import { useState, useEffect, useRef } from "react";

const SPECIES_DB = [
  // Freshwater Fish
  { id: 1, name: "Neon Tetra", type: "fish", water: "freshwater", minTank: 10, tempMin: 70, tempMax: 82, phMin: 5.0, phMax: 7.5, ghMin: 1, ghMax: 10, khMin: 1, khMax: 5, school: 6, difficulty: "beginner", img: "🐟", color: "#00e5ff", desc: "Brilliant iridescent blue and red. Peaceful schooling fish perfect for community tanks.", popular: true },
  { id: 2, name: "Betta Splendens", type: "fish", water: "freshwater", minTank: 5, tempMin: 76, tempMax: 82, phMin: 6.0, phMax: 7.5, ghMin: 1, ghMax: 12, khMin: 1, khMax: 5, school: 1, difficulty: "beginner", img: "🐠", color: "#e91e63", desc: "Stunning flowing fins. Keep males solo — territorial but full of personality.", popular: true },
  { id: 3, name: "Corydoras Catfish", type: "fish", water: "freshwater", minTank: 10, tempMin: 72, tempMax: 79, phMin: 6.0, phMax: 7.8, ghMin: 2, ghMax: 15, khMin: 2, khMax: 8, school: 4, difficulty: "beginner", img: "🐟", color: "#ffab40", desc: "Adorable bottom-dwellers that keep your substrate clean. Very social.", popular: true },
  { id: 4, name: "Angelfish", type: "fish", water: "freshwater", minTank: 30, tempMin: 76, tempMax: 84, phMin: 6.0, phMax: 7.5, ghMin: 3, ghMax: 10, khMin: 1, khMax: 5, school: 2, difficulty: "intermediate", img: "🐠", color: "#e0e0e0", desc: "Majestic and graceful. A stunning centerpiece fish for medium to large tanks.", popular: true },
  { id: 5, name: "Cherry Barb", type: "fish", water: "freshwater", minTank: 10, tempMin: 73, tempMax: 81, phMin: 6.0, phMax: 7.0, ghMin: 4, ghMax: 15, khMin: 2, khMax: 8, school: 6, difficulty: "beginner", img: "🐟", color: "#ff5252", desc: "Vibrant red coloration. Hardy, peaceful, and great for planted tanks." },
  { id: 6, name: "Dwarf Gourami", type: "fish", water: "freshwater", minTank: 10, tempMin: 72, tempMax: 82, phMin: 6.0, phMax: 7.5, ghMin: 4, ghMax: 10, khMin: 1, khMax: 5, school: 1, difficulty: "beginner", img: "🐠", color: "#448aff", desc: "Brilliant blues and reds. A labyrinth fish that breathes air from the surface." },
  { id: 7, name: "German Blue Ram", type: "fish", water: "freshwater", minTank: 20, tempMin: 78, tempMax: 85, phMin: 5.0, phMax: 7.0, ghMin: 0, ghMax: 6, khMin: 0, khMax: 3, school: 2, difficulty: "intermediate", img: "🐠", color: "#ffeb3b", desc: "Electric blue and gold. A dwarf cichlid with incredible personality." },
  { id: 8, name: "Bristlenose Pleco", type: "fish", water: "freshwater", minTank: 20, tempMin: 73, tempMax: 81, phMin: 6.5, phMax: 7.5, ghMin: 2, ghMax: 15, khMin: 1, khMax: 8, school: 1, difficulty: "beginner", img: "🐟", color: "#795548", desc: "Excellent algae eater. Stays small unlike common plecos.", popular: true },
  { id: 9, name: "Harlequin Rasbora", type: "fish", water: "freshwater", minTank: 10, tempMin: 73, tempMax: 82, phMin: 6.0, phMax: 7.5, ghMin: 2, ghMax: 10, khMin: 1, khMax: 5, school: 8, difficulty: "beginner", img: "🐟", color: "#ff9800", desc: "Copper and black wedge pattern. Peaceful and looks stunning in groups." },
  { id: 10, name: "Discus", type: "fish", water: "freshwater", minTank: 55, tempMin: 82, tempMax: 88, phMin: 5.5, phMax: 7.0, ghMin: 0, ghMax: 5, khMin: 0, khMax: 3, school: 5, difficulty: "advanced", img: "🐠", color: "#e040fb", desc: "The king of freshwater aquariums. Requires pristine water but rewards with breathtaking beauty." },
  
  // Saltwater Fish
  { id: 11, name: "Ocellaris Clownfish", type: "fish", water: "saltwater", minTank: 20, tempMin: 74, tempMax: 80, phMin: 8.0, phMax: 8.4, ghMin: 8, ghMax: 12, khMin: 8, khMax: 12, school: 2, difficulty: "beginner", img: "🐠", color: "#ff6d00", desc: "The iconic 'Nemo'. Hardy, colorful, and bonds with anemones.", popular: true },
  { id: 12, name: "Royal Gramma", type: "fish", water: "saltwater", minTank: 20, tempMin: 72, tempMax: 78, phMin: 8.1, phMax: 8.4, ghMin: 8, ghMax: 12, khMin: 8, khMax: 12, school: 1, difficulty: "beginner", img: "🐠", color: "#aa00ff", desc: "Striking purple and yellow. A peaceful reef-safe fish." },
  { id: 13, name: "Yellow Tang", type: "fish", water: "saltwater", minTank: 75, tempMin: 72, tempMax: 78, phMin: 8.1, phMax: 8.4, ghMin: 8, ghMax: 12, khMin: 8, khMax: 12, school: 1, difficulty: "intermediate", img: "🐠", color: "#ffd600", desc: "Electric yellow coloration. Active swimmer needing room to roam." },
  { id: 14, name: "Firefish Goby", type: "fish", water: "saltwater", minTank: 20, tempMin: 72, tempMax: 80, phMin: 8.1, phMax: 8.4, ghMin: 8, ghMax: 12, khMin: 8, khMax: 12, school: 1, difficulty: "beginner", img: "🐟", color: "#ff1744", desc: "Elegant white body with fiery red tail. Peaceful and hardy." },

  // Invertebrates
  { id: 20, name: "Amano Shrimp", type: "invertebrate", water: "freshwater", minTank: 5, tempMin: 70, tempMax: 80, phMin: 6.5, phMax: 7.5, ghMin: 6, ghMax: 15, khMin: 3, khMax: 8, school: 3, difficulty: "beginner", img: "🦐", color: "#b2dfdb", desc: "Champion algae eaters. Transparent with distinctive dots along the body.", popular: true },
  { id: 21, name: "Cherry Shrimp", type: "invertebrate", water: "freshwater", minTank: 5, tempMin: 65, tempMax: 80, phMin: 6.2, phMax: 8.0, ghMin: 4, ghMax: 8, khMin: 3, khMax: 8, school: 6, difficulty: "beginner", img: "🦐", color: "#ef5350", desc: "Brilliant red neocaridina. Breed readily and create living jewels in your tank.", popular: true },
  { id: 22, name: "Nerite Snail", type: "invertebrate", water: "freshwater", minTank: 5, tempMin: 72, tempMax: 78, phMin: 7.0, phMax: 8.5, ghMin: 5, ghMax: 15, khMin: 5, khMax: 12, school: 1, difficulty: "beginner", img: "🐌", color: "#a1887f", desc: "Tireless algae eaters with beautiful shell patterns. Won't breed in freshwater." },
  { id: 23, name: "Mystery Snail", type: "invertebrate", water: "freshwater", minTank: 5, tempMin: 68, tempMax: 82, phMin: 7.0, phMax: 8.0, ghMin: 5, ghMax: 15, khMin: 5, khMax: 12, school: 1, difficulty: "beginner", img: "🐌", color: "#ffc107", desc: "Colorful and entertaining to watch. Available in gold, blue, ivory, and more." },
  { id: 24, name: "Cleaner Shrimp", type: "invertebrate", water: "saltwater", minTank: 20, tempMin: 72, tempMax: 80, phMin: 8.0, phMax: 8.4, ghMin: 8, ghMax: 12, khMin: 8, khMax: 12, school: 1, difficulty: "beginner", img: "🦐", color: "#ff6e40", desc: "Sets up cleaning stations for fish. Charismatic and useful reef inhabitant.", popular: true },
  { id: 25, name: "Emerald Crab", type: "invertebrate", water: "saltwater", minTank: 20, tempMin: 72, tempMax: 80, phMin: 8.0, phMax: 8.4, ghMin: 8, ghMax: 12, khMin: 8, khMax: 12, school: 1, difficulty: "beginner", img: "🦀", color: "#00c853", desc: "Brilliant green. Consumes bubble algae that other creatures won't touch." },

  // Corals
  { id: 30, name: "Zoanthids", type: "coral", water: "saltwater", minTank: 10, tempMin: 75, tempMax: 80, phMin: 8.0, phMax: 8.4, ghMin: 8, ghMax: 12, khMin: 8, khMax: 12, school: 1, difficulty: "beginner", img: "🪸", color: "#76ff03", desc: "Kaleidoscopic colors. The gateway coral — hardy and comes in infinite morphs.", popular: true },
  { id: 31, name: "Mushroom Coral", type: "coral", water: "saltwater", minTank: 10, tempMin: 75, tempMax: 80, phMin: 8.0, phMax: 8.4, ghMin: 8, ghMax: 12, khMin: 7, khMax: 11, school: 1, difficulty: "beginner", img: "🪸", color: "#d500f9", desc: "Soft, flowing discs in vivid colors. Nearly indestructible for a coral." },
  { id: 32, name: "Hammer Coral", type: "coral", water: "saltwater", minTank: 30, tempMin: 75, tempMax: 80, phMin: 8.0, phMax: 8.4, ghMin: 8, ghMax: 12, khMin: 8, khMax: 12, school: 1, difficulty: "intermediate", img: "🪸", color: "#00e676", desc: "Flowing tentacles with hammer-shaped tips. Mesmerizing movement under flow." },
  { id: 33, name: "Torch Coral", type: "coral", water: "saltwater", minTank: 30, tempMin: 75, tempMax: 80, phMin: 8.0, phMax: 8.4, ghMin: 8, ghMax: 12, khMin: 8, khMax: 12, school: 1, difficulty: "intermediate", img: "🪸", color: "#ffea00", desc: "Long flowing tentacles. Clownfish sometimes host in these as anemone substitutes." },
  { id: 34, name: "Acropora", type: "coral", water: "saltwater", minTank: 50, tempMin: 76, tempMax: 80, phMin: 8.1, phMax: 8.4, ghMin: 8, ghMax: 12, khMin: 9, khMax: 12, school: 1, difficulty: "advanced", img: "🪸", color: "#18ffff", desc: "The pinnacle of reef keeping. Stunning branching structures demanding pristine water." },

  // Amphibians
  { id: 40, name: "African Dwarf Frog", type: "amphibian", water: "freshwater", minTank: 5, tempMin: 72, tempMax: 82, phMin: 6.5, phMax: 7.8, ghMin: 5, ghMax: 15, khMin: 2, khMax: 8, school: 2, difficulty: "beginner", img: "🐸", color: "#69f0ae", desc: "Fully aquatic and full of charm. Loves to float at the surface with arms spread.", popular: true },
  { id: 41, name: "Axolotl", type: "amphibian", water: "freshwater", minTank: 20, tempMin: 60, tempMax: 68, phMin: 6.5, phMax: 8.0, ghMin: 7, ghMax: 14, khMin: 3, khMax: 8, school: 1, difficulty: "intermediate", img: "🦎", color: "#f8bbd0", desc: "The smiling salamander. Needs cold water and gentle flow. Utterly unique.", popular: true },
  { id: 42, name: "Fire Belly Newt", type: "amphibian", water: "freshwater", minTank: 10, tempMin: 62, tempMax: 72, phMin: 6.5, phMax: 7.5, ghMin: 6, ghMax: 12, khMin: 3, khMax: 8, school: 2, difficulty: "intermediate", img: "🦎", color: "#ff3d00", desc: "Vivid orange belly warns predators. Semi-aquatic — needs land area access." },
];

