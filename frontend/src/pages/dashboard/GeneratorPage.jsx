import { useState } from "react";
import Icon from "../../components/Icon";
import { callGemini } from "../../api/gemini";

const TEMPLATES = [
  "ERC-20 token with 1 million supply, minting, and burn function",
  "NFT collection (ERC-721) with whitelist and public mint phases",
  "Multi-signature wallet requiring 2 of 3 approvals",
  "DeFi staking contract with 10% APY and lockup period",
  "DAO governance contract with proposal and voting",
  "Escrow contract for freelance payment with dispute resolution",
  "Token vesting contract with 1-year cliff, 4-year linear vesting",
  "Simple DEX with liquidity pool and swap functionality"
];

const SYSTEM_PROMPT = `You are an expert Solidity developer. Generate complete, production-ready, secure Solidity smart contracts.

Requirements:
- Include SPDX license identifier
- Use pragma solidity ^0.8.20
- Add comprehensive NatSpec comments
- Include events for all state changes
- Implement proper access control (Ownable pattern)
- Follow security best practices (checks-effects-interactions, etc.)
- Include relevant modifiers
- Return ONLY the Solidity code, no explanations outside comments`;

export default function GeneratorPage({ onNavigateToAudit }) {
  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(null);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setGenerated("");
    setActiveTemplate(null);
    try {
      const code = await callGemini(
        `Create a production-ready Solidity smart contract for: ${prompt}`,
        SYSTEM_PROMPT
      );
      setGenerated(code);
    } catch {
      setGenerated("// Error generating contract. Please check your Gemini API key.");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([generated], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SmartGuard_Contract.sol";
    a.click();
    URL.revokeObjectURL(url);
  };

  const useTemplate = (t, i) => {
    setPrompt(t);
    setActiveTemplate(i);
  };

  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200, margin: "0 auto", animation: "fadeInUp 0.35s ease" }}>
      <div style={{ display: "grid", gridTemplateColumns: generated ? "1fr 1fr" : "1fr", gap: "1.5rem" }}>

        {/* LEFT — Input Panel */}
        <div>
          <div style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: "var(--r-xl)", padding: "1.5rem", marginBottom: "1.5rem"
          }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="code" size={18} color="var(--teal)" />
              Describe Your Contract
            </h3>
            <p style={{ color: "var(--text2)", fontSize: 13, marginBottom: "1.2rem" }}>
              Tell the AI what your smart contract should do in plain English.
            </p>

            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) generate(); }}
              placeholder="e.g. A token vesting contract that releases tokens linearly over 4 years with a 1-year cliff, where the owner can set beneficiaries..."
              style={{
                width: "100%", height: 110,
                background: "var(--bg3)", border: "1px solid var(--border)",
                borderRadius: "var(--r-md)", padding: "0.9rem 1rem",
                color: "var(--text)", fontSize: 14, outline: "none",
                resize: "vertical", fontFamily: "var(--font)", lineHeight: 1.6,
                transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "rgba(0,212,170,0.5)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />

            <button onClick={generate} disabled={loading || !prompt.trim()} style={{
              width: "100%", marginTop: "1rem",
              background: loading || !prompt.trim()
                ? "var(--bg3)"
                : "linear-gradient(135deg, #00d4aa, #4f8ef7)",
              border: "none",
              color: loading || !prompt.trim() ? "var(--muted)" : "white",
              padding: "0.9rem", borderRadius: "var(--r-md)",
              fontWeight: 700, fontSize: 15,
              cursor: loading || !prompt.trim() ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s",
              boxShadow: loading || !prompt.trim() ? "none" : "0 6px 20px rgba(0,212,170,0.3)"
            }}>
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid var(--muted)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                  Generating Contract...
                </>
              ) : "✨ Generate Contract"}
            </button>
            <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 6 }}>
              Ctrl+Enter to generate quickly
            </p>
          </div>

          {/* Templates */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
              Quick Templates
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {TEMPLATES.map((t, i) => (
                <button key={i} onClick={() => useTemplate(t, i)} style={{
                  padding: "0.65rem 1rem",
                  background: activeTemplate === i ? "rgba(0,212,170,0.08)" : "var(--card)",
                  border: `1px solid ${activeTemplate === i ? "rgba(0,212,170,0.3)" : "var(--border)"}`,
                  borderRadius: "var(--r-md)",
                  color: activeTemplate === i ? "var(--teal)" : "var(--text2)",
                  fontSize: 13, cursor: "pointer", textAlign: "left",
                  transition: "all 0.2s", width: "100%"
                }}
                  onMouseEnter={e => { if (activeTemplate !== i) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "var(--border2)"; } }}
                  onMouseLeave={e => { if (activeTemplate !== i) { e.currentTarget.style.background = "var(--card)"; e.currentTarget.style.borderColor = "var(--border)"; } }}>
                  <span style={{ marginRight: 8, opacity: 0.5 }}>{i + 1}.</span>{t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Generated Code */}
        {generated && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", animation: "slideInRight 0.35s ease" }}>
            <div style={{
              background: "var(--bg3)", border: "1px solid var(--border)",
              borderRadius: "var(--r-xl)", overflow: "hidden", flex: 1, display: "flex", flexDirection: "column"
            }}>
              {/* Code header */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "0.9rem 1.2rem", borderBottom: "1px solid var(--border)",
                background: "var(--card)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["#ff5f57", "#febc2e", "#28c840"].map(c => (
                      <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 13, color: "var(--muted)", fontFamily: "var(--mono)" }}>
                    SmartGuard_Contract.sol
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={copy} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "0.4rem 0.9rem",
                    background: copied ? "rgba(0,212,170,0.1)" : "transparent",
                    border: `1px solid ${copied ? "rgba(0,212,170,0.3)" : "var(--border)"}`,
                    borderRadius: "var(--r-sm)",
                    color: copied ? "#00d4aa" : "var(--muted)", fontSize: 12, cursor: "pointer",
                    transition: "all 0.2s"
                  }}>
                    <Icon name={copied ? "check" : "copy"} size={13} color={copied ? "#00d4aa" : "var(--muted)"} />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button onClick={download} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "0.4rem 0.9rem",
                    background: "transparent", border: "1px solid var(--border)",
                    borderRadius: "var(--r-sm)", color: "var(--muted)", fontSize: 12, cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}>
                    <Icon name="download" size={13} />
                    Download
                  </button>
                </div>
              </div>

              {/* Code body */}
              <pre style={{
                padding: "1.2rem", fontSize: 12.5,
                fontFamily: "var(--mono)", lineHeight: 1.75,
                overflowX: "auto", overflowY: "auto",
                color: "#a8b4d0", whiteSpace: "pre-wrap",
                flex: 1, margin: 0, maxHeight: "65vh"
              }}>
                {generated}
              </pre>
            </div>

            {/* Audit this contract CTA */}
            <button onClick={() => onNavigateToAudit && onNavigateToAudit(generated)} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "0.85rem", borderRadius: "var(--r-md)",
              background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.25)",
              color: "var(--blue)", fontWeight: 600, fontSize: 14, cursor: "pointer",
              transition: "all 0.2s"
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(79,142,247,0.12)"; e.currentTarget.style.borderColor = "rgba(79,142,247,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(79,142,247,0.08)"; e.currentTarget.style.borderColor = "rgba(79,142,247,0.25)"; }}>
              <Icon name="shield" size={16} color="var(--blue)" />
              Audit This Contract →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
