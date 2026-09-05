// Gallery Carousel controller with touch drag, auto-play, navigation arrows, and Lightbox modal.

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

    // 1. Render Gallery Cards
    renderGalleryCards();

    function renderGalleryCards() {
      track.innerHTML = "";
      window.galleryData.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "gallery-card-item";
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", `View ${item.title}`);
        card.dataset.index = index;

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

        card.addEventListener("click", () => openLightbox(index));
        card.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openLightbox(index);
          }
        });

        track.appendChild(card);
      });
    }

    // 2. Carousel Controls & Drag/Swipe
    let isDown = false;
    let startX;
    let scrollLeft;
    let autoPlayTimer = null;

    // Scroll calculation helper
    function getScrollStep() {
      const firstCard = track.querySelector(".gallery-card-item");
      if (!firstCard) return 320;
      return firstCard.offsetWidth + 20; // card width + gap
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        pauseAutoPlay();
        track.scrollBy({ left: -getScrollStep(), behavior: "smooth" });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        pauseAutoPlay();
        track.scrollBy({ left: getScrollStep(), behavior: "smooth" });
      });
    }

    // Drag / Touch gestures
    track.addEventListener("mousedown", (e) => {
      isDown = true;
      track.classList.add("is-dragging");
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      pauseAutoPlay();
    });

    track.addEventListener("mouseleave", () => {
      isDown = false;
      track.classList.remove("is-dragging");
    });

    track.addEventListener("mouseup", () => {
      isDown = false;
      track.classList.remove("is-dragging");
    });

    track.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeft - walk;
    });

    // Auto Play loop
    function startAutoPlay() {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
      autoPlayTimer = setInterval(() => {
        if (track.matches(":hover") || isDown) return;
        const maxScrollLeft = track.scrollWidth - track.clientWidth;
        if (track.scrollLeft >= maxScrollLeft - 10) {
          track.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          track.scrollBy({ left: getScrollStep(), behavior: "smooth" });
        }
      }, 2500);
    }

    function pauseAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
      setTimeout(startAutoPlay, 2000); // Resume auto-play after 8s of inactivity
    }

    track.addEventListener("mouseenter", pauseAutoPlay);
    track.addEventListener("touchstart", pauseAutoPlay, { passive: true });

    startAutoPlay();

    // 3. Lightbox Popup Handling
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
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove("is-active");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
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
        const nextIdx = (currentIndex + 1) % window.galleryData.length;
        openLightbox(nextIdx);
      } else if (e.key === "ArrowLeft") {
        const prevIdx = (currentIndex - 1 + window.galleryData.length) % window.galleryData.length;
        openLightbox(prevIdx);
      }
    });
  });
})();
