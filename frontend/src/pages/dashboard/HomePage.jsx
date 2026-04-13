import { useState } from "react";
import Icon from "../../components/Icon";
import { RevealDiv } from "../../components/ScrollReveal";

const FEATURES = [
  { id: "chat",      icon: "chat",    label: "Web3 AI Chat",           color: "#c084fc", desc: "Ask anything about Web3, DeFi, and blockchain." },
  { id: "generator", icon: "code",    label: "Contract Generator",     color: "#00e5ff", desc: "Generate secure Solidity contracts from text." },
  { id: "auditor",   icon: "shield",  label: "Contract Auditor",       color: "#a8ff6c", desc: "Scan for vulnerabilities with 88.4% accuracy." },
  { id: "alerts",    icon: "bell",    label: "Crypto Alerts",          color: "#fb923c", desc: "Set price & security alerts for any token." },
  { id: "news",      icon: "news",    label: "Web3 News",              color: "#f472b6", desc: "AI-curated blockchain news from 50+ sources." },
  { id: "trading",   icon: "trading", label: "AI Trading Assistant",   color: "#facc15", desc: "AI-powered signals & testnet trading on Base Sepolia." },
];

const RECENT_ACTIVITY = [
  { icon: "shield", color: "#a8ff6c", text: "Contract 'VaultV2.sol' audited",         time: "2 min ago",  badge: "VULNERABLE", badgeColor: "#ff4d6d" },
  { icon: "code",   color: "#00e5ff", text: "ERC-20 token contract generated",          time: "15 min ago", badge: "DONE",       badgeColor: "#a8ff6c" },
  { icon: "chat",   color: "#c084fc", text: "Asked about reentrancy attacks",           time: "1 hr ago",   badge: null },
  { icon: "bell",   color: "#fb923c", text: "ETH price alert triggered at $3,200",     time: "3 hr ago",   badge: "ALERT",      badgeColor: "#fb923c" },
  { icon: "news",   color: "#f472b6", text: "DeFi weekly digest read",                  time: "5 hr ago",   badge: null },
];

const QUICK_STATS = [
  { icon: "shield", label: "Contracts Audited",   value: "0", color: "#a8ff6c" },
  { icon: "code",   label: "Contracts Generated", value: "0", color: "#00e5ff" },
  { icon: "chat",   label: "AI Conversations",    value: "0", color: "#c084fc" },
  { icon: "bell",   label: "Active Alerts",        value: "0", color: "#fb923c" },
];

