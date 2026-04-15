import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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
      if (!res.ok) {
        let errMsg = "Backend returned an error.";
        try {
          const errData = await res.json();
          errMsg = errData.detail || errMsg;
        } catch { }
        throw new Error(errMsg);
      }
      const data = await res.json();
      setResult(data);
      // Save to Firestore scans collection
      if (user?.uid) await saveAuditResult(user.uid, user.email, code, data);

      setAiLoading(true);
      // Construct a prompt specifically grounded in the new Tri-Layer findings
      const prompt = `Review this Smart Contract using our Hybrid Security Architecture:

[FINAL VERDICT]:
- Base Security Score: ${data.final_judgment.score}/100
- Risk Level: ${data.final_judgment.risk_level}
- Analysis Mode: ${data.final_judgment.analysis_mode}

[NEURAL THREAT MODEL (${data.ml_signal.model_name})]:
- Binary Classification: ${data.ml_signal.verdict}
- Neural Confidence: ${data.ml_signal.confidence * 100}%

[STATIC ANALYSIS]:
- Identified Vulnerabilities: ${JSON.stringify(data.static_analysis.issues)}

CONTRACT CODE:
${code}

Please provide a developer-friendly explanation of these combined findings and remediation steps.`;
      
      const explanation = await callGemini(prompt, SYSTEM_PROMPT);
      setAiExplanation(explanation);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to analyze contract. Please verify backend is running.");
    } finally {
      setLoading(false);
      setAiLoading(false);
    }
  };

  const continueToChat = () => {
    if (!result) return;
    const context = {
      code,
      verdict: result.final_judgment.verdict,
      score: result.final_judgment.score,
      risk_level: result.final_judgment.risk_level,
      issues: result.static_analysis.issues,
      explanation: aiExplanation,
      model_name: "Hybrid " + result.ml_signal.model_name,
      analysis_mode: result.final_judgment.analysis_mode,
      timestamp: new Date().toISOString()
    };
    sessionStorage.setItem("smartguard_audit_context", JSON.stringify(context));
    navigate("/aichat");
  };

  const scoreColor = result
    ? result.final_judgment.score > 70 ? "#00d4aa" : result.final_judgment.score > 40 ? "#ffab40" : "#ff6b8a"
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

        {/* RIGHT — Audit Results Dashboard */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", animation: "slideInRight 0.4s ease" }}>
            
            {/* TIER 1: FINAL AUDIT RESULT (Hero View) */}
            <div style={{ 
              background: "var(--card)", border: "1px solid var(--border)", 
              borderRadius: "var(--r-xl)", padding: "1.5rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text)", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.8 }}>
                  <Icon name="shield" size={14} color="#4f8ef7" />
                  FINAL AUDIT VERDICT
                </div>
                <div style={{ 
                  padding: "4px 10px", borderRadius: 6, background: "rgba(79,142,247,0.1)", 
                  border: "1px solid rgba(79,142,247,0.2)", color: "#4f8ef7", fontSize: 10, fontWeight: 700 
                }}>
                  {result.final_judgment.analysis_mode}
                </div>
              </div>

              {/* Main Score & Verdict */}
              <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", padding: "1rem", background: "var(--bg3)", borderRadius: "var(--r-lg)" }}>
                <ScoreRing score={result.final_judgment.score} size={85} />
                <div>
                  <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>
                    Official Outcome
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ 
                      fontSize: 18, fontWeight: 800, color: result.final_judgment.verdict === "SECURE" ? "#00d4aa" : result.final_judgment.verdict === "WARNING" ? "#ffab40" : "#ff6b8a"
                    }}>
                      {result.final_judgment.verdict === "SECURE" ? "✓ LIKELY SAFE" : 
                       result.final_judgment.verdict === "WARNING" ? "⚠ WARNING" : "⨯ VULNERABLE"}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text2)", fontWeight: 500 }}>
                      ({result.final_judgment.risk_level})
                    </span>
                  </div>
                  <div style={{ color: "var(--text2)", fontSize: 13 }}>
                    Calculated using Hybrid Neural & Static Severity matrices.
                  </div>
                </div>
              </div>
            </div>

            {/* TIER 2 & 3: Transparent Data Split */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              
              {/* TIER 2: ML Signal */}
              <div style={{ 
                background: "var(--bg3)", border: "1px solid rgba(124,92,252,0.2)", 
                borderRadius: "var(--r-lg)", padding: "1rem"
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#7c5cfc", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="zap" size={14} color="#7c5cfc" /> Raw ML Signal
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>Binary Prediction</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: result.ml_signal.verdict === "SAFE" ? "#00d4aa" : "#ff6b8a" }}>
                    {result.ml_signal.verdict}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>Neural Confidence</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
                    {Math.round((result.ml_signal.confidence || 0) * 100)}%
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                  Model: {result.ml_signal.model_name}
                </div>
              </div>

              {/* TIER 3: Static Analysis Findings */}
              <div style={{ 
                background: "var(--bg3)", border: "1px solid rgba(255,171,64,0.2)", 
                borderRadius: "var(--r-lg)", padding: "1rem"
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#ffab40", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="search" size={14} color="#ffab40" /> Static Findings
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>Concrete Vulnerabilities</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
                    {result.static_analysis.finding_count} Detected
                  </div>
                </div>
                {result.static_analysis.finding_count > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 120, overflowY: "auto" }}>
                    {result.static_analysis.issues.map((issue, i) => <IssueCard key={i} issue={issue} />)}
                  </div>
                ) : (
                  <div style={{ padding: "0.5rem", background: "rgba(0, 212, 170, 0.05)", borderRadius: 6, color: "#00d4aa", fontSize: 12, textAlign: "center" }}>
                    No rule violations detected.
                  </div>
                )}
              </div>
            </div>

            {/* 2. AI SECTION — SECURITY EXPLANATION & GUIDANCE */}
            <div style={{ 
              background: "rgba(0,212,170,0.03)", border: "1px solid rgba(0,212,170,0.15)", 
              borderRadius: "var(--r-xl)", padding: "1.5rem",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
                <div style={{ animation: aiLoading ? "spin 2s linear infinite" : "none" }}>
                  <Icon name="shield" size={16} color="#00d4aa" />
                </div>
                <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 14 }}>
                  AI SECURITY ANALYSIS & REMEDIATION
                  {aiLoading && <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 400, marginLeft: 8 }}>Thinking...</span>}
                </div>
              </div>

              {aiLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="skeleton" style={{ height: 12, width: "100%" }} />
                  <div className="skeleton" style={{ height: 12, width: "90%" }} />
                  <div className="skeleton" style={{ height: 12, width: "95%" }} />
                  <div className="skeleton" style={{ height: 12, width: "40%" }} />
                </div>
              ) : (
                <>
                  <div style={{ 
                    color: "var(--text2)", fontSize: 13, lineHeight: 1.8, 
                    whiteSpace: "pre-wrap", maxHeight: 350, overflowY: "auto",
                    paddingRight: 10
                  }}>
                    {aiExplanation}
                  </div>
                  
                  {aiExplanation && (
                    <button
                      onClick={continueToChat}
                      style={{
                        marginTop: "1.5rem", width: "100%", padding: "1rem",
                        background: "linear-gradient(135deg, rgba(124,92,252,0.1), rgba(79,142,247,0.1))",
                        border: "1px solid rgba(124,92,252,0.3)",
                        borderRadius: "var(--r-md)", color: "#7c5cfc", fontWeight: 700, fontSize: 14,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                        cursor: "pointer", transition: "all 0.2s",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#7c5cfc"; e.currentTarget.style.background = "rgba(124,92,252,0.15)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(124,92,252,0.3)"; e.currentTarget.style.background = "rgba(124,92,252,0.1)"; }}
                    >
                      <Icon name="chat" size={16} color="#7c5cfc" />
                      Consult Expert AI Assistant
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
