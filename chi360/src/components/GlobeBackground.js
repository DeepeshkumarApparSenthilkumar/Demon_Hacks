import React, { useEffect, useRef } from 'react';

// Simplified continent outlines as lat/lng polygon arrays
const CONTINENTS = [
  // North America
  [[70,-140],[70,-60],[50,-55],[45,-52],[35,-75],[25,-80],[15,-85],[10,-83],[8,-77],[8,-60],[15,-60],[20,-70],[25,-77],[30,-80],[35,-75],[40,-72],[45,-66],[50,-55],[55,-55],[60,-65],[65,-68],[70,-75],[72,-80],[72,-95],[70,-110],[68,-130],[70,-140]],
  // South America
  [[10,-75],[8,-60],[5,-52],[0,-50],[-5,-35],[-10,-37],[-15,-39],[-20,-40],[-23,-43],[-30,-50],[-35,-57],[-40,-62],[-45,-65],[-50,-68],[-55,-65],[-55,-68],[-53,-70],[-45,-65],[-40,-62],[-30,-50],[-20,-40],[-10,-75],[-5,-80],[0,-80],[5,-77],[10,-75]],
  // Europe
  [[70,30],[65,25],[60,22],[55,20],[50,15],[45,10],[43,5],[43,-2],[44,-8],[45,-9],[48,-5],[50,2],[51,2],[55,8],[58,5],[60,5],[65,14],[70,20],[72,25],[70,30]],
  // Africa
  [[35,10],[30,32],[20,37],[10,42],[0,42],[-10,40],[-20,35],[-30,30],[-35,20],[-35,18],[-30,17],[-20,12],[-10,13],[0,9],[5,2],[5,-8],[10,-15],[15,-17],[20,-17],[25,-15],[30,-10],[35,10]],
  // Asia
  [[70,30],[70,60],[70,100],[68,120],[65,140],[60,140],[55,135],[50,130],[45,135],[40,130],[35,120],[30,120],[25,120],[20,110],[15,100],[10,100],[5,100],[0,105],[5,95],[10,80],[15,75],[20,70],[25,65],[30,60],[35,55],[40,50],[45,40],[50,30],[55,30],[60,25],[65,25],[70,30]],
  // Australia
  [[-15,130],[-15,137],[-12,136],[-12,142],[-18,148],[-25,152],[-30,153],[-35,149],[-38,145],[-38,140],[-35,136],[-32,133],[-30,115],[-22,114],[-18,122],[-15,130]],
];

