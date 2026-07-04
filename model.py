# ==============================================================================
# Step 1: Imports and Environment Setup
# ==============================================================================
import os
import json
import math
import random
import datetime
import warnings

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import tensorflow as tf

from tensorflow.keras import mixed_precision
from tensorflow.keras.applications import DenseNet121
from tensorflow.keras.applications.densenet import preprocess_input
from tensorflow.keras.callbacks import (
    BackupAndRestore,
    CSVLogger,
    EarlyStopping,
    ModelCheckpoint,
    ReduceLROnPlateau,
    TensorBoard,
)
from tensorflow.keras.layers import (
    BatchNormalization,
    Dense,
    Dropout,
    GlobalAveragePooling2D,
    Input,
)
from tensorflow.keras.models import Model, load_model
from tensorflow.keras.optimizers import AdamW
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.regularizers import l2

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_curve,
    auc,
    precision_recall_curve,
    average_precision_score,
)
from sklearn.utils.class_weight import compute_class_weight

warnings.filterwarnings("ignore")

# ------------------------------------------------------------------------------
# Reproducibility
# ------------------------------------------------------------------------------
SEED = 42
os.environ["PYTHONHASHSEED"] = str(SEED)
random.seed(SEED)
np.random.seed(SEED)
tf.random.set_seed(SEED)

# ------------------------------------------------------------------------------
# Mixed Precision Setup
# ------------------------------------------------------------------------------
print("TensorFlow version:", tf.__version__)
gpus = tf.config.list_physical_devices("GPU")
print("Available GPUs:", gpus)

if gpus:
    try:
        mixed_precision.set_global_policy("mixed_float16")
        print("Mixed precision enabled: mixed_float16")
    except Exception as e:
        print("Could not enable mixed precision:", e)
else:
    print("GPU not detected. Mixed precision not enabled.")

# ==============================================================================
# Step 2: Define Paths, Output Directories, and Hyperparameters
# ==============================================================================
BASE_DIR = "/content/drive/MyDrive/pneumonia/chest_xray"
TRAIN_DIR = os.path.join(BASE_DIR, "train")
VAL_DIR = os.path.join(BASE_DIR, "val")
TEST_DIR = os.path.join(BASE_DIR, "test")

OUTPUT_DIR = os.path.join(BASE_DIR, "training_artifacts")
CHECKPOINT_DIR = os.path.join(OUTPUT_DIR, "checkpoints")
BACKUP_DIR = os.path.join(OUTPUT_DIR, "backup_restore")
TB_LOG_DIR = os.path.join(OUTPUT_DIR, "tensorboard_logs")
PLOTS_DIR = os.path.join(OUTPUT_DIR, "plots")
REPORTS_DIR = os.path.join(OUTPUT_DIR, "reports")
PREDICTIONS_DIR = os.path.join(OUTPUT_DIR, "predictions")

for directory in [
    OUTPUT_DIR,
    CHECKPOINT_DIR,
    BACKUP_DIR,
    TB_LOG_DIR,
    PLOTS_DIR,
    REPORTS_DIR,
    PREDICTIONS_DIR,
]:
    os.makedirs(directory, exist_ok=True)

BEST_MODEL_PATH = os.path.join(CHECKPOINT_DIR, "best_densenet121_pneumonia.keras")
LAST_MODEL_PATH = os.path.join(CHECKPOINT_DIR, "last_densenet121_pneumonia.keras")
HISTORY_JSON_PATH = os.path.join(REPORTS_DIR, "training_history.json")
HISTORY_CSV_PATH = os.path.join(REPORTS_DIR, "training_log.csv")
CLASSIFICATION_REPORT_PATH = os.path.join(REPORTS_DIR, "classification_report.txt")
CONFUSION_MATRIX_PATH = os.path.join(REPORTS_DIR, "confusion_matrix.png")
ROC_CURVE_PATH = os.path.join(PLOTS_DIR, "roc_curve.png")
PR_CURVE_PATH = os.path.join(PLOTS_DIR, "precision_recall_curve.png")
TRAINING_CURVES_PATH = os.path.join(PLOTS_DIR, "training_curves.png")
PREDICTIONS_CSV_PATH = os.path.join(PREDICTIONS_DIR, "test_predictions.csv")

IMG_SIZE = (224, 224)
INPUT_SHAPE = (IMG_SIZE[0], IMG_SIZE[1], 3)
BATCH_SIZE = 32

