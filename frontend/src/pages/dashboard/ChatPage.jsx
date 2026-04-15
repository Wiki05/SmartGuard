import { useState, useEffect, useRef } from "react";
import Icon from "../../components/Icon";
import { callGemini } from "../../api/gemini";

const SUGGESTIONS = [
  "Explain reentrancy attacks in Solidity",
  "How does DeFi yield farming work?",
  "What is ERC-721 vs ERC-1155?",
  "Best practices for Solidity security",
  "How do flash loans work in DeFi?",
  "What is a smart contract audit?"
];

const SYSTEM_PROMPT = "You are an expert Web3 and blockchain AI assistant named SmartGuard AI. You specialize in Solidity, smart contract security, DeFi, NFTs, crypto trading, and blockchain technology. Format your responses with clear structure using markdown-like formatting. Be helpful, accurate, and concise.";

function MessageBubble({ msg, userName }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", gap: 12,
      justifyContent: isUser ? "flex-end" : "flex-start",
      animation: "fadeInUp 0.25s ease"
    }}>
      {!isUser && (
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: "linear-gradient(135deg, #7c5cfc, #4f8ef7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginTop: 2,
          boxShadow: "0 0 12px rgba(124,92,252,0.3)"
        }}>
          <Icon name="shield" size={16} color="white" />
        </div>
      )}
      <div style={{
        maxWidth: "72%",
        background: isUser
          ? "linear-gradient(135deg, #4f8ef7, #7c5cfc)"
          : "var(--card)",
        border: isUser ? "none" : "1px solid var(--border)",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        padding: "0.9rem 1.1rem",
        fontSize: 14, lineHeight: 1.75,
        color: "var(--text)",
        whiteSpace: "pre-wrap",
        boxShadow: isUser ? "0 4px 15px rgba(79,142,247,0.25)" : "none"
      }}>
        {!isUser && (
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--purple)", marginBottom: 6, letterSpacing: 0.5 }}>
            SmartGuard AI
          </div>
        )}
        {msg.content}
      </div>
      {isUser && (
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: "var(--bg3)", border: "1px solid var(--border2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginTop: 2, fontSize: 13, fontWeight: 700, color: "var(--blue)"
        }}>
          {userName[0].toUpperCase()}
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <div style={{
        width: 34, height: 34, borderRadius: "50%",
        background: "linear-gradient(135deg, #7c5cfc, #4f8ef7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, boxShadow: "0 0 12px rgba(124,92,252,0.3)"
      }}>
        <Icon name="shield" size={16} color="white" />
      </div>
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: "18px 18px 18px 4px", padding: "1rem 1.2rem",
        display: "flex", alignItems: "center", gap: 5
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 7, height: 7, borderRadius: "50%", background: "#7c5cfc",
            display: "inline-block",
            animation: `bounce 1.2s ${i * 0.2}s infinite`
          }} />
        ))}
      </div>
    </div>
  );
}

export default function ChatPage({ user }) {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi! I'm SmartGuard AI — your expert Web3 assistant 🛡️\n\nAsk me anything about Solidity, smart contract security, DeFi, NFTs, or blockchain technology."
  }]);
  const [input,      setInput]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [aiError,    setAiError]    = useState(false);
  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Check for audit context from AuditorPage
    const contextStr = sessionStorage.getItem("smartguard_audit_context");
    if (contextStr) {
      try {
        const ctx = JSON.parse(contextStr);
        setMessages([
          {
            role: "assistant",
            content: `🛡️ **Audit Context Loaded**\n\nI've received the security audit for your contract. Here's a quick summary:\n\n**Verdict:** ${ctx.verdict}\n**Score:** ${ctx.score}/100\n**Engine:** ${ctx.model}\n**Issues:** ${ctx.issues?.length || 0} detected.\n\nHow can I help you dive deeper into these findings?`
          },
          {
            role: "assistant",
            content: `**Original AI Analysis:**\n${ctx.explanation}`
          }
        ]);
        sessionStorage.removeItem("smartguard_audit_context");
      } catch (e) {
        console.error("Failed to parse audit context", e);
      }
    }

    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text = input) => {
    const msg = text.trim();
    if (!msg || loading) return;
    setInput("");
    const updated = [...messages, { role: "user", content: msg }];
    setMessages(updated);
    setLoading(true);
    setAiError(false);
    try {
      const history = updated.map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");
      const reply = await callGemini(history, SYSTEM_PROMPT);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `⚠️ AI Error: ${e?.message || "Unknown error"}\n\nIf this keeps happening, check your Groq API key at: https://console.groq.com/keys`
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      maxWidth: 860, margin: "0 auto", width: "100%",
      animation: "fadeIn 0.3s ease"
    }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        {/* Suggestion chips — show only at start */}
        {messages.length === 1 && (
          <div style={{ animation: "fadeInUp 0.4s ease" }}>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: "0.8rem", fontWeight: 500 }}>
              💡 Try asking...
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)} style={{
                  padding: "0.5rem 1rem",
                  background: "var(--card)", border: "1px solid var(--border)",
                  borderRadius: 20, color: "var(--text2)", fontSize: 13,
                  cursor: "pointer", transition: "all 0.2s"
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#7c5cfc50"; e.currentTarget.style.color = "var(--text)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text2)"; }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} userName={user.name} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "1rem 1.5rem",
        borderTop: "1px solid var(--border)",
        background: "var(--bg2)"
      }}>
        <div style={{
          display: "flex", gap: 10, alignItems: "flex-end",
          background: "var(--bg3)", border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)", padding: "0.6rem 0.6rem 0.6rem 1.2rem",
          transition: "border-color 0.2s"
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = "rgba(124,92,252,0.5)"}
          onBlurCapture={e => e.currentTarget.style.borderColor = "var(--border)"}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask about smart contracts, DeFi, blockchain security..."
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "var(--text)", fontSize: 14, resize: "none",
              minHeight: 24, maxHeight: 120,
              fontFamily: "var(--font)", lineHeight: 1.6
            }}
            rows={1}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()} style={{
            width: 40, height: 40, borderRadius: 12, border: "none", flexShrink: 0,
            background: input.trim() ? "linear-gradient(135deg, #7c5cfc, #4f8ef7)" : "var(--card)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: input.trim() ? "pointer" : "not-allowed",
            transition: "all 0.2s",
            boxShadow: input.trim() ? "0 4px 12px rgba(124,92,252,0.3)" : "none"
          }}>
            <Icon name="send" size={17} color={input.trim() ? "white" : "var(--muted)"} />
          </button>
        </div>
        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 8, textAlign: "center" }}>
          Powered by Groq AI (Llama 3.3) · Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
