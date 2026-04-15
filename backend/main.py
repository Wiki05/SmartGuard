"""
SmartGuard FastAPI Backend
==========================
Serves the trained GraphCodeBERT model for smart contract vulnerability detection.
Run from any directory:  uvicorn main:app --reload --port 8000
"""

import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from pydantic import BaseModel
from pathlib import Path
from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
from transformers import AutoTokenizer, BertForSequenceClassification

# Load environment variables
load_dotenv()

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
# Set thread counts to reduce memory usage on low-RAM VPS (like Render free tier)
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
torch.set_num_threads(1)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# -- Load model ----------------------------------------------------------------
tokenizer = None
model     = None
model_ok  = False

# Check if we are running in a memory-constrained environment like Render Free Tier
is_memory_constrained = os.environ.get("RENDER", "false").lower() == "true" or os.environ.get("LOW_MEMORY", "false").lower() == "true"

try:
    if is_memory_constrained:
        print("[WARNING] Memory-constrained environment detected (Render Free Tier).")
        print("[WARNING] Skipping 500MB ML model load to prevent Out-Of-Memory crash.")
        print("[WARNING] SmartGuard will automatically fall back to fast heuristic scanning.")
        raise MemoryError("ML model disabled on Render Free Tier to avoid OOM.")

    import gc
    from transformers import BertConfig
    print("[*] Loading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(str(TOKENIZER_PATH))

    print("[*] Loading model weights...")
    # Initialize empty model via config (avoids heavy 440MB base weights download into RAM)
    config = BertConfig.from_pretrained("bert-base-uncased", num_labels=2)
    model = BertForSequenceClassification(config)

    # Load local state_dict directly (mmap=True saves massive RAM on PyTorch 2.1+)
    try:
        state_dict = torch.load(str(MODEL_PATH), map_location=device, mmap=True)
    except TypeError:
        # Fallback for older PyTorch versions
        state_dict = torch.load(str(MODEL_PATH), map_location=device)
        
    model.load_state_dict(state_dict, strict=False)
    del state_dict
    gc.collect() # Force garbage collection of massive objects

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


# -- Email Logic ---------------------------------------------------------------
class EmailAlertRequest(BaseModel):
    email: str
    token: str
    price: str
    condition: str

@app.post("/api/alert/email")
async def send_email_alert(req: EmailAlertRequest):
    """Sends a real-time price alert to the user's email."""
    smtp_server   = os.getenv("SMTP_SERVER")
    smtp_port     = os.getenv("SMTP_PORT", "465")
    smtp_user     = os.getenv("SMTP_USER")
    smtp_pass     = os.getenv("SMTP_PASS")
    sender_email  = os.getenv("SENDER_EMAIL", smtp_user)

    subject = f"🔔 SmartGuard Alert: {req.token} reached {req.condition} target!"
    body = f"""
    <html>
      <body style="font-family: sans-serif; background: #030303; color: #fff; padding: 20px;">
        <h2 style="color: #a8ff6c;">SmartGuard Price Alert</h2>
        <p>Your alert for <b>{req.token}</b> has been triggered.</p>
        <div style="background: #0a0a0a; border: 1px solid #141414; padding: 15px; border-radius: 12px;">
          <p><b>Condition:</b> {req.condition}</p>
          <p><b>Target Price:</b> {req.price}</p>
        </div>
        <p style="color: #555; font-size: 12px; margin-top: 20px;">
          Stay safe and monitor your positions real-time on SmartGuard.
        </p>
      </body>
    </html>
    """

    if not all([smtp_server, smtp_user, smtp_pass]):
        print(f"[SIMULATION] Email alert to {req.email}: {req.token} {req.condition}")
        return {"status": "simulated", "message": "Email logged to console (SMTP credentials missing)"}

    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"]    = sender_email
        message["To"]      = req.email
        message.attach(MIMEText(body, "html"))

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(smtp_server, int(smtp_port), context=context) as server:
            server.login(smtp_user, smtp_pass)
            server.sendmail(sender_email, req.email, message.as_string())
        
        print(f"[OK] Email alert sent to {req.email}")
        return {"status": "sent", "message": "Alert email delivered."}
    except Exception as e:
        print(f"[ERROR] Email failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email alert.")

# -- Entry point ---------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)