# Training stages
EPOCHS_STAGE1 = 15
EPOCHS_STAGE2 = 25

# Validation strategy
USE_TRAIN_VALIDATION_SPLIT = True
VALIDATION_SPLIT = 0.15

# Fine-tuning controls
UNFREEZE_LAST_N_LAYERS = 40

# Optimization
STAGE1_LEARNING_RATE = 1e-3
STAGE2_LEARNING_RATE = 1e-5
WEIGHT_DECAY = 1e-4
LABEL_SMOOTHING = 0.05

# Monitoring
MONITOR_METRIC = "val_auc"
MONITOR_MODE = "max"

print("\nDataset paths:")
print("TRAIN_DIR:", TRAIN_DIR)
print("VAL_DIR:", VAL_DIR)
print("TEST_DIR:", TEST_DIR)
print("OUTPUT_DIR:", OUTPUT_DIR)

# ==============================================================================
# Step 3: Data Pipeline and Validation Strategy
# ==============================================================================
# For the original Kaggle Chest X-Ray dataset, the provided validation folder is very small.
# A split from the training set is usually more stable and representative.
# If you want to use the original val folder instead, set USE_TRAIN_VALIDATION_SPLIT = False.

train_augmentation = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    validation_split=VALIDATION_SPLIT if USE_TRAIN_VALIDATION_SPLIT else 0.0,
    rotation_range=7,
    width_shift_range=0.05,
    height_shift_range=0.05,
    zoom_range=0.08,
    brightness_range=(0.9, 1.1),
    horizontal_flip=True,
    fill_mode="nearest",
)

eval_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    validation_split=VALIDATION_SPLIT if USE_TRAIN_VALIDATION_SPLIT else 0.0,
)

if USE_TRAIN_VALIDATION_SPLIT:
    print("\nValidation strategy: using validation_split from TRAIN_DIR")
    train_generator = train_augmentation.flow_from_directory(
        TRAIN_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode="binary",
        shuffle=True,
        subset="training",
        seed=SEED,
        interpolation="bilinear",
    )

    val_generator = eval_datagen.flow_from_directory(
        TRAIN_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode="binary",
        shuffle=False,
        subset="validation",
        seed=SEED,
        interpolation="bilinear",
    )
else:
    print("\nValidation strategy: using existing VAL_DIR")
    train_generator = train_augmentation.flow_from_directory(
        TRAIN_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode="binary",
        shuffle=True,
        seed=SEED,
        interpolation="bilinear",
    )

    val_generator = eval_datagen.flow_from_directory(
        VAL_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode="binary",
        shuffle=False,
        interpolation="bilinear",
    )

test_generator = eval_datagen.flow_from_directory(
    TEST_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="binary",
    shuffle=False,
    interpolation="bilinear",
)

# ------------------------------------------------------------------------------
# Class mapping
# ------------------------------------------------------------------------------
class_indices = train_generator.class_indices
idx_to_class = {v: k for k, v in class_indices.items()}
print("\nClass indices:", class_indices)

# ------------------------------------------------------------------------------
# Compute steps per epoch explicitly for stability
# ------------------------------------------------------------------------------
train_steps = math.ceil(train_generator.samples / train_generator.batch_size)
val_steps = math.ceil(val_generator.samples / val_generator.batch_size)
test_steps = math.ceil(test_generator.samples / test_generator.batch_size)

print(f"\nTrain samples: {train_generator.samples}")
print(f"Validation samples: {val_generator.samples}")
print(f"Test samples: {test_generator.samples}")

# ==============================================================================
# Step 4: Handle Class Imbalance
# ==============================================================================
train_classes = train_generator.classes
class_weights = compute_class_weight(
    class_weight="balanced",
    classes=np.unique(train_classes),
    y=train_classes,
)
class_weight_dict = dict(zip(np.unique(train_classes), class_weights))
print(f"\nCalculated Class Weights: {class_weight_dict}\n")

