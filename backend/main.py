"""
SmartGuard FastAPI Backend
==========================
Serves the trained GraphCodeBERT model for smart contract vulnerability detection.
Run from any directory:  uvicorn main:app --reload --port 8000
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from pathlib import Path
from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
from transformers import AutoTokenizer, BertForSequenceClassification

# -- Absolute paths (works regardless of cwd) ----------------------------------
BASE_DIR       = Path(__file__).parent
MODEL_PATH     = BASE_DIR / "model" / "smartguard_best_model.pt"
TOKENIZER_PATH = BASE_DIR / "model" / "smartguard_tokenizer"

# -- App -----------------------------------------------------------------------
app = FastAPI(
    title="SmartGuard API",
    description="AI-powered smart contract vulnerability detection",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -- Device --------------------------------------------------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# -- Load model ----------------------------------------------------------------
tokenizer = None
model     = None
model_ok  = False

try:
    print("[*] Loading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(str(TOKENIZER_PATH))

    print("[*] Loading model weights...")
    model = BertForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=2)
    state_dict = torch.load(str(MODEL_PATH), map_location=device)
    model.load_state_dict(state_dict, strict=False)
    model.to(device)
    model.eval()
    model_ok = True
    print("[OK] SmartGuard model loaded successfully!")
except Exception as e:
    print(f"[ERROR] Model load error: {e}")
    print("   The /analyze endpoint will return an error until the model is available.")


# -- Vulnerability heuristics --------------------------------------------------
VULN_PATTERNS = [
    {
        "check": lambda c: any(t in c for t in [".call{value:", "msg.sender.call"]) and "balances[msg.sender" in c,
        "name":  "Reentrancy Attack",
        "risk":  "HIGH",
        "desc":  "State variables are updated after an external call. An attacker can re-enter the function and drain funds. Fix: use the Checks-Effects-Interactions pattern.",
    },
    {
        "check": lambda c: "function " in c and "onlyOwner" not in c and "require(msg.sender ==" not in c,
        "name":  "Missing Access Control",
        "risk":  "MEDIUM",
        "desc":  "Critical functions lack ownership or role-based checks. Any address can call privileged operations. Fix: add an onlyOwner modifier or OpenZeppelin AccessControl.",
    },
    {
        "check": lambda c: any(t in c for t in ["pragma solidity ^0.7", "pragma solidity ^0.6", "pragma solidity ^0.5"]),
        "name":  "Integer Overflow / Underflow",
        "risk":  "MEDIUM",
        "desc":  "Solidity <0.8 does not protect against arithmetic overflow. Use SafeMath or upgrade to Solidity >=0.8.0.",
    },
    {
        "check": lambda c: "tx.origin" in c,
        "name":  "tx.origin Authentication",
        "risk":  "HIGH",
        "desc":  "Using tx.origin for authentication is unsafe. A malicious contract can trick users into authorizing it. Use msg.sender instead.",
    },
    {
        "check": lambda c: "selfdestruct" in c or "suicide(" in c,
        "name":  "Selfdestruct Vulnerability",
        "risk":  "HIGH",
        "desc":  "selfdestruct can permanently destroy the contract. Ensure it is behind strict access control.",
    },
    {
        "check": lambda c: "block.timestamp" in c or " now " in c,
        "name":  "Timestamp Dependence",
        "risk":  "LOW",
        "desc":  "block.timestamp can be manipulated by miners within ~30 seconds. Avoid for critical randomness or time-locks.",
    },
    {
        "check": lambda c: "delegatecall" in c,
        "name":  "Unsafe Delegatecall",
        "risk":  "HIGH",
        "desc":  "delegatecall runs external code in the callers storage context. A malicious target can overwrite storage or drain funds.",
    },
]


def heuristic_issues(code: str) -> list:
    found = []
    for p in VULN_PATTERNS:
        try:
            if p["check"](code):
                found.append({"name": p["name"], "risk": p["risk"], "desc": p["desc"], "line": None})
        except Exception:
            pass
    return found


# -- Endpoints -----------------------------------------------------------------

@app.get("/health")
async def health():
    return {
        "status":  "ok",
        "model":   "loaded" if model_ok else "unavailable",
        "device":  str(device),
        "version": "1.0.0"
    }


@app.post("/analyze")
async def analyze_code(code: str = Form(...)):
    if not code.strip():
        raise HTTPException(status_code=400, detail="No contract code provided.")

    if not model_ok:
        raise HTTPException(status_code=503, detail="Model not loaded. Check backend logs.")

    # ML inference
    inputs = tokenizer(
        code,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=512
    ).to(device)

    with torch.no_grad():
        outputs = model(**inputs)
        probs   = torch.nn.functional.softmax(outputs.logits, dim=-1)
        pred    = torch.argmax(probs, dim=-1).item()   # 0=SAFE, 1=VULNERABLE
        conf    = float(probs[0][pred].item())

    is_vulnerable  = pred == 1
    raw_safe_prob  = float(probs[0][0].item())
    score          = max(0, min(100, int(raw_safe_prob * 100)))

    issues = heuristic_issues(code) if is_vulnerable else []

    if is_vulnerable and not issues:
        issues = [{
            "name": "Unclassified Vulnerability",
            "risk": "HIGH",
            "desc": "The AI model detected vulnerability patterns not matched by heuristic rules. Manual review recommended.",
            "line": None,
        }]

    return {
        "verdict":    "VULNERABLE" if is_vulnerable else "SAFE",
        "score":      score,
        "confidence": round(conf, 4),
        "issues":     issues,
        "model":      "SmartGuard-BERT v1",
        "device":     str(device),
    }


# -- Entry point ---------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)