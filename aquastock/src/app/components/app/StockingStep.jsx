import { SPECIES_TYPE_ICONS, SPECIES_TYPE_LABELS } from "../../../config/speciesUi.js";
import { BIOLOAD_PCT_DISPLAY_CAP } from "../../../config/aquariumConstants.js";
import { CatalogBlockedMessage } from "../catalog/CatalogBlockedMessage.jsx";
import { SpeciesAvatar } from "../species/SpeciesAvatar.jsx";

export function StockingStep({
  fadeIn,
  isMobile,
  setStep,
  waterType,
  tankSize,
  tankCapacity,
  catalogStatus,
  catalogErrorDetail,
  setCatalogReloadTick,
  catalogReady,
  stockList,
  speciesDb,
  compatible,
  stockTypeFilter,
  setStockTypeFilter,
  totalBioload,
  bioloadPct,
  bioloadOver,
  bioloadPctAtCap,
  tankBioloadPct,
  formatCappedBioloadPct,
  stockStatus,
  barColor,
  getCount,
  setStockCount,
  removeAllFromStock,
  addToStock,
}) {
  const status = stockStatus();
  const color = barColor();
  const stockedSpecies = stockList.map(item => ({ sp: speciesDb.find(s => s.id === item.id), count: item.count })).filter(x => x.sp);
  const totalFish = stockList.reduce((s, x) => s + x.count, 0);
  const pickableSpecies = compatible.filter(s =>
    stockTypeFilter === "all" ? true : s.type === stockTypeFilter
  );

  return (
    <div style={{ paddingTop: 40, paddingBottom: 80, opacity: fadeIn ? 1 : 0, transition: "opacity 0.6s ease" }}>
      <div style={{ marginBottom: 32, animation: "fadeUp 0.6s ease both" }}>
        <button type="button" onClick={() => setStep(2)} style={{
          background: "none", border: "none", color: "rgba(176,222,255,0.5)",
          cursor: "pointer", fontSize: 14, fontFamily: "inherit", marginBottom: 12,
        }}>← Back to Species</button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: isMobile ? 24 : 32, fontWeight: 700 }}>
            Stock Your Tank
          </h2>
          <div style={{
            display: "flex", gap: 12, background: "rgba(0,0,0,0.2)", padding: "10px 16px",
            borderRadius: 12, fontSize: 13, color: "rgba(176,222,255,0.6)",
          }}>
            <span>{waterType === "freshwater" ? "🌿" : "🌊"} {waterType}</span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span>{tankSize} gal</span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span>{tankCapacity} bioload units</span>
          </div>
        </div>
      </div>

      {!catalogReady ? (
        <CatalogBlockedMessage
          status={catalogStatus}
          detail={catalogErrorDetail}
          onRetry={() => setCatalogReloadTick((n) => n + 1)}
        />
      ) : (
      <>
      <div style={{
        background: "rgba(255,255,255,0.03)", borderRadius: 20, padding: isMobile ? "20px 16px" : "24px 28px",
        border: bioloadOver ? "1px solid rgba(255,82,82,0.3)" : "1px solid rgba(255,255,255,0.06)",
        marginBottom: 32, animation: "fadeUp 0.6s ease 0.1s both",
        transition: "border-color 0.4s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: 20, fontWeight: 700, color: bioloadOver ? "#ff5252" : "#00e5ff" }}>
              {totalBioload.toFixed(1)}
            </span>
            <span style={{ fontSize: 14, color: "rgba(176,222,255,0.4)", marginLeft: 6 }}>
              / {tankCapacity} units used
            </span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: status.color }}>{status.text}</span>
        </div>

        <div style={{ position: "relative", height: 14, background: "rgba(255,255,255,0.06)", borderRadius: 8, overflow: "visible" }}>
          <div style={{
            position: "absolute", top: 0, left: 0, height: "100%",
            width: `${bioloadPct}%`,
            borderRadius: 8,
            background: color,
            transition: "width 0.5s cubic-bezier(0.4,0,0.2,1), background 0.4s ease",
            boxShadow: bioloadOver ? "0 0 12px rgba(255,82,82,0.4)" : "0 0 10px rgba(0,229,255,0.2)",
          }} />
          {bioloadOver && (
            <div style={{
              position: "absolute", top: "50%", right: 0, transform: "translateY(-50%)",
              width: 14, height: 14, borderRadius: "50%",
              background: "#ff5252", border: "2px solid rgba(10,14,26,0.8)",
              boxShadow: "0 0 8px rgba(255,82,82,0.8)",
              animation: "pulse 1s ease-in-out infinite",
            }} />
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "rgba(176,222,255,0.3)" }}>
          <span>0</span>
          <span style={{ color: "rgba(255,215,64,0.5)" }}>85%</span>
          <span style={{ color: bioloadOver ? "rgba(255,82,82,0.6)" : "rgba(176,222,255,0.3)" }}>{tankCapacity} units</span>
        </div>

        {stockedSpecies.length > 0 && (
          <div style={{ marginTop: 16, display: "flex", gap: 20, flexWrap: "wrap", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 13, color: "rgba(176,222,255,0.5)" }}>
            <span>🐠 {totalFish} animal{totalFish !== 1 ? "s" : ""}</span>
            <span>🔬 {stockedSpecies.length} species</span>
            <span style={{ color: status.color }}>⚡ {formatCappedBioloadPct(tankBioloadPct)} capacity</span>
          </div>
        )}
        {bioloadPctAtCap && (
          <p style={{ marginTop: 12, fontSize: 12, color: "rgba(255,215,64,0.55)", lineHeight: 1.45 }}>
            {BIOLOAD_PCT_DISPLAY_CAP}% bioload cap reached — remove animals to add more.
          </p>
        )}
      </div>

      {stockedSpecies.length > 0 && (
        <div style={{ marginBottom: 32, animation: "fadeUp 0.6s ease 0.15s both" }}>
          <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 2, color: "rgba(176,222,255,0.4)", fontWeight: 600, marginBottom: 16 }}>
            🐠 In Your Tank
          </h3>
          <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
            {stockedSpecies.map(({ sp, count }, i) => {
              const unit = sp.bioload ?? 1;
              const itemBioload = unit * count;
              const itemPct = tankCapacity > 0 ? (itemBioload / tankCapacity) * 100 : 0;
              const othersBioload = totalBioload - itemBioload;
              const capUnits = tankSize > 0 ? (BIOLOAD_PCT_DISPLAY_CAP / 100) * tankSize : Number.MAX_SAFE_INTEGER;
              const maxByCap = unit > 0 ? Math.floor((capUnits - othersBioload) / unit) : count;
              const sliderMax = Math.min(500, Math.max(count, maxByCap));
              const atSpeciesCap = count >= maxByCap;
              return (
                <div key={sp.id} style={{
                  display: "flex", alignItems: "flex-start", gap: 14,
                  padding: "14px 20px",
                  borderBottom: i < stockedSpecies.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}>
                  <SpeciesAvatar species={sp} size={44} borderRadius={10} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{sp.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => setStockCount(sp.id, count - 1)}
                          style={{
                            width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(255,82,82,0.3)",
                            background: "rgba(255,82,82,0.08)", color: "#ff5252",
                            cursor: "pointer", fontSize: 16, fontWeight: 700, fontFamily: "inherit",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.15s",
                          }}
                          title="Remove one"
                        >−</button>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "#00e5ff", minWidth: 28, textAlign: "center" }}>{count}</span>
                        <button
                          type="button"
                          disabled={atSpeciesCap}
                          onClick={() => setStockCount(sp.id, count + 1)}
                          title={atSpeciesCap ? `${BIOLOAD_PCT_DISPLAY_CAP}% bioload cap` : "Add one"}
                          style={{
                            width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(0,229,255,0.3)",
                            background: "rgba(0,229,255,0.08)", color: "#00e5ff",
                            cursor: atSpeciesCap ? "not-allowed" : "pointer", fontSize: 16, fontWeight: 700, fontFamily: "inherit",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.15s", opacity: atSpeciesCap ? 0.35 : 1,
                          }}
                        >+</button>
                        <button
                          type="button"
                          onClick={() => removeAllFromStock(sp.id)}
                          style={{
                            width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)",
                            background: "rgba(255,255,255,0.03)", color: "rgba(176,222,255,0.3)",
                            cursor: "pointer", fontSize: 14, fontFamily: "inherit",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.15s", marginLeft: 4,
                          }}
                          title="Remove all from tank"
                        >✕</button>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(176,222,255,0.35)", marginTop: 4 }}>
                      {unit} unit{unit !== 1 ? "s" : ""}/fish · {itemBioload.toFixed(1)} total · {formatCappedBioloadPct(itemPct)} of tank
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                      <span style={{ fontSize: 10, color: "rgba(176,222,255,0.35)", width: 14 }}>0</span>
                      <input
                        type="range"
                        min={0}
                        max={sliderMax}
                        value={Math.min(count, sliderMax)}
                        onChange={(e) => setStockCount(sp.id, +e.target.value)}
                        aria-label={`${sp.name} count`}
                        style={{ flex: 1, minWidth: 0 }}
                      />
                      <span style={{ fontSize: 10, color: "rgba(176,222,255,0.35)", minWidth: 22, textAlign: "right" }}>{sliderMax}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ animation: "fadeUp 0.6s ease 0.2s both" }}>
        <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 2, color: "rgba(176,222,255,0.4)", fontWeight: 600, marginBottom: 16 }}>
          + Add Species
        </h3>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {["all", "fish", "invertebrate", "coral", "amphibian"].map((t) => {
            if (t !== "all" && waterType === "freshwater" && t === "coral") return null;
            return (
              <button
                type="button"
                key={t}
                onClick={() => setStockTypeFilter(t)}
                className="tag-btn"
                style={{
                  padding: "6px 14px", borderRadius: 20, fontSize: 12, fontFamily: "inherit",
                  background: stockTypeFilter === t ? "rgba(0,229,255,0.15)" : "transparent",
                  border: stockTypeFilter === t ? "1px solid rgba(0,229,255,0.4)" : "1px solid rgba(255,255,255,0.1)",
                  color: stockTypeFilter === t ? "#00e5ff" : "rgba(176,222,255,0.5)",
                  cursor: "pointer", transition: "all 0.2s ease", textTransform: "capitalize",
                }}
              >
                {t === "all" ? "All" : `${SPECIES_TYPE_ICONS[t] || ""} ${SPECIES_TYPE_LABELS[t] || t}`}
              </button>
            );
          })}
        </div>

        <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
          {pickableSpecies.map((sp, i) => {
            const count = getCount(sp.id);
            const addedBioload = (sp.bioload ?? 1) * count;
            const wouldOverstock = (totalBioload + (sp.bioload ?? 1)) > tankCapacity;
            const addBlockedAtCap = bioloadPctAtCap;
            return (
              <div key={sp.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 20px",
                borderBottom: i < pickableSpecies.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                background: count > 0 ? "rgba(0,229,255,0.03)" : "transparent",
                transition: "background 0.2s ease",
              }}>
                <SpeciesAvatar species={sp} size={44} borderRadius={10} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{sp.name}</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "rgba(176,222,255,0.35)" }}>
                      {sp.bioload ?? 1} unit{(sp.bioload ?? 1) !== 1 ? "s" : ""}/fish
                    </span>
                    {sp.school > 1 && (
                      <span style={{ fontSize: 10, color: "#ffcc80", opacity: 0.7 }}>
                        min {sp.school}
                      </span>
                    )}
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                      background: sp.difficulty === "beginner" ? "rgba(105,240,174,0.12)" : sp.difficulty === "intermediate" ? "rgba(255,215,64,0.12)" : "rgba(255,82,82,0.12)",
                      color: sp.difficulty === "beginner" ? "#69f0ae" : sp.difficulty === "intermediate" ? "#ffd740" : "#ff5252",
                    }}>{sp.difficulty}</span>
                    {count > 0 && (
                      <span style={{ fontSize: 11, color: "#00e5ff", fontWeight: 600 }}>
                        ×{count} in tank ({addedBioload.toFixed(1)} units)
                      </span>
                    )}
                  </div>
                </div>

                {count === 0 ? (
                  <button
                    type="button"
                    disabled={addBlockedAtCap}
                    onClick={() => addToStock(sp)}
                    className="glow-btn"
                    style={{
                      padding: "8px 18px", borderRadius: 20, fontSize: 13, fontWeight: 600,
                      fontFamily: "inherit", cursor: addBlockedAtCap ? "not-allowed" : "pointer", transition: "all 0.2s ease",
                      background: addBlockedAtCap
                        ? "rgba(255,255,255,0.06)"
                        : wouldOverstock
                          ? "rgba(255,82,82,0.12)"
                          : "rgba(0,229,255,0.1)",
                      border: addBlockedAtCap
                        ? "1px solid rgba(255,255,255,0.12)"
                        : wouldOverstock
                          ? "1px solid rgba(255,82,82,0.4)"
                          : "1px solid rgba(0,229,255,0.3)",
                      color: addBlockedAtCap ? "rgba(176,222,255,0.35)" : wouldOverstock ? "#ff5252" : "#00e5ff",
                      whiteSpace: "nowrap",
                      opacity: addBlockedAtCap ? 0.85 : 1,
                    }}
                  >
                    {addBlockedAtCap ? `${BIOLOAD_PCT_DISPLAY_CAP}% cap` : wouldOverstock ? "⚠ Add" : "+ Add"}
                  </button>
                ) : (
                  <span style={{ fontSize: 11, color: "rgba(176,222,255,0.35)", fontStyle: "italic", whiteSpace: "nowrap" }}>
                    In tank — use slider above
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