# ==============================================================================
# Step 5: Model Builder
# ==============================================================================
def build_model(input_shape):
    base_model = DenseNet121(
        weights="imagenet",
        include_top=False,
        input_shape=input_shape,
    )
    base_model.trainable = False

    inputs = Input(shape=input_shape)
    x = base_model(inputs, training=False)
    x = GlobalAveragePooling2D(name="global_avg_pool")(x)

    # Improved classification head:
    # - moderate size
    # - BN after dense
    # - dropout for regularization
    # - L2 regularization to reduce overfitting
    x = Dense(
        256,
        activation="relu",
        kernel_regularizer=l2(1e-4),
        name="dense_256",
    )(x)
    x = BatchNormalization(name="bn_256")(x)
    x = Dropout(0.35, name="dropout_256")(x)

    x = Dense(
        64,
        activation="relu",
        kernel_regularizer=l2(1e-4),
        name="dense_64",
    )(x)
    x = BatchNormalization(name="bn_64")(x)
    x = Dropout(0.25, name="dropout_64")(x)

    # Force float32 output to avoid mixed precision numeric issues in sigmoid
    outputs = Dense(
        1,
        activation="sigmoid",
        dtype="float32",
        name="pneumonia_probability",
    )(x)

    model = Model(inputs=inputs, outputs=outputs, name="DenseNet121_Pneumonia")
    return model, base_model

model, base_model = build_model(INPUT_SHAPE)

# ==============================================================================
# Step 6: Optimizer, Loss, and Metrics
# ==============================================================================
def get_metrics():
    return [
        tf.keras.metrics.BinaryAccuracy(name="accuracy"),
        tf.keras.metrics.Precision(name="precision"),
        tf.keras.metrics.Recall(name="recall"),
        tf.keras.metrics.AUC(name="auc", curve="ROC"),
        tf.keras.metrics.AUC(name="pr_auc", curve="PR"),
    ]

def compile_model(model, learning_rate):
    optimizer = AdamW(
        learning_rate=learning_rate,
        weight_decay=WEIGHT_DECAY,
    )
    loss = tf.keras.losses.BinaryCrossentropy(label_smoothing=LABEL_SMOOTHING)

    model.compile(
        optimizer=optimizer,
        loss=loss,
        metrics=get_metrics(),
    )

compile_model(model, STAGE1_LEARNING_RATE)
model.summary()

# ==============================================================================
# Step 7: Callback Factory
# ==============================================================================
def build_callbacks(stage_name):
    timestamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    tensorboard_log_dir = os.path.join(TB_LOG_DIR, f"{stage_name}_{timestamp}")

    callbacks = [
        ModelCheckpoint(
            filepath=BEST_MODEL_PATH,
            monitor=MONITOR_METRIC,
            mode=MONITOR_MODE,
            save_best_only=True,
            save_weights_only=False,
            verbose=1,
        ),
        EarlyStopping(
            monitor=MONITOR_METRIC,
            mode=MONITOR_MODE,
            patience=6,
            restore_best_weights=True,
            verbose=1,
        ),
        ReduceLROnPlateau(
            monitor="val_loss",
            mode="min",
            factor=0.25,
            patience=2,
            min_lr=1e-7,
            verbose=1,
        ),
        CSVLogger(HISTORY_CSV_PATH, append=True),
        TensorBoard(
            log_dir=tensorboard_log_dir,
            histogram_freq=1,
            write_graph=True,
            update_freq="epoch",
        ),
        BackupAndRestore(
            backup_dir=BACKUP_DIR,
            save_freq="epoch",
            delete_checkpoint=False,
        ),
    ]
    return callbacks

# ==============================================================================
# Step 8: Resume Utilities
# ==============================================================================
def load_history_if_exists(path):
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return {}

def save_history_json(history_dict, path):
    with open(path, "w") as f:
        json.dump(history_dict, f, indent=4)

def merge_histories(existing_history, new_history):
    for key, values in new_history.items():
        if key not in existing_history:
            existing_history[key] = []
        existing_history[key].extend([float(v) for v in values])
    return existing_history

def get_initial_epoch_from_csv(csv_path):
    if os.path.exists(csv_path):
        try:
            df_log = pd.read_csv(csv_path)
            if len(df_log) > 0:
                return int(df_log["epoch"].max()) + 1
        except Exception as e:
            print("Could not parse CSV log for initial epoch:", e)
    return 0

# ==============================================================================
# Step 9: Stage 1 Training - Train Classification Head
# ==============================================================================
print("\n" + "=" * 80)
print("Stage 1: Training classifier head with frozen DenseNet121 backbone")
print("=" * 80)