const CURATED_SETUPS = [
  {
    name: "Peaceful Community",
    water: "freshwater",
    minTank: 20,
    desc: "A harmonious mix of colorful, easy-going species",
    species: [1, 3, 8, 21],
    gradient: "linear-gradient(135deg, #00695c, #004d40)",
  },
  {
    name: "Nano Reef Starter",
    water: "saltwater",
    minTank: 20,
    desc: "Your first steps into the mesmerizing world of reef keeping",
    species: [11, 14, 24, 30],
    gradient: "linear-gradient(135deg, #1a237e, #0d47a1)",
  },
  {
    name: "Shrimp Paradise",
    water: "freshwater",
    minTank: 10,
    desc: "A lush planted tank alive with tiny colorful crustaceans",
    species: [20, 21, 22, 1],
    gradient: "linear-gradient(135deg, #1b5e20, #2e7d32)",
  },
  {
    name: "Betta Kingdom",
    water: "freshwater",
    minTank: 10,
    desc: "A serene realm built around a magnificent betta",
    species: [2, 3, 22, 20],
    gradient: "linear-gradient(135deg, #880e4f, #4a148c)",
  },
  {
    name: "Oddball Aquatics",
    water: "freshwater",
    minTank: 20,
    desc: "Fascinating creatures that break the mold",
    species: [41, 40, 23],
    gradient: "linear-gradient(135deg, #263238, #37474f)",
  },
];

