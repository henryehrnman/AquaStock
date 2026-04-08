import { SPECIES_TYPE_ICONS, SPECIES_TYPE_LABELS } from "../../../config/speciesUi.js";
import { MATCHES_SEE_MORE_INCREMENT } from "../../../config/aquariumConstants.js";
import { CatalogBlockedMessage } from "../catalog/CatalogBlockedMessage.jsx";
import { SpeciesAvatar } from "../species/SpeciesAvatar.jsx";

export function ResultsStep({
  resultsRef,
  fadeIn,
  isMobile,
  setStep,
  setTypeFilter,
  setDiffFilter,
  setSelectedSpecies,
  setStockTypeFilter,
  waterType,
  tankSize,
  temp,
  ph,
  gh,
  kh,
  chemistryFilterActive,
  catalogStatus,
  catalogErrorDetail,
  setCatalogReloadTick,
  catalogReady,
  matchingSetups,
  speciesDb,
  popularPicks,
  compatible,
  typeFilter,
  diffFilter,
  selectedSpecies,
  visibleCompatible,
  matchesHasMore,
  setMatchesVisibleCount,
  readyToStockAnchorRef,
}) {
  return (
    <div ref={resultsRef} style={{
      paddingTop: 40, paddingBottom: 60,
      opacity: fadeIn ? 1 : 0, transition: "opacity 0.6s ease",
    }}>
      <div className="results-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16, animation: "fadeUp 0.6s ease both" }}>
        <div>
          <button type="button" onClick={() => setStep(1)} style={{
            background: "none", border: "none", color: "rgba(176,222,255,0.5)",
            cursor: "pointer", fontSize: 14, fontFamily: "inherit", marginBottom: 12,
          }}>← Edit Parameters</button>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: isMobile ? 24 : 32, fontWeight: 700 }}>
            Your Matches
          </h2>
        </div>
        <div className="results-summary" style={{
          display: "flex", gap: 12, flexWrap: "wrap",
          alignItems: "center",
          background: "rgba(0,0,0,0.2)", padding: "10px 16px", borderRadius: 12,
          fontSize: 13, color: "rgba(176,222,255,0.6)",
        }}>
          <span>{waterType === "freshwater" ? "🌿" : "🌊"} {waterType}</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span>{tankSize % 1 === 0 ? tankSize : tankSize.toFixed(1)} gal</span>
          {chemistryFilterActive && (
            <>
              <span style={{ opacity: 0.3 }}>|</span>
              <span>{temp}°F</span>
              <span style={{ opacity: 0.3 }}>|</span>
              <span>pH {ph.toFixed(1)}</span>
              <span style={{ opacity: 0.3 }}>|</span>
              <span>GH {gh} dGH</span>
              <span style={{ opacity: 0.3 }}>|</span>
              <span>KH {kh} dKH</span>
            </>
          )}
          {!chemistryFilterActive && (
            <span style={{ fontSize: 11, color: "rgba(176,222,255,0.35)", fontStyle: "italic" }}>
              · matches use tank size and water type only
            </span>
          )}
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
      {matchingSetups.length > 0 && (
        <div style={{ marginBottom: 40, animation: "fadeUp 0.6s ease 0.1s both" }}>
          <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 2, color: "rgba(176,222,255,0.4)", fontWeight: 600, marginBottom: 16 }}>
            ✨ Curated Setups For You
          </h3>
          <div className="setup-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {matchingSetups.map((setup) => (
              <div key={setup.name} className="setup-card" style={{
                background: setup.gradient, borderRadius: 20, padding: 24,
                border: "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer", transition: "all 0.3s ease",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}>
                <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{setup.name}</h4>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 16, lineHeight: 1.5 }}>{setup.desc}</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {setup.species.map((sid) => {
                    const sp = speciesDb.find((s) => s.id === sid);
                    return sp ? (
                      <span key={sid} style={{
                        fontSize: 12, padding: "3px 4px 3px 3px", borderRadius: 20,
                        background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)",
                        display: "inline-flex", alignItems: "center", gap: 6,
                      }}>
                        <SpeciesAvatar species={sp} size={22} borderRadius={10} />
                        {sp.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {popularPicks.length > 0 && (
        <div style={{ marginBottom: 40, animation: "fadeUp 0.6s ease 0.2s both" }}>
          <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 2, color: "rgba(176,222,255,0.4)", fontWeight: 600, marginBottom: 16 }}>
            🔥 Popular Picks
          </h3>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {popularPicks.map((sp) => (
              <div
                key={sp.id}
                onClick={() => setSelectedSpecies(selectedSpecies?.id === sp.id ? null : sp)}
                className="card-hover"
                style={{
                  minWidth: 160, padding: 16, borderRadius: 16,
                  background: "rgba(255,255,255,0.04)",
                  border: selectedSpecies?.id === sp.id ? `1px solid ${sp.color}44` : "1px solid rgba(255,255,255,0.06)",
                  cursor: "pointer", transition: "all 0.3s ease", textAlign: "center",
                  boxShadow: selectedSpecies?.id === sp.id ? `0 0 20px ${sp.color}22` : "none",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                }}
              >
                <SpeciesAvatar species={sp} size={72} borderRadius={14} />
                <div style={{ fontSize: 14, fontWeight: 600 }}>{sp.name}</div>
                <div style={{
                  fontSize: 10, textTransform: "uppercase", letterSpacing: 1,
                  color: sp.difficulty === "beginner" ? "#69f0ae" : sp.difficulty === "intermediate" ? "#ffd740" : "#ff5252",
                }}>{sp.difficulty}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 24, animation: "fadeUp 0.6s ease 0.3s both" }}>
        <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 2, color: "rgba(176,222,255,0.4)", fontWeight: 600, marginBottom: 12 }}>
          All Compatible Species ({compatible.length})
        </h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["all", "fish", "invertebrate", "coral", "amphibian"].map((t) => {
            if (t !== "all" && waterType === "freshwater" && t === "coral") return null;
            return (
              <button
                type="button"
                key={t}
                onClick={() => setTypeFilter(t)}
                className="tag-btn"
                style={{
                  padding: "6px 14px", borderRadius: 20, fontSize: 12, fontFamily: "inherit",
                  background: typeFilter === t ? "rgba(0,229,255,0.15)" : "transparent",
                  border: typeFilter === t ? "1px solid rgba(0,229,255,0.4)" : "1px solid rgba(255,255,255,0.1)",
                  color: typeFilter === t ? "#00e5ff" : "rgba(176,222,255,0.5)",
                  cursor: "pointer", transition: "all 0.2s ease", textTransform: "capitalize",
                }}
              >
                {t === "all" ? "All" : `${SPECIES_TYPE_ICONS[t] || ""} ${SPECIES_TYPE_LABELS[t] || t}`}
              </button>
            );
          })}
          <span style={{ width: 1, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
          {["all", "beginner", "intermediate", "advanced"].map((d) => (
            <button
              type="button"
              key={d}
              onClick={() => setDiffFilter(d)}
              className="tag-btn"
              style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12, fontFamily: "inherit",
                background: diffFilter === d ? "rgba(0,229,255,0.15)" : "transparent",
                border: diffFilter === d ? "1px solid rgba(0,229,255,0.4)" : "1px solid rgba(255,255,255,0.1)",
                color: diffFilter === d ? "#00e5ff" : "rgba(176,222,255,0.5)",
                cursor: "pointer", transition: "all 0.2s ease", textTransform: "capitalize",
              }}
            >
              {d === "all" ? "All Levels" : d}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        background: "rgba(255,255,255,0.02)", borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden",
        animation: "fadeUp 0.6s ease 0.4s both",
      }}>
        {compatible.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "rgba(176,222,255,0.4)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: 16 }}>No species match your current parameters.</p>
            <p style={{ fontSize: 13, marginTop: 8 }}>
              {chemistryFilterActive
                ? "Try adjusting your tank size, temperature, pH, GH, or KH."
                : "Try a larger tank or switch water type (water chemistry is not filtering this list)."}
            </p>
          </div>
        ) : (
          <>
          {visibleCompatible.map((sp, i) => (
            <div key={sp.id}>
              <div
                className="species-row"
                onClick={() => setSelectedSpecies(selectedSpecies?.id === sp.id ? null : sp)}
                style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "16px 24px",
                  transition: "background 0.2s ease",
                  background: selectedSpecies?.id === sp.id ? "rgba(0,229,255,0.06)" : "transparent",
                }}
              >
                <SpeciesAvatar species={sp} size={64} borderRadius={12} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{sp.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(176,222,255,0.4)", marginTop: 2 }}>
                    {SPECIES_TYPE_LABELS[sp.type]} · Min {sp.minTank}gal · {sp.school > 1 ? `School of ${sp.school}+` : "Solo"}
                  </div>
                </div>
                <div style={{
                  fontSize: 10, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600,
                  padding: "4px 10px", borderRadius: 20,
                  background: sp.difficulty === "beginner" ? "rgba(105,240,174,0.12)" : sp.difficulty === "intermediate" ? "rgba(255,215,64,0.12)" : "rgba(255,82,82,0.12)",
                  color: sp.difficulty === "beginner" ? "#69f0ae" : sp.difficulty === "intermediate" ? "#ffd740" : "#ff5252",
                }}>
                  {sp.difficulty}
                </div>
                <div style={{ color: "rgba(176,222,255,0.3)", fontSize: 18 }}>
                  {selectedSpecies?.id === sp.id ? "▾" : "›"}
                </div>
              </div>

              {selectedSpecies?.id === sp.id && (() => {
                const statRows = [
                  { label: "Temperature", value: `${sp.tempMin}–${sp.tempMax}°F`, min: sp.tempMin, max: sp.tempMax, cur: temp, absMin: 55, absMax: 95 },
                  { label: "pH", value: `${sp.phMin}–${sp.phMax}`, min: sp.phMin, max: sp.phMax, cur: ph, absMin: 4, absMax: 9.5 },
                  { label: "GH", value: `${sp.ghMin}–${sp.ghMax} dGH`, min: sp.ghMin, max: sp.ghMax, cur: gh, absMin: 0, absMax: 25 },
                  { label: "KH", value: `${sp.khMin}–${sp.khMax} dKH`, min: sp.khMin, max: sp.khMax, cur: kh, absMin: 0, absMax: 15 },
                ];
                return (
                  <div style={{ padding: "0 20px 22px", animation: "fadeUp 0.25s ease both", borderTop: "1px solid rgba(0,229,255,0.07)", marginTop: 2 }}>
                    <div className="detail-top" style={{ display: "flex", gap: 18, paddingTop: 18, alignItems: "flex-start" }}>
                      <SpeciesAvatar species={sp} size={150} borderRadius={14} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13.5, color: "rgba(176,222,255,0.65)", lineHeight: 1.75, margin: "0 0 14px" }}>
                          {sp.desc}
                        </p>
                        <div className="detail-tags" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {[
                            { label: sp.water === "freshwater" ? "Freshwater" : "Saltwater", color: sp.water === "freshwater" ? "#00e5ff" : "#00b0ff" },
                            { label: SPECIES_TYPE_LABELS[sp.type], color: "#b39ddb" },
                            { label: `Min ${sp.minTank} gal`, color: "#80cbc4" },
                            { label: sp.school > 1 ? `School of ${sp.school}+` : "Solo", color: "#ffcc80" },
                          ].map(({ label, color }) => (
                            <span key={label} style={{
                              fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                              background: `${color}18`, color, border: `1px solid ${color}30`,
                            }}>{label}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="detail-bars" style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
                      {statRows.map(({ label, value, min, max, cur, absMin, absMax }) => {
                        const rangeW = absMax - absMin;
                        const barLeft = ((min - absMin) / rangeW) * 100;
                        const barWidth = ((max - min) / rangeW) * 100;
                        const markerPos = ((cur - absMin) / rangeW) * 100;
                        const inRange = cur >= min && cur <= max;
                        if (!chemistryFilterActive) {
                          return (
                            <div key={label}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                <span style={{ fontSize: 11, color: "rgba(176,222,255,0.4)", fontWeight: 500 }}>{label}</span>
                                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(176,222,255,0.65)" }}>{value}</span>
                              </div>
                              <div style={{ position: "relative", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                                <div style={{
                                  position: "absolute", top: 0, height: "100%", borderRadius: 4,
                                  left: `${barLeft}%`, width: `${barWidth}%`,
                                  background: "rgba(0,229,255,0.35)",
                                }} />
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div key={label}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                              <span style={{ fontSize: 11, color: "rgba(176,222,255,0.4)", fontWeight: 500 }}>{label}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: inRange ? "#00e5ff" : "#ff5252" }}>{value}</span>
                            </div>
                            <div style={{ position: "relative", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "visible" }}>
                              <div style={{
                                position: "absolute", top: 0, height: "100%", borderRadius: 4,
                                left: `${barLeft}%`, width: `${barWidth}%`,
                                background: inRange ? "rgba(0,229,255,0.5)" : "rgba(255,82,82,0.4)",
                              }} />
                              <div style={{
                                position: "absolute", top: "50%", transform: "translate(-50%, -50%)",
                                left: `${Math.min(Math.max(markerPos, 2), 98)}%`,
                                width: 10, height: 10, borderRadius: "50%",
                                background: inRange ? "#00e5ff" : "#ff5252",
                                border: "2px solid rgba(10,14,26,0.8)",
                                zIndex: 1,
                              }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {!chemistryFilterActive && (
                      <p style={{ marginTop: 14, fontSize: 11, color: "rgba(176,222,255,0.35)", lineHeight: 1.5 }}>
                        Add water parameters on setup to compare these ranges to your tank and filter the species list.
                      </p>
                    )}
                  </div>
                );
              })()}

              {i < visibleCompatible.length - 1 && (
                <div style={{ height: 1, background: "rgba(255,255,255,0.04)", margin: "0 24px" }} />
              )}
            </div>
          ))}
          {matchesHasMore && (
            <div style={{
              padding: "18px 24px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex", justifyContent: "center",
            }}>
              <button
                type="button"
                onClick={() => setMatchesVisibleCount((n) => Math.min(compatible.length, n + MATCHES_SEE_MORE_INCREMENT))}
                className="glow-btn"
                style={{
                  padding: "12px 28px", fontSize: 15, fontWeight: 600,
                  fontFamily: "inherit",
                  background: "rgba(0,229,255,0.12)",
                  border: "1px solid rgba(0,229,255,0.35)", borderRadius: 60, color: "#00e5ff",
                  cursor: "pointer", letterSpacing: 0.3,
                  transition: "all 0.2s ease",
                }}
              >
                See more
              </button>
            </div>
          )}
          </>
        )}
      </div>

      {compatible.length > 0 && (
        <div
          ref={readyToStockAnchorRef}
          style={{ marginTop: 40, display: "flex", justifyContent: "center", animation: "fadeUp 0.6s ease 0.5s both" }}
        >
          <button
            type="button"
            onClick={() => { setStep(3); setStockTypeFilter("all"); }}
            className="glow-btn"
            style={{
              padding: "18px 48px", fontSize: 17, fontWeight: 600,
              fontFamily: "inherit",
              background: "linear-gradient(135deg, #00b0ff, #00e5ff)",
              border: "none", borderRadius: 60, color: "#0a1628",
              cursor: "pointer", letterSpacing: 0.5,
              boxShadow: "0 0 20px rgba(0,229,255,0.25), 0 4px 20px rgba(0,0,0,0.3)",
              transition: "all 0.3s ease",
            }}
          >
            Ready to Stock →
          </button>
        </div>
      )}
      </>
      )}
    </div>
  );
}