history_all = load_history_if_exists(HISTORY_JSON_PATH)
initial_epoch_stage1 = get_initial_epoch_from_csv(HISTORY_CSV_PATH)

# If best model already exists and CSV indicates stage1 may have run before,
# we still allow fit() to resume safely via BackupAndRestore.
callbacks_stage1 = build_callbacks(stage_name="stage1")

history_stage1 = model.fit(
    train_generator,
    steps_per_epoch=train_steps,
    validation_data=val_generator,
    validation_steps=val_steps,
    epochs=EPOCHS_STAGE1,
    initial_epoch=min(initial_epoch_stage1, EPOCHS_STAGE1),
    class_weight=class_weight_dict,
    callbacks=callbacks_stage1,
    verbose=1,
)


history_all = merge_histories(history_all, history_stage1.history)
save_history_json(history_all, HISTORY_JSON_PATH)

# Save last model after stage 1
model.save(LAST_MODEL_PATH)

# ==============================================================================
# Step 10: Stage 2 Fine-Tuning
# ==============================================================================
print("\n" + "=" * 80)
print("Stage 2: Fine-tuning upper DenseNet121 layers")
print("=" * 80)

# Load best checkpoint before fine-tuning
if os.path.exists(BEST_MODEL_PATH):
    print(f"Loading best model from: {BEST_MODEL_PATH}")
    model = load_model(BEST_MODEL_PATH)
    base_model = model.get_layer(index=1) if len(model.layers) > 1 else None

# Re-identify the DenseNet backbone robustly
densenet_backbone = None
for layer in model.layers:
    if isinstance(layer, tf.keras.Model) and "densenet121" in layer.name.lower():
        densenet_backbone = layer
        break

if densenet_backbone is None:
    raise ValueError("DenseNet121 backbone not found inside the model.")

densenet_backbone.trainable = True

# Gradual fine-tuning:
# Freeze earlier layers, unfreeze only top layers because lower layers capture generic visual primitives.
total_backbone_layers = len(densenet_backbone.layers)
unfreeze_from = max(0, total_backbone_layers - UNFREEZE_LAST_N_LAYERS)

for i, layer in enumerate(densenet_backbone.layers):
    if i < unfreeze_from:
        layer.trainable = False
    else:
        # Keep batch norm layers frozen for more stable transfer learning on small medical datasets
        if isinstance(layer, tf.keras.layers.BatchNormalization):
            layer.trainable = False
        else:
            layer.trainable = True

print(f"Total DenseNet backbone layers: {total_backbone_layers}")
print(f"Unfreezing from layer index: {unfreeze_from}")
print(f"Unfrozen last {UNFREEZE_LAST_N_LAYERS} layers (except BatchNormalization layers)")

compile_model(model, STAGE2_LEARNING_RATE)

# For stage 2, continue epoch count instead of restarting from zero
completed_epochs = len(history_all.get("loss", []))
stage2_total_epochs = completed_epochs + EPOCHS_STAGE2

callbacks_stage2 = build_callbacks(stage_name="stage2")

history_stage2 = model.fit(
    train_generator,
    steps_per_epoch=train_steps,
    validation_data=val_generator,
    validation_steps=val_steps,
    epochs=stage2_total_epochs,
    initial_epoch=completed_epochs,
    class_weight=class_weight_dict,
    callbacks=callbacks_stage2,
    verbose=1,
)



history_all = merge_histories(history_all, history_stage2.history)
save_history_json(history_all, HISTORY_JSON_PATH)

# Save last model after stage 2
model.save(LAST_MODEL_PATH)

# ==============================================================================
# Step 11: Load Best Model and Final Evaluation
# ==============================================================================
print("\n" + "=" * 80)
print("Final Evaluation on Test Set")
print("=" * 80)

if os.path.exists(BEST_MODEL_PATH):
    model = load_model(BEST_MODEL_PATH)
    print(f"Best model loaded from: {BEST_MODEL_PATH}")
else:
    print("Best model checkpoint not found. Using current in-memory model.")

test_results = model.evaluate(
    test_generator,
    steps=test_steps,
    verbose=1,
)

metric_names = model.metrics_names
test_metrics = dict(zip(metric_names, test_results))

print("\nTest Metrics:")
for metric_name, metric_value in test_metrics.items():
    if isinstance(metric_value, float):
        print(f"{metric_name}: {metric_value:.4f}")
    else:
        print(f"{metric_name}: {metric_value}")

