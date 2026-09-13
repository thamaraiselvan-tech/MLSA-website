/**
 * MLSA × SCE - Scroll Progress Indicator Bar
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        let progressBar = document.getElementById('scroll-progress-bar');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.id = 'scroll-progress-bar';
            Object.assign(progressBar.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                height: '3px',
                width: '0%',
                background: 'linear-gradient(90deg, #0078d4, #005a9e, #8764b8, #0078d4)',
                backgroundSize: '200% 100%',
                zIndex: '100000',
                transition: 'width 0.1s ease-out',
                pointerEvents: 'none',
                boxShadow: '0 0 10px rgba(0, 120, 212, 0.6)'
            });
            document.body.appendChild(progressBar);
        }

        let ticking = false;

        function updateProgress() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = Math.min(100, Math.max(0, scrollPercent)) + '%';
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateProgress);
                ticking = true;
            }
        }, { passive: true });

        updateProgress();
    });
})();
