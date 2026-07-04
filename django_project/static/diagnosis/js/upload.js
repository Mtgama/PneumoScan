// ===================================================
// upload.js - مدیریت آپلود تصویر و تنظیم حساسیت
// ===================================================

document.addEventListener('DOMContentLoaded', function() {
    var dropZone = document.getElementById('drop-zone');
    var fileInput = document.getElementById('file-input');
    var previewContainer = document.getElementById('preview-container');
    var previewImage = document.getElementById('preview-image');
    var clearBtn = document.getElementById('clear-btn');
    var submitBtn = document.getElementById('submit-btn');
    var uploadForm = document.getElementById('upload-form');
    var loadingOverlay = document.getElementById('loading-overlay');
    var thresholdSlider = document.getElementById('thresholdSlider');
    var thresholdValue = document.getElementById('thresholdValue');

    if (!dropZone) return;

    // Threshold slider
    if (thresholdSlider && thresholdValue) {
        thresholdSlider.addEventListener('input', function() {
            thresholdValue.textContent = parseFloat(this.value).toFixed(2);
        });
    }

    // Click to upload
    dropZone.addEventListener('click', function(e) {
        if (e.target === clearBtn || clearBtn.contains(e.target)) return;
        fileInput.click();
    });

    // Drag & Drop
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        var files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // File selection
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleFile(this.files[0]);
        }
    });

    // Process file
    function handleFile(file) {
        var validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp'];
        if (!validTypes.includes(file.type)) {
            showNotification('فرمت فایل پشتیبانی نمی\u200cشود.', 'error');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            showNotification('حجم فایل بیش از ۱۰ مگابایت است.', 'error');
            return;
        }

        var reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewContainer.style.display = 'block';
            dropZone.querySelector('.drop-zone-content').style.display = 'none';
            submitBtn.disabled = false;
        };
        reader.readAsDataURL(file);

        var dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;
    }

    // Clear selection
    clearBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        previewContainer.style.display = 'none';
        dropZone.querySelector('.drop-zone-content').style.display = 'block';
        fileInput.value = '';
        submitBtn.disabled = true;
    });

    // Submit form
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();

        var formData = new FormData(this);

        // Ensure threshold is included
        if (thresholdSlider) {
            formData.set('threshold', thresholdSlider.value);
        }

        loadingOverlay.style.display = 'flex';

        fetch(this.action, {
            method: 'POST',
            body: formData,
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            loadingOverlay.style.display = 'none';
            if (data.error) {
                showNotification(data.error, 'error');
            } else {
                sessionStorage.setItem('prediction_result', JSON.stringify(data));
                showNotification('تحلیل تصویر با موفقیت انجام شد!', 'success');
                window.location.href = '/results/';
            }
        })
        .catch(function(error) {
            loadingOverlay.style.display = 'none';
            showNotification('خطا در ارسال تصویر. لطفاً دوباره تلاش کنید.', 'error');
        });
    });
});

// Notification
function showNotification(message, type) {
    var container = document.getElementById('notification-container') || createNotificationContainer();

    var notification = document.createElement('div');
    notification.className = 'notification notification-' + type;
    notification.innerHTML =
        '<span>' + (type === 'success' ? '\u2705' : '\u274C') + '</span>' +
        '<span>' + message + '</span>' +
        '<button onclick="this.parentElement.remove()">\u2715</button>';

    container.appendChild(notification);

    setTimeout(function() { notification.remove(); }, 5000);
}

function createNotificationContainer() {
    var container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
    return container;
}
