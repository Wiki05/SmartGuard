# 🛡️ SmartGuard: Web3 Security Auditor

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PyTorch](https://img.shields.io/badge/PyTorch-%23EE4C2C.svg?style=for-the-badge&logo=PyTorch&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Hugging Face](https://img.shields.io/badge/-HuggingFace-FDEE21?style=for-the-badge&logo=HuggingFace&logoColor=black)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

**SmartGuard** is an advanced, production-ready Web3 Security Platform that audits Solidity smart contracts using a powerful **Hybrid Dual-Engine Architecture**. It combines the deep predictive capabilities of a trained `GraphCodeBERT` Neural Network with aggressive Static Analysis heuristics to provide highly defensible, mathematically grounded security verdicts.

---

## ✨ Key Features

- **Dual-Engine Security Audit**: 
  - **Neural Threat Prediction:** A fine-tuned `PyTorch` sequence classifier processes raw smart contract tokens to calculate a binary vulnerability probability.
  - **Static Analysis Engine:** A decoupled static engine runs concurrently to flag hard-rule violations (e.g., Reentrancy, Missing Access Control).
- **Defensible Hybrid Scoring**: The system generates a highly reliable `0-100` Final Audit Verdict by intelligently weighting ML confidence bonuses against high-severity static penalties.
- **AI Expert Remediation**: Powered by Google Gemini, the platform contextually synthesizes the Tri-Layer audit results (Score, ML Signal, Static Findings) and provides line-by-line developer remediation in a seamless chat interface.

---

## 🏗️ Technical Architecture & Hosting

This project is specifically engineered to bypass local and free-tier bottlenecks securely by splitting the workload across two specialized cloud providers:

### 1. Frontend (Vercel)
- **Tech Stack:** React.js, Vite, Vanilla CSS.
- **Hosting:** Deployed edge-side via Vercel for instant load times and dynamic environment variable injection handling.

### 2. Backend (Hugging Face Spaces)
- **Tech Stack:** Python, FastAPI, PyTorch, Transformers.
- **Hosting:** Standard free-tier services (like Render) enforce 512MB RAM limits, causing massive ML models to instantly crash `(OOM Kill)`. **SmartGuard's backend is specifically Dockerized and deployed on Hugging Face Spaces.** This grants the FastAPI server access to **16GB of Free RAM**, allowing the intensive `500MB` model weights and PyTorch tensor operations to run blazingly fast in production.

---

## 🚀 Local Development Setup

If you want to run SmartGuard locally, follow these steps:

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/SmartGuard.git
cd SmartGuard
```

### 2. Backend Setup
The backend requires Python 3.9+ and pip.
```bash
cd backend
pip install -r requirements.txt

# Ensure that the model weights are downloaded and placed in the /model directory:
# - backend/model/smartguard_best_model.pt
# - backend/model/smartguard_tokenizer/...

# Run the FastAPI server locally
npm run start-backend 
# (Or manually: cd backend && uvicorn main:app --reload --port 8000)
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create a .env file and add your backend and API keys:
# VITE_BACKEND_URL=http://127.0.0.1:8000
# VITE_GEMINI_API_KEY=your_key_here
# VITE_FIREBASE_API_KEY=your_firebase_config_here

# Start the Vite development server
npm run dev
```

---

## ☁️ Deployment Guide

To mimic the production environment:

1. **Backend to Hugging Face:**
   - Create a new **Docker** Space on Hugging Face.
   - Upload the entire contents of the `/backend` folder (including the `Dockerfile`, `main.py`, `requirements.txt`, and the full `model/` directory) into the root of the Space.
   - Hugging Face will automatically detect the Dockerfile, bind to port `7860`, and stand up your powerful 16GB API endpoint.

2. **Frontend to Vercel:**
   - Push your code to GitHub and connect the repo to Vercel.
   - In Vercel's Environment Variables settings, set `VITE_BACKEND_URL` to your hidden, direct Hugging Face Space API URL (e.g., `https://yourusername-smartguard-backend.hf.space`).
   - Trigger a deploy.

---
*Built with ❤️ for Web3 Security.*
