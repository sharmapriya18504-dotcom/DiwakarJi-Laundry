import React, { useEffect, useRef } from 'react';

/**
 * FireworksCanvas
 * Grand, spectacular Diwali festival fireworks display.
 * - Rising rockets with fiery ember trails
 * - Large magnificent radial bursts ("Bde Bde Patake") with 80-120 glowing sparks
 * - Dual-layer particle trails for weeping-willow golden sparks
 * - Vibrant festive palette (Gold, Saffron, Crimson, Cyan, Violet, Champagne)
 * - Strictly pointer-events: none (zero interference with clicks or scrolling)
 * - Auto-pauses when tab is hidden, respects reduced motion
 */
export default function FireworksCanvas({ enabled = true, className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = null;
    let isPaused = false;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;
    const maxParticles = isMobile ? 180 : 380;

    // Handle resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Color palettes for majestic bursts
    const colorThemes = [
      ['#FFD700', '#FFB703', '#FB8500', '#FFF3B0', '#FFFFFF'], // Royal Gold & Saffron
      ['#FF1744', '#F43F5E', '#FFD700', '#FDA4AF', '#FFFFFF'], // Festive Crimson & Gold
      ['#38BDF8', '#0284C7', '#7DD3FC', '#FFD700', '#FFFFFF'], // Electric Cyan & Star Gold
      ['#C084FC', '#A855F7', '#E879F9', '#FFD700', '#FFFFFF'], // Royal Purple & Violet
      ['#4ADE80', '#22C55E', '#A7F3D0', '#FFD700', '#FFFFFF']  // Emerald Green & Gold
    ];

    const rockets = [];
    const particles = [];

    // Rocket Class: launches from bottom to sky
    class Rocket {
      constructor(targetX, targetY) {
        this.x = targetX + (Math.random() * 40 - 20);
        this.y = height + 10;
        this.targetY = targetY;
        const totalDistance = height - targetY;
        this.vy = -(Math.random() * 2.5 + Math.sqrt(totalDistance * 0.45));
        this.vx = (targetX - this.x) * 0.02 + (Math.random() * 1.2 - 0.6);
        this.color = '#FFE57F';
        this.trail = [];
        this.exploded = false;
        this.theme = colorThemes[Math.floor(Math.random() * colorThemes.length)];
      }

      update() {
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 7) this.trail.shift();

        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.08; // slight drag

        if (this.y <= this.targetY || this.vy >= -1) {
          this.exploded = true;
          createGrandBurst(this.x, this.y, this.theme);
        }
      }

      draw(c) {
        // Draw trailing rocket sparks
        for (let i = 0; i < this.trail.length; i++) {
          const t = this.trail[i];
          const trailAlpha = (i / this.trail.length) * 0.8;
          c.save();
          c.globalAlpha = trailAlpha;
          c.fillStyle = '#FFA000';
          c.beginPath();
          c.arc(t.x, t.y, 2.2, 0, Math.PI * 2);
          c.fill();
          c.restore();
        }

        // Rocket head
        c.save();
        c.fillStyle = '#FFFFFF';
        c.shadowColor = '#FFD700';
        c.shadowBlur = 10;
        c.beginPath();
        c.arc(this.x, this.y, 3, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    // Sparkle Particle Class
    class Particle {
      constructor(x, y, color, speedMult = 1) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        // Big radial explosion speed: 2.5 to 7.0
        const speed = (Math.random() * 4.6 + 2.0) * speedMult;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.gravity = 0.055;
        this.friction = 0.965; // creates wide majestic spread
        this.alpha = 1;
        this.decay = Math.random() * 0.012 + 0.009;
        this.size = Math.random() * 2.8 + 1.8;
        this.trail = [];
      }

      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 4) this.trail.shift();

        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }

      draw(c) {
        // Sparkle tail
        if (this.trail.length > 1) {
          c.save();
          c.globalAlpha = Math.max(0, this.alpha * 0.6);
          c.strokeStyle = this.color;
          c.lineWidth = this.size * 0.8;
          c.beginPath();
          c.moveTo(this.trail[0].x, this.trail[0].y);
          for (let i = 1; i < this.trail.length; i++) {
            c.lineTo(this.trail[i].x, this.trail[i].y);
          }
          c.stroke();
          c.restore();
        }

        // Main glowing spark
        c.save();
        c.globalAlpha = Math.max(0, this.alpha);
        c.fillStyle = this.color;
        c.shadowBlur = 12;
        c.shadowColor = this.color;
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    // Grand Explosion ("Bda Pataka")
    function createGrandBurst(x, y, theme) {
      const colors = theme || colorThemes[Math.floor(Math.random() * colorThemes.length)];
      const count = isMobile ? 55 : 95;

      for (let i = 0; i < count; i++) {
        if (particles.length > maxParticles) {
          particles.shift();
        }
        const color = colors[Math.floor(Math.random() * colors.length)];
        const speedMult = Math.random() > 0.85 ? 1.3 : 1.0;
        particles.push(new Particle(x, y, color, speedMult));
      }

      // Add a small cluster of bright glittering champagne flashes
      for (let j = 0; j < (isMobile ? 10 : 20); j++) {
        if (particles.length > maxParticles) particles.shift();
        particles.push(new Particle(x, y, '#FFFFFF', 0.65));
      }
    }

    // Launch a rocket towards sky
    function launchRocket() {
      const tx = width * 0.12 + Math.random() * (width * 0.76);
      const ty = height * 0.12 + Math.random() * (height * 0.38);
      rockets.push(new Rocket(tx, ty));
    }

    let lastLaunchTime = Date.now();
    let nextLaunchDelay = 900;

    function loop() {
      if (isPaused) return;

      // Clear with slight trail retention for smooth glow
      ctx.clearRect(0, 0, width, height);

      const now = Date.now();
      if (now - lastLaunchTime > nextLaunchDelay) {
        launchRocket();
        // Occasionally launch a double burst for grand celebration
        if (Math.random() > 0.55) {
          setTimeout(launchRocket, 250);
        }
        lastLaunchTime = now;
        nextLaunchDelay = 1100 + Math.random() * 1400; // between 1.1s and 2.5s
      }

      // Update & Draw Rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.update();
        if (r.exploded) {
          rockets.splice(i, 1);
        } else {
          r.draw(ctx);
        }
      }

      // Update & Draw Burst Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        } else {
          p.draw(ctx);
        }
      }

      animId = requestAnimationFrame(loop);
    }

    // Visibility change handler (pause when tab hidden)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true;
        if (animId) cancelAnimationFrame(animId);
      } else {
        isPaused = false;
        lastLaunchTime = Date.now();
        animId = requestAnimationFrame(loop);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial grand celebration bursts on activation
    setTimeout(() => {
      if (!isPaused) {
        launchRocket();
        setTimeout(launchRocket, 300);
        setTimeout(launchRocket, 700);
      }
    }, 200);

    animId = requestAnimationFrame(loop);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`fireworks-canvas ${className}`}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 10
      }}
    />
  );
}
