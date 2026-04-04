import { useState, useEffect, useRef, useCallback } from "react";
import { getSupabase } from "../lib/supabase/browserClient.js";
import { fetchCatalog } from "../lib/supabase/speciesCatalogFromSupabase.js";
import { SPECIES_TYPE_ICONS, SPECIES_TYPE_LABELS } from "../config/speciesUi.js";
import { CatalogBlockedMessage } from "./components/catalog/CatalogBlockedMessage.jsx";
import { SpeciesAvatar } from "./components/species/SpeciesAvatar.jsx";
import { Bubble, ClownfishLogo, SwimmingFish } from "./components/ambient/AmbientAquariumDecor.jsx";

export default function AquariumStockr() {
  // ── State: wizard & transitions (hook order fixed) ─────────────────────
  const [step, setStep] = useState(0); // 0=landing, 1=setup, 2=results, 3=stocking
  const [tankSize, setTankSize] = useState(20);
  const [waterType, setWaterType] = useState("freshwater");
  const [temp, setTemp] = useState(76);
  const [ph, setPh] = useState(7.0);
  const [gh, setGh] = useState(8);
  const [kh, setKh] = useState(5);
  const [typeFilter, setTypeFilter] = useState("all");
  const [diffFilter, setDiffFilter] = useState("all");
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [dimMode, setDimMode] = useState(false);
  const [showParams, setShowParams] = useState(false);
  const [tankL, setTankL] = useState(24);
  const [tankW, setTankW] = useState(12);
  const [tankH, setTankH] = useState(16);
  const [fadeIn, setFadeIn] = useState(true);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  const [stockList, setStockList] = useState([]); // [{id, count}]
  const [stockTypeFilter, setStockTypeFilter] = useState("all");
  const [speciesDb, setSpeciesDb] = useState([]);
  const [curatedSetups, setCuratedSetups] = useState([]);
  /** loading | ready | missing_env | error | empty */
  const [catalogStatus, setCatalogStatus] = useState("loading");
  const [catalogErrorDetail, setCatalogErrorDetail] = useState("");
  const [catalogReloadTick, setCatalogReloadTick] = useState(0);

  // ── Refs: scroll targets & ambient parallax ────────────────────────────
  const resultsRef = useRef(null);
  const bubbleRefs = useRef([]);
  const fishRefs = useRef([]);
  // Random fish pool — generated once on mount, covers 0–5000% page depth
  const fishPool = useRef(
    Array.from({ length: window.innerWidth < 640 ? 25 : 782 }, (_, i) => {
      const sizes = [22, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64];
      const size = sizes[i % sizes.length];
      const topPct = i * 32;
      return {
        size,
        topPct,
        top: `${topPct}%`,
        duration: Math.round(70 - size * 0.85),
        delay: -((i * 11 + 3) % 50),
        direction: i % 2 === 0 ? "right" : "left",
        opacity: size >= 56 ? 0.11 : size >= 44 ? 0.09 : size >= 32 ? 0.07 : 0.05,
        speed: 0.35 + (size / 64) * 0.75,
      };
    })
  );
  // Per-bubble depth speeds — bigger = closer = more parallax
  // Indices 0-5: always-visible; 6-11: results viewport; 12+: results below-fold
  const bubbleSpeeds = useRef([
    0.90, 0.60, 1.10, 0.75, 0.55, 0.95,
    0.70, 1.05, 0.65, 0.85, 1.15, 0.50,
    0.80, 1.00, 0.60, 0.88, 1.12, 0.68,
    0.92, 0.55, 1.05, 0.78, 0.63, 0.97, 0.85,
  ]);

  // ── Effects ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setCatalogStatus("missing_env");
      setSpeciesDb([]);
      setCuratedSetups([]);
      return;
    }
    let cancelled = false;
    setCatalogStatus("loading");
    setCatalogErrorDetail("");
    (async () => {
      try {
        const { species, curatedSetups: setups } = await fetchCatalog(supabase);
        if (cancelled) return;
        setSpeciesDb(species);
        setCuratedSetups(setups);
        if (species.length === 0) setCatalogStatus("empty");
        else setCatalogStatus("ready");
      } catch (e) {
        console.error("Supabase catalog load failed:", e);
        if (!cancelled) {
          setCatalogStatus("error");
          setCatalogErrorDetail(e?.message || String(e));
          setSpeciesDb([]);
          setCuratedSetups([]);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [catalogReloadTick]);

  // Parallax: bubbles & fish vs scroll (rAF-throttled for mobile)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const mobileScale = window.innerWidth < 640 ? 0.4 : 1;
        bubbleRefs.current.forEach((el, i) => {
          if (!el) return;
          const depth = (bubbleSpeeds.current[i] ?? 0.75) * mobileScale;
          el.style.transform = `translateY(${-y * depth}px)`;
        });
        fishRefs.current.forEach((el, i) => {
          if (!el) return;
          const speed = (fishPool.current[i]?.speed ?? 0.75) * mobileScale;
          el.style.transform = `translateY(${-y * speed}px)`;
        });
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setFadeIn(false);
    const t = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(t);
  }, [step]);

  // ── Stock list: mutations ──────────────────────────────────────────────
  const getCount = useCallback((id) => stockList.find(x => x.id === id)?.count ?? 0, [stockList]);
  const addToStock = useCallback((sp) => {
    setStockList(prev => {
      const existing = prev.find(x => x.id === sp.id);
      if (existing) return prev.map(x => x.id === sp.id ? { ...x, count: x.count + 1 } : x);
      return [...prev, { id: sp.id, count: 1 }];
    });
  }, []);
  const removeOneFromStock = useCallback((id) => {
    setStockList(prev => {
      const existing = prev.find(x => x.id === id);
      if (!existing) return prev;
      if (existing.count <= 1) return prev.filter(x => x.id !== id);
      return prev.map(x => x.id === id ? { ...x, count: x.count - 1 } : x);
    });
  }, []);
  const removeAllFromStock = useCallback((id) => {
    setStockList(prev => prev.filter(x => x.id !== id));
  }, []);

  // ── Bioload & capacity (1 unit per gallon) ─────────────────────────────
  const tankCapacity = tankSize;
  const totalBioload = stockList.reduce((sum, item) => {
    const sp = speciesDb.find(s => s.id === item.id);
    return sum + (sp ? (sp.bioload ?? 1) * item.count : 0);
  }, 0);
  const bioloadPct = tankCapacity > 0 ? Math.min((totalBioload / tankCapacity) * 100, 100) : 0;
  const bioloadOver = totalBioload > tankCapacity;
  const bioloadOverflow = tankCapacity > 0 ? Math.max(0, (totalBioload / tankCapacity) * 100 - 100) : 0;

  const stockStatus = () => {
    const pct = tankCapacity > 0 ? (totalBioload / tankCapacity) * 100 : 0;
    if (pct === 0) return { text: "Add fish to get started", color: "rgba(176,222,255,0.4)" };
    if (pct < 30)  return { text: "Lightly stocked", color: "#80cbc4" };
    if (pct < 60)  return { text: "Getting there", color: "#00e5ff" };
    if (pct < 85)  return { text: "Well balanced", color: "#69f0ae" };
    if (pct < 100) return { text: "Almost full", color: "#ffd740" };
    if (pct === 100) return { text: "Perfectly stocked!", color: "#69f0ae" };
    return { text: `Overstocked by ${(totalBioload - tankCapacity).toFixed(1)} units`, color: "#ff5252" };
  };

  const barColor = () => {
    const pct = tankCapacity > 0 ? (totalBioload / tankCapacity) * 100 : 0;
    if (pct > 100) return "#ff5252";
    if (pct > 85)  return "#ffd740";
    return "linear-gradient(90deg, #00e5ff, #69f0ae)";
  };

  // ── Matching: tank + water type always; temp/pH/GH/KH only if user enabled that section ───
  const chemistryFilterActive = showParams;

  const compatible = speciesDb.filter((s) => {
    if (s.water !== waterType) return false;
    if (s.minTank > tankSize) return false;
    if (chemistryFilterActive) {
      if (temp < s.tempMin || temp > s.tempMax) return false;
      if (ph < s.phMin || ph > s.phMax) return false;
      if (gh < s.ghMin || gh > s.ghMax) return false;
      if (kh < s.khMin || kh > s.khMax) return false;
    }
    if (typeFilter !== "all" && s.type !== typeFilter) return false;
    if (diffFilter !== "all" && s.difficulty !== diffFilter) return false;
    return true;
  });

  const popularPicks = speciesDb.filter((s) => {
    if (!s.popular || s.water !== waterType || s.minTank > tankSize) return false;
    if (!chemistryFilterActive) return true;
    return (
      temp >= s.tempMin && temp <= s.tempMax &&
      ph >= s.phMin && ph <= s.phMax &&
      gh >= s.ghMin && gh <= s.ghMax &&
      kh >= s.khMin && kh <= s.khMax
    );
  });

  const matchingSetups = curatedSetups.filter((s) => s.water === waterType && s.minTank <= tankSize);
  const catalogReady = catalogStatus === "ready";

  // ── Render: layout shell ────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "'Outfit', 'Avenir Next', 'Segoe UI', sans-serif",
      color: "#e0f0ff",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Global CSS (fonts, keyframes, utilities) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        
        @keyframes fish-appear {
          0%, 55%  { opacity: 1; }
          65%, 88% { opacity: 0; }
          100%     { opacity: 1; }
        }

        @keyframes swim-right {
          0%   { transform: translateX(-160px) translateY(0px); }
          20%  { transform: translateX(20vw)   translateY(-7px); }
          40%  { transform: translateX(45vw)   translateY(5px); }
          60%  { transform: translateX(68vw)   translateY(-5px); }
          80%  { transform: translateX(88vw)   translateY(3px); }
          100% { transform: translateX(110vw)  translateY(0px); }
        }
        @keyframes swim-left {
          0%   { transform: translateX(110vw)  translateY(0px); }
          20%  { transform: translateX(88vw)   translateY(-7px); }
          40%  { transform: translateX(65vw)   translateY(5px); }
          60%  { transform: translateX(42vw)   translateY(-5px); }
          80%  { transform: translateX(20vw)   translateY(3px); }
          100% { transform: translateX(-160px) translateY(0px); }
        }

        @keyframes float {
          0%   { transform: translateY(0px)   translateX(0px)  scale(1);    }
          25%  { transform: translateY(-20px) translateX(10px) scale(1.04); }
          50%  { transform: translateY(-28px) translateX(0px)  scale(1.06); }
          75%  { transform: translateY(-14px) translateX(-8px) scale(1.03); }
          100% { transform: translateY(0px)   translateX(0px)  scale(1);    }
        }
        @keyframes float-mobile {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-14px); }
        }
        @media (max-width: 640px) {
          .bubble-inner { animation-name: float-mobile !important; }
          .swim-fish { animation: none !important; opacity: 0.08 !important; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes waveMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 3px;
          background: rgba(255,255,255,0.1);
          outline: none;
          width: 100%;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00e5ff, #00b0ff);
          cursor: pointer;
          box-shadow: 0 0 12px rgba(0,229,255,0.5);
        }
        .card-hover:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1) !important;
        }
        .glow-btn:hover {
          box-shadow: 0 0 30px rgba(0,229,255,0.4), 0 0 60px rgba(0,229,255,0.15) !important;
          transform: translateY(-2px);
        }
        .tag-btn:hover {
          background: rgba(0,229,255,0.25) !important;
          border-color: rgba(0,229,255,0.6) !important;
        }
        .setup-card:hover {
          transform: translateY(-6px) scale(1.02) !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5) !important;
        }
        .species-row:hover {
          background: rgba(0,229,255,0.06) !important;
          cursor: pointer;
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        ::-webkit-scrollbar-thumb { background: rgba(0,229,255,0.3); border-radius: 3px; }
        @media (max-width: 640px) {
          .results-header { flex-direction: column !important; align-items: flex-start !important; }
          .results-summary { font-size: 11px !important; padding: 8px 12px !important; flex-wrap: wrap !important; gap: 6px !important; }
          .filters-row { flex-wrap: wrap !important; gap: 8px !important; }
          .setup-grid { grid-template-columns: 1fr !important; }
          .species-row { padding: 12px 14px !important; gap: 10px !important; }
          .detail-top { flex-direction: column !important; align-items: center !important; text-align: center !important; }
          .detail-tags { justify-content: center !important; }
          .detail-bars { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Fixed layers: ambient fish + bubbles + caustics (below main content z-index) */}
      {/* Swimming fish — fixed to viewport, positions extend below fold via parallax */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        {fishPool.current.map((f, i) => (
          <SwimmingFish
            key={i}
            parallaxRef={el => fishRefs.current[i] = el}
            size={f.size} top={f.top} duration={f.duration} delay={f.delay}
            direction={f.direction} opacity={f.opacity}
          />
        ))}
      </div>

      {/* Ambient Bubbles — fixed to viewport */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <Bubble parallaxRef={el => bubbleRefs.current[0] = el} style={{ width: 80,  height: 80,  top: "10%", left: "5%"   }} />
        <Bubble parallaxRef={el => bubbleRefs.current[1] = el} style={{ width: 40,  height: 40,  top: "30%", right: "8%"  }} />
        <Bubble parallaxRef={el => bubbleRefs.current[2] = el} style={{ width: 120, height: 120, bottom: "15%", left: "12%" }} />
        <Bubble parallaxRef={el => bubbleRefs.current[3] = el} style={{ width: 60,  height: 60,  top: "60%", right: "15%" }} />
        <Bubble parallaxRef={el => bubbleRefs.current[4] = el} style={{ width: 35,  height: 35,  top: "80%", left: "40%"  }} />
        <Bubble parallaxRef={el => bubbleRefs.current[5] = el} style={{ width: 90,  height: 90,  top: "5%",  right: "30%" }} />
        {/* Extra bubbles on results screen — desktop only */}
        {step === 2 && !isMobile && <>
          {/* First viewport */}
          <Bubble parallaxRef={el => bubbleRefs.current[6]  = el} style={{ width: 70,  height: 70,  top: "20%",  right: "22%" }} />
          <Bubble parallaxRef={el => bubbleRefs.current[7]  = el} style={{ width: 100, height: 100, top: "45%",  left: "3%"  }} />
          <Bubble parallaxRef={el => bubbleRefs.current[8]  = el} style={{ width: 45,  height: 45,  top: "70%",  right: "35%" }} />
          <Bubble parallaxRef={el => bubbleRefs.current[9]  = el} style={{ width: 85,  height: 85,  top: "15%",  left: "30%" }} />
          <Bubble parallaxRef={el => bubbleRefs.current[10] = el} style={{ width: 110, height: 110, top: "88%",  right: "5%"  }} />
          <Bubble parallaxRef={el => bubbleRefs.current[11] = el} style={{ width: 30,  height: 30,  top: "55%",  left: "55%" }} />
          {/* Second viewport (100–200%) */}
          <Bubble parallaxRef={el => bubbleRefs.current[12] = el} style={{ width: 55,  height: 55,  top: "110%", left: "8%"  }} />
          <Bubble parallaxRef={el => bubbleRefs.current[13] = el} style={{ width: 95,  height: 95,  top: "130%", right: "12%" }} />
          <Bubble parallaxRef={el => bubbleRefs.current[14] = el} style={{ width: 40,  height: 40,  top: "150%", left: "45%" }} />
          <Bubble parallaxRef={el => bubbleRefs.current[15] = el} style={{ width: 75,  height: 75,  top: "170%", right: "28%" }} />
          <Bubble parallaxRef={el => bubbleRefs.current[16] = el} style={{ width: 115, height: 115, top: "190%", left: "2%"  }} />
          <Bubble parallaxRef={el => bubbleRefs.current[17] = el} style={{ width: 50,  height: 50,  top: "210%", right: "42%" }} />
          {/* Third viewport (200–300%) */}
          <Bubble parallaxRef={el => bubbleRefs.current[18] = el} style={{ width: 80,  height: 80,  top: "230%", left: "20%" }} />
          <Bubble parallaxRef={el => bubbleRefs.current[19] = el} style={{ width: 35,  height: 35,  top: "250%", right: "5%"  }} />
          <Bubble parallaxRef={el => bubbleRefs.current[20] = el} style={{ width: 100, height: 100, top: "270%", left: "35%" }} />
          <Bubble parallaxRef={el => bubbleRefs.current[21] = el} style={{ width: 60,  height: 60,  top: "290%", right: "18%" }} />
          {/* Fourth viewport (300–400%) */}
          <Bubble parallaxRef={el => bubbleRefs.current[22] = el} style={{ width: 45,  height: 45,  top: "320%", left: "60%" }} />
          <Bubble parallaxRef={el => bubbleRefs.current[23] = el} style={{ width: 90,  height: 90,  top: "350%", right: "8%"  }} />
          <Bubble parallaxRef={el => bubbleRefs.current[24] = el} style={{ width: 70,  height: 70,  top: "380%", left: "15%" }} />
        </>}
      </div>

      {/* Caustics overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse at 30% 20%, rgba(0,229,255,0.03) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(0,176,255,0.02) 0%, transparent 50%)",
      }} />

      {/* Main column: wizard steps */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: isMobile ? "0 16px" : "0 24px" }}>

        {/* ===== LANDING ===== */}
        {step === 0 && (
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
              onClick={() => setStep(1)}
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
        )}

        {/* ===== SETUP ===== */}
        {step === 1 && (
          <div style={{
            minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center",
            gap: 32, paddingTop: 40, paddingBottom: 40,
            opacity: fadeIn ? 1 : 0, transition: "opacity 0.6s ease",
          }}>
            <div style={{ animation: "fadeUp 0.6s ease both" }}>
              <button onClick={() => setStep(0)} style={{
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

            {/* Water Type */}
            <div style={{ animation: "fadeUp 0.6s ease 0.1s both" }}>
              <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "rgba(176,222,255,0.5)", fontWeight: 600, display: "block", marginBottom: 12 }}>
                Water Type
              </label>
              <div style={{ display: "flex", gap: 12 }}>
                {["freshwater", "saltwater"].map((w) => (
                  <button
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

            {/* Tank Size */}
            <div style={{ animation: "fadeUp 0.6s ease 0.2s both" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "rgba(176,222,255,0.5)", fontWeight: 600 }}>
                  Tank Size
                </label>
                <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: 3, border: "1px solid rgba(255,255,255,0.08)" }}>
                  {[["Volume", false], ["Dimensions", true]].map(([label, val]) => (
                    <button key={label} onClick={() => setDimMode(val)} style={{
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
                            {/* +1 / +0.1 row */}
                            <div style={{ display: "flex", borderBottom: "1px solid rgba(0,229,255,0.1)" }}>
                              <button onClick={() => update(val + 1)}   style={{ ...btnStyle, borderRight: "1px solid rgba(0,229,255,0.1)", borderRadius: 0 }}>+1</button>
                              <button onClick={() => update(val + 0.1)} style={{ ...btnStyle, borderRadius: 0 }}>+.1</button>
                            </div>
                            {/* value display */}
                            <input
                              type="text" inputMode="decimal" value={val}
                              onChange={(e) => update(+e.target.value || 0.1)}
                              style={{
                                width: "100%", padding: "8px 4px", border: "none", outline: "none",
                                background: "transparent", color: "#00e5ff",
                                fontSize: 20, fontWeight: 700, fontFamily: "inherit", textAlign: "center",
                              }}
                            />
                            {/* -1 / -0.1 row */}
                            <div style={{ display: "flex", borderTop: "1px solid rgba(0,229,255,0.1)" }}>
                              <button onClick={() => update(val - 1)}   style={{ ...btnStyle, borderRight: "1px solid rgba(0,229,255,0.1)", borderRadius: 0 }}>−1</button>
                              <button onClick={() => update(val - 0.1)} style={{ ...btnStyle, borderRadius: 0 }}>−.1</button>
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

            {/* Water Parameters — optional */}
            <div style={{ animation: "fadeUp 0.6s ease 0.3s both" }}>
              <button
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
                  {/* Temperature */}
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
                  {/* pH */}
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
                  {/* GH */}
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
                  {/* KH */}
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
              onClick={() => { setStep(2); setTypeFilter("all"); setDiffFilter("all"); setSelectedSpecies(null); }}
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
        )}

        {/* ===== RESULTS ===== */}
        {step === 2 && (
          <div ref={resultsRef} style={{
            paddingTop: 40, paddingBottom: 60,
            opacity: fadeIn ? 1 : 0, transition: "opacity 0.6s ease",
          }}>
            {/* Header */}
            <div className="results-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16, animation: "fadeUp 0.6s ease both" }}>
              <div>
                <button onClick={() => setStep(1)} style={{
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
            {/* Curated Setups */}
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

            {/* Popular Picks */}
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

            {/* Filters */}
            <div style={{ marginBottom: 24, animation: "fadeUp 0.6s ease 0.3s both" }}>
              <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 2, color: "rgba(176,222,255,0.4)", fontWeight: 600, marginBottom: 12 }}>
                All Compatible Species ({compatible.length})
              </h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["all", "fish", "invertebrate", "coral", "amphibian"].map((t) => {
                  if (t !== "all" && waterType === "freshwater" && t === "coral") return null;
                  return (
                    <button
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

            {/* Species List */}
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
                compatible.map((sp, i) => (
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

                    {/* Expanded Detail */}
                    {selectedSpecies?.id === sp.id && (() => {
                      const statRows = [
                        { label: "Temperature", value: `${sp.tempMin}–${sp.tempMax}°F`, min: sp.tempMin, max: sp.tempMax, cur: temp, absMin: 55, absMax: 95 },
                        { label: "pH", value: `${sp.phMin}–${sp.phMax}`, min: sp.phMin, max: sp.phMax, cur: ph, absMin: 4, absMax: 9.5 },
                        { label: "GH", value: `${sp.ghMin}–${sp.ghMax} dGH`, min: sp.ghMin, max: sp.ghMax, cur: gh, absMin: 0, absMax: 25 },
                        { label: "KH", value: `${sp.khMin}–${sp.khMax} dKH`, min: sp.khMin, max: sp.khMax, cur: kh, absMin: 0, absMax: 15 },
                      ];
                      return (
                        <div style={{ padding: "0 20px 22px", animation: "fadeUp 0.25s ease both", borderTop: "1px solid rgba(0,229,255,0.07)", marginTop: 2 }}>
                          {/* Top: image + description + tags */}
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

                          {/* Parameter bars — compare to your water only when chemistry filters are active */}
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

                    {i < compatible.length - 1 && (
                      <div style={{ height: 1, background: "rgba(255,255,255,0.04)", margin: "0 24px" }} />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Ready to Stock button */}
            {compatible.length > 0 && (
              <div style={{ marginTop: 40, display: "flex", justifyContent: "center", animation: "fadeUp 0.6s ease 0.5s both" }}>
                <button
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
        )}

        {/* ===== STOCKING PLANNER ===== */}
        {step === 3 && (() => {
          const status = stockStatus();
          const color = barColor();
          const stockedSpecies = stockList.map(item => ({ sp: speciesDb.find(s => s.id === item.id), count: item.count })).filter(x => x.sp);
          const totalFish = stockList.reduce((s, x) => s + x.count, 0);
          const pickableSpecies = compatible.filter(s =>
            stockTypeFilter === "all" ? true : s.type === stockTypeFilter
          );

          return (
            <div style={{ paddingTop: 40, paddingBottom: 80, opacity: fadeIn ? 1 : 0, transition: "opacity 0.6s ease" }}>
              {/* Header */}
              <div style={{ marginBottom: 32, animation: "fadeUp 0.6s ease both" }}>
                <button onClick={() => setStep(2)} style={{
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
              {/* ── Bioload Bar ── */}
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

                {/* Track */}
                <div style={{ position: "relative", height: 14, background: "rgba(255,255,255,0.06)", borderRadius: 8, overflow: "visible" }}>
                  {/* Fill */}
                  <div style={{
                    position: "absolute", top: 0, left: 0, height: "100%",
                    width: `${bioloadPct}%`,
                    borderRadius: 8,
                    background: color,
                    transition: "width 0.5s cubic-bezier(0.4,0,0.2,1), background 0.4s ease",
                    boxShadow: bioloadOver ? "0 0 12px rgba(255,82,82,0.4)" : "0 0 10px rgba(0,229,255,0.2)",
                  }} />
                  {/* Overflow spike */}
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

                {/* Scale labels */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "rgba(176,222,255,0.3)" }}>
                  <span>0</span>
                  <span style={{ color: "rgba(255,215,64,0.5)" }}>85%</span>
                  <span style={{ color: bioloadOver ? "rgba(255,82,82,0.6)" : "rgba(176,222,255,0.3)" }}>{tankCapacity} units</span>
                </div>

                {/* Summary row */}
                {stockedSpecies.length > 0 && (
                  <div style={{ marginTop: 16, display: "flex", gap: 20, flexWrap: "wrap", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 13, color: "rgba(176,222,255,0.5)" }}>
                    <span>🐠 {totalFish} animal{totalFish !== 1 ? "s" : ""}</span>
                    <span>🔬 {stockedSpecies.length} species</span>
                    <span style={{ color: status.color }}>⚡ {((totalBioload / tankCapacity) * 100).toFixed(0)}% capacity</span>
                  </div>
                )}
              </div>

              {/* ── Current Tank Stock ── */}
              {stockedSpecies.length > 0 && (
                <div style={{ marginBottom: 32, animation: "fadeUp 0.6s ease 0.15s both" }}>
                  <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 2, color: "rgba(176,222,255,0.4)", fontWeight: 600, marginBottom: 16 }}>
                    🐠 In Your Tank
                  </h3>
                  <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    {stockedSpecies.map(({ sp, count }, i) => {
                      const itemBioload = (sp.bioload ?? 1) * count;
                      const itemPct = tankCapacity > 0 ? (itemBioload / tankCapacity) * 100 : 0;
                      return (
                        <div key={sp.id} style={{
                          display: "flex", alignItems: "center", gap: 14,
                          padding: "14px 20px",
                          borderBottom: i < stockedSpecies.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        }}>
                          <SpeciesAvatar species={sp} size={44} borderRadius={10} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{sp.name}</div>
                            <div style={{ fontSize: 11, color: "rgba(176,222,255,0.35)" }}>
                              {sp.bioload ?? 1} unit{(sp.bioload ?? 1) !== 1 ? "s" : ""}/fish · {itemBioload.toFixed(1)} total · {itemPct.toFixed(0)}% of tank
                            </div>
                          </div>
                          {/* Count controls */}
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <button
                              onClick={() => removeOneFromStock(sp.id)}
                              style={{
                                width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(255,82,82,0.3)",
                                background: "rgba(255,82,82,0.08)", color: "#ff5252",
                                cursor: "pointer", fontSize: 16, fontWeight: 700, fontFamily: "inherit",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.15s",
                              }}
                            >−</button>
                            <span style={{ fontSize: 16, fontWeight: 700, color: "#e0f0ff", minWidth: 28, textAlign: "center" }}>{count}</span>
                            <button
                              onClick={() => addToStock(sp)}
                              style={{
                                width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(0,229,255,0.3)",
                                background: "rgba(0,229,255,0.08)", color: "#00e5ff",
                                cursor: "pointer", fontSize: 16, fontWeight: 700, fontFamily: "inherit",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.15s",
                              }}
                            >+</button>
                            <button
                              onClick={() => removeAllFromStock(sp.id)}
                              style={{
                                width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)",
                                background: "rgba(255,255,255,0.03)", color: "rgba(176,222,255,0.3)",
                                cursor: "pointer", fontSize: 14, fontFamily: "inherit",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.15s", marginLeft: 4,
                              }}
                              title="Remove all"
                            >✕</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Add Species ── */}
              <div style={{ animation: "fadeUp 0.6s ease 0.2s both" }}>
                <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 2, color: "rgba(176,222,255,0.4)", fontWeight: 600, marginBottom: 16 }}>
                  + Add Species
                </h3>

                {/* Type filter */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                  {["all", "fish", "invertebrate", "coral", "amphibian"].map((t) => {
                    if (t !== "all" && waterType === "freshwater" && t === "coral") return null;
                    return (
                      <button
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

                {/* Species pick list */}
                <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  {pickableSpecies.map((sp, i) => {
                    const count = getCount(sp.id);
                    const addedBioload = (sp.bioload ?? 1) * count;
                    const wouldOverstock = (totalBioload + (sp.bioload ?? 1)) > tankCapacity;
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

                        {/* Add/remove controls */}
                        {count === 0 ? (
                          <button
                            onClick={() => addToStock(sp)}
                            className="glow-btn"
                            style={{
                              padding: "8px 18px", borderRadius: 20, fontSize: 13, fontWeight: 600,
                              fontFamily: "inherit", cursor: "pointer", transition: "all 0.2s ease",
                              background: wouldOverstock
                                ? "rgba(255,82,82,0.12)"
                                : "rgba(0,229,255,0.1)",
                              border: wouldOverstock
                                ? "1px solid rgba(255,82,82,0.4)"
                                : "1px solid rgba(0,229,255,0.3)",
                              color: wouldOverstock ? "#ff5252" : "#00e5ff",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {wouldOverstock ? "⚠ Add" : "+ Add"}
                          </button>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <button
                              onClick={() => removeOneFromStock(sp.id)}
                              style={{
                                width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(255,82,82,0.3)",
                                background: "rgba(255,82,82,0.08)", color: "#ff5252",
                                cursor: "pointer", fontSize: 16, fontWeight: 700, fontFamily: "inherit",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}
                            >−</button>
                            <span style={{ fontSize: 15, fontWeight: 700, color: "#00e5ff", minWidth: 24, textAlign: "center" }}>{count}</span>
                            <button
                              onClick={() => addToStock(sp)}
                              style={{
                                width: 30, height: 30, borderRadius: 8,
                                border: wouldOverstock ? "1px solid rgba(255,82,82,0.4)" : "1px solid rgba(0,229,255,0.3)",
                                background: wouldOverstock ? "rgba(255,82,82,0.08)" : "rgba(0,229,255,0.08)",
                                color: wouldOverstock ? "#ff5252" : "#00e5ff",
                                cursor: "pointer", fontSize: 16, fontWeight: 700, fontFamily: "inherit",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}
                            >+</button>
                          </div>
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
        })()}
      </div>
    </div>
  );
}