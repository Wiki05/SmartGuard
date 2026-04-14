import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Icon from "../../components/Icon";
import SmartWalletButton from "../../components/SmartWalletButton";

const NAV_ITEMS = [
  { id: "home",      icon: "home",    label: "Dashboard",            color: "#a8ff6c" },
  { id: "chat",      icon: "chat",    label: "Web3 AI Chat",         color: "#c084fc" },
  { id: "generator", icon: "code",    label: "Contract Generator",   color: "#00e5ff" },
  { id: "auditor",   icon: "shield",  label: "Contract Auditor",     color: "#a8ff6c" },
  { id: "alerts",    icon: "bell",    label: "Crypto Alerts",        color: "#fb923c" },
  { id: "news",      icon: "news",    label: "Web3 News",            color: "#f472b6" },
  { id: "trading",   icon: "trading", label: "AI Trading Assistant", color: "#facc15" },
];

/* ─── Real wallet SVG icons ─────────────────────────────────────── */
const WalletIcons = {
  metamask: (
    <svg viewBox="0 0 318.6 318.6" width="32" height="32">
      <polygon fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" points="274.1,35.5 174.6,109.4 193,65.8"/>
      <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="44.4,35.5 143.1,110.1 125.6,65.8"/>
      <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="238.3,206.8 211.8,247.4 268.5,263 284.8,207.7"/>
      <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="33.9,207.7 50.1,263 106.8,247.4 80.3,206.8"/>
      <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="103.6,138.2 87.8,162.1 144.1,164.6 142.1,104.1"/>
      <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="214.9,138.2 175.9,103.4 174.6,164.6 230.8,162.1"/>
      <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="106.8,247.4 140.6,230.9 111.4,208.1"/>
      <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="177.9,230.9 211.8,247.4 207.1,208.1"/>
      <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="211.8,247.4 177.9,230.9 180.6,253 180.3,262.3"/>
      <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="106.8,247.4 138.3,262.3 138.1,253 140.6,230.9"/>
      <polygon fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" points="138.8,193.5 110.6,185.2 130.5,176.1"/>
      <polygon fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" points="179.7,193.5 188,176.1 207.9,185.2"/>
      <polygon fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" points="106.8,247.4 111.6,206.8 80.3,207.7"/>
      <polygon fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" points="207,206.8 211.8,247.4 238.3,207.7"/>
      <polygon fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" points="230.8,162.1 174.6,164.6 179.8,193.5 188.1,176.1 208,185.2"/>
      <polygon fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" points="110.6,185.2 130.5,176.1 138.8,193.5 144.1,164.6 87.8,162.1"/>
      <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="87.8,162.1 138.8,193.5 111.4,208.1"/>
      <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="207.9,185.2 180.6,208.1 230.8,162.1"/>
      <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="144.1,164.6 138.8,193.5 145.4,227.6 146.9,182.7"/>
      <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="174.6,164.6 171.9,182.6 172.9,227.6 179.8,193.5"/>
      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="179.8,193.5 172.9,227.6 177.9,230.9 207.9,208.1 208,185.2"/>
      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="110.6,185.2 111.4,208.1 140.6,230.9 145.4,227.6 138.8,193.5"/>
      <polygon fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round" points="180.3,262.3 180.6,253 178.1,250.8 140.4,250.8 138.1,253 138.3,262.3 106.8,247.4 117.8,256.4 140.1,271.9 178.4,271.9 200.8,256.4 211.8,247.4"/>
      <polygon fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round" points="177.9,230.9 172.9,227.6 145.4,227.6 140.6,230.9 138.1,253 140.4,250.8 178.1,250.8 180.6,253"/>
      <polygon fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round" points="278.3,114.2 286.8,73.4 274.1,35.5 177.9,106.9 214.9,138.2 267.2,153.5 278.8,140 273.9,136.4 281.8,129.1 275.7,124.4 283.6,118.3"/>
      <polygon fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round" points="31.8,73.4 40.3,114.2 34.9,118.3 42.8,124.4 36.8,129.1 44.7,136.4 39.8,140 51.3,153.5 103.6,138.2 140.6,106.9 44.4,35.5"/>
      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="267.2,153.5 214.9,138.2 230.8,162.1 207.9,185.2 208,208.1 238.3,207.7 284.8,207.7"/>
      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="103.6,138.2 51.3,153.5 33.9,207.7 80.3,207.7 111.4,208.1 110.6,185.2 87.8,162.1"/>
      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="214.9,138.2 174.6,164.6 172.9,182.6 179.8,193.5 207.9,185.2 230.8,162.1"/>
      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="138.8,193.5 110.6,185.2 87.8,162.1 144.1,164.6 145.4,182.7"/>
      <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="87.8,162.1 111.4,208.1 138.8,193.5"/>
      <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="207.9,185.2 207.9,208.1 230.8,162.1"/>
      <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="144.1,164.6 145.4,182.7 145.4,227.6 172.9,182.6 174.6,164.6"/>
    </svg>
  ),
  coinbase: (
    <svg viewBox="0 0 1024 1024" width="32" height="32">
      <rect width="1024" height="1024" rx="200" fill="#0052FF"/>
      <path d="M512 692c-99.4 0-180-80.6-180-180s80.6-180 180-180 180 80.6 180 180-80.6 180-180 180zm0-460C317.9 232 160 389.9 160 584s157.9 352 352 352 352-157.9 352-352S706.1 232 512 232z" fill="white"/>
    </svg>
  ),
  walletconnect: (
    <svg viewBox="0 0 300 185" width="36" height="22">
      <path d="M61.4 36.3c48.8-47.8 127.8-47.8 176.6 0l5.9 5.7c2.4 2.4 2.4 6.2 0 8.6l-20.1 19.7c-1.2 1.2-3.2 1.2-4.4 0l-8.1-7.9c-34-33.3-89.2-33.3-123.2 0l-8.7 8.5c-1.2 1.2-3.2 1.2-4.4 0L54.9 51.2c-2.4-2.4-2.4-6.2 0-8.6l6.5-6.3zm218 40.7l17.9 17.5c2.4 2.4 2.4 6.2 0 8.6L205 195.3c-2.4 2.4-6.4 2.4-8.8 0L134.4 134c-.6-.6-1.6-.6-2.2 0L70.4 195.3c-2.4 2.4-6.4 2.4-8.8 0L-31 102.1c-2.4-2.4-2.4-6.2 0-8.6l17.9-17.5c2.4-2.4 6.4-2.4 8.8 0L57.5 138c.6.6 1.6.6 2.2 0l61.8-61.3c2.4-2.4 6.4-2.4 8.8 0L192.1 138c.6.6 1.6.6 2.2 0l61.8-61.8c2.4-2.4 6.4-2.4 8.8-.2z" fill="#3B99FC" transform="translate(30, 10) scale(0.8)"/>
    </svg>
  ),
  phantom: (
    <svg viewBox="0 0 128 128" width="32" height="32">
      <rect width="128" height="128" rx="26" fill="url(#phantomGrad)"/>
      <path d="M110 64C110 89.4 89.4 110 64 110C38.6 110 18 89.4 18 64C18 38.6 38.6 18 64 18C89.4 18 110 38.6 110 64Z" fill="url(#phantomGrad2)"/>
      <path d="M88.9 63.2H83.1C83.1 52.3 74.2 43.4 63.3 43.4C52.7 43.4 44.0 51.8 43.5 62.3L37.8 62.3C38.3 48.6 49.5 37.6 63.3 37.6C77.4 37.6 88.9 49.1 88.9 63.2Z" fill="white" opacity="0.9"/>
      <path d="M77.3 66.1C77.3 66.1 74.8 72.0 68.5 72.0C62.2 72.0 59.7 66.1 59.7 66.1" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <circle cx="57" cy="61" r="3.5" fill="white"/>
      <circle cx="71" cy="61" r="3.5" fill="white"/>
      <defs>
        <linearGradient id="phantomGrad" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9945FF"/>
          <stop offset="1" stopColor="#6E52D4"/>
        </linearGradient>
        <linearGradient id="phantomGrad2" x1="18" y1="18" x2="110" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9945FF" stopOpacity="0.3"/>
          <stop offset="1" stopColor="#6E52D4" stopOpacity="0.1"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  brave: (
    <svg viewBox="0 0 128 128" width="32" height="32">
      <rect width="128" height="128" rx="26" fill="#FF5722"/>
      <path d="M64 16L94 28L104 58L95 78L80 90L64 96L48 90L33 78L24 58L34 28L64 16Z" fill="white" opacity="0.15"/>
      <path d="M64 20L91 31L100 58L92 75L78 87L64 92L50 87L36 75L28 58L37 31L64 20Z" fill="white" opacity="0.3"/>
      <path d="M 78 48 L 84 72 L 74 82 L 64 86 L 54 82 L 44 72 L 50 48 L 64 44 Z" fill="white"/>
      <path d="M 64 44 L 78 48 L 84 38 L 64 34 L 44 38 L 50 48 Z" fill="#FF9800"/>
    </svg>
  ),
  trust: (
    <svg viewBox="0 0 128 128" width="32" height="32">
      <rect width="128" height="128" rx="26" fill="#0500FF"/>
      <path d="M64 18L98 32V64C98 82.8 83.2 99.4 64 106C44.8 99.4 30 82.8 30 64V32L64 18Z" fill="white" opacity="0.15"/>
      <path d="M64 24L92 36V64C92 79.6 79.6 94 64 100C48.4 94 36 79.6 36 64V36L64 24Z" fill="white" opacity="0.25"/>
      <path d="M64 32L86 42V64C86 76.4 76.4 88 64 93C51.6 88 42 76.4 42 64V42L64 32Z" fill="white"/>
      <rect x="57" y="55" width="14" height="3" rx="1.5" fill="#0500FF"/>
      <rect x="57" y="62" width="14" height="3" rx="1.5" fill="#0500FF"/>
      <rect x="57" y="69" width="10" height="3" rx="1.5" fill="#0500FF"/>
    </svg>
  ),
};

const WALLETS = [
  { id: "metamask",      name: "MetaMask",        color: "#E87910", desc: "Most popular Web3 wallet",    icon: "metamask"      },
  { id: "coinbase",      name: "Coinbase Wallet",  color: "#0052FF", desc: "Easy-to-use crypto wallet",   icon: "coinbase"      },
  { id: "walletconnect", name: "WalletConnect",    color: "#3B99FC", desc: "Connect any mobile wallet",   icon: "walletconnect" },
  { id: "phantom",       name: "Phantom",          color: "#9945FF", desc: "Solana & multi-chain wallet", icon: "phantom"       },
  { id: "brave",         name: "Brave Wallet",     color: "#FF5722", desc: "Built-in browser wallet",     icon: "brave"         },
  { id: "trust",         name: "Trust Wallet",     color: "#0500FF", desc: "Binance's trusted wallet",    icon: "trust"         },
];

/* ─── SmartGuard Logo ───────────────────────────────────────────── */
function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M20 3L35 11.5V28.5L20 37L5 28.5V11.5L20 3Z" fill="url(#lg)" />
      <path d="M20 10L27 13.5V20C27 24 23.5 27 20 29C16.5 27 13 24 13 20V13.5L20 10Z" fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      <path d="M16 20l3 3 5-6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a8ff6c" />
          <stop offset="100%" stopColor="#00e5ff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Wallet Button via RainbowKit (Headless Custom) ─────────────── */
function WalletButton() {
  return <SmartWalletButton />;
}

/* ─── AI Status dot ──────────────────────────────────────────────── */
function AIStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6, padding: "0.32rem 0.85rem",
      background: online ? "rgba(168,255,108,0.05)" : "rgba(255,77,109,0.05)",
      border: `1px solid ${online ? "rgba(168,255,108,0.15)" : "rgba(255,77,109,0.25)"}`,
      borderRadius: 50, fontSize: 11.5, color: online ? "#a8ff6c" : "#ff4d6d", fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: online ? "#a8ff6c" : "#ff4d6d", display: "inline-block", animation: online ? "pulseDot 2s infinite" : "none", boxShadow: online ? "0 0 6px #a8ff6c" : "0 0 6px #ff4d6d" }} />
      {online ? "AI Online" : "AI Offline"}
    </div>
  );
}

