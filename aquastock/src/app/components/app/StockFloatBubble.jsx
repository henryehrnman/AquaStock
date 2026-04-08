import { useEffect, useRef } from "react";

function randBetween(a, b) {
  return a + Math.random() * (b - a);
}

/** Smooth random drift (rAF + lerp). Slower / larger / new targets on a random schedule. */
export function StockFloatBubble({ isMobile, onReadyToStock }) {
  const btnRef = useRef(null);
  const pos = useRef({ x: 0, y: 0, r: 0 });
  const target = useRef({ x: 0, y: 0, r: 0 });

  useEffect(() => {
    const pickTarget = () => {
      if (isMobile) {
        target.current = {
          x: randBetween(-22, 10),
          y: randBetween(-52, 12),
          r: randBetween(-14, 14),
        };
      } else {
        target.current = {
          x: randBetween(-32, 28),
          y: randBetween(-56, 16),
          r: randBetween(-16, 16),
        };
      }
    };

    pickTarget();

    let timeoutId = 0;
    const scheduleNextTarget = () => {
      timeoutId = window.setTimeout(() => {
        pickTarget();
        scheduleNextTarget();
      }, randBetween(5200, 11000));
    };
    scheduleNextTarget();

    const lerp = (a, b, t) => a + (b - a) * t;
    /** Smaller = slower, smoother glide toward each random pose */
    const ease = isMobile ? 0.011 : 0.009;

    let rafId = 0;
    const tick = () => {
      const el = btnRef.current;
      const p = pos.current;
      const tg = target.current;
      p.x = lerp(p.x, tg.x, ease);
      p.y = lerp(p.y, tg.y, ease);
      p.r = lerp(p.r, tg.r, ease);
      if (el) {
        el.style.transform = `translate(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px) rotate(${p.r.toFixed(2)}deg)`;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [isMobile]);

  return (
    <button
      ref={btnRef}
      type="button"
      className="stock-float-bubble"
      aria-label="Ready to Stock"
      title="Ready to Stock"
      onClick={onReadyToStock}
      style={{
        position: "fixed",
        right: isMobile ? 14 : 22,
        bottom: isMobile ? "max(18px, env(safe-area-inset-bottom, 0px))" : "max(24px, env(safe-area-inset-bottom, 0px))",
        zIndex: 30,
        width: isMobile ? 52 : 58,
        height: isMobile ? 52 : 58,
        borderRadius: "50%",
        border: "2px solid rgba(0,229,255,0.55)",
        background: "linear-gradient(145deg, #00b0ff, #00e5ff)",
        color: "#0a1628",
        fontSize: isMobile ? 20 : 24,
        fontWeight: 700,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        fontFamily: "inherit",
        lineHeight: 1,
        transform: "translate(0px, 0px) rotate(0deg)",
      }}
    >
      →
    </button>
  );
}
