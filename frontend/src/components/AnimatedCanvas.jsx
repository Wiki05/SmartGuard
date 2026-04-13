import { useEffect, useRef } from "react";

/**
 * AnimatedCanvas
 * Renders an interactive particle-mesh network on a <canvas> element.
 * Particles float around, connect with lines when nearby, and react to mouse.
 */
export default function AnimatedCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let W = (canvas.width  = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    let animId;
    let mouse = { x: W / 2, y: H / 2 };

    /* ── Particles ── */
    const COUNT   = 90;
    const CONNECT = 150; // max distance for line
    const particles = Array.from({ length: COUNT }, () => ({
      x:   Math.random() * W,
      y:   Math.random() * H,
      vx:  (Math.random() - 0.5) * 0.45,
      vy:  (Math.random() - 0.5) * 0.45,
      r:   Math.random() * 1.8 + 0.5,
      // vary the particle color between neon-green and cyan
      hue: Math.random() > 0.5 ? "168,255,108" : "0,229,255",
    }));

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    const onMouse = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", onMouse);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      /* subtle radial gradient centred on mouse */
      const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 400);
      grd.addColorStop(0, "rgba(168,255,108,0.03)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      /* update + draw each particle */
      for (let i = 0; i < COUNT; i++) {
        const p = particles[i];

        /* gentle drift toward mouse */
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 250) {
          p.vx += (dx / dist) * 0.007;
          p.vy += (dy / dist) * 0.007;
        }

        /* speed cap */
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1.2) { p.vx *= 0.97; p.vy *= 0.97; }

        p.x += p.vx;
        p.y += p.vy;

        /* bounce */
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        p.x = Math.max(0, Math.min(W, p.x));
        p.y = Math.max(0, Math.min(H, p.y));

        /* draw dot */
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.hue}, 0.6)`;
        ctx.fill();

        /* draw connecting lines */
        for (let j = i + 1; j < COUNT; j++) {
          const q  = particles[j];
          const ex = p.x - q.x;
          const ey = p.y - q.y;
          const ed = Math.sqrt(ex * ex + ey * ey);
          if (ed < CONNECT) {
            const alpha = (1 - ed / CONNECT) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(168,255,108,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.85,
      }}
    />
  );
}
