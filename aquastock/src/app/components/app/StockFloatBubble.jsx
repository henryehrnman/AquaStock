export function StockFloatBubble({ isMobile, onReadyToStock }) {
  return (
    <button
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
      }}
    >
      →
    </button>
  );
}
