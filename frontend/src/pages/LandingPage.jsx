import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import AnimatedCanvas from "../components/AnimatedCanvas";
import { RevealDiv } from "../components/ScrollReveal";

/* ── Animated counter ── */
function useCounter(target, duration = 2000, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    const isFloat = String(target).includes(".");
    const end = parseFloat(target);
    const step = end / (duration / 16);
    let cur = 0;
    const t = setInterval(() => {
      cur += step;
      if (cur >= end) { setCount(end); clearInterval(t); }
      else setCount(isFloat ? parseFloat(cur.toFixed(1)) : Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [target, duration, active]);
  return count;
}

/* ── Typewriter effect ── */
function Typewriter({ words, speed = 80, pause = 1800 }) {
  const [text, setText] = useState("");
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const tick = () => {
      const word = words[wi];
      if (!deleting) {
        setText(word.slice(0, ci + 1));
        if (ci + 1 === word.length) {
          setTimeout(() => setDeleting(true), pause);
          return;
        }
        setCi(c => c + 1);
      } else {
        setText(word.slice(0, ci - 1));
        if (ci - 1 === 0) {
          setDeleting(false);
          setWi(w => (w + 1) % words.length);
          setCi(0);
          return;
        }
        setCi(c => c - 1);
      }
    };
    const id = setTimeout(tick, deleting ? 40 : speed);
    return () => clearTimeout(id);
  }, [text, deleting, wi, ci, words, speed, pause]);

  useEffect(() => {
    const id = setInterval(() => setShowCursor(s => !s), 530);
    return () => clearInterval(id);
  }, []);

  return (
    <span>
      {text}
      <span style={{ color: "var(--neon)", opacity: showCursor ? 1 : 0 }}>|</span>
    </span>
  );
}

/* ── Glowing pill badge ── */
function GlowBadge({ children, color = "var(--neon)" }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      background: "rgba(168,255,108,0.06)",
      border: "1px solid rgba(168,255,108,0.2)",
      borderRadius: "var(--r-pill)", padding: "0.4rem 1.2rem",
      fontSize: 12, color, fontWeight: 600, letterSpacing: 0.5,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%", background: color,
        display: "inline-block", animation: "pulseDot 2s infinite",
        boxShadow: `0 0 8px ${color}`
      }} />
      {children}
    </div>
  );
}

