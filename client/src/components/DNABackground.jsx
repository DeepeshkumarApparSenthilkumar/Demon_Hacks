import { useEffect, useRef } from "react";

export default function DNABackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Color palette: red, yellow, white
    const COLORS = {
      red:    "rgba(220, 40,  40,",
      yellow: "rgba(220, 180, 0,",
      white:  "rgba(255, 255, 255,",
    };

    // Floating network nodes
    const nodes = Array.from({ length: 70 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.8 + 0.4,
      color: [COLORS.red, COLORS.yellow, COLORS.white][Math.floor(Math.random() * 3)],
    }));

    // DNA strand config — multiple helices across the canvas
    const DNA_STRANDS = [
      { x: 0.15, amplitude: 55, frequency: 0.018, speed: 0.6,  phase: 0    },
      { x: 0.50, amplitude: 60, frequency: 0.016, speed: 0.5,  phase: 2.1  },
      { x: 0.82, amplitude: 50, frequency: 0.020, speed: 0.7,  phase: 4.2  },
    ];

    const drawDNAStrand = (strand, time) => {
      const baseX = strand.x * canvas.width;
      const amp   = strand.amplitude;
      const freq  = strand.frequency;
      const spd   = strand.speed;
      const phase = strand.phase;

      // Draw both backbone strands
      for (let s = 0; s < 2; s++) {
        const offset = s === 0 ? 0 : Math.PI; // 180° apart = double helix
        ctx.beginPath();
        let started = false;

        for (let y = -20; y < canvas.height + 20; y += 3) {
          const angle = y * freq + time * spd + phase + offset;
          const x = baseX + Math.sin(angle) * amp;
          const depth = (Math.sin(angle) + 1) / 2; // 0–1 depth illusion

          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Color alternates: strand 0 = red, strand 1 = yellow
        const col = s === 0 ? COLORS.red : COLORS.yellow;
        ctx.strokeStyle = `${col}0.35)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw rungs (base pairs connecting the two strands)
      const rungSpacing = 28;
      for (let y = 0; y < canvas.height; y += rungSpacing) {
        const angle0 = y * freq + time * spd + phase;
        const angle1 = angle0 + Math.PI;
        const x0 = baseX + Math.sin(angle0) * amp;
        const x1 = baseX + Math.sin(angle1) * amp;
        const depth = (Math.sin(angle0) + 1) / 2;

        // Only draw rung when it's "facing forward" (depth > 0.1)
        if (depth > 0.08) {
          const alpha = depth * 0.45;
          const gradient = ctx.createLinearGradient(x0, y, x1, y);
          gradient.addColorStop(0,   `${COLORS.red}${alpha})`);
          gradient.addColorStop(0.5, `${COLORS.white}${alpha * 0.8})`);
          gradient.addColorStop(1,   `${COLORS.yellow}${alpha})`);

          ctx.beginPath();
          ctx.moveTo(x0, y);
          ctx.lineTo(x1, y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1 + depth * 1.5;
          ctx.stroke();

          // Node dots at rung ends
          [{ x: x0, col: COLORS.red }, { x: x1, col: COLORS.yellow }].forEach(({ x, col }) => {
            ctx.beginPath();
            ctx.arc(x, y, 2 + depth * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `${col}${alpha + 0.1})`;
            ctx.fill();
          });
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.008;

      // ── Floating network nodes ──────────────────────────────────────────────
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      // Connections between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.12;
            ctx.strokeStyle = `${nodes[i].color}${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Node dots
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `${n.color}0.22)`;
        ctx.fill();
      });

      // ── DNA Double Helices ─────────────────────────────────────────────────
      DNA_STRANDS.forEach((strand) => drawDNAStrand(strand, t));

      // ── Subtle horizontal scan line ─────────────────────────────────────────
      const scanY = ((t * 60) % (canvas.height + 100)) - 50;
      const scanGrad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
      scanGrad.addColorStop(0,   "rgba(220,40,40,0)");
      scanGrad.addColorStop(0.5, "rgba(220,40,40,0.04)");
      scanGrad.addColorStop(1,   "rgba(220,40,40,0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 40, canvas.width, 80);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.75 }}
      aria-hidden="true"
    />
  );
}
