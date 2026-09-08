// Gallery Carousel controller with step-by-step auto-play (move -> pause -> move forward), touch drag, and Lightbox modal.

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

    // Render 3 sets of items for seamless infinite forward looping
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

      // Initial scroll position set to Set 1 (middle set: index N)
      setTimeout(() => {
        const initialCard = track.children[N];
        if (initialCard) {
          track.scrollLeft = initialCard.offsetLeft - track.offsetLeft;
        }
      }, 50);
    }

    let isDown = false;
    let isHovered = false;
    let startX = 0;
    let scrollLeft = 0;
    let autoPlayTimer = null;
    let animFrameId = null;

    // Find card closest to current scrollLeft position
    function getClosestCardIndex() {
      const cards = track.children;
      if (!cards || cards.length === 0) return 0;
      const currentScroll = track.scrollLeft;

      let closestIdx = 0;
      let minDiff = Infinity;

      for (let i = 0; i < cards.length; i++) {
        const targetLeft = cards[i].offsetLeft - track.offsetLeft;
        const diff = Math.abs(currentScroll - targetLeft);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }
      return closestIdx;
    }

    function animateToCard(targetIndex, duration = 1600) {
      if (animFrameId) cancelAnimationFrame(animFrameId);

      const cards = track.children;
      if (!cards || !cards[targetIndex]) return;

      const startLeft = track.scrollLeft;
      const targetLeft = cards[targetIndex].offsetLeft - track.offsetLeft;
      const delta = targetLeft - startLeft;

      if (Math.abs(delta) < 2) {
        normalizeScrollPosition(targetIndex);
        return;
      }

      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4); // Smooth Ease-out Quartic

        track.scrollLeft = startLeft + (delta * ease);

        if (progress < 1) {
          animFrameId = requestAnimationFrame(step);
        } else {
          animFrameId = null;
          normalizeScrollPosition(targetIndex);
        }
      }

      animFrameId = requestAnimationFrame(step);
    }

    function normalizeScrollPosition(index) {
      const cards = track.children;
      if (!cards) return;

      let resetIndex = index;
      if (index >= 2 * N) {
        resetIndex = index - N;
      } else if (index < N) {
        resetIndex = index + N;
      }

      if (resetIndex !== index && cards[resetIndex]) {
        track.scrollLeft = cards[resetIndex].offsetLeft - track.offsetLeft;
      }
    }

    function stepForward() {
      const currentIdx = getClosestCardIndex();
      animateToCard(currentIdx + 1, 1600);
    }

    function stepBackward() {
      const currentIdx = getClosestCardIndex();
      animateToCard(currentIdx - 1, 1600);
    }

    function startAutoPlay() {
      stopAutoPlay();
      autoPlayTimer = setInterval(() => {
        if (isHovered || isDown) return;
        stepForward();
      }, 4500); // 4.5s pause between smooth glides
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    function pauseAndRestartAutoPlay() {
      stopAutoPlay();
      setTimeout(startAutoPlay, 4000);
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        pauseAndRestartAutoPlay();
        stepBackward();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        pauseAndRestartAutoPlay();
        stepForward();
      });
    }

    // Drag / Touch gestures
    track.addEventListener("mousedown", (e) => {
      isDown = true;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      track.classList.add("is-dragging");
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      stopAutoPlay();
    });

    track.addEventListener("mouseleave", () => {
      isDown = false;
      isHovered = false;
      track.classList.remove("is-dragging");
      startAutoPlay();
    });

    track.addEventListener("mouseenter", () => {
      isHovered = true;
    });

    track.addEventListener("mouseup", () => {
      isDown = false;
      track.classList.remove("is-dragging");
      pauseAndRestartAutoPlay();
    });

    track.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeft - walk;
    });

    // Touch events for mobile
    track.addEventListener("touchstart", () => {
      isDown = true;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      stopAutoPlay();
    }, { passive: true });

    track.addEventListener("touchend", () => {
      isDown = false;
      isHovered = false;
      pauseAndRestartAutoPlay();
    }, { passive: true });

    track.addEventListener("touchcancel", () => {
      isDown = false;
      isHovered = false;
      pauseAndRestartAutoPlay();
    }, { passive: true });

    startAutoPlay();

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
      stopAutoPlay();
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove("is-active");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      pauseAndRestartAutoPlay();
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


