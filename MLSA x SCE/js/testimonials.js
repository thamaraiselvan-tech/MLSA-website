/**
 * MLSA × SCE - Single Student Experience Card with Automatic Rotation & Native Hover Detection
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const track = document.getElementById('testimonialTrack');
        if (!track || !window.testimonialsData || !window.testimonialsData.length) return;

        const data = window.testimonialsData;
        let currentIndex = 0;
        let autoRotateTimer = null;
        let isAnimating = false;

        function buildCardHTML(index) {
            const item = data[index];
            return `
                <div class="testimonial-card-container position-relative mx-auto" style="max-width: 760px;">
                    <!-- Outer Card -->
                    <div class="testimonial-card rounded-4 p-4 p-md-5 text-start position-relative overflow-hidden d-flex flex-column justify-content-between" style="
                        background: linear-gradient(145deg, #ffffff 0%, #f8fbfe 100%);
                        border: 1px solid rgba(0, 120, 212, 0.16);
                        box-shadow: 0 12px 36px rgba(0, 120, 212, 0.08);
                        transition: transform 0.3s ease, box-shadow 0.3s ease;
                    ">
                        <!-- Top Accent Line -->
                        <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #0078d4, #8764b8, #0078d4);"></div>

                        <!-- Card Top Bar: Star Rating & Verification Badge -->
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <div class="d-flex align-items-center gap-1">
                                <span style="color: #ffb900; font-size: 16px; letter-spacing: 2px;">★★★★★</span>
                                <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill ms-2 font-monospace" style="font-size: 10px;"><i class="bi bi-patch-check-fill me-1"></i> Genuine Feedback Form Submission</span>
                            </div>
                        </div>

                        <!-- Quote Icon & Text (Flex-grow for uniform height across all quotes) -->
                        <div class="position-relative mb-4 my-auto flex-grow-1 d-flex align-items-center testimonial-quote-container">
                            <i class="bi bi-quote position-absolute" style="top: -15px; left: -10px; font-size: 48px; color: rgba(0, 120, 212, 0.12); pointer-events: none;"></i>
                            <p class="testimonial-quote mb-0 text-dark w-100" style="
                                font-size: 1.05rem;
                                line-height: 1.75;
                                font-weight: 500;
                                position: relative;
                                z-index: 1;
                                color: #1e293b !important;
                            ">
                                "${item.quote}"
                            </p>
                        </div>

                        <!-- Footer: Avatar + Author Info + Navigation Controls (Pinned at bottom) -->
                        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 pt-3 border-top mt-auto" style="border-color: rgba(0, 120, 212, 0.1) !important;">
                            <div class="d-flex align-items-center gap-3">
                                <div class="avatar-circle rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm" style="
                                    width: 46px;
                                    height: 46px;
                                    background: linear-gradient(135deg, #0078d4, #8764b8);
                                    font-size: 15px;
                                    box-shadow: 0 4px 12px rgba(0, 120, 212, 0.25);
                                ">
                                    ${item.avatar}
                                </div>
                                <div>
                                    <h4 class="h6 fw-bold mb-0 text-dark" style="font-size: 0.95rem;">${item.name}</h4>
                                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1 mt-1" style="font-size: 11px; font-weight: 600;">
                                        ${item.role}
                                    </span>
                                </div>
                            </div>

                            <!-- Interactive Navigation Arrows -->
                            <div class="d-flex align-items-center gap-2 ms-auto ms-sm-0">
                                <button id="testiPrev" class="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 36px; height: 36px; padding: 0;" aria-label="Previous review">
                                    <i class="bi bi-chevron-left"></i>
                                </button>
                                <button id="testiNext" class="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 36px; height: 36px; padding: 0;" aria-label="Next review">
                                    <i class="bi bi-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Bottom Indicator Dots -->
                    <div class="testimonial-dots d-flex justify-content-center gap-2 mt-4">
                        ${data.map((_, i) => `
                            <button class="testimonial-dot ${i === index ? 'active' : ''}" data-index="${i}" aria-label="Go to feedback ${i + 1}"></button>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        function renderTestimonial(newIndex, direction = 'next') {
            if (isAnimating) return;
            
            const cardWrapper = track.querySelector('.testimonial-card-container');

            if (!cardWrapper) {
                // Initial render without animation
                track.innerHTML = buildCardHTML(newIndex);
                currentIndex = newIndex;
                bindEvents();
                return;
            }

            isAnimating = true;

            // Step 1: Slide Out existing card in movement direction
            const slideOutClass = direction === 'next' ? 'slide-out-next' : 'slide-out-prev';
            cardWrapper.classList.add('testimonial-card-wrapper', slideOutClass);

            setTimeout(() => {
                // Step 2: Swap content and trigger smooth Slide In from opposite side
                currentIndex = newIndex;
                track.innerHTML = buildCardHTML(newIndex);
                bindEvents();

                const newCardWrapper = track.querySelector('.testimonial-card-container');
                if (newCardWrapper) {
                    const slideInClass = direction === 'next' ? 'slide-in-next' : 'slide-in-prev';
                    newCardWrapper.classList.add('testimonial-card-wrapper', slideInClass);

                    setTimeout(() => {
                        newCardWrapper.classList.remove('testimonial-card-wrapper', slideInClass);
                        isAnimating = false;
                    }, 450);
                } else {
                    isAnimating = false;
                }
            }, 300);
        }

        function bindEvents() {
            const prevBtn = track.querySelector('#testiPrev');
            const nextBtn = track.querySelector('#testiNext');

            if (prevBtn) {
                prevBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (isAnimating) return;
                    const newIndex = (currentIndex - 1 + data.length) % data.length;
                    renderTestimonial(newIndex, 'prev');
                    resetTimer();
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (isAnimating) return;
                    const newIndex = (currentIndex + 1) % data.length;
                    renderTestimonial(newIndex, 'next');
                    resetTimer();
                });
            }

            const dots = track.querySelectorAll('.testimonial-dot');
            dots.forEach(dot => {
                dot.addEventListener('click', (e) => {
                    if (isAnimating) return;
                    const idx = parseInt(e.target.dataset.index);
                    if (!isNaN(idx) && idx !== currentIndex) {
                        const dir = idx > currentIndex ? 'next' : 'prev';
                        renderTestimonial(idx, dir);
                        resetTimer();
                    }
                });
            });
        }

        function nextSlide() {
            if (isAnimating) return;
            // Native browser :hover check to prevent stuck JS state
            if (track.matches(':hover')) return;
            const newIndex = (currentIndex + 1) % data.length;
            renderTestimonial(newIndex, 'next');
        }

        function startTimer() {
            if (autoRotateTimer) clearInterval(autoRotateTimer);
            autoRotateTimer = setInterval(nextSlide, 5500); // Smooth 5.5s interval
        }

        function resetTimer() {
            startTimer();
        }

        // Restart auto-rotation immediately on mouse leave
        track.addEventListener('mouseleave', () => {
            resetTimer();
        });

        // Touch swipe tracking on mobile
        let touchStartX = 0;
        track.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches[0]) {
                touchStartX = e.touches[0].clientX;
            }
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            if (!e.changedTouches || !e.changedTouches[0]) return;
            const touchEndX = e.changedTouches[0].clientX;
            const diffX = touchStartX - touchEndX;

            if (Math.abs(diffX) > 40 && !isAnimating) {
                if (diffX > 0) {
                    // Swiped Left -> Next
                    const newIndex = (currentIndex + 1) % data.length;
                    renderTestimonial(newIndex, 'next');
                } else {
                    // Swiped Right -> Prev
                    const newIndex = (currentIndex - 1 + data.length) % data.length;
                    renderTestimonial(newIndex, 'prev');
                }
                resetTimer();
            }
        }, { passive: true });

        renderTestimonial(0);
        startTimer();
    });
})();
