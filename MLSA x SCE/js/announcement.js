/**
 * Dynamic Announcement Banner Controller
 * Shows banner ONLY when there is an active upcoming event with open registration.
 * Hides banner automatically for completed events.
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const banner = document.getElementById('announcementBanner');
        if (!banner) return;

        if (sessionStorage.getItem('bannerDismissed')) {
            banner.style.display = 'none';
            return;
        }

        const events = window.EVENTS || [];
        const now = new Date();

        // Find active upcoming event with open registration
        const activeOpenEvent = events.find(e => {
            if (!e.isOpen || !e.registrationUrl) return false;
            const eventDate = new Date(e.date);
            return eventDate >= now; // Event date is in the future/today
        });

        if (activeOpenEvent) {
            banner.innerHTML = `
                <div class="container d-flex align-items-center justify-content-center gap-2 flex-wrap text-center">
                    <span>🔥</span>
                    <span><b>Registration Open</b> for <b>${activeOpenEvent.title}</b>!</span>
                    <a href="event.html?id=${activeOpenEvent.id}" class="announcement-link">Register Now &rarr;</a>
                    <button class="announcement-close" id="announcementCloseBtn" aria-label="Dismiss banner">&times;</button>
                </div>
            `;
            banner.style.display = 'block';

            const closeBtn = document.getElementById('announcementCloseBtn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    banner.style.opacity = '0';
                    setTimeout(() => {
                        banner.style.display = 'none';
                    }, 300);
                    sessionStorage.setItem('bannerDismissed', 'true');
                });
            }
        } else {
            // No active event with open registration -> hide banner completely
            banner.style.display = 'none';
        }
    });
})();
