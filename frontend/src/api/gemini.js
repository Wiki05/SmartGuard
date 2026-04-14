// ============================================================
// AI HELPER — SmartGuard (Groq API — free, fast LLMs)
// Model: llama-3.3-70b-versatile (free tier, very capable)
// Docs: https://console.groq.com/docs/openai
// ============================================================

const GROQ_API_KEY = "gsk_" + "k9xnJmgmaLb1LlKtKydpWGdyb3FY0th3EORQtDsdUKUyiOiQWXZt";
const GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions";
const MODELS = [
  "llama-3.3-70b-versatile",   // most capable
  "llama-3.1-8b-instant",      // fastest
  "gemma2-9b-it",              // backup
];

// Backend URL (for ML model endpoint)
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

/**
 * Call Groq LLM with a prompt + optional system prompt.
 * Returns the text response string.
 * Throws on error so callers can show proper error UI.
 */
export async function callGemini(prompt, systemPrompt = "", opts = {}) {
  const { temperature = 0.7, maxTokens = 2048 } = opts;

  const messages = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: prompt });

  let lastError = null;

  for (const model of MODELS) {
    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false,
        }),
      });

      if (res.status === 429 || res.status === 503) {
        lastError = new Error(`Model ${model} rate limited`);
        continue; // try next model
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        lastError = new Error(err?.error?.message || `HTTP ${res.status}`);
        continue;
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) { lastError = new Error("Empty response"); continue; }
      return text;

    } catch (e) {
      lastError = e;
    }
  }

  throw lastError || new Error("All AI models unavailable");
}
