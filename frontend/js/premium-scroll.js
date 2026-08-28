// Premium scroll animations powered by GSAP ScrollTrigger + Lenis smooth scroll.
// Handles hero text entrance, staggered section card reveals, smooth scrolling, and scroll-triggered animations.

(function () {
  // ---- Lenis smooth scroll ----
  let lenis;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (typeof ScrollTrigger !== "undefined") {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  // ---- Skip all animations if reduced motion is preferred ----
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".gsap-reveal, .gsap-reveal-left, .gsap-reveal-right, .gsap-reveal-scale").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  // ---- 1. Hero Section Entrance Animation ----
  function animateHero() {
    const hero = document.querySelector(".hero-mlsa");
    if (!hero) return;

    const eyebrow = hero.querySelector(".eyebrow");
    const h1 = hero.querySelector("h1");
    const desc = hero.querySelector(".fs-6");
    const btns = hero.querySelectorAll(".btn");
    const logos = hero.querySelectorAll(".hero-logo");

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (eyebrow) tl.fromTo(eyebrow, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.1);
    if (h1) tl.fromTo(h1, { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.2);
    if (desc) tl.fromTo(desc, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.35);
    if (btns.length) tl.fromTo(btns, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 }, 0.45);
    if (logos.length) tl.fromTo(logos, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, stagger: 0.15 }, 0.25);
  }

  // Check if loader is active
  const loader = document.getElementById("siteLoader");
  const loaderActive = loader && !loader.classList.contains("is-hidden") && sessionStorage.getItem("mlsa_loader_shown") !== "1";

  if (loaderActive) {
    window.addEventListener("loaderDone", () => {
      animateHero();
      ScrollTrigger.refresh();
    });
  } else {
    animateHero();
  }

  // ---- 2. Standalone Headings & Eyebrows (outside of major sections) ----
  document.querySelectorAll("h2.fw-bold, h1.fw-bold").forEach((heading) => {
    if (heading.closest(".hero-mlsa, #about, #what-is-mlsa, #our-role, #contact")) return;

    gsap.from(heading, {
      y: 30,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
      scrollTrigger: {
        trigger: heading,
        start: "top 88%",
        once: true,
      },
    });
  });

  document.querySelectorAll(".text-fluent-primary.fw-semibold.small.text-uppercase, .eyebrow").forEach((el) => {
    if (el.closest(".hero-mlsa, #about, #what-is-mlsa, #our-role, #contact")) return;

    gsap.from(el, {
      x: -20,
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        once: true,
      },
    });
  });

  // ---- 3. Updates Grid (index.html) ----
  const updatesGrid = document.getElementById("updatesGrid");
  if (updatesGrid) {
    const observer = new MutationObserver(() => {
      const cards = updatesGrid.querySelectorAll(".col-md-6");
      if (cards.length === 0) return;
      observer.disconnect();

      gsap.from(cards, {
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: updatesGrid,
          start: "top 85%",
          once: true,
        },
      });
    });
    observer.observe(updatesGrid, { childList: true });
  }

  // ---- 4. Events Grid (events.html) ----
  const eventsGrid = document.getElementById("eventsGrid");
  if (eventsGrid) {
    const observer = new MutationObserver(() => {
      const cards = eventsGrid.querySelectorAll(".col-sm-6");
      if (cards.length === 0) return;
      observer.disconnect();

      gsap.from(cards, {
        y: 50,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: eventsGrid,
          start: "top 85%",
          once: true,
        },
      });
    });
    observer.observe(eventsGrid, { childList: true });
  }

  // ---- 5. About Section (#about) ----
  const aboutSection = document.getElementById("about");
  if (aboutSection) {
    const img = aboutSection.querySelector("img");
    const textCol = aboutSection.querySelector(".col-12.col-md-7, .col-md-7");

    if (img) {
      gsap.from(img, {
        x: -40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: aboutSection,
          start: "top 80%",
          once: true,
        },
      });
    }

    if (textCol) {
      gsap.from(textCol.children, {
        x: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: aboutSection,
          start: "top 80%",
          once: true,
        },
      });
    }
  }

  // ---- 6. What is MLSA Section (#what-is-mlsa) ----
  const mlsaSection = document.getElementById("what-is-mlsa");
  if (mlsaSection) {
    const textCol = mlsaSection.querySelector(".col-12.col-md-7, .col-md-7");
    const imgCol = mlsaSection.querySelector("img");

    if (textCol) {
      gsap.from(textCol.children, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: mlsaSection,
          start: "top 80%",
          once: true,
        },
      });
    }

    if (imgCol) {
      gsap.from(imgCol, {
        scale: 0.85,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: mlsaSection,
          start: "top 80%",
          once: true,
        },
      });
    }
  }

  // ---- 7. Our Role Section (#our-role) ----
  const roleSection = document.getElementById("our-role");
  if (roleSection) {
    const heading = roleSection.querySelector("h2");
    const eyebrow = roleSection.querySelector(".text-fluent-primary");
    const cards = roleSection.querySelectorAll(".tilt-card");

    if (eyebrow) {
      gsap.from(eyebrow, {
        x: -20,
        opacity: 0,
        duration: 0.5,
        scrollTrigger: { trigger: roleSection, start: "top 82%", once: true },
      });
    }

    if (heading) {
      gsap.from(heading, {
        y: 25,
        opacity: 0,
        duration: 0.6,
        scrollTrigger: { trigger: roleSection, start: "top 82%", once: true },
      });
    }

    if (cards.length) {
      gsap.from(cards, {
        y: 45,
        rotateX: 8,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: roleSection,
          start: "top 78%",
          once: true,
        },
      });
    }
  }

  // ---- 8. Contact Section (#contact) ----
  const contactSection = document.getElementById("contact");
  if (contactSection) {
    const card = contactSection.querySelector(".card-fluent");
    const eyebrow = contactSection.querySelector(".text-fluent-primary");
    const heading = contactSection.querySelector("h2");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: contactSection,
        start: "top 85%",
        once: true,
      },
    });

    if (eyebrow) tl.from(eyebrow, { x: -20, opacity: 0, duration: 0.5 });
    if (heading) tl.from(heading, { y: 20, opacity: 0, duration: 0.5 }, "-=0.3");
    if (card) tl.from(card, { y: 30, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.3");
  }

  // ---- 9. Winners Groups (winners.html) ----
  const winnersGroups = document.getElementById("winnersGroups");
  if (winnersGroups) {
    const observer = new MutationObserver(() => {
      const groups = winnersGroups.querySelectorAll(".winners-event-group");
      if (groups.length === 0) return;
      observer.disconnect();

      gsap.from(groups, {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: winnersGroups,
          start: "top 85%",
          once: true,
        },
      });
    });
    observer.observe(winnersGroups, { childList: true });
  }

  // ---- 10. Footer ----
  const footer = document.querySelector(".footer-mlsa");
  if (footer) {
    gsap.from(footer.querySelector(".container"), {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: footer,
        start: "top 92%",
        once: true,
      },
    });
  }

  // ---- 11. Multi-Layer 3D Parallax Effects ----
  const heroSection = document.querySelector(".hero-mlsa");
  if (heroSection) {
    const meshBlobs = heroSection.querySelectorAll(".hero-mesh-blob");
    const particles = heroSection.querySelectorAll(".hero-particle");
    const logos = heroSection.querySelectorAll(".hero-logo");

    if (meshBlobs.length) {
      gsap.to(meshBlobs, {
        y: 90,
        ease: "none",
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      });
    }

    if (logos.length) {
      gsap.to(logos, {
        y: -40,
        scale: 1.06,
        ease: "none",
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      });
    }

    if (particles.length) {
      gsap.to(particles, {
        y: -120,
        ease: "none",
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }
  }

  // Multi-layer parallax for About badge image
  const aboutSec = document.getElementById("about");
  if (aboutSec) {
    const aboutImg = aboutSec.querySelector("img");
    if (aboutImg) {
      gsap.to(aboutImg, {
        y: -35,
        rotateZ: -2,
        ease: "none",
        scrollTrigger: {
          trigger: aboutSec,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    }
  }

  // Multi-layer parallax for What is MLSA badge image
  const mlsaSec = document.getElementById("what-is-mlsa");
  if (mlsaSec) {
    const mlsaBadge = mlsaSec.querySelector("img");
    if (mlsaBadge) {
      gsap.to(mlsaBadge, {
        y: -30,
        rotateZ: 2,
        ease: "none",
        scrollTrigger: {
          trigger: mlsaSec,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    }
  }

  // Alternating depth parallax for Our Role cards
  const roleSec = document.getElementById("our-role");
  if (roleSec) {
    const cards = roleSec.querySelectorAll(".tilt-card");
    cards.forEach((card, index) => {
      const depth = (index % 2 === 0) ? -18 : 18;
      gsap.to(card, {
        y: depth,
        ease: "none",
        scrollTrigger: {
          trigger: roleSec,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      });
    });
  }

  // ---- 12. Cleanup fallback reveal classes ----
  document.querySelectorAll(".reveal").forEach((el) => {
    el.classList.remove("reveal");
    el.style.opacity = "1";
    el.style.transform = "none";
  });
})();