export default function GlobeBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId, time = 0;
    let width, height, cx, cy, radius;

    // Precompute continent block positions
    const continentBlocks = [];
    CONTINENTS.forEach(polygon => {
      // Sample points inside polygon bbox
      let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
      polygon.forEach(([lat, lng]) => {
        minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng); maxLng = Math.max(maxLng, lng);
      });
      for (let lat = minLat; lat <= maxLat; lat += 4) {
        for (let lng = minLng; lng <= maxLng; lng += 5) {
          if (pointInPolygon([lat, lng], polygon)) {
            continentBlocks.push({
              lat: lat * Math.PI / 180,
              lng: lng * Math.PI / 180,
              size: Math.random() * 2.5 + 1.0,
              brightness: Math.random() * 0.4 + 0.6,
              pulse: Math.random() * Math.PI * 2,
            });
          }
        }
      }
    });

    function pointInPolygon([lat, lng], polygon) {
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [yi, xi] = polygon[i];
        const [yj, xj] = polygon[j];
        if (((xi > lng) !== (xj > lng)) && (lat < (yj - yi) * (lng - xi) / (xj - xi) + yi)) {
          inside = !inside;
        }
      }
      return inside;
    }

    // Orbital rings
    const rings = [
      { tilt: 0.4,  rotSpeed: 0.00015, phase: 0,   opacity: 0.35, width: 0.8, scale: 1.28 },
      { tilt: -0.6, rotSpeed: 0.0001,  phase: 1.0, opacity: 0.25, width: 0.6, scale: 1.22 },
      { tilt: 1.2,  rotSpeed: 0.0002,  phase: 2.5, opacity: 0.20, width: 0.5, scale: 1.35 },
      { tilt: -1.0, rotSpeed: 0.00008, phase: 4.0, opacity: 0.18, width: 0.4, scale: 1.18 },
      { tilt: 0.2,  rotSpeed: 0.00025, phase: 3.2, opacity: 0.15, width: 0.4, scale: 1.40 },
    ];

    // Floating particles
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random(), y: Math.random(),
      size: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.0002 + 0.00005,
      angle: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    function resize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      cx = width / 2;
      cy = height / 2;
      radius = Math.min(width, height) * 0.40;
    }

    function project(latR, lngR, rot) {
      const lng2 = lngR + rot;
      const x3 = Math.cos(latR) * Math.sin(lng2);
      const y3 = Math.sin(latR);
      const z3 = Math.cos(latR) * Math.cos(lng2);
      // X-axis tilt 25deg
      const tilt = 0.42;
      const y4 = y3 * Math.cos(tilt) - z3 * Math.sin(tilt);
      const z4 = y3 * Math.sin(tilt) + z3 * Math.cos(tilt);
      return { x: cx + x3 * radius, y: cy - y4 * radius, z: z4 };
    }

    function drawRing(ring, rot) {
      const segs = 200;
      const ringRot = ring.phase + rot * ring.rotSpeed * 3000;
      ctx.beginPath();
      let first = true;
      for (let s = 0; s <= segs; s++) {
        const a = (s / segs) * Math.PI * 2;
        let x3 = Math.cos(a);
        let y3 = Math.sin(a) * Math.sin(ring.tilt);
        let z3 = Math.sin(a) * Math.cos(ring.tilt);
        // rotate ring
        const x4 = x3 * Math.cos(ringRot) - z3 * Math.sin(ringRot);
        const z4 = x3 * Math.sin(ringRot) + z3 * Math.cos(ringRot);
        // globe tilt
        const tilt = 0.42;
        const y5 = y3 * Math.cos(tilt) - z4 * Math.sin(tilt);
        const sx = cx + x4 * radius * ring.scale;
        const sy = cy - y5 * radius * ring.scale;
        const depth = z4 * Math.cos(tilt) + y3 * Math.sin(tilt);
        const alpha = ring.opacity * (0.3 + 0.7 * Math.max(0, depth + 0.5));
        if (first) { ctx.moveTo(sx, sy); first = false; }
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(180,220,255,${ring.opacity})`;
      ctx.lineWidth = ring.width;
      ctx.stroke();
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      time++;
      const rot = time * 0.0005;

      // ── Deep teal/navy background ─────────────────────────────────────
      const bg = ctx.createRadialGradient(cx * 0.6, cy * 0.4, 0, cx, cy, Math.max(width, height));
      bg.addColorStop(0, '#1a3a4a');
      bg.addColorStop(0.4, '#0d2535');
      bg.addColorStop(0.8, '#071520');
      bg.addColorStop(1, '#040d14');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // ── Floating particles in background ──────────────────────────────
      for (const p of particles) {
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150,200,240,${p.opacity * 0.5})`;
        ctx.fill();
      }

      // ── Globe dark sphere ─────────────────────────────────────────────
      const sphereGrad = ctx.createRadialGradient(
        cx - radius * 0.3, cy - radius * 0.3, 0,
        cx, cy, radius
      );
      sphereGrad.addColorStop(0, '#1a2540');
      sphereGrad.addColorStop(0.4, '#0d1828');
      sphereGrad.addColorStop(0.8, '#080f1c');
      sphereGrad.addColorStop(1, '#040810');
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.fill();

      // ── Sunburst / hot spot (top-left of globe) ───────────────────────
      const sunX = cx - radius * 0.45;
      const sunY = cy - radius * 0.45;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, radius * 0.9);
      sunGlow.addColorStop(0, 'rgba(255,240,200,0.95)');
      sunGlow.addColorStop(0.05, 'rgba(255,220,150,0.7)');
      sunGlow.addColorStop(0.15, 'rgba(255,160,80,0.35)');
      sunGlow.addColorStop(0.35, 'rgba(200,100,60,0.15)');
      sunGlow.addColorStop(0.6, 'rgba(100,50,30,0.05)');
      sunGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = sunGlow;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      // ── Latitude / longitude grid lines ──────────────────────────────
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      // Latitude lines
      for (let lat = -80; lat <= 80; lat += 20) {
        const latR = lat * Math.PI / 180;
        ctx.beginPath();
        let first = true;
        for (let lng = -180; lng <= 180; lng += 3) {
          const p = project(latR, lng * Math.PI / 180, rot);
          if (p.z < 0) { first = true; continue; }
          if (first) { ctx.moveTo(p.x, p.y); first = false; }
          else ctx.lineTo(p.x, p.y);
        }
        const alpha = 0.08 + (lat === 0 ? 0.06 : 0);
        ctx.strokeStyle = `rgba(150,210,255,${alpha})`;
        ctx.lineWidth = lat === 0 ? 0.7 : 0.4;
        ctx.stroke();
      }

      // Longitude lines
      for (let lng = -180; lng < 180; lng += 20) {
        const lngR = lng * Math.PI / 180;
        ctx.beginPath();
        let first = true;
        for (let lat = -90; lat <= 90; lat += 3) {
          const p = project(lat * Math.PI / 180, lngR, rot);
          if (p.z < 0) { first = true; continue; }
          if (first) { ctx.moveTo(p.x, p.y); first = false; }
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = 'rgba(150,210,255,0.07)';
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }
      ctx.restore();

      // ── Continent data blocks ─────────────────────────────────────────
      for (const b of continentBlocks) {
        const p = project(b.lat, b.lng, rot);
        if (p.z < 0) continue;
        b.pulse += 0.015;
        const pv = (Math.sin(b.pulse) + 1) / 2;
        const depth = 0.3 + 0.7 * p.z;
        const alpha = b.brightness * depth * (0.5 + 0.5 * pv) * 0.9;
        const sz = b.size * depth;

        // Glowing square block
        ctx.save();
        ctx.shadowColor = 'rgba(120,220,255,0.8)';
        ctx.shadowBlur = sz * 3;
        ctx.fillStyle = `rgba(180,230,255,${alpha})`;
        ctx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
        ctx.restore();

        // Bright center dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, sz * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,245,255,${alpha * 1.2})`;
        ctx.fill();
      }

      // ── Globe edge atmosphere ─────────────────────────────────────────
      // Cyan glow bottom
      const bottomGlow = ctx.createRadialGradient(cx, cy + radius * 0.7, 0, cx, cy + radius * 0.7, radius * 0.8);
      bottomGlow.addColorStop(0, 'rgba(0,220,255,0.25)');
      bottomGlow.addColorStop(0.4, 'rgba(0,180,220,0.12)');
      bottomGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.02, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = bottomGlow;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      // Limb white glow
      const limbGrad = ctx.createRadialGradient(cx, cy, radius * 0.9, cx, cy, radius * 1.05);
      limbGrad.addColorStop(0, 'rgba(200,230,255,0)');
      limbGrad.addColorStop(0.6, 'rgba(200,230,255,0.12)');
      limbGrad.addColorStop(1, 'rgba(200,230,255,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = limbGrad;
      ctx.lineWidth = radius * 0.08;
      ctx.stroke();

      // ── Orbital rings ─────────────────────────────────────────────────
      for (const ring of rings) drawRing(ring, rot);

      // ── Ring intersection particles (data nodes on rings) ─────────────
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + rot * 0.3;
        const rx = Math.cos(angle) * radius * 1.28;
        const ry = Math.sin(angle) * radius * 0.35;
        const px = cx + rx;
        const py = cy + ry;
        const dist = Math.sqrt(rx * rx + ry * ry);
        if (dist > radius * 0.5) {
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(180,230,255,0.6)';
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', inset: 0,
      width: '100%', height: '100%',
      zIndex: 0,
    }} />
  );
}