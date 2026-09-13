/**
 * MLSA × SCE - Event Countdown Timer
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById('nextEventCountdown');
        if (!container || typeof EVENTS === 'undefined' || !EVENTS.length) return;

        const now = new Date();
        // Find nearest future event that is open and hasn't passed
        const upcoming = EVENTS
            .filter(e => e.isOpen !== false)
            .map(e => ({ ...e, eventDate: new Date(e.date) }))
            .filter(e => e.eventDate.getTime() > now.getTime())
            .sort((a, b) => a.eventDate - b.eventDate)[0];

        if (!upcoming) {
            container.style.display = 'none';
            return; // Hide section if no future active event
        }

        const eventTime = upcoming.eventDate.getTime();

        container.innerHTML = `
            <div class="countdown-card card border-0 p-4 p-md-5 rounded-4 overflow-hidden position-relative" style="
                background: linear-gradient(135deg, rgba(0, 120, 212, 0.12) 0%, rgba(135, 100, 184, 0.08) 100%);
                border: 1px solid rgba(0, 120, 212, 0.25) !important;
                box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
            ">
                <div class="row align-items-center g-4">
                    <div class="col-lg-6">
                        <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-2 mb-2 font-monospace text-uppercase" style="font-size: 11px; letter-spacing: 1px;">
                            <i class="bi bi-clock-history me-1"></i> Next Chapter Event
                        </span>
                        <h2 class="h3 fw-bold mb-2 text-gradient">${upcoming.title}</h2>
                        <p class="text-secondary small mb-3">${upcoming.tagline || upcoming.description.substring(0, 120) + '...'}</p>
                        <a href="event.html?id=${upcoming.id}" class="btn btn-primary btn-sm rounded-pill px-4 py-2 fw-semibold">
                            Register Now <i class="bi bi-arrow-right ms-1"></i>
                        </a>
                    </div>
                    <div class="col-lg-6">
                        <div class="d-flex justify-content-center justify-content-lg-end gap-2 gap-sm-3" id="timerDigits">
                            <div class="timer-unit text-center">
                                <div class="timer-box" id="cd-days">00</div>
                                <span class="timer-label">Days</span>
                            </div>
                            <div class="timer-separator">:</div>
                            <div class="timer-unit text-center">
                                <div class="timer-box" id="cd-hours">00</div>
                                <span class="timer-label">Hours</span>
                            </div>
                            <div class="timer-separator">:</div>
                            <div class="timer-unit text-center">
                                <div class="timer-box" id="cd-mins">00</div>
                                <span class="timer-label">Mins</span>
                            </div>
                            <div class="timer-separator">:</div>
                            <div class="timer-unit text-center">
                                <div class="timer-box" id="cd-secs">00</div>
                                <span class="timer-label">Secs</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.style.display = 'block';

        const daysEl = document.getElementById('cd-days');
        const hoursEl = document.getElementById('cd-hours');
        const minsEl = document.getElementById('cd-mins');
        const secsEl = document.getElementById('cd-secs');

        function updateTimer() {
            const currentTime = new Date().getTime();
            const diff = eventTime - currentTime;

            if (diff <= 0) {
                if (daysEl) daysEl.textContent = '00';
                if (hoursEl) hoursEl.textContent = '00';
                if (minsEl) minsEl.textContent = '00';
                if (secsEl) secsEl.textContent = '00';
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);

            if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
            if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
            if (minsEl) minsEl.textContent = mins.toString().padStart(2, '0');
            if (secsEl) secsEl.textContent = secs.toString().padStart(2, '0');
        }

        updateTimer();
        setInterval(updateTimer, 1000);
    });
})();
