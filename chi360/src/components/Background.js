import React, { useEffect, useRef } from 'react';

export default function Background() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W, H, lines, particles;

    function buildLines() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;

      // Generate topographic-style flowing lines like sedai.io
      lines = [];
      const count = 18;
      for (let i = 0; i < count; i++) {
        const points = [];
        const startX = -100;
        const startY = H * 0.25 + (i / count) * H * 0.6;
        const segments = 80;
        for (let j = 0; j <= segments; j++) {
          const t = j / segments;
          const x = startX + t * (W + 200);
          // Create layered wave with noise-like variation per line
          const y = startY
            + Math.sin(t * Math.PI * 3 + i * 0.7) * (30 + i * 4)
            + Math.sin(t * Math.PI * 7 + i * 1.3) * (10 + i * 1.5)
            + Math.cos(t * Math.PI * 2 + i * 0.4) * 20;
          points.push({ x, y });
        }
        lines.push({
          points,
          baseAlpha: 0.04 + Math.random() * 0.08,
          phase: Math.random() * Math.PI * 2,
          speed: 0.0003 + Math.random() * 0.0004,
          pulsePos: Math.random(),
          pulseSpeed: 0.0008 + Math.random() * 0.001,
          glowing: Math.random() > 0.65,
        });
      }

      // Floating particles
      particles = Array.from({ length: 55 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random(),
        speed: 0.0008 + Math.random() * 0.001,
        phase: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.06,
      }));
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);

      // Deep gradient background glow
      const grd = ctx.createRadialGradient(W * 0.6, H * 0.4, 0, W * 0.6, H * 0.4, W * 0.7);
      grd.addColorStop(0, 'rgba(50,70,180,0.04)');
      grd.addColorStop(0.5, 'rgba(30,30,80,0.03)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // Draw topographic lines
      lines.forEach((line) => {
        const alpha = line.baseAlpha + Math.sin(t * line.speed + line.phase) * 0.02;

        ctx.beginPath();
        line.points.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });

        if (line.glowing) {
          ctx.strokeStyle = `rgba(80,110,255,${alpha * 1.6})`;
          ctx.lineWidth = 0.8;
          ctx.shadowColor = 'rgba(79,110,247,0.6)';
          ctx.shadowBlur = 6;
        } else {
          ctx.strokeStyle = `rgba(120,140,255,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Traveling pulse dot along glowing lines
        if (line.glowing) {
          line.pulsePos = (line.pulsePos + line.pulseSpeed) % 1;
          const idx = Math.floor(line.pulsePos * (line.points.length - 1));
          const pt = line.points[idx];
          if (pt) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(120,150,255,0.9)`;
            ctx.shadowColor = 'rgba(100,140,255,1)';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      });

      // Stars / particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        const a = 0.15 + 0.35 * Math.abs(Math.sin(t * p.speed + p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,190,255,${a})`;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    }

    buildLines();
    rafRef.current = requestAnimationFrame(draw);
    window.addEventListener('resize', buildLines);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', buildLines);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
}
