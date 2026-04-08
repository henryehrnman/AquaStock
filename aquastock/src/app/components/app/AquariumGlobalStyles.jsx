export function AquariumGlobalStyles() {
  return (
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
        .stock-float-bubble {
          box-shadow: 0 10px 32px rgba(0,0,0,0.4), 0 0 28px rgba(0,229,255,0.45);
          will-change: transform;
        }
        .stock-float-bubble:hover {
          filter: brightness(1.08);
          box-shadow: 0 12px 36px rgba(0,0,0,0.45), 0 0 36px rgba(0,229,255,0.55);
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
  );
}