/* ── Feature card ── */
function FeatureCard({ f, delay = 0 }) {
  const [hov, setHov] = useState(false);
  return (
    <RevealDiv delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: hov ? "rgba(17,17,17,0.98)" : "rgba(11,11,11,0.8)",
          border: `1px solid ${hov ? f.color + "40" : "rgba(255,255,255,0.06)"}`,
          borderRadius: "var(--r-xl)",
          padding: "2rem",
          cursor: "default",
          transition: "all 0.3s ease",
          transform: hov ? "translateY(-8px) scale(1.01)" : "translateY(0) scale(1)",
          boxShadow: hov ? `0 28px 70px rgba(0,0,0,0.9), 0 0 40px ${f.color}12` : "none",
          backdropFilter: "blur(16px)",
          position: "relative", overflow: "hidden",
          height: "100%",
        }}>
        {/* Top shimmer line on hover */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg, transparent, ${f.color}80, transparent)`,
          opacity: hov ? 1 : 0, transition: "opacity 0.3s"
        }} />
        {/* Corner glow */}
        {hov && (
          <div style={{
            position: "absolute", top: -40, right: -40,
            width: 150, height: 150, borderRadius: "50%",
            background: `radial-gradient(circle, ${f.color}18 0%, transparent 70%)`,
            pointerEvents: "none"
          }} />
        )}
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: `${f.color}10`, border: `1px solid ${f.color}22`,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "1.3rem",
          boxShadow: hov ? `0 0 22px ${f.color}35` : "none",
          transition: "box-shadow 0.3s"
        }}>
          <Icon name={f.icon} size={24} color={f.color} />
        </div>
        <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 10, color: "#fff" }}>{f.title}</h3>
        <p style={{ color: "#666", fontSize: 14, lineHeight: 1.75 }}>{f.desc}</p>
        {/* Arrow on hover */}
        <div style={{
          marginTop: "1.2rem", display: "flex", alignItems: "center", gap: 4,
          color: f.color, fontSize: 13, fontWeight: 600,
          opacity: hov ? 1 : 0, transform: hov ? "translateX(0)" : "translateX(-8px)",
          transition: "all 0.25s"
        }}>
          Explore <Icon name="chevronRight" size={14} color={f.color} />
        </div>
      </div>
    </RevealDiv>
  );
}

/* ── Stat item ── */
function StatItem({ value, suffix = "", label, active, color }) {
  const n = parseFloat(value);
  const c = useCounter(n, 2000, active);
  return (
    <div style={{ textAlign: "center", padding: "0 2rem" }}>
      <div style={{
        fontSize: "clamp(2.2rem, 4vw, 3rem)", fontWeight: 900,
        color, letterSpacing: "-2px", lineHeight: 1,
        textShadow: `0 0 30px ${color}60`
      }}>
        {isNaN(n) ? value : `${c}${suffix}`}
      </div>
      <div style={{ color: "#555", fontSize: 13, marginTop: 6, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════ */
export default function LandingPage({ user }) {
  const navigate = useNavigate();
  const goAuth = () => navigate(user ? "/dashboard" : "/login");

  const [scrolled, setScrolled]       = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [modalType, setModalType]       = useState(null); // 'privacy' | 'terms' | null

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 40);
      if (window.scrollY > 300) setStatsVisible(true);
    };
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const features = [
    { icon: "chat",   title: "Web3 AI Chat",           color: "#c084fc",
      desc: "Your intelligent blockchain companion — DeFi strategies, Solidity concepts, and protocol deep-dives answered instantly." },
    { icon: "code",   title: "Contract Generator",     color: "#00e5ff",
      desc: "Describe in plain English, get production-ready Solidity code. NFTs, DAOs, DeFi vaults — generated in seconds." },
    { icon: "shield", title: "Smart Contract Auditor", color: "#a8ff6c",
      desc: "GraphCodeBERT-powered (88.4% accuracy). Detects reentrancy, overflows, and 7+ critical vulnerability types." },
    { icon: "bell",   title: "AI Crypto Alerts",       color: "#fb923c",
      desc: "Intelligent price alerts and security monitors. Get notified before market moves — not after they happen." },
    { icon: "news",   title: "Web3 News Feed",         color: "#f472b6",
      desc: "AI-curated blockchain news from 50+ sources. Stay ahead of DeFi trends, exploits, and regulatory updates." },
    { icon: "zap",    title: "Security Score",         color: "#facc15",
      desc: "Every audit gets a 0–100 security score with actionable fixes. Know exactly what to patch before deployment." },
  ];

  const stats = [
    { value: "88.4", suffix: "%", label: "Detection Accuracy",   color: "#a8ff6c" },
    { value: "943",  suffix: "+", label: "Contracts Trained On", color: "#00e5ff" },
    { value: "7",    suffix: "+", label: "Vulnerability Types",  color: "#c084fc" },
    { value: "100",  suffix: "%", label: "Free Forever",         color: "#fb923c" },
  ];

  const steps = [
    { num: "01", title: "Sign Up Free",       desc: "Create your account in seconds. No credit card required.", icon: "user",   color: "#a8ff6c" },
    { num: "02", title: "Upload Contract",    desc: "Paste Solidity code or upload a .sol file directly.",      icon: "upload", color: "#00e5ff" },
    { num: "03", title: "AI Analysis",        desc: "GraphCodeBERT scans for vulnerabilities in ~10 seconds.",  icon: "cpu",    color: "#c084fc" },
    { num: "04", title: "Get Report",         desc: "Receive security score, detailed fixes, and AI report.",   icon: "check",  color: "#fb923c" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000", overflowX: "hidden" }}>

      {/* ── Animated particle canvas ── */}
      <AnimatedCanvas />

      {/* ── NAVBAR ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        padding: "0 clamp(1.5rem, 5vw, 5rem)",
        height: 66,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(0,0,0,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent",
        transition: "all 0.35s ease"
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "linear-gradient(135deg, #a8ff6c, #00e5ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(168,255,108,0.5)"
          }}>
            <Icon name="shield" size={17} color="#000" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px", color: "#fff" }}>
            Smart<span style={{ color: "#a8ff6c" }}>Guard</span>
          </span>
        </div>

        {/* Nav links */}
        <nav className="hide-on-mobile" style={{ display: "flex", gap: "2.5rem", alignItems: "center" }}>
          {["Features", "How It Works", "About"].map(n => (
            <a key={n} href={"#" + n.toLowerCase().replaceAll(" ", "-")}
              style={{ color: "#555", fontSize: 14, fontWeight: 500, transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#fff"}
              onMouseLeave={e => e.target.style.color = "#555"}>{n}</a>
          ))}
        </nav>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={() => navigate(user ? "/dashboard" : "/login")} style={{
            background: "#a8ff6c", color: "#000",
            border: "none", padding: "0.48rem 1.3rem", borderRadius: "var(--r-pill)",
            fontWeight: 700, fontSize: 13,
            boxShadow: "0 0 16px rgba(168,255,108,0.45)",
            transition: "all 0.2s"
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 30px rgba(168,255,108,0.7)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 16px rgba(168,255,108,0.45)"; e.currentTarget.style.transform = "translateY(0)"; }}>
            Launch App →
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{
        padding: "clamp(5rem,12vw,10rem) clamp(1.5rem,5vw,5rem) 7rem",
        textAlign: "center", position: "relative", zIndex: 1,
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column"
      }}>

        {/* Badge */}
        <div style={{ animation: "fadeInDown 0.7s ease both", marginBottom: "2rem" }}>
          <GlowBadge>Powered by GraphCodeBERT + Gemini AI</GlowBadge>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(3.2rem, 9vw, 7rem)", fontWeight: 900,
          lineHeight: 1.0, letterSpacing: "-5px",
          marginBottom: "1.5rem", color: "#fff",
          animation: "fadeInUp 0.8s 0.1s ease both"
        }}>
          Secure Your<br />
          <span className="shimmer-text">Web3 Contracts</span>
          <br />with <span style={{
            color: "var(--neon)",
            textShadow: "0 0 40px rgba(168,255,108,0.6), 0 0 80px rgba(168,255,108,0.25)",
            animation: "glowPulse 3s ease infinite"
          }}>AI</span>
        </h1>

        {/* Typewriter subtitle */}
        <p style={{
          color: "#555", fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
          maxWidth: 560, margin: "0 auto 3.5rem", lineHeight: 1.7,
          animation: "fadeInUp 0.8s 0.2s ease both"
        }}>
          <Typewriter
            words={[
              "Detect reentrancy attacks before deployment.",
              "Generate secure Solidity in seconds.",
              "Audit smart contracts with 88.4% accuracy.",
              "Stay ahead of Web3 security exploits.",
            ]}
          />
        </p>

        {/* CTAs */}
        <div style={{
          display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap",
          animation: "fadeInUp 0.8s 0.3s ease both"
        }}>
          <button onClick={() => navigate(user ? "/dashboard" : "/login")} style={{
            background: "#a8ff6c", color: "#000",
            border: "none", padding: "1rem 2.8rem", borderRadius: "var(--r-pill)",
            fontWeight: 800, fontSize: 16, cursor: "pointer",
            boxShadow: "0 0 35px rgba(168,255,108,0.5), 0 8px 30px rgba(0,0,0,0.8)",
            transition: "all 0.22s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.02)"; e.currentTarget.style.boxShadow = "0 0 55px rgba(168,255,108,0.75), 0 12px 40px rgba(0,0,0,0.9)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = "0 0 35px rgba(168,255,108,0.5), 0 8px 30px rgba(0,0,0,0.8)"; }}>
            Start Auditing — Free →
          </button>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{
        borderTop: "1px solid rgba(255,255,255,0.04)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        background: "rgba(5,5,5,0.9)",
        padding: "4rem clamp(1.5rem,5vw,5rem)",
        position: "relative", zIndex: 1,
        backdropFilter: "blur(10px)"
      }}>
        <RevealDiv>
          <div style={{
            display: "flex", justifyContent: "center", flexWrap: "wrap",
            gap: 0, maxWidth: 960, margin: "0 auto"
          }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{
                flex: "1 1 180px",
                borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}>
                <StatItem {...s} active={statsVisible} />
              </div>
            ))}
          </div>
        </RevealDiv>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "8rem clamp(1.5rem,5vw,5rem)", position: "relative", zIndex: 1 }}>
        <RevealDiv style={{ textAlign: "center", marginBottom: "5rem" }}>
          <GlowBadge>Everything You Need</GlowBadge>
          <h2 style={{
            fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 900,
            letterSpacing: "-3px", marginTop: "1.2rem", marginBottom: "1rem", color: "#fff"
          }}>
            A Complete Web3<br />
            <span className="grad-text">Security Platform</span>
          </h2>
          <p style={{ color: "#555", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>
            Six powerful AI tools, one sleek unified dashboard.
          </p>
        </RevealDiv>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem", maxWidth: 1100, margin: "0 auto"
        }}>
          {features.map((f, i) => <FeatureCard key={f.title} f={f} delay={i * 80} />)}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{
        padding: "8rem clamp(1.5rem,5vw,5rem)",
        background: "rgba(5,5,5,0.95)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        position: "relative", zIndex: 1,
        backdropFilter: "blur(10px)"
      }}>
        <RevealDiv style={{ textAlign: "center", marginBottom: "5rem" }}>
          <GlowBadge color="#00e5ff">Simple Process</GlowBadge>
          <h2 style={{
            fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 900,
            letterSpacing: "-3px", marginTop: "1.2rem", color: "#fff"
          }}>
            How It <span style={{ color: "#a8ff6c", textShadow: "0 0 30px rgba(168,255,108,0.5)" }}>Works</span>
          </h2>
        </RevealDiv>

        <div style={{
          display: "flex", gap: "2rem", justifyContent: "center",
          flexWrap: "wrap", maxWidth: 1000, margin: "0 auto"
        }}>
          {steps.map((s, i) => (
            <RevealDiv key={s.num} delay={i * 120} style={{ flex: "1 1 200px", maxWidth: 240, textAlign: "center", position: "relative" }}>
              {i < steps.length - 1 && (
                <div className="hide-on-mobile" style={{
                  position: "absolute", top: 30, left: "62%", width: "75%", height: 1,
                  background: `linear-gradient(90deg, ${s.color}50, transparent)`,
                }} />
              )}
              <div style={{
                width: 62, height: 62, borderRadius: "50%",
                background: `${s.color}0d`,
                border: `1px solid ${s.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1.3rem", position: "relative",
                boxShadow: `0 0 24px ${s.color}18`
              }}>
                <Icon name={s.icon} size={24} color={s.color} />

              </div>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: "#fff" }}>{s.title}</h3>
              <p style={{ color: "#555", fontSize: 13.5, lineHeight: 1.7 }}>{s.desc}</p>
            </RevealDiv>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{
        padding: "8rem clamp(1.5rem,5vw,5rem)",
        position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        <RevealDiv style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <GlowBadge color="#c084fc">About SmartGuard</GlowBadge>
          <h2 style={{
            fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 900,
            letterSpacing: "-2px", marginTop: "1.2rem", color: "#fff", marginBottom: "4rem"
          }}>
            Pioneering Safe <span style={{ color: "#c084fc", textShadow: "0 0 30px rgba(192,132,252,0.5)" }}>Web3</span>
          </h2>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
            gap: "2rem", textAlign: "left"
          }}>
            {/* Left Large Card */}
            <div style={{
              background: "rgba(10,10,10,0.85)", border: "1px solid rgba(192,132,252,0.15)",
              borderRadius: "var(--r-2xl)", padding: "clamp(1.5rem, 5vw, 3.5rem)",
              backdropFilter: "blur(20px)", transition: "all 0.3s ease",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: "2.5rem" }}>
                <div style={{
                  width: 54, height: 54, borderRadius: 14, background: "rgba(192,132,252,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 20px rgba(192,132,252,0.15)"
                }}>
                  <Icon name="shield" size={26} color="#c084fc" />
                </div>
                <h3 style={{ color: "#fff", fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>The Foundation</h3>
              </div>
              
              <div style={{ marginBottom: "2.5rem" }}>
                <h4 style={{ color: "#c084fc", fontSize: 13, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: "0.8rem" }}>What is SmartGuard</h4>
                <p style={{ color: "#aaa", fontSize: 16, lineHeight: 1.8 }}>
                  A next-generation Web3 security platform that empowers developers to build, analyze, and strengthen smart contracts with complete confidence.
                </p>
              </div>

              <div>
                <h4 style={{ color: "#c084fc", fontSize: 13, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: "0.8rem" }}>The Problem We Solve</h4>
                <p style={{ color: "#aaa", fontSize: 16, lineHeight: 1.8 }}>
                  Smart contract vulnerabilities lead to catastrophic exploits and broken trust. We eliminate these blind spots by providing deep visibility before deployment.
                </p>
              </div>
            </div>

            {/* Right Large Card */}
            <div style={{
              background: "rgba(10,10,10,0.85)", border: "1px solid rgba(192,132,252,0.15)",
              borderRadius: "var(--r-2xl)", padding: "clamp(1.5rem, 5vw, 3.5rem)",
              backdropFilter: "blur(20px)", transition: "all 0.3s ease",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: "2.5rem" }}>
                <div style={{
                  width: 54, height: 54, borderRadius: 14, background: "rgba(192,132,252,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 20px rgba(192,132,252,0.15)"
                }}>
                  <Icon name="audit" size={26} color="#c084fc" />
                </div>
                <h3 style={{ color: "#fff", fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>The Advantage</h3>
              </div>
              
              <div style={{ marginBottom: "2.5rem" }}>
                <h4 style={{ color: "#c084fc", fontSize: 13, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: "0.8rem" }}>What We Offer</h4>
                <p style={{ color: "#aaa", fontSize: 16, lineHeight: 1.8 }}>
                  Real-time intelligent auditing assistance, automated security insights, and a developer-first suite of tools designed to support secure decentralized applications.
                </p>
              </div>

              <div>
                <h4 style={{ color: "#c084fc", fontSize: 13, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: "0.8rem" }}>What You Gain</h4>
                <p style={{ color: "#aaa", fontSize: 16, lineHeight: 1.8 }}>
                  Ship faster and safer. Spot risky patterns instantly, accelerate your security reviews, and build unshakeable trust in your published smart contracts.
                </p>
              </div>
            </div>
            
          </div>
        </RevealDiv>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: "9rem clamp(1.5rem,5vw,5rem)", textAlign: "center", position: "relative", zIndex: 1 }}>
        <RevealDiv>
          <div style={{
            maxWidth: 700, margin: "0 auto", position: "relative"
          }}>
            {/* Glow behind */}
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              width: 500, height: 300, borderRadius: "50%",
              transform: "translate(-50%,-50%)",
              background: "radial-gradient(ellipse, rgba(168,255,108,0.08) 0%, transparent 70%)",
              pointerEvents: "none", filter: "blur(30px)"
            }} />
            <div style={{
              background: "rgba(10,10,10,0.85)",
              border: "1px solid rgba(168,255,108,0.15)",
              borderRadius: "var(--r-2xl)", padding: "5rem 3rem",
              backdropFilter: "blur(20px)", position: "relative"
            }}>
              {/* Top accent */}
              <div style={{
                position: "absolute", top: 0, left: "20%", right: "20%", height: 1,
                background: "linear-gradient(90deg, transparent, rgba(168,255,108,0.6), transparent)"
              }} />
              <GlowBadge>Free Forever</GlowBadge>
              <h2 style={{
                fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 900,
                letterSpacing: "-2.5px", margin: "1.2rem 0 1rem", color: "#fff", lineHeight: 1.1
              }}>
                Ready to secure<br />your contracts?
              </h2>
              <p style={{ color: "#555", fontSize: 16, marginBottom: "2.5rem", lineHeight: 1.7 }}>
                Join Web3 developers who audit with SmartGuard before every deployment.
              </p>
              <button onClick={() => navigate("/login")} style={{
                background: "#a8ff6c", color: "#000",
                border: "none", padding: "1.1rem 3.5rem", borderRadius: "var(--r-pill)",
                fontWeight: 800, fontSize: 17, cursor: "pointer",
                boxShadow: "0 0 40px rgba(168,255,108,0.55), 0 8px 32px rgba(0,0,0,0.9)",
                transition: "all 0.22s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.02)"; e.currentTarget.style.boxShadow = "0 0 65px rgba(168,255,108,0.8), 0 12px 40px rgba(0,0,0,1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(168,255,108,0.55), 0 8px 32px rgba(0,0,0,1)"; }}>
                Get Started — It's Free →
              </button>
            </div>
          </div>
        </RevealDiv>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.04)",
        padding: "2rem clamp(1.5rem,5vw,5rem)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: "1rem", position: "relative", zIndex: 1
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: "linear-gradient(135deg, #a8ff6c, #00e5ff)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Icon name="shield" size={13} color="#000" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>
            Smart<span style={{ color: "#a8ff6c" }}>Guard</span>
          </span>
        </div>
        
        <span style={{ color: "#666", fontSize: 13 }}>SmartGuard — Secure smarter. Build with confidence.</span>
        
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <button onClick={() => setModalType("privacy")} style={{ background: "none", border: "none", cursor: "pointer", color: "#666", fontSize: 13, transition: "color 0.2s", padding: 0 }}
            onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "#666"}>Privacy</button>
          
          <button onClick={() => setModalType("terms")} style={{ background: "none", border: "none", cursor: "pointer", color: "#666", fontSize: 13, transition: "color 0.2s", padding: 0 }}
            onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "#666"}>Terms</button>
          
          <a href="mailto:smartguard26.web@gmail.com" style={{ color: "#666", fontSize: 13, transition: "color 0.2s" }}
            onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "#666"}>Contact</a>
        </div>
      </footer>

      {/* ── MODALS (Privacy / Terms) ── */}
      {modalType && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)",
          zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem"
        }} onClick={() => setModalType(null)}>
          <div style={{
            background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "var(--r-2xl)", maxWidth: 650, width: "100%", maxHeight: "85vh",
            overflowY: "auto", padding: "clamp(2rem, 5vw, 3.5rem)", position: "relative",
            boxShadow: "0 25px 70px rgba(0,0,0,0.8)"
          }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setModalType(null)}
              style={{ position: "absolute", top: 20, right: 25, background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 26, padding: 0 }}
            >
              &times;
            </button>
            <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 800, marginBottom: "2rem", letterSpacing: "-1px" }}>
              {modalType === "privacy" ? "Privacy Policy" : "Terms of Service"}
            </h2>
            <div style={{ color: "#aaa", fontSize: 15.5, lineHeight: 1.8 }}>
              {modalType === "privacy" ? (
                <>
                  <p style={{ marginBottom: "1.5rem" }}><strong>1. Data Collection:</strong> SmartGuard respects your privacy. We collect minimal operational analytics strictly to improve the platform experience. We do not sell your data.</p>
                  <p style={{ marginBottom: "1.5rem" }}><strong>2. Smart Contract Analysis:</strong> Code submitted through our platform is processed securely to identify vulnerabilities. We do not retain, share, or claim ownership over your proprietary code or logic.</p>
                  <p style={{ marginBottom: "1.5rem" }}><strong>3. Wallet Connections:</strong> When integrating Web3 wallets for dashboard access, we only read publicly available on-chain data. We never have access to your private keys, seed phrases, or sensitive wallet signing permissions.</p>
                  <p><strong>4. Security:</strong> We employ industry-standard security measures to protect your session data. If you have questions regarding data handling, please reach out via our contact email.</p>
                </>
              ) : (
                <>
                  <p style={{ marginBottom: "1.5rem" }}><strong>1. Informational Use:</strong> SmartGuard is an AI-enhanced analysis platform. The vulnerability reports, scores, and exact fixes provided are designed to powerfully assist developers but are not a complete substitute for professional, manual security audits.</p>
                  <p style={{ marginBottom: "1.5rem" }}><strong>2. User Responsibility:</strong> You are solely responsible for the smart contracts you deploy to the blockchain. SmartGuard assumes no liability for financial losses, exploits, or damages that occur in live production environments.</p>
                  <p style={{ marginBottom: "1.5rem" }}><strong>3. Acceptable Use:</strong> Users must use the platform respectfully. Attempting to reverse-engineer our infrastructure, maliciously spamming the analysis endpoints, or bypassing auth constraints will result in a ban.</p>
                  <p><strong>4. Platform Limitations:</strong> As Web3 security rapidly evolves, our platform evolves with it. We reserve the right to modify these terms or adjust platform limits at any time. Continued use constitutes acceptance.</p>
                </>
              )}
            </div>
            
            <button onClick={() => setModalType(null)} style={{
              marginTop: "2.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff", padding: "0.8rem 2rem", borderRadius: "100px", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
            }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
