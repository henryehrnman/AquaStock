import { useState, useEffect, useRef, useCallback } from "react";
import { getSupabase } from "../../lib/supabase/browserClient.js";
import { fetchCatalog } from "../../lib/supabase/speciesCatalogFromSupabase.js";
import {
  BIOLOAD_PCT_DISPLAY_CAP,
  MATCHES_PAGE_SIZE,
} from "../../config/aquariumConstants.js";

export function useAquariumApp() {
  const [step, setStep] = useState(0);
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
  const [stockList, setStockList] = useState([]);
  const [stockTypeFilter, setStockTypeFilter] = useState("all");
  const [speciesDb, setSpeciesDb] = useState([]);
  const [curatedSetups, setCuratedSetups] = useState([]);
  const [catalogStatus, setCatalogStatus] = useState("loading");
  const [catalogErrorDetail, setCatalogErrorDetail] = useState("");
  const [catalogReloadTick, setCatalogReloadTick] = useState(0);
  const [matchesVisibleCount, setMatchesVisibleCount] = useState(MATCHES_PAGE_SIZE);
  const [showStockFloatBubble, setShowStockFloatBubble] = useState(false);

  const resultsRef = useRef(null);
  const readyToStockAnchorRef = useRef(null);
  const bubbleRefs = useRef([]);
  const fishRefs = useRef([]);
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

  useEffect(() => {
    setMatchesVisibleCount(MATCHES_PAGE_SIZE);
  }, [step, typeFilter, diffFilter]);

  const getCount = useCallback((id) => stockList.find(x => x.id === id)?.count ?? 0, [stockList]);
  const addToStock = useCallback((sp) => {
    setStockList(prev => {
      const total = prev.reduce((sum, item) => {
        const s = speciesDb.find(x => x.id === item.id);
        return sum + (s ? (s.bioload ?? 1) * item.count : 0);
      }, 0);
      if (tankSize > 0 && (total / tankSize) * 100 >= BIOLOAD_PCT_DISPLAY_CAP) return prev;
      const existing = prev.find(x => x.id === sp.id);
      if (existing) return prev.map(x => x.id === sp.id ? { ...x, count: x.count + 1 } : x);
      return [...prev, { id: sp.id, count: 1 }];
    });
  }, [speciesDb, tankSize]);
  const removeAllFromStock = useCallback((id) => {
    setStockList(prev => prev.filter(x => x.id !== id));
  }, []);

  const setStockCount = useCallback((speciesId, desired) => {
    setStockList(prev => {
      const sp = speciesDb.find(s => s.id === speciesId);
      if (!sp) return prev;
      const unit = sp.bioload ?? 1;
      const othersBioload = prev.reduce((sum, item) => {
        if (item.id === speciesId) return sum;
        const s = speciesDb.find(x => x.id === item.id);
        return sum + (s ? (s.bioload ?? 1) * item.count : 0);
      }, 0);
      const capUnits = tankSize > 0 ? (BIOLOAD_PCT_DISPLAY_CAP / 100) * tankSize : Number.MAX_SAFE_INTEGER;
      const maxByCap = unit > 0 ? Math.floor((capUnits - othersBioload) / unit) : 0;
      let n = Math.max(0, Math.floor(Number(desired) || 0));
      n = Math.min(n, maxByCap);
      if (n === 0) return prev.filter(x => x.id !== speciesId);
      const existing = prev.find(x => x.id === speciesId);
      if (existing) return prev.map(x => x.id === speciesId ? { ...x, count: n } : x);
      return [...prev, { id: speciesId, count: n }];
    });
  }, [speciesDb, tankSize]);

  const tankCapacity = tankSize;
  const totalBioload = stockList.reduce((sum, item) => {
    const sp = speciesDb.find(s => s.id === item.id);
    return sum + (sp ? (sp.bioload ?? 1) * item.count : 0);
  }, 0);
  const tankBioloadPct = tankCapacity > 0 ? (totalBioload / tankCapacity) * 100 : 0;
  const bioloadPctAtCap = tankCapacity > 0 && tankBioloadPct >= BIOLOAD_PCT_DISPLAY_CAP;
  const bioloadPct = Math.min(tankBioloadPct, 100);
  const bioloadOver = totalBioload > tankCapacity;

  const formatCappedBioloadPct = (pct) =>
    pct > BIOLOAD_PCT_DISPLAY_CAP ? `${BIOLOAD_PCT_DISPLAY_CAP}%+` : `${Math.round(Math.min(pct, BIOLOAD_PCT_DISPLAY_CAP))}%`;

  const stockStatus = () => {
    const pct = tankBioloadPct;
    if (pct === 0) return { text: "Add fish to get started", color: "rgba(176,222,255,0.4)" };
    if (pct < 30)  return { text: "Lightly stocked", color: "#80cbc4" };
    if (pct < 60)  return { text: "Getting there", color: "#00e5ff" };
    if (pct < 85)  return { text: "Well balanced", color: "#69f0ae" };
    if (pct < 100) return { text: "Almost full", color: "#ffd740" };
    if (pct === 100) return { text: "Perfectly stocked!", color: "#69f0ae" };
    return { text: `Overstocked by ${(totalBioload - tankCapacity).toFixed(1)} units`, color: "#ff5252" };
  };

  const barColor = () => {
    const pct = tankBioloadPct;
    if (pct > 100) return "#ff5252";
    if (pct > 85)  return "#ffd740";
    return "linear-gradient(90deg, #00e5ff, #69f0ae)";
  };

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
  const visibleCompatible = compatible.slice(0, matchesVisibleCount);
  const matchesHasMore = compatible.length > matchesVisibleCount;

  useEffect(() => {
    const expandedList = matchesVisibleCount > MATCHES_PAGE_SIZE;
    const el = readyToStockAnchorRef.current;
    if (step !== 2 || !catalogReady || compatible.length === 0 || !expandedList || !el) {
      setShowStockFloatBubble(false);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        setShowStockFloatBubble(!entry.isIntersecting);
      },
      { root: null, threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [step, catalogReady, compatible.length, matchesVisibleCount]);

  return {
    step,
    setStep,
    tankSize,
    setTankSize,
    waterType,
    setWaterType,
    temp,
    setTemp,
    ph,
    setPh,
    gh,
    setGh,
    kh,
    setKh,
    typeFilter,
    setTypeFilter,
    diffFilter,
    setDiffFilter,
    selectedSpecies,
    setSelectedSpecies,
    dimMode,
    setDimMode,
    showParams,
    setShowParams,
    tankL,
    setTankL,
    tankW,
    setTankW,
    tankH,
    setTankH,
    fadeIn,
    isMobile,
    stockList,
    stockTypeFilter,
    setStockTypeFilter,
    speciesDb,
    curatedSetups,
    catalogStatus,
    catalogErrorDetail,
    catalogReloadTick,
    setCatalogReloadTick,
    matchesVisibleCount,
    setMatchesVisibleCount,
    showStockFloatBubble,
    resultsRef,
    readyToStockAnchorRef,
    bubbleRefs,
    fishRefs,
    fishPool,
    getCount,
    addToStock,
    removeAllFromStock,
    setStockCount,
    tankCapacity,
    totalBioload,
    tankBioloadPct,
    bioloadPctAtCap,
    bioloadPct,
    bioloadOver,
    formatCappedBioloadPct,
    stockStatus,
    barColor,
    chemistryFilterActive,
    compatible,
    popularPicks,
    matchingSetups,
    catalogReady,
    visibleCompatible,
    matchesHasMore,
  };
}
