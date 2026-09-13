/**
 * MLSA × SCE - Native-Feel Pull to Refresh (Mobile Only)
 */
(function () {
    'use strict';

    if (!('ontouchstart' in window)) return; // Only active on touch devices

    let startY = 0;
    let currentY = 0;
    let pulling = false;
    const PULL_THRESHOLD = 70;
    let indicatorEl = null;

    function createIndicator() {
        if (indicatorEl) return indicatorEl;
        indicatorEl = document.createElement('div');
        indicatorEl.id = 'pull-to-refresh-indicator';
        Object.assign(indicatorEl.style, {
            position: 'fixed',
            top: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(20, 25, 35, 0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0, 120, 212, 0.4)',
            boxShadow: '0 4px 16px rgba(0, 120, 212, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0078d4',
            fontSize: '18px',
            zIndex: '99999',
            transition: 'transform 0.1s ease-out, opacity 0.2s ease',
            pointerEvents: 'none',
            opacity: '0'
        });

        indicatorEl.innerHTML = `<i class="bi bi-arrow-down" id="ptr-icon" style="transition: transform 0.2s ease;"></i>`;
        document.body.appendChild(indicatorEl);
        return indicatorEl;
    }

    window.addEventListener('touchstart', function (e) {
        if (window.scrollY === 0 || document.documentElement.scrollTop === 0) {
            startY = e.touches[0].pageY;
            pulling = true;
        } else {
            pulling = false;
        }
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
        if (!pulling) return;
        currentY = e.touches[0].pageY;
        const diff = currentY - startY;

        if (diff > 0 && (window.scrollY === 0 || document.documentElement.scrollTop === 0)) {
            const pullDistance = Math.min(diff * 0.45, PULL_THRESHOLD + 20);
            const indicator = createIndicator();
            const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);

            indicator.style.opacity = progress.toString();
            indicator.style.transform = `translate(-50%, ${pullDistance}px) scale(${0.7 + progress * 0.3})`;

            const icon = document.getElementById('ptr-icon');
            if (icon) {
                if (pullDistance >= PULL_THRESHOLD) {
                    icon.className = 'bi bi-arrow-repeat';
                    icon.style.transform = 'rotate(180deg)';
                } else {
                    icon.className = 'bi bi-arrow-down';
                    icon.style.transform = `rotate(${progress * 180}deg)`;
                }
            }
        }
    }, { passive: true });

    window.addEventListener('touchend', function () {
        if (!pulling) return;
        const diff = currentY - startY;
        const pullDistance = diff * 0.45;

        if (pullDistance >= PULL_THRESHOLD && (window.scrollY === 0 || document.documentElement.scrollTop === 0)) {
            const indicator = createIndicator();
            indicator.style.transform = `translate(-50%, ${PULL_THRESHOLD}px)`;
            const icon = document.getElementById('ptr-icon');
            if (icon) {
                icon.className = 'bi bi-arrow-repeat';
                icon.style.animation = 'ptr-spin 0.8s linear infinite';
            }

            // Inject keyframes if not present
            if (!document.getElementById('ptr-style')) {
                const style = document.createElement('style');
                style.id = 'ptr-style';
                style.innerHTML = `@keyframes ptr-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
                document.head.appendChild(style);
            }

            setTimeout(() => {
                window.location.reload();
            }, 400);
        } else if (indicatorEl) {
            indicatorEl.style.opacity = '0';
            indicatorEl.style.transform = 'translate(-50%, -50px)';
        }

        pulling = false;
        startY = 0;
        currentY = 0;
    }, { passive: true });
})();