const TYPE_ICONS = { fish: "🐟", invertebrate: "🦐", coral: "🪸", amphibian: "🐸" };
const TYPE_LABELS = { fish: "Fish", invertebrate: "Invertebrates", coral: "Corals", amphibian: "Amphibians" };

function Bubble({ style }) {
  return (
    <div
      style={{
        position: "absolute",
        borderRadius: "50%",
        background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12), rgba(255,255,255,0.02))",
        border: "1px solid rgba(255,255,255,0.06)",
        animation: `float ${8 + Math.random() * 12}s ease-in-out infinite`,
        animationDelay: `${Math.random() * 5}s`,
        ...style,
      }}
    />
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
  const resultsRef = useRef(null);

  useEffect(() => {
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
      background: "linear-gradient(180deg, #0a1628 0%, #0d2137 30%, #0a2a3c 60%, #081c2e 100%)",
      fontFamily: "'Outfit', 'Avenir Next', 'Segoe UI', sans-serif",
      color: "#e0f0ff",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
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
      `}</style>

      {/* Ambient Bubbles */}
      <Bubble style={{ width: 80, height: 80, top: "10%", left: "5%" }} />
      <Bubble style={{ width: 40, height: 40, top: "30%", right: "8%" }} />
      <Bubble style={{ width: 120, height: 120, bottom: "15%", left: "12%" }} />
      <Bubble style={{ width: 60, height: 60, top: "60%", right: "15%" }} />
      <Bubble style={{ width: 35, height: 35, top: "80%", left: "40%" }} />
      <Bubble style={{ width: 90, height: 90, top: "5%", right: "30%" }} />

      {/* Caustics overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse at 30% 20%, rgba(0,229,255,0.03) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(0,176,255,0.02) 0%, transparent 50%)",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
        
        {/* ===== LANDING ===== */}
        {step === 0 && (
          <div style={{
            minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
            textAlign: "center", gap: 32,
            opacity: fadeIn ? 1 : 0, transition: "opacity 0.6s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, animation: "fadeUp 0.8s ease both" }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: "linear-gradient(135deg, rgba(0,229,255,0.2), rgba(0,176,255,0.1))",
                border: "1px solid rgba(0,229,255,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 36, boxShadow: "0 0 40px rgba(0,229,255,0.15)",
              }}>
                🌊
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
              display: "flex", gap: 40, marginTop: 20,
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16, animation: "fadeUp 0.6s ease both" }}>
              <div>
                <button onClick={() => setStep(1)} style={{
                  background: "none", border: "none", color: "rgba(176,222,255,0.5)",
                  cursor: "pointer", fontSize: 14, fontFamily: "inherit", marginBottom: 12,
                }}>← Edit Parameters</button>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, fontWeight: 700 }}>
                  Your Matches
                </h2>
              </div>
              <div style={{
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
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
                              fontSize: 12, padding: "4px 10px", borderRadius: 20,
                              background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)",
                            }}>
                              {sp.img} {sp.name}
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
                        minWidth: 160, padding: 20, borderRadius: 16,
                        background: "rgba(255,255,255,0.04)",
                        border: selectedSpecies?.id === sp.id ? `1px solid ${sp.color}44` : "1px solid rgba(255,255,255,0.06)",
                        cursor: "pointer", transition: "all 0.3s ease", textAlign: "center",
                        boxShadow: selectedSpecies?.id === sp.id ? `0 0 20px ${sp.color}22` : "none",
                      }}
                    >
                      <div style={{ fontSize: 32, marginBottom: 8 }}>{sp.img}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{sp.name}</div>
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
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: `${sp.color}18`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 22, flexShrink: 0,
                        border: `1px solid ${sp.color}30`,
                      }}>
                        {sp.img}
                      </div>
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
                    {selectedSpecies?.id === sp.id && (
                      <div style={{
                        padding: "0 24px 20px 84px",
                        animation: "fadeUp 0.3s ease both",
                      }}>
                        <p style={{ fontSize: 14, color: "rgba(176,222,255,0.65)", lineHeight: 1.7, marginBottom: 16 }}>
                          {sp.desc}
                        </p>
                        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: 12 }}>
                          <div>
                            <span style={{ color: "rgba(176,222,255,0.35)" }}>Temp Range</span>
                            <div style={{ fontWeight: 600, marginTop: 2, color: "#00e5ff" }}>{sp.tempMin}–{sp.tempMax}°F</div>
                          </div>
                          <div>
                            <span style={{ color: "rgba(176,222,255,0.35)" }}>pH Range</span>
                            <div style={{ fontWeight: 600, marginTop: 2, color: "#00e5ff" }}>{sp.phMin}–{sp.phMax}</div>
                          </div>
                          <div>
                            <span style={{ color: "rgba(176,222,255,0.35)" }}>GH Range</span>
                            <div style={{ fontWeight: 600, marginTop: 2, color: "#00e5ff" }}>{sp.ghMin}–{sp.ghMax} dGH</div>
                          </div>
                          <div>
                            <span style={{ color: "rgba(176,222,255,0.35)" }}>KH Range</span>
                            <div style={{ fontWeight: 600, marginTop: 2, color: "#00e5ff" }}>{sp.khMin}–{sp.khMax} dKH</div>
                          </div>
                          <div>
                            <span style={{ color: "rgba(176,222,255,0.35)" }}>Min Tank</span>
                            <div style={{ fontWeight: 600, marginTop: 2, color: "#00e5ff" }}>{sp.minTank} gal</div>
                          </div>
                          <div>
                            <span style={{ color: "rgba(176,222,255,0.35)" }}>Grouping</span>
                            <div style={{ fontWeight: 600, marginTop: 2, color: "#00e5ff" }}>{sp.school > 1 ? `${sp.school}+ recommended` : "Can keep solo"}</div>
                          </div>
                        </div>
                      </div>
                    )}

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
