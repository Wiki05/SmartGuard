import { useState, useEffect, useCallback } from "react";
import Icon from "../../components/Icon";
import { callGroq } from "../../api/groq";

const CATEGORIES = ["all", "defi", "nft", "security", "regulation", "ethereum", "bitcoin"];

/* ── Fallback articles shown when API is unavailable ── */
const FALLBACK_NEWS = [
  { id: 1, title: "Ethereum Layer 2 Solutions See Record TVL in 2024", body: "Layer 2 networks like Arbitrum, Optimism, and Base have collectively surpassed $40B in total value locked, representing a major milestone for Ethereum scaling...", source: "CoinDesk", url: "#", imageurl: "", time: "Apr 13", tags: ["ETHEREUM", "L2"] },
  { id: 2, title: "DeFi Protocol Exploited for $15M via Reentrancy Attack", body: "A major DeFi lending protocol suffered a reentrancy vulnerability exploit, highlighting ongoing security challenges in smart contract development...", source: "The Block", url: "#", imageurl: "", time: "Apr 12", tags: ["SECURITY", "DEFI"] },
  { id: 3, title: "SEC Approves Spot Bitcoin ETF Options Trading", body: "The SEC has given the green light for options trading on spot Bitcoin ETFs, a significant development that could bring more institutional investors into the crypto market...", source: "Bloomberg", url: "#", imageurl: "", time: "Apr 11", tags: ["BITCOIN", "REGULATION"] },
  { id: 4, title: "OpenSea 2.0 Launches with New NFT Royalty Standards", body: "The dominant NFT marketplace has unveiled a major platform overhaul with improved royalty enforcement mechanisms and creator monetization tools...", source: "NFT News", url: "#", imageurl: "", time: "Apr 10", tags: ["NFT"] },
  { id: 5, title: "Solidity 0.9 Release Introduces Breaking Security Changes", body: "The Solidity team has released a new version with major security improvements including native reentrancy guards and enhanced overflow protection by default...", source: "Ethereum Blog", url: "#", imageurl: "", time: "Apr 9", tags: ["SECURITY", "ETHEREUM"] },
  { id: 6, title: "Uniswap v4 Hooks Drive DeFi Innovation Wave", body: "Uniswap's latest major upgrade with customizable hooks has sparked a new wave of DeFi protocol innovation, enabling new financial primitives previously impossible on-chain...", source: "DeFi Pulse", url: "#", imageurl: "", time: "Apr 8", tags: ["DEFI"] },
  { id: 7, title: "MiCA Regulation Takes Full Effect Across EU", body: "The European Union's Markets in Crypto-Assets regulation is now fully in force, requiring crypto businesses to comply with new licensing and reporting requirements...", source: "Reuters", url: "#", imageurl: "", time: "Apr 7", tags: ["REGULATION"] },
  { id: 8, title: "Bitcoin Halving Impact: Miners Adapt as Rewards Drop", body: "Following the most recent Bitcoin halving event, mining operations have been forced to optimize efficiency, upgrade hardware, or seek lower energy costs to remain profitable...", source: "CoinTelegraph", url: "#", imageurl: "", time: "Apr 6", tags: ["BITCOIN"] },
  { id: 9, title: "Cross-Chain Bridge Security: $2B Lost in 2024 Exploits", body: "A new report reveals that cross-chain bridge vulnerabilities continue to be the largest vector for crypto theft, with over $2B lost in the past year to bridge exploits...", source: "Chainalysis", url: "#", imageurl: "", time: "Apr 5", tags: ["SECURITY"] },
];

