import { useState, useEffect, useRef, useCallback } from "react";
import { SPECIES_DB, CURATED_SETUPS } from "./data";

const TYPE_ICONS = { fish: "🐟", invertebrate: "🦐", coral: "🪸", amphibian: "🐸" };

const TYPE_LABELS = { fish: "Fish", invertebrate: "Invertebrates", coral: "Corals", amphibian: "Amphibians" };

// ─── Image cache so we don't re-fetch the same species ───
const imageCache = {};

// ─── Wikipedia search terms for better image results ───
const SEARCH_OVERRIDES = {
  "Betta Splendens": "Betta fish",
  "Cherry Shrimp": "Neocaridina davidi red",
  "Blue Dream Shrimp": "Neocaridina davidi blue",
  "Orange Sakura Shrimp": "Neocaridina davidi orange",
  "Yellow Shrimp": "Neocaridina davidi yellow",
  "Crystal Red Shrimp": "Caridina cantonensis crystal red",
  "Crystal Black Shrimp": "Caridina cantonensis crystal black",
  "Ghost Shrimp": "Palaemonetes paludosus",
  "Amano Shrimp": "Caridina multidentata",
  "Cleaner Shrimp (Skunk)": "Lysmata amboinensis",
  "Peppermint Shrimp": "Lysmata wurdemanni",
  "Sexy Shrimp": "Thor amboinensis",
  "Yellow Lab (Labidochromis caeruleus)": "Labidochromis caeruleus",
  "Galaxy Rasbora (Celestial Pearl Danio)": "Celestichthys margaritatus",
  "Espei Rasbora (Lambchop)": "Trigonostigma espei",
  "Peacock Cichlid (Aulonocara)": "Aulonocara cichlid",
  "Shell Dweller (Neolamprologus multifasciatus)": "Neolamprologus multifasciatus",
  "Blue Leg Hermit Crab": "Clibanarius tricolor",
  "Scarlet Reef Hermit": "Paguristes cadenati",
  "Mexican Dwarf Crayfish (CPO)": "Cambarellus patzcuarensis orange",
  "Blue Crayfish (Procambarus alleni)": "Procambarus alleni",
  "Fire Belly Newt": "Cynops orientalis",
  "Dojo/Weather Loach": "Misgurnus anguillicaudatus",
  "Vampire Pleco (L029)": "Leporacanthicus galaxias",
  "Axolotl (Leucistic)": "Axolotl leucistic",
  "Axolotl (GFP/Green Fluorescent)": "Axolotl GFP green fluorescent",
  "Mexican Axolotl (Wild Type)": "Ambystoma mexicanum",
  "Bubble Tip Anemone": "Entacmaea quadricolor",
  "Rock Flower Anemone": "Phymanthus crucifer",
  "Mushroom Coral (Discosoma)": "Discosoma coral",
  "Montipora (Plating)": "Montipora coral",
  "Montipora (Digitata)": "Montipora digitata",
  "Hammer Coral (Euphyllia)": "Euphyllia ancora",
  "Torch Coral (Euphyllia)": "Euphyllia glabrescens",
  "Frogspawn Coral (Euphyllia)": "Euphyllia divisa",
  "Rhodactis Mushroom": "Rhodactis coral",
  "Carpenter's Fairy Wrasse": "Cirrhilabrus carpenterae",
};

