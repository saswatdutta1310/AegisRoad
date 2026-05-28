# 🛡️ AegisRoad v3.0

> AI-powered road safety platform for IIT Madras Road Safety Hackathon 2026 — RoadWatch Track

## ⚡ Quick Start (One Command)

### Windows
Double-click `start.bat` OR run in terminal:

start.bat

### Manual (Mac/Linux)
```bash
# Terminal 1 — Backend
cd backend && pip install -r requirements.txt && uvicorn main:app --reload

# Terminal 2 — Frontend + Mock Server
cd frontend && npm install && npm run dev
```

Open http://localhost:5173 in your browser.

## 🧩 What You'll See

| Module | URL | Description |
|---|---|---|
| Hazard Map | localhost:5173 | Live pothole map of Andhra Pradesh |
| Edge AI | localhost:5173/edgeai | Upload dashcam image → YOLOv8 detection |
| SpendWatch | localhost:5173/spend | Contractor accountability dashboard |
| AegisChat | Bottom right bubble | Claude-powered road safety assistant |
| API Docs | localhost:8000/docs | FastAPI Swagger UI |

## 🤖 AI Model

- Architecture: YOLOv8-Nano
- Trained on: RDD2022 (26,869 images, 6 countries including India)
- Classes: D00 · D10 · D20 · D40
- Live inference: https://hacksss-aegisroad-detector.hf.space

## 🗂️ Project Structure
aegisroad/
├── frontend/          React 18 + Vite + Leaflet
├── backend/           FastAPI + PostgreSQL
├── hf-space/          YOLOv8 inference server (Hugging Face)
├── kaggle-notebook/   Model training script
├── docs/              Setup guide
└── start.bat          ← ONE CLICK STARTUP

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Leaflet.js, CSS Modules |
| Backend | FastAPI, PostgreSQL, pgvector |
| AI Model | YOLOv8-Nano, trained on RDD2022 |
| LLM | Claude Sonnet via Anthropic API |
| Inference | Hugging Face Spaces (Docker) |
| Deployment | Vercel + Render.com + HF Spaces |

## 📋 Requirements

- Node.js 18+
- Python 3.11+
- Git