/* ─── User Menu — top-right avatar ──────────────────────────────── */
function UserMenu({ user, onLogout, onPageChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const initial = (user?.name || "U")[0].toUpperCase();
  const avatarBg = "linear-gradient(135deg, #a8ff6c, #00e5ff)";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: 34, height: 34, borderRadius: "50%", background: avatarBg,
        border: `2px solid ${open ? "rgba(168,255,108,0.7)" : "#222"}`,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 900, color: "#000",
        boxShadow: open ? "0 0 24px rgba(168,255,108,0.8)" : "0 0 10px rgba(168,255,108,0.3)",
        transition: "all 0.2s", overflow: "hidden",
      }}>
        {user?.photoURL
          ? <img src={user.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : initial
        }
      </button>

      {open && createPortal(
        <div
          style={{ position: "fixed", inset: 0, zIndex: 88888 }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              position: "fixed",
              top: 62,
              right: 16,
              background: "#0d0d0d",
              border: "1px solid #222",
              borderRadius: 18,
              padding: "0.5rem",
              minWidth: 230,
              boxShadow: "0 24px 70px rgba(0,0,0,0.98), 0 0 50px rgba(168,255,108,0.05)",
              zIndex: 88889,
              animation: "fadeInDown 0.18s ease",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: "0.85rem 1rem 0.9rem", borderBottom: "1px solid #1a1a1a", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#000", flexShrink: 0, overflow: "hidden" }}>
                  {user?.photoURL ? <img src={user.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initial}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#e8e8e8" }}>{user?.name}</div>
                  <div style={{ fontSize: 11, color: "#444", marginTop: 1 }}>{user?.email}</div>
                </div>
              </div>
            </div>
            {/* Items — real SVG icons */}
            {[
              { label: "My Profile", color: "#888", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>, action: () => { setOpen(false); onPageChange("profile"); } },
              { label: "Settings",   color: "#888", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>, action: () => { setOpen(false); onPageChange("settings"); } },
              { label: "Security",   color: "#a8ff6c", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, action: () => { setOpen(false); onPageChange("security"); } },
            ].map(m => (
              <button key={m.label} onClick={m.action} style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "0.65rem 1rem",
                background: "none", border: "none", color: m.color, fontSize: 13,
                fontWeight: 500, borderRadius: 10, cursor: "pointer",
                transition: "all 0.15s", textAlign: "left", fontFamily: "var(--font)",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#ddd"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = m.color; }}
              >
                <span style={{ color: m.color, display: "flex", alignItems: "center" }}>{m.icon}</span>
                {m.label}
              </button>
            ))}
            <div style={{ borderTop: "1px solid #1a1a1a", marginTop: 4, paddingTop: 4 }}>
              <button onClick={() => { setOpen(false); onLogout(); }} style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "0.65rem 1rem",
                background: "none", border: "none", color: "#ff4d6d", fontSize: 13,
                fontWeight: 500, borderRadius: 10, cursor: "pointer",
                transition: "background 0.15s", textAlign: "left", fontFamily: "var(--font)",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,77,109,0.07)"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ff4d6d" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
export default function DashboardLayout({ user, page, onPageChange, onLogout, children }) {
  const [collapsed,  setCollapsed]  = useState(true);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [sidebarMenu, setSidebarMenu] = useState(false);
  const currentNav = NAV_ITEMS.find(n => n.id === page);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#000", overflow: "hidden" }}>

      {/* ══ SIDEBAR ══ */}
      <aside style={{
        width: collapsed ? 56 : 230,
        background: "#040404", borderRight: "1px solid #111",
        display: "flex", flexDirection: "column",
        transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden", flexShrink: 0, position: "relative", zIndex: 50,
      }}>
        {/* top accent */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(168,255,108,0.5),transparent)", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ height: 56, padding: "0 0.85rem", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #111", flexShrink: 0 }}>
          <div style={{ flexShrink: 0, filter: "drop-shadow(0 0 8px rgba(168,255,108,0.4))" }}><Logo size={30} /></div>
          {!collapsed && (
            <span style={{ fontWeight: 900, fontSize: 15.5, whiteSpace: "nowrap", letterSpacing: "-0.5px", color: "#fff", animation: "fadeIn 0.2s ease" }}>
              Smart<span style={{ color: "#a8ff6c" }}>Guard</span>
              <span style={{ display: "inline-block", marginLeft: 6, fontSize: 9, fontWeight: 700, background: "#a8ff6c", color: "#000", borderRadius: 4, padding: "1px 5px", letterSpacing: 1, verticalAlign: "middle" }}>AI</span>
            </span>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0.6rem 0.4rem", display: "flex", flexDirection: "column", gap: 1, overflowY: "auto" }}>
          {!collapsed && <div style={{ fontSize: 9, fontWeight: 700, color: "#222", letterSpacing: 2.5, textTransform: "uppercase", padding: "0.5rem 0.85rem 0.3rem" }}>Navigation</div>}
          {NAV_ITEMS.map(item => {
            const active = page === item.id, hovered = hoveredNav === item.id;
            return (
              <button key={item.id}
                onClick={() => onPageChange(item.id)}
                onMouseEnter={() => setHoveredNav(item.id)}
                onMouseLeave={() => setHoveredNav(null)}
                title={collapsed ? item.label : undefined}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: collapsed ? "0.72rem 0" : "0.65rem 0.85rem",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 10, border: "none",
                  background: active ? `${item.color}0d` : hovered ? "rgba(255,255,255,0.03)" : "transparent",
                  color: active ? item.color : hovered ? "#666" : "#2e2e2e",
                  width: "100%", fontWeight: active ? 600 : 400, fontSize: 13,
                  cursor: "pointer", transition: "all 0.16s", whiteSpace: "nowrap", overflow: "hidden",
                  position: "relative", fontFamily: "var(--font)",
                }}>
                {active && <div style={{ position: "absolute", left: 0, top: "15%", bottom: "15%", width: 2.5, borderRadius: "0 3px 3px 0", background: item.color, boxShadow: `0 0 10px ${item.color}90` }} />}
                <div style={{ flexShrink: 0, filter: active ? `drop-shadow(0 0 5px ${item.color}90)` : "none", transition: "filter 0.2s" }}>
                  <Icon name={item.icon} size={16} color={active ? item.color : hovered ? "#666" : "#2e2e2e"} />
                </div>
                {!collapsed && <span style={{ animation: "fadeIn 0.15s ease" }}>{item.label}</span>}
                {!collapsed && active && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: item.color, boxShadow: `0 0 8px ${item.color}` }} />}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "0.5rem 0.4rem", borderTop: "1px solid #111", flexShrink: 0 }}>
          {/* Clickable user card */}
          {!collapsed && (
            <button onClick={() => setSidebarMenu(true)} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "0.58rem 0.85rem",
              borderRadius: 12, border: "1px solid rgba(168,255,108,0.1)", background: "rgba(168,255,108,0.04)",
              width: "100%", cursor: "pointer", marginBottom: "0.8rem",
              transition: "background 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(168,255,108,0.09)"; e.currentTarget.style.borderColor = "rgba(168,255,108,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(168,255,108,0.04)"; e.currentTarget.style.borderColor = "rgba(168,255,108,0.1)"; }}
            >
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#a8ff6c,#00e5ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#000", flexShrink: 0, boxShadow: "0 0 10px rgba(168,255,108,0.4)", overflow: "hidden" }}>
                {user?.photoURL ? <img src={user.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (user?.name || "U")[0].toUpperCase()}
              </div>
              <div style={{ overflow: "hidden", flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#ccc" }}>{user?.name}</div>
                <div style={{ fontSize: 10, color: "#333", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</div>
              </div>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: sidebarMenu ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}><path d="M4 5l2 2 2-2" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}

          {/* Collapse toggle */}
          <button onClick={() => setCollapsed(c => !c)} title={collapsed ? "Expand" : "Collapse"} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: collapsed ? "0.65rem 0" : "0.58rem 0.85rem",
            justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: 10, border: "none", background: "transparent", color: "#222",
            width: "100%", cursor: "pointer", fontSize: 12.5, transition: "all 0.15s", marginBottom: 2, fontFamily: "var(--font)",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#0d0d0d"; e.currentTarget.style.color = "#555"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#222"; }}
          >
            <Icon name={collapsed ? "chevronRight" : "chevronLeft"} size={14} color="currentColor" />
            {!collapsed && <span style={{ animation: "fadeIn 0.15s ease" }}>Collapse</span>}
          </button>

          {/* Logout */}
          <button onClick={onLogout} title={collapsed ? "Logout" : undefined} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: collapsed ? "0.65rem 0" : "0.58rem 0.85rem",
            justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: 10, border: "none", background: "transparent", color: "#ff4d6d",
            width: "100%", cursor: "pointer", fontSize: 12.5, transition: "all 0.15s", fontFamily: "var(--font)",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,77,109,0.07)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <Icon name="logout" size={14} color="#ff4d6d" />
            {!collapsed && <span style={{ animation: "fadeIn 0.15s ease" }}>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* Topbar — NO backdrop-filter (it breaks position:fixed children) */}
        <header style={{
          height: 56, padding: "0 1.4rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid #111",
          background: "rgba(4,4,4,0.98)",
          flexShrink: 0, gap: 12, position: "relative", zIndex: 40,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {currentNav && (
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${currentNav.color}0d`, border: `1px solid ${currentNav.color}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={currentNav.icon} size={13} color={currentNav.color} />
              </div>
            )}
            <div>
              <h1 style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.3px", color: "#ddd" }}>{currentNav?.label}</h1>
              <div style={{ fontSize: 10, color: "#2a2a2a" }}>SmartGuard Platform</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <AIStatus />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <WalletButton />
              <UserMenu user={user} onLogout={onLogout} onPageChange={onPageChange} />
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflow: "auto" }}>{children}</main>
      </div>

      {/* Sidebar user popup via portal */}
      {sidebarMenu && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 88888 }} onClick={() => setSidebarMenu(false)}>
          <div style={{
            position: "fixed", bottom: 80, left: collapsed ? 64 : 238,
            background: "#0d0d0d", border: "1px solid #1e1e1e",
            borderRadius: 18, padding: "0.6rem", minWidth: 220,
            boxShadow: "0 20px 60px rgba(0,0,0,0.98), 0 0 40px rgba(168,255,108,0.04)",
            animation: "fadeInUp 0.18s ease", zIndex: 88889,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "0.75rem 0.9rem 0.85rem", borderBottom: "1px solid #161616", marginBottom: 4, display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#a8ff6c,#00e5ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#000", flexShrink: 0, overflow: "hidden" }}>
                {user?.photoURL ? <img src={user.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (user?.name || "U")[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e0e0e0" }}>{user?.name}</div>
                <div style={{ fontSize: 10, color: "#444" }}>{user?.email}</div>
              </div>
            </div>
            {[
              { label: "My Profile", color: "#888", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>, action: () => onPageChange("profile") },
              { label: "Settings",   color: "#888", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>, action: () => onPageChange("settings") },
              { label: "Security",   color: "#a8ff6c", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, action: () => onPageChange("security") },
            ].map(m => (
              <button key={m.label} onClick={() => { setSidebarMenu(false); m.action(); }} style={{
                display: "flex", alignItems: "center", gap: 9,
                width: "100%", padding: "0.55rem 0.9rem",
                background: "none", border: "none", color: m.color, fontSize: 12.5,
                fontWeight: 500, borderRadius: 9, cursor: "pointer", fontFamily: "var(--font)",
                transition: "all 0.15s", textAlign: "left",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#ccc"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = m.color; }}
              >
                <span style={{ color: m.color, display: "flex" }}>{m.icon}</span> {m.label}
              </button>
            ))}
            <div style={{ borderTop: "1px solid #161616", marginTop: 4, paddingTop: 4 }}>
            <button onClick={() => { setSidebarMenu(false); onLogout(); }} style={{
              display: "flex", alignItems: "center", gap: 9,
              width: "100%", padding: "0.55rem 0.9rem",
              background: "none", border: "none", color: "#ff4d6d",
              fontSize: 12.5, fontWeight: 500, borderRadius: 9,
              cursor: "pointer", fontFamily: "var(--font)", transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,77,109,0.07)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff4d6d" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
