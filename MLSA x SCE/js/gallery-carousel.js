// Gallery Carousel controller with continuous infinite marquee glide, touch drag, navigation controls, and Lightbox modal.

(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const track = document.getElementById("galleryTrack");
    if (!track || !window.galleryData) return;

    const prevBtn = document.getElementById("galleryPrev");
    const nextBtn = document.getElementById("galleryNext");
    const lightbox = document.getElementById("galleryLightbox");
    const lightboxImg = document.getElementById("lightboxImage");
    const lightboxTitle = document.getElementById("lightboxTitle");
    const lightboxCaption = document.getElementById("lightboxCaption");
    const lightboxCategory = document.getElementById("lightboxCategory");
    const lightboxDate = document.getElementById("lightboxDate");
    const lightboxClose = document.getElementById("lightboxClose");

    const originalItems = window.galleryData;
    const N = originalItems.length;
    if (N === 0) return;

    // Render 3 sets of items for seamless infinite continuous looping
    const itemsToRender = [...originalItems, ...originalItems, ...originalItems];

    renderGalleryCards();

    function renderGalleryCards() {
      track.innerHTML = "";
      itemsToRender.forEach((item, realIndex) => {
        const originalIndex = realIndex % N;
        const card = document.createElement("div");
        card.className = "gallery-card-item";
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", `View ${item.title}`);
        card.dataset.index = originalIndex;

        card.innerHTML = `
          <div class="gallery-card-inner">
            <img src="${item.image}" alt="${item.title}" loading="lazy" class="gallery-card-img">
            <div class="gallery-card-overlay">
              <span class="badge gallery-badge mb-2">${item.category}</span>
              <h3 class="gallery-card-title h6 fw-bold mb-1">${item.title}</h3>
              <p class="gallery-card-date small mb-0">${item.date}</p>
            </div>
            <button class="gallery-expand-btn" aria-label="Expand image">
              <i class="bi bi-arrows-angle-expand"></i>
            </button>
          </div>
        `;

        card.addEventListener("click", () => openLightbox(originalIndex));
        card.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openLightbox(originalIndex);
          }
        });

        track.appendChild(card);
      });

      // Initial scroll position to set 1 (middle set)
      requestAnimationFrame(() => {
        const firstSetStart = track.children[N];
        if (firstSetStart) {
          track.scrollLeft = firstSetStart.offsetLeft - track.offsetLeft;
        }
      });
    }

    let isDown = false;
    let isHovered = false;
    let isPausedByInteraction = false;
    let startX = 0;
    let scrollLeft = 0;
    let pauseTimer = null;
    let animFrameId = null;
    let arrowAnimId = null;

    const SPEED = 0.6; // pixels per frame continuous marquee speed

    function getSingleSetWidth() {
      const cards = track.children;
      if (!cards || cards.length < 2 * N) return 0;
      return cards[N].offsetLeft - cards[0].offsetLeft;
    }

    function checkLoopBounds() {
      const setWidth = getSingleSetWidth();
      if (setWidth <= 0) return;

      const cards = track.children;
      const set0Start = cards[0].offsetLeft - track.offsetLeft;
      const set1Start = cards[N].offsetLeft - track.offsetLeft;
      const set2Start = cards[2 * N].offsetLeft - track.offsetLeft;

      // Reset seamlessly if scrolled into Set 2 or Set 0
      if (track.scrollLeft >= set2Start - 10) {
        track.scrollLeft -= setWidth;
      } else if (track.scrollLeft <= set0Start + 10) {
        track.scrollLeft += setWidth;
      }
    }

    // Continuous marquee frame loop
    function marqueeLoop() {
      if (!isHovered && !isDown && !isPausedByInteraction) {
        track.scrollLeft += SPEED;
        checkLoopBounds();
      }
      animFrameId = requestAnimationFrame(marqueeLoop);
    }

    animFrameId = requestAnimationFrame(marqueeLoop);

    function triggerTemporaryPause(ms = 3000) {
      isPausedByInteraction = true;
      if (pauseTimer) clearTimeout(pauseTimer);
      pauseTimer = setTimeout(() => {
        isPausedByInteraction = false;
      }, ms);
    }

    // Smooth button step animation
    function smoothStepBy(amount, duration = 400) {
      if (arrowAnimId) cancelAnimationFrame(arrowAnimId);
      triggerTemporaryPause(3000);

      const start = track.scrollLeft;
      const target = start + amount;
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);

        track.scrollLeft = start + (amount * ease);
        checkLoopBounds();

        if (progress < 1) {
          arrowAnimId = requestAnimationFrame(step);
        } else {
          arrowAnimId = null;
        }
      }
      arrowAnimId = requestAnimationFrame(step);
    }

    function getScrollStep() {
      const card = track.querySelector(".gallery-card-item");
      if (!card) return 340;
      const style = window.getComputedStyle(track);
      const gap = parseFloat(style.gap) || 20;
      return card.offsetWidth + gap;
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        smoothStepBy(-getScrollStep(), 400);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        smoothStepBy(getScrollStep(), 400);
      });
    }

    // Mouse events
    track.addEventListener("mousedown", (e) => {
      isDown = true;
      track.classList.add("is-dragging");
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      triggerTemporaryPause(3000);
    });

    track.addEventListener("mouseleave", () => {
      isDown = false;
      isHovered = false;
      track.classList.remove("is-dragging");
    });

    track.addEventListener("mouseenter", () => {
      isHovered = true;
    });

    track.addEventListener("mouseup", () => {
      isDown = false;
      track.classList.remove("is-dragging");
      triggerTemporaryPause(2000);
    });

    track.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeft - walk;
      checkLoopBounds();
    });

    // Touch events for mobile
    track.addEventListener("touchstart", (e) => {
      isDown = true;
      triggerTemporaryPause(3000);
    }, { passive: true });

    track.addEventListener("touchend", () => {
      isDown = false;
      isHovered = false;
      triggerTemporaryPause(2500);
    }, { passive: true });

    track.addEventListener("touchcancel", () => {
      isDown = false;
      isHovered = false;
      triggerTemporaryPause(2500);
    }, { passive: true });

    // Lightbox Popup Handling
    let currentIndex = 0;

    function openLightbox(index) {
      const item = window.galleryData[index];
      if (!item || !lightbox) return;
      currentIndex = index;

      lightboxImg.src = item.image;
      lightboxImg.alt = item.title;
      lightboxTitle.textContent = item.title;
      lightboxCaption.textContent = item.caption;
      lightboxCategory.textContent = item.category;
      lightboxDate.textContent = item.date;

      lightbox.classList.add("is-active");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      triggerTemporaryPause(10000);
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove("is-active");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      triggerTemporaryPause(1000);
    }

    if (lightboxClose) {
      lightboxClose.addEventListener("click", closeLightbox);
    }

    if (lightbox) {
      lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox || e.target.classList.contains("lightbox-backdrop")) {
          closeLightbox();
        }
      });
    }

    document.addEventListener("keydown", (e) => {
      if (!lightbox || !lightbox.classList.contains("is-active")) return;

      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        const nextIdx = (currentIndex + 1) % N;
        openLightbox(nextIdx);
      } else if (e.key === "ArrowLeft") {
        const prevIdx = (currentIndex - 1 + N) % N;
        openLightbox(prevIdx);
      }
    });
  });
})();