export default function HomePage({ user, onNavigate }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200, margin: "0 auto", animation: "fadeInUp 0.35s ease" }}>

      {/* Welcome Banner */}
      <RevealDiv>
        <div style={{
          background: "rgba(10,10,10,0.9)",
          border: "1px solid rgba(168,255,108,0.12)",
          borderRadius: "var(--r-xl)", padding: "2rem 2.5rem",
          marginBottom: "1.5rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "1rem", flexWrap: "wrap",
          position: "relative", overflow: "hidden"
        }}>
          {/* Top neon line */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(168,255,108,0.5), transparent)"
          }} />
          {/* Glow orb */}
          <div style={{
            position: "absolute", right: -50, top: -50, width: 200, height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,255,108,0.07) 0%, transparent 70%)",
            pointerEvents: "none"
          }} />

          <div>
            <div style={{ fontSize: 13, color: "#444", marginBottom: 4 }}>{greeting} 👋</div>
            <h2 style={{
              fontWeight: 900, fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
              letterSpacing: "-0.8px", marginBottom: 6, lineHeight: 1.1, color: "#fff"
            }}>
              Welcome back,{" "}
              <span style={{ color: "#a8ff6c", textShadow: "0 0 20px rgba(168,255,108,0.5)" }}>
                {user.name}
              </span>
            </h2>
            <p style={{ color: "#444", fontSize: 14 }}>
              Your Web3 AI security platform is ready. What are we building today?
            </p>
          </div>

          <button onClick={() => onNavigate("auditor")} style={{
            background: "#a8ff6c", color: "#000",
            border: "none", padding: "0.75rem 1.8rem", borderRadius: "var(--r-pill)",
            fontWeight: 800, fontSize: 14, cursor: "pointer", flexShrink: 0,
            boxShadow: "0 0 24px rgba(168,255,108,0.45), 0 6px 20px rgba(0,0,0,0.8)",
            display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 38px rgba(168,255,108,0.7), 0 10px 28px rgba(0,0,0,0.9)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(168,255,108,0.45), 0 6px 20px rgba(0,0,0,0.8)"; }}>
            <Icon name="shield" size={15} color="#000" />
            Audit a Contract
          </button>
        </div>
      </RevealDiv>

      {/* Quick Stats */}
      <RevealDiv delay={80}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
          gap: "1rem", marginBottom: "1.5rem"
        }}>
          {QUICK_STATS.map((s, i) => (
            <div key={s.label} style={{
              background: "#0a0a0a",
              border: "1px solid #141414",
              borderRadius: "var(--r-lg)", padding: "1.2rem 1.3rem",
              display: "flex", alignItems: "center", gap: 12,
              transition: "all 0.22s ease", cursor: "default"
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = s.color + "30"; e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.8), 0 0 20px ${s.color}08`; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#141414"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${s.color}0d`, border: `1px solid ${s.color}20`,
                flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Icon name={s.icon} size={18} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 900, color: s.color, letterSpacing: "-1px", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11.5, color: "#333", marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </RevealDiv>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 330px", gap: "1.5rem" }}>

        {/* Quick Actions */}
        <RevealDiv delay={120}>
          <h3 style={{
            fontWeight: 600, fontSize: 13, marginBottom: "1rem",
            display: "flex", alignItems: "center", gap: 8, color: "#333",
            letterSpacing: 0.3, textTransform: "uppercase"
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: 5,
              background: "rgba(168,255,108,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Icon name="zap" size={12} color="#a8ff6c" />
            </span>
            Quick Actions
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "1rem" }}>
            {FEATURES.map(f => (
              <button key={f.id} onClick={() => onNavigate(f.id)} style={{
                background: "#080808", border: "1px solid #111",
                borderRadius: "var(--r-lg)", padding: "1.4rem",
                cursor: "pointer", textAlign: "left",
                transition: "all 0.22s ease", display: "block", width: "100%",
                position: "relative", overflow: "hidden"
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.borderColor = f.color + "40";
                  e.currentTarget.style.boxShadow = `0 18px 50px rgba(0,0,0,0.9), 0 0 25px ${f.color}08`;
                  e.currentTarget.style.background = "#0d0d0d";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "#111";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#080808";
                }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 11,
                  background: `${f.color}0d`, border: `1px solid ${f.color}22`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "0.9rem"
                }}>
                  <Icon name={f.icon} size={19} color={f.color} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4, color: "#ccc" }}>{f.label}</div>
                <div style={{ fontSize: 12, color: "#333", lineHeight: 1.6 }}>{f.desc}</div>
                <div style={{ marginTop: "0.9rem", display: "flex", alignItems: "center", gap: 3, color: f.color, fontSize: 12, fontWeight: 600 }}>
                  Open <Icon name="chevronRight" size={12} color={f.color} />
                </div>
              </button>
            ))}
          </div>
        </RevealDiv>

        {/* Right column */}
        <RevealDiv delay={160} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          <h3 style={{
            fontWeight: 600, fontSize: 13, marginBottom: "0",
            display: "flex", alignItems: "center", gap: 8, color: "#333",
            letterSpacing: 0.3, textTransform: "uppercase"
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: 5,
              background: "rgba(255,255,255,0.04)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Icon name="eye" size={12} color="#333" />
            </span>
            Recent Activity
          </h3>

          <div style={{ background: "#080808", border: "1px solid #111", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 11,
                padding: "0.85rem 1.1rem",
                borderBottom: i < RECENT_ACTIVITY.length - 1 ? "1px solid #0e0e0e" : "none",
                transition: "background 0.15s"
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: `${a.color}0d`, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1
                }}>
                  <Icon name={a.icon} size={13} color={a.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 3, lineHeight: 1.45, color: "#888" }}>{a.text}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 11, color: "#333" }}>{a.time}</span>
                    {a.badge && (
                      <span style={{
                        fontSize: 9, fontWeight: 700,
                        padding: "1px 6px", borderRadius: 3,
                        background: `${a.badgeColor}10`, color: a.badgeColor,
                        letterSpacing: 0.5, border: `1px solid ${a.badgeColor}20`
                      }}>{a.badge}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </RevealDiv>
      </div>
    </div>
  );
}
