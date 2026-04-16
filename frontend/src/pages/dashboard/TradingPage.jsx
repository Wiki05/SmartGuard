import { useState, useEffect } from "react";
import Icon from "../../components/Icon";
import SmartWalletButton from "../../components/SmartWalletButton";
import { useWallet } from "../../hooks/useWallet";
import { RevealDiv } from "../../components/ScrollReveal";
import { createPortal } from "react-dom";

/* ─── Inline Wallet Modal (same design as DashboardLayout) ──────── */
const WALLETS_T = [
  { id: "metamask",      name: "MetaMask",       color: "#E87910", desc: "Most popular Web3 wallet"  },
  { id: "coinbase",      name: "Coinbase Wallet", color: "#0052FF", desc: "Easy-to-use crypto wallet" },
  { id: "walletconnect", name: "WalletConnect",   color: "#3B99FC", desc: "Connect any mobile wallet" },
  { id: "phantom",       name: "Phantom",         color: "#9945FF", desc: "Solana & multi-chain"      },
];

function TradingWalletModal({ onClose }) {
  const [connecting, setConnecting] = useState(null);
  const [connected,  setConnected]  = useState(null);

  const connect = async (w) => {
    setConnecting(w.id);
    if (w.id === "metamask" && window.ethereum) {
      try {
        const [addr] = await window.ethereum.request({ method: "eth_requestAccounts" });
        setConnected({ ...w, address: addr.slice(0, 6) + "…" + addr.slice(-4) });
        setConnecting(null); return;
      } catch { setConnecting(null); return; }
    }
    await new Promise(r => setTimeout(r, 1400));
    const fake = "0x" + Math.random().toString(16).slice(2, 8).toUpperCase() + "…" + Math.random().toString(16).slice(2, 6).toUpperCase();
    setConnected({ ...w, address: fake });
    setConnecting(null);
  };

  return createPortal(
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(14px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.18s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#0d0d0d", border: "1px solid #222", borderRadius: 24,
        width: "100%", maxWidth: 420, padding: "2rem",
        boxShadow: "0 40px 100px rgba(0,0,0,0.98)", animation: "fadeInUp 0.22s ease", position: "relative",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 14, width: 28, height: 28, borderRadius: "50%",
          background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#666", fontSize: 18,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}>×</button>
        {!connected ? (
          <>
            <h2 style={{ fontWeight: 800, fontSize: 18, color: "#fff", marginBottom: 4 }}>Connect Wallet</h2>
            <p style={{ fontSize: 12, color: "#444", marginBottom: "1.3rem" }}>Choose a wallet to trade on SmartGuard testnet</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {WALLETS_T.map(w => (
                <button key={w.id} onClick={() => connect(w)} disabled={!!connecting} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "0.85rem 1rem",
                  background: connecting === w.id ? `${w.color}15` : "#111",
                  border: `1px solid ${connecting === w.id ? w.color + "50" : "#1e1e1e"}`,
                  borderRadius: 12, cursor: connecting ? "wait" : "pointer",
                  transition: "all 0.18s", fontFamily: "var(--font)",
                }}
                  onMouseEnter={e => { if (!connecting) { e.currentTarget.style.background = `${w.color}10`; e.currentTarget.style.borderColor = w.color + "40"; }}}
                  onMouseLeave={e => { e.currentTarget.style.background = "#111"; e.currentTarget.style.borderColor = "#1e1e1e"; }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: w.color + "20", border: `1px solid ${w.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontWeight: 900, fontSize: 11, color: w.color }}>{w.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#e8e8e8", marginBottom: 1 }}>{w.name}</div>
                    <div style={{ fontSize: 11, color: "#444" }}>{w.desc}</div>
                  </div>
                  {connecting === w.id
                    ? <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${w.color}40`, borderTopColor: w.color, animation: "spin 0.8s linear infinite" }} />
                    : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#333" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  }
                </button>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
            <div style={{ fontSize: 46, marginBottom: 12 }}>🎉</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#a8ff6c", marginBottom: 8 }}>Connected!</h3>
            <div style={{ fontSize: 12, color: "#555", fontFamily: "monospace", background: "#111", padding: "7px 14px", borderRadius: 9, display: "inline-block", marginBottom: 18, border: "1px solid #1e1e1e" }}>{connected.address}</div>
            <br/>
            <button onClick={onClose} style={{ background: "linear-gradient(135deg,#a8ff6c,#00e5ff)", color: "#000", border: "none", padding: "0.75rem 2rem", borderRadius: 50, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "var(--font)" }}>
              Start Trading →
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}


/* ─── Data ──────────────────────────────────────────────────────── */
const FALLBACK_MARKET = [
  { symbol: "BTC/USDT",  price: "...", change: "...",  vol: "...", pos: true  },
  { symbol: "ETH/USDT",  price: "...", change: "...",  vol: "...", pos: true  },
  { symbol: "SOL/USDT",  price: "...", change: "...",  vol: "...", pos: true  },
  { symbol: "LINK/USDT", price: "...", change: "...",  vol: "...", pos: true  },
  { symbol: "AVAX/USDT", price: "...", change: "...",  vol: "...", pos: true  },
];

const AI_SIGNALS = [
  { name: "ETH Sniper",      roi: "+12.4%",     risk: "Medium", active: true,  color: "#a8ff6c", token: "ETH/USDT", signal: "LONG", confidence: 85, reason: "Moving average crossover detected." },
  { name: "SOL Breakout",    roi: "+28.1%",     risk: "High",   active: false, color: "#00e5ff", token: "SOL/USDT", signal: "LONG", confidence: 72, reason: "High volume breakout on 4h timeframe." },
  { name: "LINK Swing trade",roi: "+5.2%",      risk: "Low",    active: true,  color: "#c084fc", token: "LINK/USDT", signal: "SHORT", confidence: 60, reason: "Approaching heavy resistance." },
  { name: "BTC Momentum",    roi: "+8.9%",      risk: "Medium", active: false, color: "#fb923c", token: "BTC/USDT", signal: "LONG", confidence: 68, reason: "Golden cross forming." },
];

const STRATEGIES = [
  { name: "Grid Bot",      roi: "1.2% / day", risk: "Low",    active: true,  color: "#a8ff6c" },
  { name: "Trend Follower",roi: "15% / mo",   risk: "Medium", active: false, color: "#00e5ff" },
  { name: "Arbitrage",     roi: "0.5% / day", risk: "Low",    active: false, color: "#c084fc" },
];

export default function TradingPage() {
  const [activeTab, setActiveTab] = useState("chart"); // chart|strategy
  const [marketData, setMarketData] = useState(FALLBACK_MARKET);
  const [selectedPair, setSelectedPair] = useState(FALLBACK_MARKET[0]);
  const [loading, setLoading] = useState(false);
  const [activeToken, setActiveToken] = useState("ETH");
  const [showWallet, setShowWallet] = useState(false);
  const [walletBalance, setWalletBalance] = useState("0.0000 ETH");
  const { connected, formattedAddress, connectMetaMask, disconnect, address } = useWallet();

  // Fetch Live Prices
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,chainlink,avalanche-2&order=market_cap_desc");
        const data = await res.json();
        const mapped = data.map(coin => ({
          symbol: `${coin.symbol.toUpperCase()}/USDT`,
          price: coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 }),
          change: `${coin.price_change_percentage_24h >= 0 ? '+' : ''}${coin.price_change_percentage_24h.toFixed(2)}%`,
          vol: `${(coin.total_volume / 1e6).toFixed(1)}M`,
          pos: coin.price_change_percentage_24h >= 0
        }));
        if (mapped.length) setMarketData(mapped);
      } catch (err) {}
    };
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 20000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Actual Wallet Balance
  useEffect(() => {
    if (connected && address && window.ethereum) {
      window.ethereum.request({ method: 'eth_getBalance', params: [address, 'latest'] })
        .then(hexString => {
          const bal = (parseInt(hexString, 16) / 1e18).toFixed(4);
          setWalletBalance(`${bal} ETH`);
        }).catch(console.error);
    }
  }, [connected, address]);

  return (
    <>
    {showWallet && <TradingWalletModal onClose={() => setShowWallet(false)} />}
    <div style={{ padding: "1.5rem", maxWidth: 1200, margin: "0 auto", animation: "fadeInUp 0.35s ease" }}>

      {/* Header */}
      <RevealDiv>
        <div style={{
          background: "rgba(10,10,10,0.9)",
          border: "1px solid rgba(168,255,108,0.12)",
          borderRadius: "var(--r-xl)", padding: "1.8rem 2.5rem",
          marginBottom: "1.5rem", position: "relative", overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(168,255,108,0.5), transparent)"
          }} />
          <div style={{
            position: "absolute", right: -40, top: -40, width: 180, height: 180, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,255,108,0.07) 0%, transparent 70%)",
            pointerEvents: "none"
          }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: "rgba(168,255,108,0.1)", border: "1px solid rgba(168,255,108,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Icon name="trading" size={18} color="#a8ff6c" />
                </div>
                <h2 style={{ fontWeight: 900, fontSize: "1.6rem", letterSpacing: "-0.8px", color: "#fff" }}>
                  AI Trading Assistant
                </h2>
              </div>
              <p style={{ color: "#444", fontSize: 14 }}>
                AI-powered signals, strategy automation & testnet trading on Base Sepolia.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{
                padding: "0.45rem 1rem",
                background: "rgba(168,255,108,0.06)", border: "1px solid rgba(168,255,108,0.15)",
                borderRadius: "var(--r-pill)", fontSize: 12, color: "#a8ff6c", fontWeight: 600,
                display: "flex", alignItems: "center", gap: 6
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a8ff6c", animation: "pulseDot 2s infinite", boxShadow: "0 0 6px #a8ff6c" }} />
                Testnet Mode
              </div>
              <SmartWalletButton />
            </div>
          </div>
        </div>
      </RevealDiv>

      {/* Main Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 650px), 1fr))", gap: "1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Market overview */}
          <RevealDiv delay={60}>
            <div style={{ background: "#080808", border: "1px solid #111", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
              <div style={{
                padding: "1rem 1.3rem", borderBottom: "1px solid #111",
                display: "flex", alignItems: "center", gap: 8
              }}>
                <Icon name="trending" size={15} color="#a8ff6c" />
                <span style={{ fontWeight: 700, fontSize: 13, color: "#ccc", letterSpacing: 0.3 }}>Live Market</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "#333" }}>Testnet prices</span>
              </div>
              <div>
                {marketData.map((m, i) => (
                  <div key={m.symbol}
                    onClick={() => setActiveToken(m.symbol.split("/")[0])}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "0.85rem 1.3rem",
                      borderBottom: i < marketData.length - 1 ? "1px solid #0e0e0e" : "none",
                      cursor: "pointer", transition: "background 0.15s",
                      background: activeToken === m.symbol.split("/")[0] ? "rgba(168,255,108,0.04)" : "transparent"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                    onMouseLeave={e => e.currentTarget.style.background = activeToken === m.symbol.split("/")[0] ? "rgba(168,255,108,0.04)" : "transparent"}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: m.pos ? "rgba(168,255,108,0.1)" : "rgba(255,77,109,0.1)",
                        border: `1px solid ${m.pos ? "rgba(168,255,108,0.2)" : "rgba(255,77,109,0.2)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 800, color: m.pos ? "#a8ff6c" : "#ff4d6d"
                      }}>
                        {m.symbol.split("/")[0].slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#ccc" }}>{m.symbol}</div>
                        <div style={{ fontSize: 11, color: "#444" }}>Vol: ${m.vol}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>${m.price}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: m.pos ? "#a8ff6c" : "#ff4d6d" }}>{m.change}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealDiv>

          {/* AI Signals */}
          <RevealDiv delay={120}>
            <div style={{ background: "#080808", border: "1px solid #111", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
              <div style={{ padding: "1rem 1.3rem", borderBottom: "1px solid #111", display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="zap" size={15} color="#facc15" />
                <span style={{ fontWeight: 700, fontSize: 13, color: "#ccc", letterSpacing: 0.3 }}>AI Trading Signals</span>
                <div style={{
                  marginLeft: "auto", fontSize: 10, fontWeight: 600, color: "#a8ff6c",
                  background: "rgba(168,255,108,0.08)", border: "1px solid rgba(168,255,108,0.15)",
                  padding: "2px 8px", borderRadius: "var(--r-pill)", letterSpacing: 1
                }}>LIVE</div>
              </div>
              <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {AI_SIGNALS.map(s => (
                  <div key={s.token} style={{
                    background: "#0a0a0a", border: "1px solid #141414",
                    borderRadius: "var(--r-md)", padding: "1rem 1.2rem",
                    display: "flex", alignItems: "flex-start", gap: 12, transition: "border-color 0.2s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = s.color + "30"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#141414"}>
                    <div style={{
                      padding: "0.3rem 0.7rem", borderRadius: "var(--r-pill)",
                      background: `${s.color}12`, border: `1px solid ${s.color}25`,
                      color: s.color, fontSize: 11, fontWeight: 800, letterSpacing: 1,
                      flexShrink: 0, marginTop: 2
                    }}>{s.signal}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, fontSize: 14, color: "#fff" }}>{s.token}</span>
                        <span style={{ fontSize: 11, color: "#444" }}>Confidence:</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.confidence}%</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#444", lineHeight: 1.6 }}>{s.reason}</div>
                      {/* Confidence bar */}
                      <div style={{ marginTop: 8, height: 3, background: "#111", borderRadius: 2 }}>
                        <div style={{
                          height: "100%", borderRadius: 2,
                          width: `${s.confidence}%`,
                          background: s.color,
                          boxShadow: `0 0 6px ${s.color}80`,
                          transition: "width 0.8s ease"
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealDiv>
        </div>

        {/* Right: Strategies */}
        <RevealDiv delay={80}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ background: "#080808", border: "1px solid #111", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
              <div style={{ padding: "1rem 1.3rem", borderBottom: "1px solid #111", display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="cpu" size={15} color="#c084fc" />
                <span style={{ fontWeight: 700, fontSize: 13, color: "#ccc", letterSpacing: 0.3 }}>AI Strategies</span>
              </div>
              <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {STRATEGIES.map((s, i) => (
                  <div key={s.name} style={{
                    background: s.active ? "rgba(168,255,108,0.04)" : "#0a0a0a",
                    border: `1px solid ${s.active ? "rgba(168,255,108,0.15)" : "#141414"}`,
                    borderRadius: "var(--r-md)", padding: "1rem",
                    cursor: "pointer", transition: "all 0.2s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = s.color + "30"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = s.active ? "rgba(168,255,108,0.15)" : "#141414"}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#ccc" }}>{s.name}</span>
                      <div style={{
                        width: 9, height: 9, borderRadius: "50%",
                        background: s.active ? "#a8ff6c" : "#222",
                        boxShadow: s.active ? "0 0 8px #a8ff6c" : "none"
                      }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px",
                        borderRadius: "var(--r-pill)", letterSpacing: 0.5,
                        background: s.risk === "High" ? "rgba(255,77,109,0.1)" : s.risk === "Low" ? "rgba(0,229,255,0.08)" : "rgba(251,146,60,0.1)",
                        color: s.risk === "High" ? "#ff4d6d" : s.risk === "Low" ? "#00e5ff" : "#fb923c",
                        border: `1px solid ${s.risk === "High" ? "rgba(255,77,109,0.2)" : s.risk === "Low" ? "rgba(0,229,255,0.2)" : "rgba(251,146,60,0.2)"}`
                      }}>{s.risk} Risk</span>
                      <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 800, color: "#a8ff6c" }}>{s.roi}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testnet info */}
            <div style={{
              background: "#080808", border: "1px solid rgba(0,229,255,0.12)",
              borderRadius: "var(--r-lg)", padding: "1.2rem",
              position: "relative", overflow: "hidden"
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 1,
                background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.4), transparent)"
              }} />
              <div style={{ fontSize: 10, fontWeight: 700, color: "#00e5ff", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00e5ff", display: "inline-block", animation: "pulseDot 2s infinite", boxShadow: "0 0 6px #00e5ff" }} />
                Testnet Info
              </div>
              {[
                { label: "Network",      value: connected ? "Ethereum Mainnet" : "Base Sepolia" },
                { label: "Your Wallet",  value: connected ? walletBalance : "10.00 ETH" },
                { label: "Portfolio",    value: connected ? "Syncing..." : "$48,230" },
                { label: "P&L Today",   value: connected ? "0.0%" : "+$1,204" },
              ].map((r, i, arr) => (
                <div key={r.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginBottom: i < arr.length - 1 ? 7 : 0,
                  paddingBottom: i < arr.length - 1 ? 7 : 0,
                  borderBottom: i < arr.length - 1 ? "1px solid #0e0e0e" : "none"
                }}>
                  <span style={{ fontSize: 12, color: "#333" }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#00e5ff" }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </RevealDiv>
      </div>
    </div>
    </>
  );
}
