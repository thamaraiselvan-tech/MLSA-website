// Hero 3D background - an animated particle network in the brand blue.
// Desktop-only (skipped on phones for battery/performance), respects
// prefers-reduced-motion, and fails silently to the existing gradient
// background if WebGL isn't available for any reason.

import * as THREE from "three";

const MOBILE_BREAKPOINT = 768;
const PARTICLE_COUNT = 55;
const CONNECT_DISTANCE = 11;
const BOUNDS = { x: 32, y: 16, z: 10 };

function shouldRun() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.innerWidth < MOBILE_BREAKPOINT) return false;
  return true;
}

function init() {
  const canvas = document.getElementById("hero3dCanvas");
  if (!canvas || !shouldRun()) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (err) {
    return; // WebGL unavailable - gradient background underneath still looks complete
  }

  const container = canvas.parentElement;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    50,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 30;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);

  // ---- Particles ----
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * BOUNDS.x * 2;
    positions[i * 3 + 1] = (Math.random() - 0.5) * BOUNDS.y * 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * BOUNDS.z * 2;
    velocities.push(
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.015
    );
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particleMaterial = new THREE.PointsMaterial({
    color: 0x0078d4,
    size: 0.55,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(points);

  // ---- Connecting lines between nearby particles ----
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x0078d4,
    transparent: true,
    opacity: 0.13,
  });
  let lineSegments = new THREE.LineSegments(new THREE.BufferGeometry(), lineMaterial);
  scene.add(lineSegments);

  function rebuildLines() {
    const pos = particleGeometry.attributes.position;
    const linePositions = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const dx = pos.getX(i) - pos.getX(j);
        const dy = pos.getY(i) - pos.getY(j);
        const dz = pos.getZ(i) - pos.getZ(j);
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < CONNECT_DISTANCE) {
          linePositions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
          linePositions.push(pos.getX(j), pos.getY(j), pos.getZ(j));
        }
      }
    }
    lineSegments.geometry.dispose();
    lineSegments.geometry = new THREE.BufferGeometry();
    lineSegments.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(linePositions, 3)
    );
  }

  // ---- Animation loop, paused when the hero scrolls out of view ----
  let isVisible = true;
  let frameId = null;

  function tick() {
    frameId = requestAnimationFrame(tick);

    const pos = particleGeometry.attributes.position;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x = pos.getX(i) + velocities[i * 3];
      let y = pos.getY(i) + velocities[i * 3 + 1];
      let z = pos.getZ(i) + velocities[i * 3 + 2];
      if (Math.abs(x) > BOUNDS.x) velocities[i * 3] *= -1;
      if (Math.abs(y) > BOUNDS.y) velocities[i * 3 + 1] *= -1;
      if (Math.abs(z) > BOUNDS.z) velocities[i * 3 + 2] *= -1;
      pos.setXYZ(i, x, y, z);
    }
    pos.needsUpdate = true;
    rebuildLines();

    points.rotation.y += 0.0006;
    lineSegments.rotation.y += 0.0006;

    renderer.render(scene, camera);
  }

  function start() {
    if (frameId === null) tick();
  }
  function stop() {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
        if (isVisible) start();
        else stop();
      });
    },
    { threshold: 0.01 }
  );
  visibilityObserver.observe(container);

  start();

  // ---- Resize handling, including crossing the mobile breakpoint live ----
  window.addEventListener("resize", () => {
    if (!shouldRun()) {
      canvas.style.display = "none";
      stop();
      return;
    }
    canvas.style.display = "";
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    if (isVisible) start();
  });
}

init();
