// ===================================================
// main.js - اسکریپت‌های اصلی سامانه
// ===================================================

document.addEventListener('DOMContentLoaded', function() {
    // ===== نوار ناوبری =====
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 20) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        });
    }

    // ===== بزرگنمایی تصاویر =====
    document.querySelectorAll('.zoomable').forEach(function(img) {
        img.addEventListener('click', function() {
            const overlay = document.createElement('div');
            overlay.className = 'image-zoom-overlay';
            
            const zoomedImg = document.createElement('img');
            zoomedImg.src = this.src;
            zoomedImg.alt = this.alt;
            
            overlay.appendChild(zoomedImg);
            document.body.appendChild(overlay);
            
            overlay.addEventListener('click', function() {
                overlay.remove();
            });
        });
    });

    // ===== انیمیشن ورود عناصر =====
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.feature-card, .metric-card, .image-card, .chart-card').forEach(function(el) {
        observer.observe(el);
    });
});
