<div align="center">

# 🛡️ SmartGuard
**Next-Generation AI-Powered Web3 Security Platform**

[![Live Demo](https://img.shields.io/badge/🔴_Live_Demo-smartguard--omega.vercel.app-a8ff6c?style=for-the-badge&logoColor=black)](https://smartguard-omega.vercel.app/)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PyTorch](https://img.shields.io/badge/PyTorch-%23EE4C2C.svg?style=for-the-badge&logo=PyTorch&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Hugging Face](https://img.shields.io/badge/-HuggingFace-FDEE21?style=for-the-badge&logo=HuggingFace&logoColor=black)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

SmartGuard is an advanced, production-ready Web3 Security Platform that audits Solidity smart contracts using a powerful **Hybrid Dual-Engine Architecture**. It combines the deep predictive capabilities of a trained **GraphCodeBERT Neural Network** with aggressive Static Analysis heuristics to provide highly defensible, mathematically grounded security verdicts before deployment.

[**View the Live Application**](https://smartguard-omega.vercel.app/)

</div>

<br />

---

## ✨ Key Features

- **Dual-Engine Security Audit**: 
  - **Neural Threat Prediction:** A fine-tuned `PyTorch` sequence classifier processes raw smart contract syntax trees to calculate a binary vulnerability probability with ~88.4% accuracy.
  - **Static Analysis Engine:** A decoupled static engine runs concurrently to flag hard-rule violations (e.g., Reentrancy, Missing Access Control, outdated compiler pragmas).
- **Defensible Hybrid Scoring**: The system generates a highly reliable `0-100` Final Audit Verdict by intelligently weighting ML confidence bonuses against high-severity static penalties.
- **Generative AI Remediation**: Powered by **Meta LLaMA 3.3 (Groq API)**, the platform contextually synthesizes the Tri-Layer audit results (Score, ML Signal, Static Findings) and provides line-by-line developer remediation and secure code patches in a seamless chat interface.
- **Premium Web3 Interface**: A strictly "glassmorphic" React UI with native WalletConnect/RainbowKit support, dark mode, and dynamic CSS grid layouts.

---

## 🏗️ Technical Architecture

SmartGuard is explicitly engineered to bypass free-tier bottlenecks by strategically splitting the workload across specialized cloud providers:

### 1. Presentation Layer (Vercel)
- **Tech Stack:** React.js, Vite, React Router DOM, Vanilla CSS.
- **Hosting:** Deployed edge-side via Vercel for instant load times and dynamic environment variable injection handling.

### 2. Inference Layer (Hugging Face Spaces)
- **Tech Stack:** Python 3.10+, FastAPI, PyTorch, Transformers.
- **Hosting:** Standard free-tier services (like Render) enforce 512MB RAM limits, causing massive ML models to instantly crash `(OOM Kill)`. **SmartGuard's backend is explicitly Dockerized and deployed on Hugging Face Spaces.** This grants the FastAPI server access to **16GB of RAM**, allowing the intensive PyTorch tensor operations and GraphCodeBERT processing to run blazingly fast in production.

---

## 🚀 Local Development Setup

If you want to run SmartGuard locally, follow these steps:

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/SmartGuard.git
cd SmartGuard
```

### 2. Backend Setup (Inference Server)
The backend requires Python 3.9+ and `pip`.
```bash
cd backend
pip install -r requirements.txt

# Run the FastAPI server locally on port 8000
npm run start-backend 
# (Or manually execute: cd backend && uvicorn main:app --reload --port 8000)
```

### 3. Frontend Setup (React Application)
```bash
cd frontend
npm install

# Create a .env file and add your backend and API keys:
# VITE_BACKEND_URL=http://127.0.0.1:8000
# VITE_GROQ_API_KEY=your_groq_api_key_here
# VITE_FIREBASE_API_KEY=your_firebase_config_here

# Start the Vite development server
npm run dev
```

---

## ☁️ Deployment Guide

To deploy your own clone of SmartGuard to production:

1. **Deploying the Backend (Hugging Face Spaces):**
   - Create a new **Docker** Space on Hugging Face.
   - Upload the entire contents of the `/backend` folder (including the `Dockerfile`, `main.py`, `requirements.txt`, and the full `model/` directory) into the root of the Space.
   - Hugging Face will automatically detect the Dockerfile, bind to port `7860`, and stand up your powerful API endpoint.

2. **Deploying the Frontend (Vercel):**
   - Push your code to GitHub and connect the repository to Vercel.
   - In Vercel's Environment Variables settings, set `VITE_BACKEND_URL` to your direct Hugging Face Space API URL (e.g., `https://yourusername-smartguard-backend.hf.space`).
   - Trigger a deployment.

---
<div align="center">
<i>Built with ❤️ for a safer Web3 ecosystem.</i>
</div>