# ==============================================================================
# Step 12: Predictions and Detailed Medical Evaluation
# ==============================================================================
print("\nGenerating predictions on test set...")

test_generator.reset()
y_true = test_generator.classes
y_prob = model.predict(test_generator, steps=test_steps, verbose=1).ravel()
y_pred = (y_prob >= 0.5).astype(int)

# Save raw predictions
predictions_df = pd.DataFrame({
    "filepath": test_generator.filepaths,
    "true_label_index": y_true,
    "true_label_name": [idx_to_class[idx] for idx in y_true],
    "predicted_probability_pneumonia": y_prob,
    "predicted_label_index": y_pred,
    "predicted_label_name": [idx_to_class[idx] for idx in y_pred],
})
predictions_df.to_csv(PREDICTIONS_CSV_PATH, index=False)
print(f"Predictions saved to: {PREDICTIONS_CSV_PATH}")

# ------------------------------------------------------------------------------
# Classification report
# ------------------------------------------------------------------------------
target_names = [idx_to_class[i] for i in sorted(idx_to_class.keys())]
report = classification_report(
    y_true,
    y_pred,
    target_names=target_names,
    digits=4,
)

print("\nClassification Report:\n")
print(report)

with open(CLASSIFICATION_REPORT_PATH, "w") as f:
    f.write(report)

# ------------------------------------------------------------------------------
# Confusion matrix
# ------------------------------------------------------------------------------
cm = confusion_matrix(y_true, y_pred)

plt.figure(figsize=(6, 5))
plt.imshow(cm, interpolation="nearest", cmap=plt.cm.Blues)
plt.title("Confusion Matrix")
plt.colorbar()
tick_marks = np.arange(len(target_names))
plt.xticks(tick_marks, target_names, rotation=45)
plt.yticks(tick_marks, target_names)

for i in range(cm.shape[0]):
    for j in range(cm.shape[1]):
        plt.text(
            j,
            i,
            format(cm[i, j], "d"),
            ha="center",
            va="center",
            color="white" if cm[i, j] > cm.max() / 2 else "black",
        )

plt.ylabel("True Label")
plt.xlabel("Predicted Label")
plt.tight_layout()
plt.savefig(CONFUSION_MATRIX_PATH, dpi=300, bbox_inches="tight")
plt.show()

# ------------------------------------------------------------------------------
# ROC curve
# ------------------------------------------------------------------------------
fpr, tpr, _ = roc_curve(y_true, y_prob)
roc_auc_value = auc(fpr, tpr)

plt.figure(figsize=(7, 6))
plt.plot(fpr, tpr, label=f"ROC Curve (AUC = {roc_auc_value:.4f})", linewidth=2)
plt.plot([0, 1], [0, 1], linestyle="--", linewidth=1)
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("Receiver Operating Characteristic (ROC)")
plt.legend(loc="lower right")
plt.grid(alpha=0.3)
plt.tight_layout()
plt.savefig(ROC_CURVE_PATH, dpi=300, bbox_inches="tight")
plt.show()

# ------------------------------------------------------------------------------
# Precision-Recall curve
# ------------------------------------------------------------------------------
precision_vals, recall_vals, _ = precision_recall_curve(y_true, y_prob)
pr_auc_value = average_precision_score(y_true, y_prob)

plt.figure(figsize=(7, 6))
plt.plot(
    recall_vals,
    precision_vals,
    label=f"PR Curve (AP = {pr_auc_value:.4f})",
    linewidth=2,
)
plt.xlabel("Recall")
plt.ylabel("Precision")
plt.title("Precision-Recall Curve")
plt.legend(loc="lower left")
plt.grid(alpha=0.3)
plt.tight_layout()
plt.savefig(PR_CURVE_PATH, dpi=300, bbox_inches="tight")
plt.show()

# ==============================================================================
# Step 13: Plot Training Curves
# ==============================================================================
print("\nPlotting training curves...")

def plot_metric(history_dict, train_key, val_key, title, ylabel, save_path=None):
    if train_key not in history_dict or val_key not in history_dict:
        print(f"Skipping plot: {title} (missing keys: {train_key}, {val_key})")
        return

    epochs = range(1, len(history_dict[train_key]) + 1)
    plt.figure(figsize=(8, 5))
    plt.plot(epochs, history_dict[train_key], label=f"Train {ylabel}")
    plt.plot(epochs, history_dict[val_key], label=f"Validation {ylabel}")
    plt.title(title)
    plt.xlabel("Epoch")
    plt.ylabel(ylabel)
    plt.legend()
    plt.grid(alpha=0.3)
    plt.tight_layout()
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches="tight")
    plt.show()

