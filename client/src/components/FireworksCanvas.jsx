import React, { useEffect, useRef } from 'react';

/**
 * FireworksCanvas
 * Lightweight, elegant background fireworks canvas.
 * - Gentle gold, amber, and festive orange sparks
 * - Subtle distant bursts behind content
 * - Strictly pointer-events: none (zero interference with clicks or scrolling)
 * - Respects prefers-reduced-motion
 * - Auto-pauses on document hidden (tab switch)
 * - Mobile particle reduction
 * - Zero audio
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
    let width = (canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth);
    let height = (canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight);

    const isMobile = width < 768;
    const maxParticles = isMobile ? 35 : 70;

    // Handle resize
    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle system
    const particles = [];
    const colorPalette = [
      '#FFD700', // Pure Gold
      '#FFB703', // Warm Amber
      '#FB8500', // Saffron Orange
      '#FF9E00', // Sunset Gold
      '#E63946', // Festive Crimson Sparkle
      '#FFF3B0'  // Bright Champagne
    ];

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2.8 + 0.8;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.gravity = 0.035;
        this.friction = 0.982;
        this.alpha = 1;
        this.decay = Math.random() * 0.012 + 0.01;
        this.size = Math.random() * 2 + 1.2;
      }

      update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }

      draw(c) {
        c.save();
        c.globalAlpha = Math.max(0, this.alpha);
        c.fillStyle = this.color;
        c.shadowBlur = 6;
        c.shadowColor = this.color;
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    function createBurst(x, y) {
      const count = isMobile ? 18 : 34;
      const baseColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      for (let i = 0; i < count; i++) {
        if (particles.length > maxParticles) {
          particles.shift();
        }
        const color = Math.random() > 0.3 ? baseColor : colorPalette[Math.floor(Math.random() * colorPalette.length)];
        particles.push(new Particle(x, y, color));
      }
    }

    let lastBurstTime = Date.now();
    let nextBurstDelay = 1200; // gentle pacing

    function loop() {
      if (isPaused) return;

      ctx.clearRect(0, 0, width, height);

      const now = Date.now();
      if (now - lastBurstTime > nextBurstDelay) {
        // Burst position: in the upper 20% to 65% area, randomly left/right
        const bx = width * 0.15 + Math.random() * (width * 0.7);
        const by = height * 0.12 + Math.random() * (height * 0.45);
        createBurst(bx, by);
        lastBurstTime = now;
        nextBurstDelay = 1600 + Math.random() * 1600; // 1.6s to 3.2s
      }

      // Update and draw particles
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
        lastBurstTime = Date.now();
        animId = requestAnimationFrame(loop);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial burst
    setTimeout(() => {
      if (!isPaused && canvas) {
        createBurst(width * 0.3, height * 0.25);
        createBurst(width * 0.7, height * 0.3);
      }
    }, 400);

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
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  );
}
