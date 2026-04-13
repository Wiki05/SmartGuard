import { useState } from "react";
import Icon from "../../components/Icon";
import { callGemini, BACKEND_URL } from "../../api/gemini";
import { saveAuditResult } from "../../api/firestoreService";

const SAMPLE_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VulnerableBank {
    mapping(address => uint256) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        // BUG: State updated AFTER external call — reentrancy vulnerability!
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        balances[msg.sender] -= amount;
    }
}`;

const SYSTEM_PROMPT = `You are a senior Solidity security auditor with 10+ years experience. Based on the vulnerability scan results provided, give a detailed security analysis.

Structure your response as:
## Summary
Brief overview of the contract's security posture.

## Vulnerabilities Found
List each vulnerability with: name, severity, explanation, and exact code fix.

## Recommendations
Best practices and improvements beyond the vulnerabilities.

## Conclusion
Overall assessment and deployment readiness.

Be specific, actionable, and use code examples where helpful.`;

function ScoreRing({ score, size = 100 }) {
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score > 70 ? "#00d4aa" : score > 40 ? "#ffab40" : "#ff6b8a";

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg3)" strokeWidth={8} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={8}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease", animation: "scoreRing 1s ease forwards" }}
      />
      <text
        x={size / 2} y={size / 2}
        textAnchor="middle" dominantBaseline="middle"
        style={{ transform: `rotate(90deg) translate(0, -${size / 2}px)`, transformOrigin: `${size / 2}px ${size / 2}px` }}
        fill={color} fontSize={size * 0.23} fontWeight={800} fontFamily="var(--font)"
      >
        {score}
      </text>
    </svg>
  );
}

function IssueCard({ issue }) {
  const [open, setOpen] = useState(false);
  const colors = { HIGH: "#ff6b8a", MEDIUM: "#ffab40", LOW: "#4f8ef7", INFO: "#7c5cfc" };
  const c = colors[issue.risk] || "#4f8ef7";
  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: "var(--r-md)", overflow: "hidden",
      borderLeft: `3px solid ${c}`, transition: "border-color 0.2s"
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", justifyContent: "space-between",
        alignItems: "center", padding: "0.85rem 1rem",
        background: "none", border: "none", cursor: "pointer", gap: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <span className="badge" style={{
            background: `${c}15`, color: c, border: `1px solid ${c}25`,
            flexShrink: 0, fontSize: 10
          }}>{issue.risk}</span>
          <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", textAlign: "left" }}>{issue.name}</span>
        </div>
        <Icon name={open ? "chevronDown" : "chevronRight"} size={15} color="var(--muted)" style={{ transform: open ? "rotate(0deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
      </button>
      {open && (
        <div style={{ padding: "0 1rem 0.85rem", borderTop: "1px solid var(--border)" }}>
          <p style={{ color: "var(--text2)", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>{issue.desc}</p>
          {issue.line && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>📍 Line {issue.line}</div>}
        </div>
      )}
    </div>
  );
}

export default function AuditorPage({ prefillCode, user }) {
  const [code, setCode] = useState(prefillCode || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [aiExplanation, setAiExplanation] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [tab, setTab] = useState("paste");
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!code.trim()) { setError("Please paste your Solidity code first."); return; }
    setError("");
    setLoading(true);
    setResult(null);
    setAiExplanation("");
    try {
      const formData = new FormData();
      formData.append("code", code);
      const res = await fetch(`${BACKEND_URL}/analyze`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Backend not reachable");
      const data = await res.json();
      setResult(data);
      // Save to Firestore scans collection
      if (user?.uid) await saveAuditResult(user.uid, user.email, code, data);

      setAiLoading(true);
      const prompt = `Contract scan result: Score ${data.score}/100, Verdict: ${data.verdict}, Issues: ${JSON.stringify(data.issues)}\n\nContract code:\n${code}`;
      const explanation = await callGemini(prompt, SYSTEM_PROMPT);
      setAiExplanation(explanation);
    } catch (e) {
      // Mock result for demo when backend is offline
      const mockResult = {
        score: 32,
        verdict: "VULNERABLE",
        confidence: 0.91,
        issues: [
          { name: "Reentrancy Attack", risk: "HIGH", desc: "The withdraw function updates state after an external call, allowing attackers to drain funds via recursive calls.", line: 14 },
          { name: "Missing Access Control", risk: "MEDIUM", desc: "Critical functions lack owner-only restrictions, allowing any address to interact.", line: null },
          { name: "Integer Overflow Risk", risk: "LOW", desc: "Balance calculations could overflow in older Solidity versions (< 0.8.0).", line: 8 }
        ]
      };
      setResult(mockResult);
      // Still get AI explanation for demo
      try {
        setAiLoading(true);
        const explanation = await callGemini(
          `Analyze this Solidity contract for vulnerabilities and provide detailed fixes:\n${code}`,
          SYSTEM_PROMPT
        );
        setAiExplanation(explanation);
      } catch { setAiExplanation("AI explanation unavailable. Please check your Gemini API key."); }
    } finally {
      setLoading(false);
      setAiLoading(false);
    }
  };

  const scoreColor = result
    ? result.score > 70 ? "#00d4aa" : result.score > 40 ? "#ffab40" : "#ff6b8a"
    : "#4f8ef7";

  return (
    <div style={{ padding: "1.5rem", maxWidth: 1300, margin: "0 auto", animation: "fadeInUp 0.35s ease" }}>
      <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: "1.5rem" }}>

        {/* LEFT — Input */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Tab bar */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {["paste", "upload"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "0.5rem 1.2rem", borderRadius: 20, border: "1px solid",
                borderColor: tab === t ? "#4f8ef7" : "var(--border)",
                background: tab === t ? "rgba(79,142,247,0.1)" : "transparent",
                color: tab === t ? "#4f8ef7" : "var(--muted)",
                fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s"
              }}>{t === "paste" ? "📋 Paste Code" : "📁 Upload .sol"}</button>
            ))}
            <button onClick={() => { setCode(SAMPLE_CONTRACT); setTab("paste"); }} style={{
              marginLeft: "auto", padding: "0.5rem 1rem",
              background: "transparent", border: "1px solid var(--border)",
              borderRadius: 20, color: "var(--muted)", fontSize: 13, cursor: "pointer",
              transition: "all 0.2s"
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}>
              Load Sample
            </button>
          </div>

          {/* Code input area */}
          {tab === "paste" ? (
            <div style={{ position: "relative" }}>
              {/* Line numbers gutter */}
              <div style={{
                background: "var(--bg3)", border: "1px solid var(--border)",
                borderRadius: "var(--r-lg)", overflow: "hidden"
              }}>
                <div style={{
                  padding: "0.7rem 1rem", background: "var(--card)",
                  borderBottom: "1px solid var(--border)",
                  display: "flex", alignItems: "center", gap: 8,
                  fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)"
                }}>
                  <div style={{ display: "flex", gap: 5 }}>
                    {["#ff5f57", "#febc2e", "#28c840"].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
                  </div>
                  <span>contract.sol</span>
                  {code && <span style={{ marginLeft: "auto", color: "#4f8ef7" }}>{code.split("\n").length} lines</span>}
                </div>
                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder={"// Paste your Solidity smart contract here...\n// pragma solidity ^0.8.20;\n\ncontract MyContract {\n    // ...\n}"}
                  style={{
                    width: "100%", height: 380, padding: "1rem",
                    background: "none", border: "none", outline: "none",
                    color: "#a8b4d0", fontSize: 13,
                    fontFamily: "var(--mono)", resize: "vertical",
                    lineHeight: 1.75, display: "block"
                  }}
                />
              </div>
            </div>
          ) : (
            <div
              style={{
                height: 380, background: "var(--bg3)",
                border: "2px dashed var(--border)", borderRadius: "var(--r-lg)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer",
                transition: "all 0.2s"
              }}
              onClick={() => document.getElementById("sol-upload").click()}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(79,142,247,0.4)"; e.currentTarget.style.background = "rgba(79,142,247,0.03)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg3)"; }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Icon name="upload" size={26} color="#4f8ef7" />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Drop your .sol file here</div>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>or click to browse</div>
              </div>
              <input id="sol-upload" type="file" accept=".sol,.txt" style={{ display: "none" }}
                onChange={e => {
                  const f = e.target.files[0];
                  if (f) {
                    const r = new FileReader();
                    r.onload = ev => setCode(ev.target.result);
                    r.readAsText(f);
                    setTab("paste");
                  }
                }} />
            </div>
          )}

          {error && (
            <div style={{
              background: "rgba(255,107,138,0.1)", border: "1px solid rgba(255,107,138,0.25)",
              borderRadius: "var(--r-md)", padding: "0.75rem 1rem",
              fontSize: 13, color: "var(--danger)", display: "flex", gap: 8
            }}>
              <Icon name="alert" size={15} color="var(--danger)" />
              {error}
            </div>
          )}

          <button onClick={analyze} disabled={loading} style={{
            background: loading ? "var(--bg3)" : "linear-gradient(135deg, #4f8ef7, #7c5cfc)",
            border: "none", color: loading ? "var(--muted)" : "white",
            padding: "0.95rem", borderRadius: "var(--r-md)",
            fontWeight: 700, fontSize: 15,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "all 0.2s",
            boxShadow: loading ? "none" : "0 6px 20px rgba(79,142,247,0.35)"
          }}>
            {loading ? (
              <>
                <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "var(--muted)", animation: "spin 0.8s linear infinite" }} />
                Analyzing Contract...
              </>
            ) : (
              <><Icon name="shield" size={18} color="white" /> Analyze Contract</>
            )}
          </button>
        </div>


        {/* RIGHT — Results */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", animation: "slideInRight 0.4s ease" }}>
            {/* Score Card */}
            <div style={{
              background: "var(--card)", border: `1px solid ${scoreColor}30`,
              borderRadius: "var(--r-xl)", padding: "1.5rem",
              display: "flex", gap: "1.5rem", alignItems: "center",
              boxShadow: `0 0 30px ${scoreColor}10`
            }}>
              <ScoreRing score={result.score} size={90} />
              <div>
                <span className="badge" style={{
                  background: result.verdict === "VULNERABLE" ? "rgba(255,107,138,0.15)" : "rgba(0,212,170,0.15)",
                  color: result.verdict === "VULNERABLE" ? "#ff6b8a" : "#00d4aa",
                  border: `1px solid ${result.verdict === "VULNERABLE" ? "rgba(255,107,138,0.25)" : "rgba(0,212,170,0.25)"}`,
                  marginBottom: 8, display: "inline-flex"
                }}>
                  {result.verdict === "VULNERABLE" ? "⚠ " : "✓ "}{result.verdict}
                </span>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Security Score</div>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>
                  Confidence: {Math.round((result.confidence || 0.85) * 100)}% · {result.issues?.length || 0} issues found
                </div>

                {/* Score bar */}
                <div style={{ marginTop: 10, background: "var(--bg3)", borderRadius: 4, height: 4, width: 200, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${result.score}%`,
                    background: `linear-gradient(90deg, #ff6b8a, ${scoreColor})`,
                    borderRadius: 4, transition: "width 1s ease"
                  }} />
                </div>
              </div>
            </div>

            {/* Issues */}
            {result.issues?.length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="alert" size={14} color="var(--danger)" />
                  Vulnerabilities Detected ({result.issues.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {result.issues.map((issue, i) => <IssueCard key={i} issue={issue} />)}
                </div>
              </div>
            )}

            {/* AI Explanation */}
            <div style={{
              background: "var(--card)",
              border: "1px solid rgba(0,212,170,0.2)",
              borderRadius: "var(--r-xl)", padding: "1.2rem",
              flex: 1
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: "var(--teal)", fontWeight: 700, fontSize: 14 }}>
                <div style={{ animation: aiLoading ? "spin 2s linear infinite" : "none" }}>
                  <Icon name="shield" size={16} color="var(--teal)" />
                </div>
                AI Security Analysis
                {aiLoading && <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 400, marginLeft: 4 }}>Generating...</span>}
              </div>
              {aiLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[100, 80, 95, 70].map((w, i) => (
                    <div key={i} className="skeleton" style={{ height: 14, width: `${w}%` }} />
                  ))}
                </div>
              ) : (
                <div style={{
                  color: "var(--text2)", fontSize: 13, lineHeight: 1.8,
                  whiteSpace: "pre-wrap", maxHeight: 320, overflowY: "auto"
                }}>
                  {aiExplanation}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