plot_metric(
    history_all,
    "accuracy",
    "val_accuracy",
    "Training and Validation Accuracy",
    "Accuracy",
)

plot_metric(
    history_all,
    "loss",
    "val_loss",
    "Training and Validation Loss",
    "Loss",
)

plot_metric(
    history_all,
    "auc",
    "val_auc",
    "Training and Validation ROC-AUC",
    "AUC",
)

plt.figure(figsize=(14, 10))

subplot_specs = [
    ("accuracy", "val_accuracy", "Accuracy"),
    ("loss", "val_loss", "Loss"),
    ("precision", "val_precision", "Precision"),
    ("recall", "val_recall", "Recall"),
    ("auc", "val_auc", "ROC-AUC"),
    ("pr_auc", "val_pr_auc", "PR-AUC"),
]

for i, (train_key, val_key, title) in enumerate(subplot_specs, start=1):
    plt.subplot(3, 2, i)
    if train_key in history_all and val_key in history_all:
        epochs = range(1, len(history_all[train_key]) + 1)
        plt.plot(epochs, history_all[train_key], label=f"Train {title}")
        plt.plot(epochs, history_all[val_key], label=f"Val {title}")
        plt.title(title)
        plt.xlabel("Epoch")
        plt.ylabel(title)
        plt.legend()
        plt.grid(alpha=0.3)
    else:
        plt.title(f"{title} (Unavailable)")

plt.tight_layout()
plt.savefig(TRAINING_CURVES_PATH, dpi=300, bbox_inches="tight")
plt.show()

# ==============================================================================
# Step 14: Save Final Summary
# ==============================================================================
summary_data = {
    "best_model_path": BEST_MODEL_PATH,
    "last_model_path": LAST_MODEL_PATH,
    "history_json_path": HISTORY_JSON_PATH,
    "history_csv_path": HISTORY_CSV_PATH,
    "classification_report_path": CLASSIFICATION_REPORT_PATH,
    "confusion_matrix_path": CONFUSION_MATRIX_PATH,
    "roc_curve_path": ROC_CURVE_PATH,
    "pr_curve_path": PR_CURVE_PATH,
    "training_curves_path": TRAINING_CURVES_PATH,
    "predictions_csv_path": PREDICTIONS_CSV_PATH,
    "test_metrics": test_metrics,
    "class_indices": class_indices,
    "validation_strategy": (
        "validation_split_from_train" if USE_TRAIN_VALIDATION_SPLIT else "existing_val_folder"
    ),
    "unfreeze_last_n_layers": UNFREEZE_LAST_N_LAYERS,
    "label_smoothing": LABEL_SMOOTHING,
    "weight_decay": WEIGHT_DECAY,
}

summary_json_path = os.path.join(REPORTS_DIR, "run_summary.json")
with open(summary_json_path, "w") as f:
    json.dump(summary_data, f, indent=4)

print("\nRun summary saved to:", summary_json_path)
print("Best model saved to:", BEST_MODEL_PATH)
print("Last model saved to:", LAST_MODEL_PATH)
print("All artifacts saved under:", OUTPUT_DIR)

# ==============================================================================
# Step 15: Optional Inference Helper for Django/Future Deployment
# ==============================================================================
def predict_single_image(model, image_path, img_size=(224, 224), threshold=0.5):
    """
    Simple inference helper compatible with Django deployment.
    Returns predicted label index, probability, and label name.
    """
    image = tf.keras.preprocessing.image.load_img(image_path, target_size=img_size)
    image_array = tf.keras.preprocessing.image.img_to_array(image)
    image_array = np.expand_dims(image_array, axis=0)
    image_array = preprocess_input(image_array)

    probability = float(model.predict(image_array, verbose=0)[0][0])
    predicted_index = int(probability >= threshold)
    predicted_label = idx_to_class[predicted_index]

    return {
        "predicted_index": predicted_index,
        "predicted_label": predicted_label,
        "probability_pneumonia": probability,
        "threshold": threshold,
    }

print("\nTraining pipeline completed successfully.")

