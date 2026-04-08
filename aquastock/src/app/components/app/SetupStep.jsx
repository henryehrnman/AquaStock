export function SetupStep({
  fadeIn,
  catalogStatus,
  onBack,
  onFindSpecies,
  waterType,
  setWaterType,
  setPh,
  tankSize,
  setTankSize,
  dimMode,
  setDimMode,
  tankL,
  setTankL,
  tankW,
  setTankW,
  tankH,
  setTankH,
  showParams,
  setShowParams,
  temp,
  setTemp,
  ph,
  gh,
  kh,
  setGh,
  setKh,
}) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center",
      gap: 32, paddingTop: 40, paddingBottom: 40,
      opacity: fadeIn ? 1 : 0, transition: "opacity 0.6s ease",
    }}>
      <div style={{ animation: "fadeUp 0.6s ease both" }}>
        <button type="button" onClick={onBack} style={{
          background: "none", border: "none", color: "rgba(176,222,255,0.5)",
          cursor: "pointer", fontSize: 14, fontFamily: "inherit", marginBottom: 16,
        }}>← Back</button>
        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 36, fontWeight: 700, marginBottom: 8,
        }}>
          Tell us about your tank
        </h2>
        <p style={{ color: "rgba(176,222,255,0.5)", fontSize: 15, fontWeight: 300 }}>
          We'll find every species that thrives in your water conditions.
        </p>
      </div>

      <div style={{ animation: "fadeUp 0.6s ease 0.1s both" }}>
        <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "rgba(176,222,255,0.5)", fontWeight: 600, display: "block", marginBottom: 12 }}>
          Water Type
        </label>
        <div style={{ display: "flex", gap: 12 }}>
          {["freshwater", "saltwater"].map((w) => (
            <button
              type="button"
              key={w}
              onClick={() => {
                setWaterType(w);
                if (w === "saltwater" && ph < 8.0) setPh(8.2);
                if (w === "freshwater" && ph > 8.0) setPh(7.0);
                if (w === "saltwater") { setGh(10); setKh(9); }
                if (w === "freshwater") { setGh(8); setKh(5); }
              }}
              style={{
                flex: 1, padding: "16px 24px", borderRadius: 16,
                background: waterType === w
                  ? "linear-gradient(135deg, rgba(0,229,255,0.15), rgba(0,176,255,0.1))"
                  : "rgba(255,255,255,0.03)",
                border: waterType === w ? "1px solid rgba(0,229,255,0.4)" : "1px solid rgba(255,255,255,0.06)",
                color: waterType === w ? "#00e5ff" : "rgba(176,222,255,0.5)",
                cursor: "pointer", fontSize: 15, fontFamily: "inherit", fontWeight: 500,
                transition: "all 0.3s ease",
                textTransform: "capitalize",
              }}
            >
              {w === "freshwater" ? "🌿" : "🌊"} {w}
            </button>
          ))}
        </div>
      </div>

      <div style={{ animation: "fadeUp 0.6s ease 0.2s both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "rgba(176,222,255,0.5)", fontWeight: 600 }}>
            Tank Size
          </label>
          <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: 3, border: "1px solid rgba(255,255,255,0.08)" }}>
            {[["Volume", false], ["Dimensions", true]].map(([label, val]) => (
              <button type="button" key={label} onClick={() => setDimMode(val)} style={{
                padding: "5px 14px", borderRadius: 16, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 600, fontFamily: "inherit",
                background: dimMode === val ? "rgba(0,229,255,0.15)" : "transparent",
                color: dimMode === val ? "#00e5ff" : "rgba(176,222,255,0.4)",
                transition: "all 0.2s ease",
              }}>{label}</button>
            ))}
          </div>
        </div>

        {!dimMode ? (
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "20px 24px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: "#00e5ff" }}>{tankSize}</span>
              <span style={{ color: "rgba(176,222,255,0.4)", fontSize: 14 }}>gallons</span>
            </div>
            <input type="range" min={5} max={200} value={tankSize} onChange={(e) => setTankSize(+e.target.value)} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "rgba(176,222,255,0.3)" }}>
              <span>5 gal</span><span>200 gal</span>
            </div>
          </div>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "20px 24px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[["L", tankL, setTankL], ["W", tankW, setTankW], ["H", tankH, setTankH]].map(([lbl, val, setter]) => {
                const update = (newVal) => {
                  const v = Math.max(0.1, Math.round(newVal * 10) / 10);
                  setter(v);
                  const newL = lbl === "L" ? v : tankL;
                  const newW = lbl === "W" ? v : tankW;
                  const newH = lbl === "H" ? v : tankH;
                  setTankSize(Math.max(0.1, Math.round((newL * newW * newH) / 231 * 10) / 10));
                };
                const btnStyle = {
                  flex: 1, padding: "4px 0", border: "none", cursor: "pointer",
                  background: "rgba(0,229,255,0.08)", color: "rgba(176,222,255,0.7)",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 700,
                  transition: "background 0.15s",
                };
                return (
                  <div key={lbl}>
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(176,222,255,0.4)", marginBottom: 6 }}>{lbl} (in)</div>
                    <div style={{ borderRadius: 10, border: "1px solid rgba(0,229,255,0.2)", overflow: "hidden", background: "rgba(0,229,255,0.06)" }}>
                      <div style={{ display: "flex", borderBottom: "1px solid rgba(0,229,255,0.1)" }}>
                        <button type="button" onClick={() => update(val + 1)}   style={{ ...btnStyle, borderRight: "1px solid rgba(0,229,255,0.1)", borderRadius: 0 }}>+1</button>
                        <button type="button" onClick={() => update(val + 0.1)} style={{ ...btnStyle, borderRadius: 0 }}>+.1</button>
                      </div>
                      <input
                        type="text" inputMode="decimal" value={val}
                        onChange={(e) => update(+e.target.value || 0.1)}
                        style={{
                          width: "100%", padding: "8px 4px", border: "none", outline: "none",
                          background: "transparent", color: "#00e5ff",
                          fontSize: 20, fontWeight: 700, fontFamily: "inherit", textAlign: "center",
                        }}
                      />
                      <div style={{ display: "flex", borderTop: "1px solid rgba(0,229,255,0.1)" }}>
                        <button type="button" onClick={() => update(val - 1)}   style={{ ...btnStyle, borderRight: "1px solid rgba(0,229,255,0.1)", borderRadius: 0 }}>−1</button>
                        <button type="button" onClick={() => update(val - 0.1)} style={{ ...btnStyle, borderRadius: 0 }}>−.1</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: 12, color: "rgba(176,222,255,0.4)" }}>Calculated volume</span>
              <span style={{ fontSize: 24, fontWeight: 700, color: "#00e5ff" }}>{tankSize.toFixed(1)} <span style={{ fontSize: 14, fontWeight: 400 }}>gal</span></span>
            </div>
          </div>
        )}
      </div>

      <div style={{ animation: "fadeUp 0.6s ease 0.3s both" }}>
        <button
          type="button"
          onClick={() => setShowParams(p => !p)}
          style={{
            width: "100%", padding: "16px 20px", borderRadius: 16,
            background: showParams ? "rgba(0,229,255,0.08)" : "rgba(255,255,255,0.03)",
            border: showParams ? "1px solid rgba(0,229,255,0.3)" : "1px dashed rgba(176,222,255,0.2)",
            color: showParams ? "#00e5ff" : "rgba(176,222,255,0.5)",
            cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            transition: "all 0.2s ease",
          }}
        >
          <span>{showParams ? "Water Parameters" : "+ Add Water Parameters"}</span>
          <span style={{ fontSize: 12, opacity: 0.6 }}>
            {showParams ? "Temp · pH · GH · KH  ✕" : "optional — filters by your water chemistry"}
          </span>
        </button>

        {showParams && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
            <div>
              <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "rgba(176,222,255,0.5)", fontWeight: 600, display: "block", marginBottom: 10 }}>Temperature</label>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: "#00e5ff" }}>{temp}°F</span>
                  <span style={{ color: "rgba(176,222,255,0.4)", fontSize: 13 }}>{temp < 70 ? "Cold" : temp < 78 ? "Moderate" : temp < 84 ? "Warm" : "Tropical"}</span>
                </div>
                <input type="range" min={58} max={90} value={temp} onChange={(e) => setTemp(+e.target.value)} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(176,222,255,0.3)" }}><span>58°F</span><span>90°F</span></div>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "rgba(176,222,255,0.5)", fontWeight: 600, display: "block", marginBottom: 10 }}>pH Level</label>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: "#00e5ff" }}>{ph.toFixed(1)}</span>
                  <span style={{ color: "rgba(176,222,255,0.4)", fontSize: 13 }}>{ph < 6.5 ? "Acidic" : ph < 7.5 ? "Neutral" : ph < 8.0 ? "Slightly Alkaline" : "Alkaline"}</span>
                </div>
                <input type="range" min={50} max={90} value={ph * 10} onChange={(e) => setPh(+(e.target.value / 10).toFixed(1))} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(176,222,255,0.3)" }}><span>5.0</span><span>9.0</span></div>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "rgba(176,222,255,0.5)", fontWeight: 600, display: "block", marginBottom: 10 }}>GH — General Hardness</label>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: "#00e5ff" }}>{gh} <span style={{ fontSize: 14, fontWeight: 400 }}>dGH</span></span>
                  <span style={{ color: "rgba(176,222,255,0.4)", fontSize: 13 }}>{gh <= 4 ? "Very Soft" : gh <= 8 ? "Soft" : gh <= 12 ? "Moderate" : gh <= 18 ? "Hard" : "Very Hard"}</span>
                </div>
                <input type="range" min={0} max={25} value={gh} onChange={(e) => setGh(+e.target.value)} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(176,222,255,0.3)" }}><span>0 dGH</span><span>25 dGH</span></div>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "rgba(176,222,255,0.5)", fontWeight: 600, display: "block", marginBottom: 10 }}>KH — Carbonate Hardness</label>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: "#00e5ff" }}>{kh} <span style={{ fontSize: 14, fontWeight: 400 }}>dKH</span></span>
                  <span style={{ color: "rgba(176,222,255,0.4)", fontSize: 13 }}>{kh <= 3 ? "Very Low" : kh <= 6 ? "Low" : kh <= 9 ? "Moderate" : kh <= 12 ? "High" : "Very High"}</span>
                </div>
                <input type="range" min={0} max={15} value={kh} onChange={(e) => setKh(+e.target.value)} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(176,222,255,0.3)" }}><span>0 dKH</span><span>15 dKH</span></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onFindSpecies}
        disabled={catalogStatus === "missing_env"}
        className="glow-btn"
        style={{
          padding: "18px 48px", fontSize: 17, fontWeight: 600,
          fontFamily: "inherit",
          background: catalogStatus === "missing_env" ? "rgba(255,255,255,0.12)" : "linear-gradient(135deg, #00b0ff, #00e5ff)",
          border: "none", borderRadius: 60, color: catalogStatus === "missing_env" ? "rgba(224,240,255,0.35)" : "#0a1628",
          cursor: catalogStatus === "missing_env" ? "not-allowed" : "pointer", letterSpacing: 0.5,
          boxShadow: catalogStatus === "missing_env" ? "none" : "0 0 20px rgba(0,229,255,0.25), 0 4px 20px rgba(0,0,0,0.3)",
          transition: "all 0.3s ease",
          animation: "fadeUp 0.6s ease 0.5s both",
          alignSelf: "center",
        }}
      >
        Find Compatible Species →
      </button>
      {catalogStatus === "missing_env" && (
        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,215,64,0.55)", maxWidth: 440, marginTop: 12, lineHeight: 1.5 }}>
          Set <code style={{ color: "rgba(200,230,255,0.85)" }}>VITE_SUPABASE_URL</code> and{" "}
          <code style={{ color: "rgba(200,230,255,0.85)" }}>VITE_SUPABASE_ANON_KEY</code> in{" "}
          <code style={{ color: "rgba(200,230,255,0.85)" }}>aquastock/.env</code>, then restart the dev server (or add them on Vercel and redeploy).
        </p>
      )}
    </div>
  );
}
