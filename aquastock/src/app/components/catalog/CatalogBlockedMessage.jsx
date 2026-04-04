export function CatalogBlockedMessage({ status, detail, onRetry }) {
  const copy = {
    loading: { title: "Loading catalog…", body: "Fetching species from your Supabase project." },
    missing_env: {
      title: "Supabase not configured",
      body: "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to aquastock/.env, then restart the dev server.",
    },
    empty: {
      title: "No species in the database",
      body: "Add rows to the species table in Supabase (Table Editor, SQL, or CSV import). The app does not ship a built-in species list.",
    },
    error: {
      title: "Could not load catalog",
      body: detail || "Check the browser console, your network, and Supabase row-level security (SELECT allowed for anon).",
    },
  };
  const { title, body } = copy[status] ?? copy.error;
  return (
    <div style={{ textAlign: "center", padding: "56px 24px 80px", maxWidth: 460, margin: "0 auto" }}>
      <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, marginBottom: 12, color: "#e0f0ff" }}>{title}</h3>
      <p style={{ color: "rgba(176,222,255,0.55)", lineHeight: 1.65, marginBottom: 24 }}>{body}</p>
      {(status === "error" || status === "empty") && (
        <button
          type="button"
          onClick={onRetry}
          className="glow-btn"
          style={{
            padding: "12px 28px", fontSize: 15, fontWeight: 600, fontFamily: "inherit",
            background: "linear-gradient(135deg, #00b0ff, #00e5ff)", border: "none", borderRadius: 60,
            color: "#0a1628", cursor: "pointer",
            boxShadow: "0 0 16px rgba(0,229,255,0.2)",
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