function SpeciesImage({ name, photo, size = 44, borderRadius = 12, style = {} }) {
  // Pre-populate cache from static photo field
  if (photo && !imageCache[name]) imageCache[name] = photo;

  const [imgUrl, setImgUrl] = useState(imageCache[name] || null);
  const [failed, setFailed] = useState(imageCache[name] === "NONE");

  useEffect(() => {
    if (imageCache[name] === "NONE") { setFailed(true); return; }
    if (imageCache[name]) { setImgUrl(imageCache[name]); return; }

    let cancelled = false;
    const searchTerm = SEARCH_OVERRIDES[name] || name;

    // Use Wikipedia API to get the main image for the species
    const fetchImage = async () => {
      try {
        // Try Wikipedia page image first
        const res = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`
        );
        if (!cancelled && res.ok) {
          const data = await res.json();
          if (data.thumbnail?.source) {
            // Get a higher-res version by tweaking the thumbnail URL
            const hiRes = data.thumbnail.source.replace(/\/\d+px-/, "/300px-");
            imageCache[name] = hiRes;
            setImgUrl(hiRes);
            return;
          }
        }

        // Fallback: Wikipedia search API
        const searchRes = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(searchTerm)}&prop=pageimages&format=json&pithumbsize=300&origin=*`
        );
        if (!cancelled && searchRes.ok) {
          const searchData = await searchRes.json();
          const pages = searchData.query?.pages;
          if (pages) {
            const page = Object.values(pages)[0];
            if (page?.thumbnail?.source) {
              imageCache[name] = page.thumbnail.source;
              setImgUrl(page.thumbnail.source);
              return;
            }
          }
        }

        // Second fallback: search by query
        const qRes = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchTerm + " aquarium")}&gsrlimit=3&prop=pageimages&format=json&pithumbsize=300&origin=*`
        );
        if (!cancelled && qRes.ok) {
          const qData = await qRes.json();
          const pages = qData.query?.pages;
          if (pages) {
            for (const page of Object.values(pages)) {
              if (page?.thumbnail?.source) {
                imageCache[name] = page.thumbnail.source;
                setImgUrl(page.thumbnail.source);
                return;
              }
            }
          }
        }

        if (!cancelled) {
          imageCache[name] = "NONE";
          setFailed(true);
        }
      } catch {
        if (!cancelled) {
          imageCache[name] = "NONE";
          setFailed(true);
        }
      }
    };

    fetchImage();
    return () => { cancelled = true; };
  }, [name]);

  if (failed || !imgUrl) {
    return null; // Let the parent show fallback emoji
  }

  return (
    <img
      src={imgUrl}
      alt={name}
      loading="lazy"
      style={{
        height: size,
        width: "auto",
        maxWidth: size * 2,
        borderRadius,
        display: "block",
        flexShrink: 0,
        ...style,
      }}
      onError={() => {
        imageCache[name] = "NONE";
        setFailed(true);
      }}
    />
  );
}

// Wrapper that shows image or falls back to emoji icon
function SpeciesAvatar({ species, size = 44, borderRadius = 12 }) {
  const [hasImage, setHasImage] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (imageCache[species.name] && imageCache[species.name] !== "NONE") {
      setHasImage(true);
      setChecked(true);
    } else if (imageCache[species.name] === "NONE") {
      setHasImage(false);
      setChecked(true);
    }
    // If not cached yet, wait for SpeciesImage to load
  }, [species.name]);

  return (
    <div style={{
      height: size, width: "auto", minWidth: size, maxWidth: size * 2, borderRadius,
      background: `${species.color || "#00e5ff"}18`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size > 60 ? 36 : 22, flexShrink: 0,
      border: `1px solid ${species.color || "#00e5ff"}30`,
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Always try to render the image */}
      <SpeciesImage name={species.name} photo={species.photo} size={size} borderRadius={0} />
      {/* Show emoji as fallback if image hasn't loaded yet or failed */}
      {!imageCache[species.name] || imageCache[species.name] === "NONE" ? (
        <span style={{ position: "absolute" }}>{species.img}</span>
      ) : null}
    </div>
  );
}

function ClownfishLogo({ size = 56 }) {
  const O = '#FF6B35'; // orange
  const B = '#0d1117'; // black
  const W = '#FFFFFF'; // white
  const _ = null;

  // 16 × 11 pixel grid — right-facing clownfish with dorsal fin + forked tail
  const grid = [
    //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15
    [ _,  _,  _,  _,  _,  B,  B,  _,  _,  _,  _,  _,  _,  _,  _,  _], // 0 dorsal fin
    [ _,  _,  _,  _,  B,  O,  O,  B,  _,  _,  _,  _,  _,  _,  _,  _], // 1 dorsal fin
    [ _,  _,  _,  B,  B,  B,  B,  B,  B,  B,  _,  _,  _,  _,  _,  _], // 2 body top
    [ _,  _,  B,  O,  O,  B,  W,  B,  O,  O,  B,  _,  _,  B,  _,  _], // 3 tail upper tip
    [ _,  B,  O,  O,  B,  W,  W,  B,  O,  O,  O,  B,  B,  O,  B,  _], // 4 tail upper fork
    [ B,  O,  O,  O,  B,  W,  W,  B,  O,  O,  O,  O,  O,  O,  B,  _], // 5
    [ B,  O,  B,  O,  B,  W,  W,  B,  O,  O,  O,  O,  O,  O,  B,  _], // 6 eye at col 2
    [ B,  O,  O,  O,  B,  W,  W,  B,  O,  O,  O,  O,  O,  O,  B,  _], // 7
    [ _,  B,  O,  O,  B,  W,  W,  B,  O,  O,  O,  B,  B,  O,  B,  _], // 8 tail lower fork
    [ _,  _,  B,  O,  O,  B,  W,  B,  O,  O,  B,  _,  _,  B,  _,  _], // 9 tail lower tip
    [ _,  _,  _,  B,  B,  B,  B,  B,  B,  B,  _,  _,  _,  _,  _,  _], // 10 body bottom
  ];

  const cols = 16, rows = 11;
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

function SwimmingFish({ size, top, duration, delay, direction = "right", opacity = 0.12, parallaxRef }) {
  const anim = direction === "right" ? "swim-right" : "swim-left";
  const appearDuration = useRef(30 + Math.random() * 40);
  const appearDelay    = useRef(-(Math.random() * 30));
  return (
    // ref on outermost so scroll handler can update both transform (parallax) and top (recycle)
    <div ref={parallaxRef} style={{
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

function Bubble({ style, parallaxRef }) {
  const duration = useRef(8 + Math.random() * 12);
  const delay = useRef(Math.random() * 5);
  return (
    // Outer div: handles parallax translation via ref (no re-renders)
    <div ref={parallaxRef} style={{ position: "absolute", willChange: "transform", ...style }}>
      {/* Inner div: handles CSS float animation independently */}
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

export default function AquariumStockr() {
  const [step, setStep] = useState(0); // 0=landing, 1=setup, 2=results
  const [tankSize, setTankSize] = useState(20);
  const [waterType, setWaterType] = useState("freshwater");
  const [temp, setTemp] = useState(76);
  const [ph, setPh] = useState(7.0);
  const [gh, setGh] = useState(8);
  const [kh, setKh] = useState(5);
  const [typeFilter, setTypeFilter] = useState("all");
  const [diffFilter, setDiffFilter] = useState("all");
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [fadeIn, setFadeIn] = useState(true);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  const resultsRef = useRef(null);
  const bubbleRefs = useRef([]);
  const fishRefs = useRef([]);
  // Random fish pool — generated once on mount, covers 0–5000% page depth
  const fishPool = useRef(
    Array.from({ length: 782 }, (_, i) => {
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

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Scroll: move bubbles upward proportional to depth — rAF throttled to avoid mobile jank
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

  const compatible = SPECIES_DB.filter((s) => {
    if (s.water !== waterType) return false;
    if (s.minTank > tankSize) return false;
    if (temp < s.tempMin || temp > s.tempMax) return false;
    if (ph < s.phMin || ph > s.phMax) return false;
    if (gh < s.ghMin || gh > s.ghMax) return false;
    if (kh < s.khMin || kh > s.khMax) return false;
    if (typeFilter !== "all" && s.type !== typeFilter) return false;
    if (diffFilter !== "all" && s.difficulty !== diffFilter) return false;
    return true;
  });

  const popularPicks = SPECIES_DB.filter(
    (s) => s.popular && s.water === waterType && s.minTank <= tankSize && temp >= s.tempMin && temp <= s.tempMax && ph >= s.phMin && ph <= s.phMax && gh >= s.ghMin && gh <= s.ghMax && kh >= s.khMin && kh <= s.khMax
  );

  const matchingSetups = CURATED_SETUPS.filter((s) => s.water === waterType && s.minTank <= tankSize);

  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "'Outfit', 'Avenir Next', 'Segoe UI', sans-serif",
      color: "#e0f0ff",
      position: "relative",
      overflow: "hidden",
    }}>
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
        {/* Extra bubbles on results screen — spread across full page depth */}
        {step === 2 && <>
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
              <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "rgba(176,222,255,0.5)", fontWeight: 600, display: "block", marginBottom: 12 }}>
                Tank Size
              </label>
              <div style={{
                background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "20px 24px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                  <span style={{ fontSize: 32, fontWeight: 700, color: "#00e5ff" }}>{tankSize}</span>
                  <span style={{ color: "rgba(176,222,255,0.4)", fontSize: 14 }}>gallons</span>
                </div>
                <input type="range" min={5} max={200} value={tankSize}
                  onChange={(e) => setTankSize(+e.target.value)} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "rgba(176,222,255,0.3)" }}>
                  <span>5 gal</span><span>200 gal</span>
                </div>
              </div>
            </div>

            {/* Temperature */}
            <div style={{ animation: "fadeUp 0.6s ease 0.3s both" }}>
              <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "rgba(176,222,255,0.5)", fontWeight: 600, display: "block", marginBottom: 12 }}>
                Temperature
              </label>
              <div style={{
                background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "20px 24px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                  <span style={{ fontSize: 32, fontWeight: 700, color: "#00e5ff" }}>{temp}°F</span>
                  <span style={{ color: "rgba(176,222,255,0.4)", fontSize: 14 }}>
                    {temp < 70 ? "Cold" : temp < 78 ? "Moderate" : temp < 84 ? "Warm" : "Tropical"}
                  </span>
                </div>
                <input type="range" min={58} max={90} value={temp}
                  onChange={(e) => setTemp(+e.target.value)} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "rgba(176,222,255,0.3)" }}>
                  <span>58°F</span><span>90°F</span>
                </div>
              </div>
            </div>

            {/* pH */}
            <div style={{ animation: "fadeUp 0.6s ease 0.4s both" }}>
              <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "rgba(176,222,255,0.5)", fontWeight: 600, display: "block", marginBottom: 12 }}>
                pH Level
              </label>
              <div style={{
                background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "20px 24px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                  <span style={{ fontSize: 32, fontWeight: 700, color: "#00e5ff" }}>{ph.toFixed(1)}</span>
                  <span style={{ color: "rgba(176,222,255,0.4)", fontSize: 14 }}>
                    {ph < 6.5 ? "Acidic" : ph < 7.5 ? "Neutral" : ph < 8.0 ? "Slightly Alkaline" : "Alkaline"}
                  </span>
                </div>
                <input type="range" min={50} max={90} value={ph * 10}
                  onChange={(e) => setPh(+(e.target.value / 10).toFixed(1))} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "rgba(176,222,255,0.3)" }}>
                  <span>5.0</span><span>9.0</span>
                </div>
              </div>
            </div>

            {/* GH */}
            <div style={{ animation: "fadeUp 0.6s ease 0.5s both" }}>
              <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "rgba(176,222,255,0.5)", fontWeight: 600, display: "block", marginBottom: 12 }}>
                GH — General Hardness
              </label>
              <div style={{
                background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "20px 24px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                  <span style={{ fontSize: 32, fontWeight: 700, color: "#00e5ff" }}>{gh} <span style={{ fontSize: 16, fontWeight: 400 }}>dGH</span></span>
                  <span style={{ color: "rgba(176,222,255,0.4)", fontSize: 14 }}>
                    {gh <= 4 ? "Very Soft" : gh <= 8 ? "Soft" : gh <= 12 ? "Moderate" : gh <= 18 ? "Hard" : "Very Hard"}
                  </span>
                </div>
                <input type="range" min={0} max={25} value={gh}
                  onChange={(e) => setGh(+e.target.value)} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "rgba(176,222,255,0.3)" }}>
                  <span>0 dGH</span><span>25 dGH</span>
                </div>
              </div>
            </div>

            {/* KH */}
            <div style={{ animation: "fadeUp 0.6s ease 0.6s both" }}>
              <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "rgba(176,222,255,0.5)", fontWeight: 600, display: "block", marginBottom: 12 }}>
                KH — Carbonate Hardness
              </label>
              <div style={{
                background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "20px 24px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                  <span style={{ fontSize: 32, fontWeight: 700, color: "#00e5ff" }}>{kh} <span style={{ fontSize: 16, fontWeight: 400 }}>dKH</span></span>
                  <span style={{ color: "rgba(176,222,255,0.4)", fontSize: 14 }}>
                    {kh <= 3 ? "Very Low" : kh <= 6 ? "Low" : kh <= 9 ? "Moderate" : kh <= 12 ? "High" : "Very High"}
                  </span>
                </div>
                <input type="range" min={0} max={15} value={kh}
                  onChange={(e) => setKh(+e.target.value)} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "rgba(176,222,255,0.3)" }}>
                  <span>0 dKH</span><span>15 dKH</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => { setStep(2); setTypeFilter("all"); setDiffFilter("all"); setSelectedSpecies(null); }}
              className="glow-btn"
              style={{
                padding: "18px 48px", fontSize: 17, fontWeight: 600,
                fontFamily: "inherit",
                background: "linear-gradient(135deg, #00b0ff, #00e5ff)",
                border: "none", borderRadius: 60, color: "#0a1628",
                cursor: "pointer", letterSpacing: 0.5,
                boxShadow: "0 0 20px rgba(0,229,255,0.25), 0 4px 20px rgba(0,0,0,0.3)",
                transition: "all 0.3s ease",
                animation: "fadeUp 0.6s ease 0.5s both",
                alignSelf: "center",
              }}
            >
              Find Compatible Species →
            </button>
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
                background: "rgba(0,0,0,0.2)", padding: "10px 16px", borderRadius: 12,
                fontSize: 13, color: "rgba(176,222,255,0.6)",
              }}>
                <span>{waterType === "freshwater" ? "🌿" : "🌊"} {waterType}</span>
                <span style={{ opacity: 0.3 }}>|</span>
                <span>{tankSize}gal</span>
                <span style={{ opacity: 0.3 }}>|</span>
                <span>{temp}°F</span>
                <span style={{ opacity: 0.3 }}>|</span>
                <span>pH {ph.toFixed(1)}</span>
                <span style={{ opacity: 0.3 }}>|</span>
                <span>GH {gh} dGH</span>
                <span style={{ opacity: 0.3 }}>|</span>
                <span>KH {kh} dKH</span>
              </div>
            </div>

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
                          const sp = SPECIES_DB.find((s) => s.id === sid);
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
                      {t === "all" ? "All" : `${TYPE_ICONS[t] || ""} ${TYPE_LABELS[t] || t}`}
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
                  <p style={{ fontSize: 13, marginTop: 8 }}>Try adjusting your tank size, temperature, pH, GH, or KH.</p>
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
                          {TYPE_LABELS[sp.type]} · Min {sp.minTank}gal · {sp.school > 1 ? `School of ${sp.school}+` : "Solo"}
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
                                  { label: TYPE_LABELS[sp.type], color: "#b39ddb" },
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

                          {/* Parameter bars */}
                          <div className="detail-bars" style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
                            {statRows.map(({ label, value, min, max, cur, absMin, absMax }) => {
                              const rangeW = absMax - absMin;
                              const barLeft = ((min - absMin) / rangeW) * 100;
                              const barWidth = ((max - min) / rangeW) * 100;
                              const markerPos = ((cur - absMin) / rangeW) * 100;
                              const inRange = cur >= min && cur <= max;
                              return (
                                <div key={label}>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                    <span style={{ fontSize: 11, color: "rgba(176,222,255,0.4)", fontWeight: 500 }}>{label}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: inRange ? "#00e5ff" : "#ff5252" }}>{value}</span>
                                  </div>
                                  <div style={{ position: "relative", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "visible" }}>
                                    {/* Species range bar */}
                                    <div style={{
                                      position: "absolute", top: 0, height: "100%", borderRadius: 4,
                                      left: `${barLeft}%`, width: `${barWidth}%`,
                                      background: inRange ? "rgba(0,229,255,0.5)" : "rgba(255,82,82,0.4)",
                                    }} />
                                    {/* Current value marker */}
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
          </div>
        )}
      </div>
    </div>
  );
}