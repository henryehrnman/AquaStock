import { useRef } from "react";

export function ClownfishLogo({ size = 56 }) {
  const O = "#FF6B35";
  const B = "#0d1117";
  const W = "#FFFFFF";
  const _ = null;

  const grid = [
    [ _,  _,  _,  _,  _,  B,  B,  _,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _,  _,  _,  _,  B,  O,  O,  B,  _,  _,  _,  _,  _,  _,  _,  _],
    [ _,  _,  _,  B,  B,  B,  B,  B,  B,  B,  _,  _,  _,  _,  _,  _],
    [ _,  _,  B,  O,  O,  B,  W,  B,  O,  O,  B,  _,  _,  B,  _,  _],
    [ _,  B,  O,  O,  B,  W,  W,  B,  O,  O,  O,  B,  B,  O,  B,  _],
    [ B,  O,  O,  O,  B,  W,  W,  B,  O,  O,  O,  O,  O,  O,  B,  _],
    [ B,  O,  B,  O,  B,  W,  W,  B,  O,  O,  O,  O,  O,  O,  B,  _],
    [ B,  O,  O,  O,  B,  W,  W,  B,  O,  O,  O,  O,  O,  O,  B,  _],
    [ _,  B,  O,  O,  B,  W,  W,  B,  O,  O,  O,  B,  B,  O,  B,  _],
    [ _,  _,  B,  O,  O,  B,  W,  B,  O,  O,  B,  _,  _,  B,  _,  _],
    [ _,  _,  _,  B,  B,  B,  B,  B,  B,  B,  _,  _,  _,  _,  _,  _],
  ];

  const cols = 16;
  const rows = 11;
  const px = size / cols;

  return (
    <svg width={size} height={Math.round(rows * px)} viewBox={`0 0 ${cols} ${rows}`} shapeRendering="crispEdges">
      {grid.map((row, y) =>
        row.map((color, x) =>
          color ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} /> : null
        )
      )}
    </svg>
  );
}

export function SwimmingFish({ size, top, duration, delay, direction = "right", opacity = 0.12, parallaxRef }) {
  const anim = direction === "right" ? "swim-right" : "swim-left";
  const appearDuration = useRef(30 + Math.random() * 40);
  const appearDelay = useRef(-(Math.random() * 30));
  return (
    <div ref={parallaxRef} className="swim-fish" style={{
      position: "absolute", top, left: 0, width: "100%", pointerEvents: "none",
      willChange: "transform",
      animation: `fish-appear ${appearDuration.current}s ease-in-out infinite`,
      animationDelay: `${appearDelay.current}s`,
    }}>
      <div style={{ display: "inline-block", animation: `${anim} ${duration}s linear infinite`, animationDelay: `${delay}s`, opacity, willChange: "transform" }}>
        <div style={{ transform: direction === "right" ? "scaleX(-1)" : undefined }}>
          <ClownfishLogo size={size} />
        </div>
      </div>
    </div>
  );
}

export function Bubble({ style, parallaxRef }) {
  const duration = useRef(8 + Math.random() * 12);
  const delay = useRef(Math.random() * 5);
  return (
    <div ref={parallaxRef} style={{ position: "absolute", willChange: "transform", ...style }}>
      <div className="bubble-inner" style={{
        width: "100%", height: "100%", borderRadius: "50%",
        background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12), rgba(255,255,255,0.02))",
        border: "1px solid rgba(255,255,255,0.06)",
        animation: `float ${duration.current}s ease-in-out infinite`,
        animationDelay: `${delay.current}s`,
        willChange: "transform",
        transform: "translateZ(0)",
      }} />
    </div>
  );
}
