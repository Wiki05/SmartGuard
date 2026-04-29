import { useState, useEffect, useCallback, useRef } from "react";
import { callGroq, BACKEND_URL } from "../../api/groq";

/* ── Coin list (CoinGecko IDs) ──────────────────────────────────── */
const COINS = [
  { id: "bitcoin",       symbol: "BTC",  name: "Bitcoin",   color: "#f7931a" },
  { id: "ethereum",      symbol: "ETH",  name: "Ethereum",  color: "#627eea" },
  { id: "solana",        symbol: "SOL",  name: "Solana",    color: "#9945ff" },
  { id: "binancecoin",   symbol: "BNB",  name: "BNB",       color: "#f3ba2f" },
  { id: "ripple",        symbol: "XRP",  name: "XRP",       color: "#00aae4" },
  { id: "usd-coin",      symbol: "USDC", name: "USD Coin",  color: "#2775ca" },
  { id: "chainlink",     symbol: "LINK", name: "Chainlink", color: "#2a5ada" },
  { id: "uniswap",       symbol: "UNI",  name: "Uniswap",   color: "#ff007a" },
  { id: "avalanche-2",   symbol: "AVAX", name: "Avalanche", color: "#e84142" },
  { id: "matic-network", symbol: "MATIC",name: "Polygon",   color: "#8247e5" },
];

const ALERT_TYPES = [
  { id: "price_above", label: "Price goes ABOVE" },
  { id: "price_below", label: "Price goes BELOW" },
  { id: "change_24h",  label: "24h change exceeds %" },
];

function fmt(price) {
  if (!price) return "—";
  if (price >= 1000) return "$" + price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (price >= 1)    return "$" + price.toFixed(2);
  return "$" + price.toFixed(4);
}

/* ── Sparkline micro-chart ──────────────────────────────────────── */
function Spark({ data = [], color = "#a8ff6c", w = 80, h = 30 }) {
  if (!data || data.length < 2) return <div style={{ width: w, height: h }} />;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`
  ).join(" ");
  const fill = data.map((v, i) =>
    `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`
  ).join(" ") + ` ${w},${h} 0,${h}`;
  const isUp = data[data.length - 1] >= data[0];
  const c = isUp ? "#00d4aa" : "#ff6b8a";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Live Ticker Strip ──────────────────────────────────────────── */
function TickerStrip({ prices }) {
  const items = [...prices, ...prices, ...prices]; // multiple duplicates for seamless loop on wide screens
  return (
    <div style={{
      background: "#060606", borderBottom: "1px solid #111",
      overflow: "hidden", position: "relative", height: 52,
    }}>
      {/* fade edges */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 80, background: "linear-gradient(90deg,#060606,transparent)", zIndex: 2, pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, background: "linear-gradient(-90deg,#060606,transparent)", zIndex: 2, pointerEvents: "none" }} />
      <div style={{ display: "flex", animation: "ticker 50s linear infinite", whiteSpace: "nowrap", height: "100%", alignItems: "center", gap: 14, paddingLeft: 14 }}>
        {items.map((p, i) => (
          <div key={i} style={{ 
            display: "inline-flex", alignItems: "center", gap: 10, 
            padding: "0.35rem 1rem", 
            background: "#0a0a0a", border: "1px solid #1a1a1a", 
            borderRadius: "50px", height: 34,
            boxShadow: "0 2px 8px rgba(0,0,0,0.5)"
          }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: p.color + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
              {p.image ? (
                <img src={p.image} alt={p.symbol} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: p.color, boxShadow: `0 0 5px ${p.color}` }} />
              )}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#e0e0e0", letterSpacing: 0.2 }}>{p.symbol}</span>
              <span style={{ fontSize: 13, fontFamily: "var(--mono)", fontWeight: 600, color: "#fff" }}>{fmt(p.price)}</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: p.change24h >= 0 ? "#00d4aa" : "#ff6b8a", display: "flex", alignItems: "center", gap: 2 }}>
              {p.change24h >= 0 ? "▲" : "▼"}
              {Math.abs(p.change24h ?? 0).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Price Grid Card ─────────────────────────────────────────────── */
function PriceCard({ p }) {
  const isUp = (p.change24h ?? 0) >= 0;
  const c = isUp ? "#00d4aa" : "#ff6b8a";
  return (
    <div style={{
      background: "#0a0a0a", border: "1px solid #141414",
      borderRadius: 16, padding: "1.1rem",
      transition: "all 0.22s", cursor: "default",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = p.color + "40"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 30px ${p.color}10`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#141414"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: p.color + "18", border: `1px solid ${p.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: p.color }}>
            {p.symbol.slice(0, 2)}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: "#e8e8e8" }}>{p.symbol}</div>
            <div style={{ fontSize: 10, color: "#333" }}>{p.name}</div>
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: `${c}12`, color: c }}>
          {isUp ? "+" : ""}{(p.change24h ?? 0).toFixed(2)}%
        </span>
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", fontFamily: "var(--mono)", marginBottom: 8 }}>{fmt(p.price)}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ fontSize: 10, color: "#333" }}>MCap: {p.mcap ? "$" + (p.mcap / 1e9).toFixed(1) + "B" : "—"}</div>
        <Spark data={p.sparkline} w={70} h={28} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
