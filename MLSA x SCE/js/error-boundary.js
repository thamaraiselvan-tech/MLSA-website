/**
 * MLSA × SCE - Global Error Boundary & Crash Protection
 * Catches uncaught runtime errors and unhandled promise rejections gracefully.
 */
(function () {
    'use strict';

    let errorToastCount = 0;
    const MAX_TOASTS = 2;

    function showErrorToast(message) {
        if (errorToastCount >= MAX_TOASTS) return;
        errorToastCount++;

        let container = document.getElementById('error-boundary-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'error-boundary-container';
            container.setAttribute('aria-live', 'polite');
            Object.assign(container.style, {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: '999999',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                maxWidth: '360px',
                width: 'calc(100% - 40px)',
                pointerEvents: 'none'
            });
            document.body ? document.body.appendChild(container) : window.addEventListener('DOMContentLoaded', () => document.body.appendChild(container));
        }

        const toast = document.createElement('div');
        Object.assign(toast.style, {
            pointerEvents: 'auto',
            background: 'rgba(20, 20, 25, 0.92)',
            backdropFilter: 'blur(12px)',
            webkitBackdropFilter: 'blur(12px)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderLeft: '4px solid #d13438',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '13px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.36)',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            gap: '12px',
            opacity: '0',
            transform: 'translateY(12px)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        });

        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                <span style="font-size: 16px; line-height: 1;">⚠️</span>
                <span style="line-height: 1.4; color: #e1e1e1;">${message || 'Something went wrong.'}</span>
            </div>
            <button onclick="window.location.reload()" style="
                background: #0078d4;
                color: #fff;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                white-space: nowrap;
                transition: background 0.2s;
            " onmouseover="this.style.background='#005a9e'" onmouseout="this.style.background='#0078d4'">
                Refresh
            </button>
        `;

        if (container.parentElement) {
            container.appendChild(toast);
        } else {
            window.addEventListener('DOMContentLoaded', () => {
                if (!container.parentElement) document.body.appendChild(container);
                container.appendChild(toast);
            });
        }

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(12px)';
            setTimeout(() => toast.remove(), 300);
        }, 8000);
    }

    window.addEventListener('error', function (event) {
        console.error('[Error Boundary Caught]:', event.error || event.message);
        // Ignore extension script errors or cross-origin script error spam
        if (event.message && (event.message.includes('Script error') || event.message.includes('Extension'))) return;
        showErrorToast('A minor issue occurred.');
    });

    window.addEventListener('unhandledrejection', function (event) {
        console.error('[Unhandled Promise Rejection]:', event.reason);
        // Ignore expected network timeouts or user aborts
        if (event.reason && (event.reason.name === 'AbortError' || event.reason.message?.includes('network'))) return;
        showErrorToast('Network or loading issue detected.');
    });

})();