export default function NewsPage() {
  const [news,           setNews]           = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [category,       setCategory]       = useState("all");
  const [summary,        setSummary]        = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [isFallback,     setIsFallback]     = useState(false);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setSummary("");
    setIsFallback(false);

    try {
      const q = category === "all" ? "crypto+OR+web3+OR+bitcoin" : category;
      const rss = encodeURIComponent(`https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`);
      const url = `https://api.rss2json.com/v1/api.json?rss_url=${rss}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const res  = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      const data = await res.json();
      const raw  = data.items || [];

      if (raw.length === 0) throw new Error("No data");

      const items = raw.slice(0, 12).map(n => ({
        id:       n.guid || Math.random().toString(),
        title:    n.title,
        body:     n.description ? n.description.replace(/<[^>]+>/g, '').slice(0, 180) + "..." : "Read the full story on the original publication.",
        source:   n.source || "Google News",
        url:      n.link,
        imageurl: n.thumbnail || n.enclosure?.link,
        time:     new Date(n.pubDate).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        tags:     (n.categories || []).slice(0, 3).filter(Boolean),
      }));

      setNews(items);

      // AI summary via Groq
      if (items.length > 0) {
        setSummaryLoading(true);
        const headlines = items.slice(0, 5).map(n => n.title).join("\n");
        try {
          const sum = await callGroq(
            `Analyze these Web3 news headlines and summarize the key market trends in 2-3 sentences:\n${headlines}`,
            "You are a Web3 market analyst. Be concise and highlight key implications for crypto investors and developers."
          );
          setSummary(sum);
        } catch { setSummary(""); }
        finally { setSummaryLoading(false); }
      }

    } catch {
      // Fallback to static articles
      setIsFallback(true);
      const filtered = category === "all"
        ? FALLBACK_NEWS
        : FALLBACK_NEWS.filter(n => n.tags.some(t => t.toLowerCase().includes(category)));
      setNews(filtered.length > 0 ? filtered : FALLBACK_NEWS);

      // Still try AI summary on fallback
      setSummaryLoading(true);
      const headlines = FALLBACK_NEWS.slice(0, 5).map(n => n.title).join("\n");
      try {
        const sum = await callGroq(
          `Analyze these Web3 news topics and summarize key trends in 2-3 sentences:\n${headlines}`,
          "You are a Web3 market analyst. Be concise and insightful."
        );
        setSummary(sum);
      } catch { setSummary(""); }
      finally { setSummaryLoading(false); }
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const catColors = {
    all: "#4f8ef7", defi: "#00d4aa", nft: "#7c5cfc",
    security: "#ff6b8a", regulation: "#ffab40", ethereum: "#627eea", bitcoin: "#f7931a",
  };
  const activeColor = catColors[category] || "#4f8ef7";

  return (
    <div style={{ padding: "1.5rem", maxWidth: 1300, margin: "0 auto", animation: "fadeInUp 0.35s ease" }}>

      {/* Controls */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem",
      }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: "0.45rem 1rem", borderRadius: 20,
              border: `1px solid ${category === c ? catColors[c] : "var(--border)"}`,
              background: category === c ? `${catColors[c]}15` : "transparent",
              color: category === c ? catColors[c] : "var(--muted)",
              fontSize: 13, fontWeight: category === c ? 600 : 400,
              cursor: "pointer", textTransform: "capitalize", transition: "all 0.2s",
              fontFamily: "var(--font)",
            }}>
              {c}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isFallback && (
            <span style={{
              fontSize: 11, color: "#f7931a",
              background: "rgba(247,147,26,0.08)", border: "1px solid rgba(247,147,26,0.2)",
              padding: "4px 10px", borderRadius: 8, fontWeight: 500,
            }}>
              ⚠ Live feed unavailable — showing curated news
            </span>
          )}
          <button onClick={fetchNews} disabled={loading} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "0.5rem 1rem", background: "var(--card)",
            border: "1px solid var(--border)", borderRadius: "var(--r-md)",
            color: "var(--text2)", fontSize: 13, cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s", fontFamily: "var(--font)",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text2)"; }}
          >
            <span style={{ display: "inline-block", animation: loading ? "spin 1s linear infinite" : "none" }}>↻</span>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* AI Summary */}
      {(summaryLoading || summary) && (
        <div style={{
          background: `linear-gradient(135deg, ${activeColor}0d, transparent)`,
          border: `1px solid ${activeColor}25`,
          borderRadius: "var(--r-xl)", padding: "1.2rem 1.4rem",
          marginBottom: "1.5rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 16, display: summaryLoading ? "inline-block" : "inline", animation: summaryLoading ? "spin 2s linear infinite" : "none" }}>⚡</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: activeColor, letterSpacing: 1, textTransform: "uppercase" }}>
              AI Market Digest
            </span>
          </div>
          {summaryLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[100, 80, 60].map((w, i) => (
                <div key={i} style={{
                  height: 13, width: `${w}%`,
                  background: "linear-gradient(90deg, #1a1a1a, #222, #1a1a1a)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite", borderRadius: 4,
                }} />
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.75, margin: 0 }}>{summary}</p>
          )}
        </div>
      )}

      {/* News Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.2rem" }}>
          {Array(6).fill(0).map((_, i) => (
            <div key={i} style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: "var(--r-xl)", overflow: "hidden",
            }}>
              <div style={{
                height: 160,
                background: "linear-gradient(90deg, #1a1a1a, #222, #1a1a1a)",
                backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
              }} />
              <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: 8 }}>
                {[60, 100, 80, 40].map((w, j) => (
                  <div key={j} style={{
                    height: j === 0 ? 12 : j === 3 ? 12 : 16, width: `${w}%`,
                    background: "linear-gradient(90deg, #1a1a1a, #222, #1a1a1a)",
                    backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
                    borderRadius: 4,
                  }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📰</div>
          <p style={{ fontSize: 15 }}>No news found. Try refreshing or changing the category.</p>
          <button onClick={fetchNews} style={{
            marginTop: 16, padding: "0.6rem 1.5rem",
            background: activeColor, color: "#000",
            border: "none", borderRadius: "var(--r-pill)",
            fontWeight: 700, cursor: "pointer", fontFamily: "var(--font)",
          }}>
            Try Again
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.2rem" }}>
          {news.map(n => (
            <a key={n.id} href={n.url !== "#" ? n.url : undefined}
              target={n.url !== "#" ? "_blank" : undefined}
              rel="noopener noreferrer"
              style={{ display: "block", textDecoration: "none" }}
            >
              <div style={{
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: "var(--r-xl)", overflow: "hidden",
                height: "100%", transition: "all 0.25s", cursor: "pointer",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.borderColor = activeColor + "50";
                  e.currentTarget.style.boxShadow = `0 12px 30px ${activeColor}10`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Image or placeholder */}
                {n.imageurl ? (
                  <div style={{ height: 160, overflow: "hidden", background: "var(--bg3)" }}>
                    <img
                      src={n.imageurl} alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.3s" }}
                      onError={e => e.target.parentElement.style.display = "none"}
                      onMouseEnter={e => e.target.style.transform = "scale(1.04)"}
                      onMouseLeave={e => e.target.style.transform = "scale(1)"}
                    />
                  </div>
                ) : (
                  <div style={{
                    height: 100, display: "flex", alignItems: "center", justifyContent: "center",
                    background: `linear-gradient(135deg, ${activeColor}15, transparent)`,
                    fontSize: 40,
                  }}>
                    📰
                  </div>
                )}

                <div style={{ padding: "1rem" }}>
                  {/* Tags */}
                  {n.tags.length > 0 && (
                    <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                      {n.tags.map(t => (
                        <span key={t} style={{
                          fontSize: 10, padding: "2px 8px", borderRadius: 4,
                          background: `${activeColor}15`, color: activeColor,
                          fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5,
                        }}>{t}</span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h3 style={{
                    fontWeight: 700, fontSize: 14, lineHeight: 1.5,
                    marginBottom: 8, color: "var(--text)",
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>{n.title}</h3>

                  {/* Body */}
                  <p style={{
                    fontSize: 13, color: "var(--text2)", lineHeight: 1.6, marginBottom: 10,
                    display: "-webkit-box", WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>{n.body}</p>

                  {/* Footer */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "var(--muted)" }}>
                    <span style={{ fontWeight: 500 }}>{n.source}</span>
                    <span>{n.time}</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