export default function AlertsPage({ user }) {
  const [prices,   setPrices]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [fearGreed,setFearGreed]= useState({ value: 50, label: "Neutral", color: "#facc15" });
  const [alerts,   setAlerts]   = useState([
    { id: 1, token: "ETH",  type: "price_above", value: "4000",  active: true,  triggered: false, color: "#627eea", lastTriggered: 0 },
    { id: 2, token: "BTC",  type: "price_below", value: "60000", active: true,  triggered: false, color: "#f7931a", lastTriggered: 0 },
    { id: 3, token: "SOL",  type: "change_24h",  value: "10",    active: false, triggered: false, color: "#9945ff", lastTriggered: 0 },
  ]);
  const alertCooldown = useRef({}); // token-type -> lastSentTimestamp
  const [newToken,   setNewToken]   = useState("BTC");
  const [newType,    setNewType]    = useState("price_above");
  const [newValue,   setNewValue]   = useState("");
  const [aiSummary,  setAiSummary]  = useState("");
  const [aiLoading,  setAiLoading]  = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  /* ── Send email alert via backend ── */
  const triggerEmailAlert = async (a, currentPrice) => {
    const key = `${a.token}-${a.type}`;
    const now = Date.now();
    // 30 minute cooldown per distinct alert type
    if (alertCooldown.current[key] && now - alertCooldown.current[key] < 1800000) return;

    alertCooldown.current[key] = now;
    try {
      await fetch(`${BACKEND_URL}/api/alert/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email || "smartguard@example.com",
          token: a.token,
          price: fmt(currentPrice),
          condition: ALERT_TYPES.find(t => t.id === a.type)?.label || a.type
        })
      });
      console.log(`[Alert] Email sent for ${a.token}`);
    } catch (err) {
      console.error("[Alert] Failed to send email:", err);
    }
  };

  /* ── Fetch live prices from CoinGecko (free API) ── */
  const fetchPrices = useCallback(async () => {
    const ids = COINS.map(c => c.id).join(",");
    try {
      const res  = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h`,
        { headers: { "Accept": "application/json" } }
      );
      if (!res.ok) throw new Error("CoinGecko API error");
      const data = await res.json();
      const merged = COINS.map(coin => {
        const d = data.find(x => x.id === coin.id);
        return {
          ...coin,
          price:     d?.current_price ?? 0,
          change24h: d?.price_change_percentage_24h ?? 0,
          mcap:      d?.market_cap ?? 0,
          vol:       d?.total_volume ?? 0,
          image:     d?.image || "",
          sparkline: d?.sparkline_in_7d?.price ?? [],
        };
      });
      setPrices(merged);
      setLastUpdate(new Date());
      setLoading(false);

      // Alert trigger check
      setAlerts(prev => prev.map(a => {
        const p = merged.find(x => x.symbol === a.token);
        if (!p || !a.active) return a;
        
        let triggered = false;
        if (a.type === "price_above" && p.price > parseFloat(a.value)) triggered = true;
        if (a.type === "price_below" && p.price < parseFloat(a.value)) triggered = true;
        if (a.type === "change_24h"  && Math.abs(p.change24h) > parseFloat(a.value)) triggered = true;

        if (triggered && !a.triggered) {
          triggerEmailAlert(a, p.price);
        }

        return { ...a, triggered };
      }));

    } catch {
      setLoading(false);
    }
  }, [user]);

  /* ── Fetch Fear & Greed from alternative.me ── */
  const fetchFearGreed = useCallback(async () => {
    try {
      const r = await fetch("https://api.alternative.me/fng/?limit=1");
      const d = await r.json();
      const v = parseInt(d.data[0].value);
      const label = d.data[0].value_classification;
      const color = v >= 75 ? "#ff6b8a" : v >= 55 ? "#ffab40" : v >= 40 ? "#facc15" : v >= 25 ? "#4f8ef7" : "#7c5cfc";
      setFearGreed({ value: v, label, color });
    } catch {}
  }, []);

  /* ── AI Market Summary ── */
  const fetchAISummary = useCallback(async (p) => {
    if (!p || p.length === 0) return;
    setAiLoading(true);
    try {
      const top5 = p.slice(0, 5).map(x => `${x.symbol}: ${fmt(x.price)} (${x.change24h >= 0 ? "+" : ""}${(x.change24h ?? 0).toFixed(2)}%)`).join(", ");
      const summary = await callGroq(
        `Live crypto prices: ${top5}. What are the key market trends right now? Give 2-3 sentences of insight.`,
        "You are a crypto market analyst. Be concise, data-driven, and highlight key opportunities or risks."
      );
      setAiSummary(summary);
    } catch { setAiSummary(""); }
    finally   { setAiLoading(false); }
  }, []);

  /* ── Mount: fetch everything ── */
  useEffect(() => {
    fetchPrices();
    fetchFearGreed();
  }, [fetchPrices, fetchFearGreed]);

  /* ── After prices load, get AI summary once ── */
  useEffect(() => {
    if (prices.length > 0 && !aiSummary && !aiLoading) fetchAISummary(prices);
  }, [prices]); // eslint-disable-line

  /* ── Auto-refresh prices every 30 seconds ── */
  useEffect(() => {
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const addAlert = () => {
    if (!newValue) return;
    const coin = COINS.find(c => c.symbol === newToken);
    setAlerts(prev => [...prev, {
      id: Date.now(), token: newToken, type: newType, value: newValue,
      active: true, triggered: false, color: coin?.color || "#4f8ef7"
    }]);
    setNewValue("");
  };

  const fearGradient = fearGreed.value >= 50
    ? `conic-gradient(${fearGreed.color} ${fearGreed.value * 3.6}deg, #111 0)`
    : `conic-gradient(${fearGreed.color} ${fearGreed.value * 3.6}deg, #111 0)`;

  return (
    <div style={{ background: "#030303", minHeight: "100%", animation: "fadeInUp 0.3s ease" }}>

      {/* Live Ticker */}
      {prices.length > 0 && <TickerStrip prices={prices} />}

      <div style={{ padding: "1.5rem", maxWidth: 1300, margin: "0 auto" }}>

        {/* Top stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
          {/* Total Market Cap */}
          <div style={{ background: "#0a0a0a", border: "1px solid #141414", borderRadius: 16, padding: "1.1rem" }}>
            <div style={{ fontSize: 10, color: "#333", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Market Cap</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", fontFamily: "var(--mono)" }}>
              {prices.length > 0 ? "$" + (prices.reduce((s, p) => s + (p.mcap || 0), 0) / 1e12).toFixed(2) + "T" : "—"}
            </div>
            <div style={{ fontSize: 11, color: "#00d4aa", marginTop: 4 }}>↑ Live update</div>
          </div>

          {/* Fear & Greed */}
          <div style={{ background: "#0a0a0a", border: "1px solid #141414", borderRadius: 16, padding: "1.1rem", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 54, height: 54, borderRadius: "50%", background: fearGradient, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: fearGreed.color }}>
                {fearGreed.value}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#333", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 3 }}>Fear & Greed</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: fearGreed.color }}>{fearGreed.label}</div>
              <div style={{ fontSize: 10, color: "#333", marginTop: 2 }}>Real-time index</div>
            </div>
          </div>

          {/* Top Gainer */}
          {prices.length > 0 && (() => {
            const top = [...prices].sort((a, b) => (b.change24h ?? 0) - (a.change24h ?? 0))[0];
            return (
              <div style={{ background: "#0a0a0a", border: "1px solid #141414", borderRadius: 16, padding: "1.1rem" }}>
                <div style={{ fontSize: 10, color: "#333", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Top Gainer 24h</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: top.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: top.color }}>{top.symbol.slice(0, 2)}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#e8e8e8" }}>{top.symbol}</div>
                    <div style={{ fontSize: 12, color: "#00d4aa", fontWeight: 700 }}>+{(top.change24h ?? 0).toFixed(2)}%</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Active Alerts */}
          <div style={{ background: "#0a0a0a", border: "1px solid #141414", borderRadius: 16, padding: "1.1rem" }}>
            <div style={{ fontSize: 10, color: "#333", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Active Alerts</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#fb923c", fontFamily: "var(--mono)" }}>{alerts.filter(a => a.active).length}</div>
            <div style={{ fontSize: 11, color: "#ff6b8a", marginTop: 4 }}>{alerts.filter(a => a.triggered).length} triggered</div>
          </div>
        </div>

        {/* AI Market Intelligence */}
        {(aiLoading || aiSummary) && (
          <div style={{
            background: "linear-gradient(135deg, rgba(255,171,64,0.06), rgba(168,255,108,0.04))",
            border: "1px solid rgba(255,171,64,0.15)",
            borderRadius: 18, padding: "1.3rem 1.5rem", marginBottom: "1.5rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ display: "inline-block", animation: aiLoading ? "spin 2s linear infinite" : "none", fontSize: 16 }}>⚡</span>
              <span style={{ fontWeight: 800, fontSize: 13, color: "#ffab40", letterSpacing: 1, textTransform: "uppercase" }}>AI Market Intelligence</span>
              {lastUpdate && !aiLoading && <span style={{ fontSize: 11, color: "#333", marginLeft: "auto" }}>Updated {lastUpdate.toLocaleTimeString()}</span>}
            </div>
            {aiLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[100, 85, 60].map((w, i) => (
                  <div key={i} style={{ height: 13, width: `${w}%`, background: "linear-gradient(90deg,#111,#181818,#111)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 4 }} />
                ))}
              </div>
            ) : (
              <p style={{ color: "#888", fontSize: 14, lineHeight: 1.8, margin: 0 }}>{aiSummary}</p>
            )}
          </div>
        )}

        {/* Body Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 650px), 1fr))", gap: "1.5rem" }}>

          {/* LEFT — Live Prices Grid */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#e0e0e0", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00d4aa", display: "inline-block", animation: "pulseDot 2s infinite", boxShadow: "0 0 8px #00d4aa" }} />
                Live Prices
              </h2>
              <button onClick={fetchPrices} style={{
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 11, color: "#333", padding: "4px 10px",
                background: "none", border: "1px solid #1a1a1a", borderRadius: 8,
                cursor: "pointer", fontFamily: "var(--font)",
              }}
                onMouseEnter={e => { e.currentTarget.style.color = "#aaa"; e.currentTarget.style.borderColor = "#333"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#333"; e.currentTarget.style.borderColor = "#1a1a1a"; }}
              >↻ Refresh</button>
            </div>

            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: "1rem" }}>
                {Array(10).fill(0).map((_, i) => (
                  <div key={i} style={{ height: 130, borderRadius: 16, background: "linear-gradient(90deg,#0a0a0a,#111,#0a0a0a)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
                ))}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: "1rem" }}>
                {prices.map(p => <PriceCard key={p.symbol} p={p} />)}
              </div>
            )}
          </div>

          {/* RIGHT — Alerts Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Create Alert */}
            <div style={{ background: "#0a0a0a", border: "1px solid #141414", borderRadius: 18, padding: "1.3rem" }}>
              <h3 style={{ fontWeight: 800, fontSize: 14, marginBottom: "1rem", color: "#ccc", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(79,142,247,0.12)", border: "1px solid rgba(79,142,247,0.2)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🔔</span>
                Create Alert
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                <div>
                  <label style={{ fontSize: 11, color: "#444", display: "block", marginBottom: 5, fontWeight: 600, letterSpacing: 0.5 }}>TOKEN</label>
                  <select value={newToken} onChange={e => setNewToken(e.target.value)} style={{
                    width: "100%", background: "#111", border: "1px solid #1e1e1e",
                    borderRadius: 10, padding: "0.65rem 0.85rem", color: "#ccc",
                    fontSize: 13, outline: "none", cursor: "pointer", fontFamily: "var(--font)",
                  }}>
                    {COINS.map(c => <option key={c.symbol} value={c.symbol}>{c.symbol} — {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#444", display: "block", marginBottom: 5, fontWeight: 600, letterSpacing: 0.5 }}>CONDITION</label>
                  <select value={newType} onChange={e => setNewType(e.target.value)} style={{
                    width: "100%", background: "#111", border: "1px solid #1e1e1e",
                    borderRadius: 10, padding: "0.65rem 0.85rem", color: "#ccc",
                    fontSize: 13, outline: "none", cursor: "pointer", fontFamily: "var(--font)",
                  }}>
                    {ALERT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#444", display: "block", marginBottom: 5, fontWeight: 600, letterSpacing: 0.5 }}>
                    {newType === "change_24h" ? "PERCENTAGE (%)" : "PRICE (USD)"}
                  </label>
                  <input
                    type="number" value={newValue} onChange={e => setNewValue(e.target.value)}
                    placeholder={newType === "change_24h" ? "e.g. 5" : "e.g. 70000"}
                    style={{
                      width: "100%", background: "#111", border: "1px solid #1e1e1e",
                      borderRadius: 10, padding: "0.65rem 0.85rem",
                      color: "#ccc", fontSize: 13, outline: "none", transition: "border-color 0.2s",
                      fontFamily: "var(--font)",
                    }}
                    onFocus={e => e.target.style.borderColor = "rgba(79,142,247,0.4)"}
                    onBlur={e => e.target.style.borderColor = "#1e1e1e"}
                  />
                </div>
                <button onClick={addAlert} disabled={!newValue} style={{
                  background: newValue ? "linear-gradient(135deg,#4f8ef7,#7c5cfc)" : "#111",
                  border: "none", color: newValue ? "#fff" : "#333",
                  padding: "0.75rem", borderRadius: 10,
                  fontWeight: 700, fontSize: 13, cursor: newValue ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  transition: "all 0.2s", fontFamily: "var(--font)",
                  boxShadow: newValue ? "0 4px 16px rgba(79,142,247,0.3)" : "none",
                }}>
                  🔔 Set Price Alert
                </button>
              </div>
            </div>

            {/* Alerts List */}
            <div style={{ background: "#0a0a0a", border: "1px solid #141414", borderRadius: 18, padding: "1.3rem" }}>
              <h3 style={{ fontWeight: 800, fontSize: 14, marginBottom: "0.9rem", color: "#ccc", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14 }}>📋</span>
                My Alerts
                <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "rgba(251,146,60,0.1)", color: "#fb923c" }}>
                  {alerts.filter(a => a.active).length} active
                </span>
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {alerts.length === 0 && (
                  <div style={{ textAlign: "center", padding: "1.5rem", color: "#333", fontSize: 13 }}>No alerts yet</div>
                )}
                {alerts.map(a => {
                  const livePrice = prices.find(p => p.symbol === a.token)?.price;
                  return (
                    <div key={a.id} style={{
                      background: a.triggered ? "rgba(255,107,138,0.05)" : "#0d0d0d",
                      border: `1px solid ${a.triggered ? "rgba(255,107,138,0.3)" : a.active ? "#1e1e1e" : "#141414"}`,
                      borderRadius: 12, padding: "0.8rem 0.9rem",
                      display: "flex", alignItems: "center", gap: 10,
                      opacity: a.active ? 1 : 0.45, transition: "all 0.2s",
                      animation: a.triggered ? "glow 2s infinite" : "none",
                    }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.triggered ? "#ff6b8a" : a.color, flexShrink: 0, boxShadow: a.triggered ? "0 0 8px #ff6b8a" : "none" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: a.triggered ? "#ff6b8a" : "#ccc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {a.token} {ALERT_TYPES.find(t => t.id === a.type)?.label} {a.type !== "change_24h" ? "$" : ""}{parseFloat(a.value).toLocaleString()}{a.type === "change_24h" ? "%" : ""}
                        </div>
                        <div style={{ fontSize: 10, color: "#333", marginTop: 2 }}>
                          {livePrice ? `Current: ${fmt(livePrice)}` : "Loading..."}{a.triggered ? " · 🔔 Triggered!" : ""}
                        </div>
                      </div>
                      {/* Toggle */}
                      <button onClick={() => setAlerts(prev => prev.map(x => x.id === a.id ? { ...x, active: !x.active } : x))} style={{
                        width: 34, height: 18, borderRadius: 9, border: "none",
                        background: a.active ? "#4f8ef7" : "#1a1a1a",
                        cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0,
                      }}>
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: a.active ? 18 : 2, transition: "left 0.2s" }} />
                      </button>
                      {/* Delete */}
                      <button onClick={() => setAlerts(prev => prev.filter(x => x.id !== a.id))} style={{
                        width: 26, height: 26, borderRadius: 7, border: "none",
                        background: "none", color: "#333", cursor: "pointer", fontSize: 14,
                        transition: "all 0.15s", flexShrink: 0,
                      }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#ff6b8a"; e.currentTarget.style.background = "rgba(255,107,138,0.08)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "#333"; e.currentTarget.style.background = "none"; }}
                      >×</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticker keyframe */}
      <style>{`@keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} } @keyframes glow { 0%,100%{box-shadow:0 0 0 rgba(255,107,138,0)} 50%{box-shadow:0 0 12px rgba(255,107,138,0.25)} }`}</style>
    </div>
  );
}
