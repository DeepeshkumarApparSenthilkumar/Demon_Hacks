import React, { useEffect, useRef } from 'react';

export default function HolographicOrb() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId, time = 0;
    let W, H;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    // Fluid noise function
    function noise(x, y, t) {
      const v1 = Math.sin(x * 1.2 + t * 0.7) * Math.cos(y * 0.8 - t * 0.5);
      const v2 = Math.sin(x * 0.6 - t * 0.4 + y * 1.1);
      const v3 = Math.cos(Math.sqrt((x * x + y * y) * 0.5) - t * 0.9);
      const v4 = Math.sin(x * 0.9 + y * 0.9 + t * 0.6);
      return (v1 + v2 + v3 + v4) / 4;
    }

    // Map noise value to iridescent color
    function noiseToColor(v, t) {
      // Shift hue based on noise + time for iridescent effect
      const hue = ((v + 1) * 180 + t * 20) % 360;
      const sat = 70 + (v + 1) * 15;
      const lit = 45 + (v + 1) * 20;
      return `hsl(${hue}, ${sat}%, ${lit}%)`;
    }

    // Orb params
    const ORB_X = () => W * 0.62;
    const ORB_Y = () => H * 0.42;
    const ORB_R = () => Math.min(W, H) * 0.28;

    function draw() {
      time += 0.012;
      ctx.clearRect(0, 0, W, H);

      const ox = ORB_X(), oy = ORB_Y(), or_ = ORB_R();

      // ── Deep dark background ───────────────────────────────────────────
      ctx.fillStyle = '#04060e';
      ctx.fillRect(0, 0, W, H);

      // ── Purple ambient light blobs ─────────────────────────────────────
      const blobs = [
        { x: W * 0.15, y: H * 0.3, r: W * 0.35, color: 'rgba(80,20,140,0.18)' },
        { x: W * 0.85, y: H * 0.7, r: W * 0.3,  color: 'rgba(40,10,120,0.14)' },
        { x: W * 0.5,  y: H * 0.9, r: W * 0.4,  color: 'rgba(20,0,80,0.12)'  },
      ];
      for (const b of blobs) {
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, b.color);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      // ── Holographic orb ────────────────────────────────────────────────
      // Render fluid noise inside a clipped circle
      const step = 4; // pixel step — lower = higher quality
      ctx.save();
      ctx.beginPath();
      ctx.arc(ox, oy, or_, 0, Math.PI * 2);
      ctx.clip();

      for (let px = ox - or_; px < ox + or_; px += step) {
        for (let py = oy - or_; py < oy + or_; py += step) {
          const dx = (px - ox) / or_;
          const dy = (py - oy) / or_;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 1) continue;

          // Spherical distortion
          const nx = dx * 2.5 + Math.sin(time * 0.3) * 0.3;
          const ny = dy * 2.5 + Math.cos(time * 0.25) * 0.3;

          const v = noise(nx, ny, time);

          // Edge darkening (sphere shading)
          const edgeDark = Math.max(0, 1 - dist * 1.1);
          const lit = edgeDark * (0.6 + (v + 1) * 0.2);

          // Iridescent color
          const hue = ((v + 1) * 160 + time * 25 + dist * 60) % 360;
          const sat = 75 + dist * 20;
          const lightness = lit * 65;

          ctx.fillStyle = `hsla(${hue},${sat}%,${lightness}%,0.96)`;
          ctx.fillRect(px, py, step, step);
        }
      }

      // ── Specular highlight (top-left shine) ───────────────────────────
      const shine = ctx.createRadialGradient(
        ox - or_ * 0.35, oy - or_ * 0.35, 0,
        ox - or_ * 0.1,  oy - or_ * 0.1,  or_ * 0.7
      );
      shine.addColorStop(0, 'rgba(255,255,255,0.55)');
      shine.addColorStop(0.3, 'rgba(255,255,255,0.12)');
      shine.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = shine;
      ctx.fillRect(ox - or_, oy - or_, or_ * 2, or_ * 2);

      ctx.restore();

      // ── Outer glow ring ────────────────────────────────────────────────
      const glow = ctx.createRadialGradient(ox, oy, or_ * 0.85, ox, oy, or_ * 1.4);
      glow.addColorStop(0, 'rgba(120,80,255,0.22)');
      glow.addColorStop(0.4, 'rgba(60,120,255,0.10)');
      glow.addColorStop(0.7, 'rgba(200,80,255,0.06)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(ox, oy, or_ * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // ── Thin border ring ───────────────────────────────────────────────
      ctx.beginPath();
      ctx.arc(ox, oy, or_ * 1.01, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(180,140,255,0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // ── Floating particles around orb ─────────────────────────────────
      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2 + time * (i % 2 === 0 ? 0.15 : -0.1);
        const radius = or_ * (1.15 + 0.12 * Math.sin(time * 0.8 + i));
        const px2 = ox + Math.cos(angle) * radius;
        const py2 = oy + Math.sin(angle) * radius * 0.55; // elliptical
        const pSize = 1 + Math.sin(time * 1.2 + i * 0.8) * 0.8;
        const alpha = 0.3 + Math.sin(time + i) * 0.2;
        const hue2 = (i * 15 + time * 30) % 360;
        ctx.beginPath();
        ctx.arc(px2, py2, pSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue2},80%,70%,${alpha})`;
        ctx.fill();
      }

      // ── Lens flare streaks ─────────────────────────────────────────────
      for (let i = 0; i < 6; i++) {
        const angle2 = (i / 6) * Math.PI * 2 + time * 0.05;
        const len = or_ * (0.4 + 0.3 * Math.sin(time * 0.7 + i));
        const lx = ox - or_ * 0.3 + Math.cos(angle2) * len;
        const ly = oy - or_ * 0.3 + Math.sin(angle2) * len;
        ctx.beginPath();
        ctx.moveTo(ox - or_ * 0.3, oy - or_ * 0.3);
        ctx.lineTo(lx, ly);
        ctx.strokeStyle = `rgba(255,255,255,${0.03 + i * 0.01})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}
