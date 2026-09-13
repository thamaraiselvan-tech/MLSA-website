/**
 * MLSA × SCE - Confetti Burst Generator (Pure JS Canvas)
 */
(function () {
    'use strict';

    window.triggerConfetti = function () {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.id = 'confetti-canvas';
        Object.assign(canvas.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: '99999'
        });

        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        const width = canvas.width = window.innerWidth;
        const height = canvas.height = window.innerHeight;

        const colors = ['#0078d4', '#005a9e', '#8764b8', '#ffb900', '#107c10', '#50e6ff'];
        const particles = [];
        const numParticles = 120;

        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: width * 0.5 + (Math.random() - 0.5) * width * 0.8,
                y: -20 - Math.random() * 150,
                vx: (Math.random() - 0.5) * 3,
                vy: Math.random() * 2 + 1,
                gravity: 0.05 + Math.random() * 0.03,
                size: Math.random() * 7 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                vRot: (Math.random() - 0.5) * 2.5,
                shape: Math.random() > 0.4 ? 'rect' : 'circle',
                swayFrequency: 0.002 + Math.random() * 0.003,
                opacity: 1
            });
        }

        let startTime = performance.now();
        const DURATION = 7500; // 7.5s graceful float

        function animate(now) {
            const elapsed = now - startTime;
            if (elapsed > DURATION) {
                canvas.remove();
                return;
            }

            ctx.clearRect(0, 0, width, height);

            particles.forEach((p) => {
                p.x += p.vx + Math.sin(now * p.swayFrequency) * 0.7;
                p.y += p.vy;
                p.vy += p.gravity;
                p.vy = Math.min(p.vy, 2.5); // Cap terminal velocity for gentle fall
                p.rotation += p.vRot;
                if (elapsed > DURATION - 1500) {
                    p.opacity = Math.max(0, (DURATION - elapsed) / 1500);
                }

                ctx.save();
                ctx.globalAlpha = p.opacity;
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;

                if (p.shape === 'rect') {
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            });

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    };

    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(window.triggerConfetti, 400);
    });
})();
