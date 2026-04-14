import { useState, useEffect, useRef } from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useDisconnect } from 'wagmi';

export default function SmartWalletButton() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const dropdownRef = useRef(null);
  const { disconnect } = useDisconnect();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setShowConfirm(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <ConnectButton.Custom>
      {({ account, chain, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button onClick={openConnectModal} type="button" style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "0.4rem 1.1rem",
                    background: "linear-gradient(135deg, rgba(168,255,108,0.15), rgba(0,229,255,0.08))",
                    border: "1px solid rgba(168,255,108,0.35)",
                    borderRadius: 50, fontSize: 12.5, fontWeight: 700,
                    color: "#a8ff6c", cursor: "pointer", transition: "all 0.2s",
                    fontFamily: "var(--font)",
                    boxShadow: "0 0 14px rgba(168,255,108,0.2), inset 0 0 10px rgba(168,255,108,0.05)",
                    letterSpacing: 0.3,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 26px rgba(168,255,108,0.5), inset 0 0 14px rgba(168,255,108,0.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 14px rgba(168,255,108,0.2), inset 0 0 10px rgba(168,255,108,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a8ff6c" strokeWidth="2.2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><circle cx="12" cy="14" r="2" fill="#a8ff6c" stroke="none"/></svg>
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button" style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "0.4rem 1.1rem", background: "rgba(255,77,109,0.1)",
                    border: "1px solid rgba(255,77,109,0.4)", borderRadius: 50,
                    fontSize: 12.5, fontWeight: 700, color: "#ff4d6d", cursor: "pointer",
                    boxShadow: "0 0 14px rgba(255,77,109,0.2)",
                  }}>
                    Wrong Network (Switch to Sepolia)
                  </button>
                );
              }

              // Custom Connected Pill Profile
              return (
                <div style={{ position: "relative" }} ref={dropdownRef}>
                  <button onClick={() => { setDropdownOpen(!dropdownOpen); setShowConfirm(false); }} type="button" style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "0.25rem 0.3rem 0.25rem 0.3rem",
                    paddingRight: "0.9rem",
                    background: dropdownOpen ? "rgba(168,255,108,0.12)" : "rgba(168,255,108,0.06)",
                    border: "1px solid rgba(168,255,108,0.25)",
                    borderRadius: 50, fontSize: 13, fontWeight: 800,
                    color: "#a8ff6c", cursor: "pointer", transition: "all 0.2s",
                    fontFamily: "var(--font)",
                  }}
                  onMouseEnter={e => { if(!dropdownOpen) e.currentTarget.style.background = "rgba(168,255,108,0.12)" }}
                  onMouseLeave={e => { if(!dropdownOpen) e.currentTarget.style.background = "rgba(168,255,108,0.06)" }}
                  >
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%", overflow: "hidden",
                      background: "linear-gradient(135deg, #a8ff6c, #00e5ff)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#000", fontSize: 11
                    }}>
                      {account.ensAvatar ? <img src={account.ensAvatar} alt="ENS" style={{width: '100%', height: '100%'}}/> : (account.displayName.slice(0,2).toUpperCase())}
                    </div>
                    {account.displayName}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ opacity: 0.6, marginLeft: 2, transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}><path d="M6 9l6 6 6-6"/></svg>
                  </button>

                  {/* Connected Dropdown Menu */}
                  {dropdownOpen && (
                    <div style={{
                      position: "absolute", top: "100%", right: 0, marginTop: "0.6rem",
                      background: "#0a0a0a", border: "1px solid rgba(168,255,108,0.15)",
                      borderRadius: 14, minWidth: 200, padding: "0.4rem",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.95), 0 0 0 1px rgba(168,255,108,0.05)",
                      zIndex: 9999, animation: "fadeInDown 0.15s ease"
                    }}>
                      {showConfirm ? (
                        <div style={{ padding: "0.5rem" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 12, textAlign: "center" }}>Disconnect wallet?</div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => setShowConfirm(false)} style={{
                              flex: 1, padding: "0.5rem", background: "#1a1a1a", border: "1px solid #333",
                              borderRadius: 8, color: "#ccc", fontSize: 12, fontWeight: 600, cursor: "pointer"
                            }}>Cancel</button>
                            <button onClick={() => { disconnect(); setDropdownOpen(false); setShowConfirm(false); }} style={{
                              flex: 1, padding: "0.5rem", background: "rgba(255,77,109,0.15)", border: "1px solid rgba(255,77,109,0.4)",
                              borderRadius: 8, color: "#ff4d6d", fontSize: 12, fontWeight: 700, cursor: "pointer"
                            }}>Confirm</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ padding: "0.6rem 0.8rem", borderBottom: "1px solid #141414", marginBottom: "0.4rem" }}>
                            <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Connected Balance</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "monospace" }}>{account.displayBalance ? `${account.displayBalance}` : 'Syncing...'}</div>
                          </div>

                          <button onClick={() => { navigator.clipboard.writeText(account.address || account.displayName); setDropdownOpen(false); }} style={{
                            width: "100%", textAlign: "left", padding: "0.65rem 0.8rem",
                            background: "transparent", border: "none", borderRadius: 8,
                            fontSize: 13, fontWeight: 600, color: "#ccc", display: "flex", alignItems: "center", gap: 8,
                            cursor: "pointer", transition: "all 0.15s"
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "#181818"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            Copy Address
                          </button>

                          <button onClick={() => setShowConfirm(true)} style={{
                            width: "100%", textAlign: "left", padding: "0.65rem 0.8rem",
                            background: "transparent", border: "none", borderRadius: 8,
                            fontSize: 13, fontWeight: 600, color: "#ff4d6d", display: "flex", alignItems: "center", gap: 8,
                            cursor: "pointer", transition: "all 0.15s", marginTop: 2
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,77,109,0.08)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                            Disconnect
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
