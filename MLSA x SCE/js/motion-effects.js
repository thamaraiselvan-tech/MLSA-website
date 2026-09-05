// Premium motion effects — 3D tilt with glare, magnetic buttons, and navbar scroll.
// Skipped on touch devices and when reduced motion is preferred.

(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const MAX_TILT_DEGREES = 8;
  const isTouch = window.matchMedia("(hover: none)").matches;

  // ---- 3D Tilt Cards with Glare Effect ----
  function attachTiltWithGlare(card) {
    // Add glare overlay element
    let glare = card.querySelector(".card-glare");
    if (!glare) {
      glare = document.createElement("div");
      glare.className = "card-glare";
      card.appendChild(glare);
    }

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -MAX_TILT_DEGREES;
      const rotateY = ((x - centerX) / centerX) * MAX_TILT_DEGREES;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;

      // Update glare position
      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;
      glare.style.setProperty("--glare-x", percentX + "%");
      glare.style.setProperty("--glare-y", percentY + "%");
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  }

  if (!isTouch) {
    document.querySelectorAll(".tilt-card").forEach(attachTiltWithGlare);

    // Also add glare to hoverable event/update cards
    document.querySelectorAll(".card-fluent.card-hover").forEach((card) => {
      let glare = card.querySelector(".card-glare");
      if (!glare) {
        glare = document.createElement("div");
        glare.className = "card-glare";
        card.appendChild(glare);
      }

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;
        glare.style.setProperty("--glare-x", percentX + "%");
        glare.style.setProperty("--glare-y", percentY + "%");
      });
    });

    // Observe for dynamically added cards (events, updates)
    const grids = document.querySelectorAll("#updatesGrid, #eventsGrid, #winnersGroups");
    grids.forEach((grid) => {
      const obs = new MutationObserver(() => {
        grid.querySelectorAll(".card-fluent.card-hover").forEach((card) => {
          if (card.querySelector(".card-glare")) return; // already set up
          const glare = document.createElement("div");
          glare.className = "card-glare";
          card.appendChild(glare);

          card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            glare.style.setProperty("--glare-x", (x / rect.width) * 100 + "%");
            glare.style.setProperty("--glare-y", (y / rect.height) * 100 + "%");
          });
        });
      });
      obs.observe(grid, { childList: true, subtree: true });
    });
  }

  // ---- Magnetic Buttons (desktop only) ----
  if (!isTouch) {
    const MAX_PULL = 4; // max displacement in pixels

    document.querySelectorAll(".btn-fluent-primary, .btn-fluent-secondary").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const moveX = (x / rect.width) * MAX_PULL * 2;
        const moveY = (y / rect.height) * MAX_PULL * 2;

        btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  // ---- Navbar shadow on scroll ----
  const nav = document.querySelector(".navbar-mlsa");
  if (nav) {
    function onScroll() {
      nav.classList.toggle("navbar-scrolled", window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();
