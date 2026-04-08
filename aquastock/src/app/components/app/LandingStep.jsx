import { ClownfishLogo } from "../ambient/AmbientAquariumDecor.jsx";

export function LandingStep({ fadeIn, isMobile, onStart }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
      textAlign: "center", gap: isMobile ? 20 : 32, padding: isMobile ? "0 20px" : 0,
      opacity: fadeIn ? 1 : 0, transition: "opacity 0.6s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, animation: "fadeUp 0.8s ease both" }}>
        <div style={{
          width: isMobile ? 52 : 72, height: isMobile ? 52 : 72, borderRadius: 20,
          background: "linear-gradient(135deg, rgba(0,229,255,0.2), rgba(0,176,255,0.1))",
          border: "1px solid rgba(0,229,255,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 40px rgba(0,229,255,0.15)",
        }}>
          <ClownfishLogo size={isMobile ? 38 : 52} />
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(42px, 7vw, 72px)", fontWeight: 700,
          background: "linear-gradient(135deg, #e0f7fa, #00e5ff, #00b0ff, #e0f7fa)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          animation: "shimmer 4s linear infinite",
          letterSpacing: -1,
          lineHeight: 1.2,
          padding: "6px 2px",
        }}>
          AquaStock
        </h1>
      </div>

      <p style={{
        fontSize: 20, color: "rgba(176,222,255,0.7)", maxWidth: 520, lineHeight: 1.6,
        fontWeight: 300, letterSpacing: 0.3,
        animation: "fadeUp 0.8s ease 0.2s both",
      }}>
        Discover the perfect inhabitants for your aquarium. Enter your tank parameters and we'll match you with compatible fish, invertebrates, corals, and amphibians.
      </p>

      <button
        type="button"
        onClick={onStart}
        className="glow-btn"
        style={{
          padding: "18px 48px", fontSize: 17, fontWeight: 600,
          fontFamily: "inherit",
          background: "linear-gradient(135deg, #00b0ff, #00e5ff)",
          border: "none", borderRadius: 60, color: "#0a1628",
          cursor: "pointer", letterSpacing: 0.5,
          boxShadow: "0 0 20px rgba(0,229,255,0.25), 0 4px 20px rgba(0,0,0,0.3)",
          transition: "all 0.3s ease",
          animation: "fadeUp 0.8s ease 0.4s both",
        }}
      >
        Start Stocking →
      </button>

      <div style={{
        display: "flex", gap: isMobile ? 20 : 40, marginTop: 20, flexWrap: "wrap", justifyContent: "center",
        animation: "fadeUp 0.8s ease 0.6s both",
      }}>
        {[
          { icon: "🐠", label: "Fish" },
          { icon: "🦐", label: "Inverts" },
          { icon: "🪸", label: "Corals" },
          { icon: "🐸", label: "Amphibians" },
        ].map((c) => (
          <div key={c.label} style={{ textAlign: "center", opacity: 0.5 }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{c.icon}</div>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, fontWeight: 500 }}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
