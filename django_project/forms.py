# ===================================================
# forms.py - فرم‌های سامانه تشخیص ذات‌الریه
# ===================================================

from django import forms
from django.core.validators import FileExtensionValidator


class ImageUploadForm(forms.Form):
    """
    فرم آپلود تصویر رادیوگرافی
    
    فرمت‌های پشتیبانی شده: PNG, JPG, JPEG, BMP, DICOM
    حداکثر حجم: 10 مگابایت
    """
    image = forms.ImageField(
        label='تصویر رادیوگرافی',
        help_text='تصویر رادیوگرافی قفسه سینه را آپلود کنید.',
        validators=[
            FileExtensionValidator(
                allowed_extensions=['png', 'jpg', 'jpeg', 'bmp', 'dcm']
            )
        ],
        widget=forms.ClearableFileInput(attrs={
            'class': 'file-input',
            'accept': 'image/*,.dcm',
        })
    )

    def clean_image(self):
        """اعتبارسنجی حجم فایل"""
        image = self.cleaned_data.get('image')
        if image:
            if image.size > 10 * 1024 * 1024:  # 10MB
                raise forms.ValidationError(
                    'حجم فایل بیش از ۱۰ مگابایت است.'
                )
        return image


class ImageUrlForm(forms.Form):
    """
    فرم ارسال URL تصویر
    """
    url = forms.URLField(
        label='آدرس تصویر',
        help_text='آدرس اینترنتی تصویر رادیوگرافی را وارد کنید.',
        widget=forms.URLInput(attrs={
            'class': 'url-input',
            'placeholder': 'https://example.com/xray.jpg',
            'dir': 'ltr',
        })
    )
