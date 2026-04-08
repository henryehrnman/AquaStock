import { useEffect, useRef, useState } from "react";

function randBetween(a, b) {
  return a + Math.random() * (b - a);
}

const PHRASE = "Ready to Stock";

/** Smooth random drift on wrapper; hover shows phrase in bubble letters around the button. */
export function StockFloatBubble({ isMobile, onReadyToStock }) {
  const wrapRef = useRef(null);
  const pos = useRef({ x: 0, y: 0, r: 0 });
  const target = useRef({ x: 0, y: 0, r: 0 });
  const [hover, setHover] = useState(false);

  const btn = isMobile ? 52 : 58;
  const orbitR = isMobile ? 54 : 64;
  const pad = orbitR + 22;
  const box = btn + pad * 2;

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
    const ease = isMobile ? 0.011 : 0.009;

    let rafId = 0;
    const tick = () => {
      const el = wrapRef.current;
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

  const letterSlots = PHRASE.split("").map((ch, i) => ({ ch, i })).filter(({ ch }) => ch !== " ");
  const m = letterSlots.length;
  const cx = box - btn / 2;
  const cy = box - btn / 2;

  return (
    <div
      ref={wrapRef}
      className="stock-float-bubble-wrap"
      style={{
        position: "fixed",
        right: isMobile ? 14 : 22,
        bottom: isMobile ? "max(18px, env(safe-area-inset-bottom, 0px))" : "max(24px, env(safe-area-inset-bottom, 0px))",
        zIndex: 30,
        width: box,
        height: box,
        transform: "translate(0px, 0px) rotate(0deg)",
        willChange: "transform",
      }}
      onMouseLeave={() => setHover(false)}
    >
      {hover &&
        letterSlots.map(({ ch, i }, j) => {
          const angle = -Math.PI / 2 + (2 * Math.PI * (j + 0.5)) / m;
          const x = cx + orbitR * Math.cos(angle);
          const y = cy + orbitR * Math.sin(angle);

          return (
            <span
              key={`${ch}-${i}`}
              className="stock-float-bubble-letter"
              style={{
                position: "absolute",
                left: x,
                top: y,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                animationDelay: `${j * 0.028}s`,
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: isMobile ? 18 : 20,
                  height: isMobile ? 18 : 20,
                  padding: "0 4px",
                  borderRadius: 999,
                  fontSize: isMobile ? 9 : 10,
                  fontWeight: 800,
                  letterSpacing: 0.2,
                  color: "#e8f8ff",
                  background: "rgba(0, 40, 60, 0.75)",
                  border: "1px solid rgba(0, 229, 255, 0.55)",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.35), 0 0 14px rgba(0,229,255,0.25)",
                  fontFamily: "inherit",
                  lineHeight: 1,
                }}
              >
                {ch}
              </span>
            </span>
          );
        })}

      <button
        type="button"
        className="stock-float-bubble"
        aria-label="Ready to Stock"
        title="Ready to Stock"
        onClick={onReadyToStock}
        onMouseEnter={() => setHover(true)}
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: btn,
          height: btn,
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
        }}
      >
        →
      </button>
    </div>
  );
}
