<div align="center">

# 🛡️ AegisRoad v3.0

### Next-Generation Civic Infrastructure Automation Platform

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Claude](https://img.shields.io/badge/Claude_Sonnet_4-Anthropic-D4A017?style=flat-square)](https://anthropic.com)
[![Avalanche](https://img.shields.io/badge/Avalanche-Fuji_Testnet-E84142?style=flat-square)](https://avax.network)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Nano-00FFAB?style=flat-square)](https://ultralytics.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**AegisRoad automates how municipal governments detect road hazards, dispatch contractors with SLA deadlines, verify repairs with photo evidence, and anchor proof-of-repair immutably on blockchain — all in one command-and-control platform.**

[🌐 Live Demo](https://aegis-road-v3.vercel.app) · [📡 API Docs](https://aegisroad-v3.onrender.com/docs) · [🔗 GitHub](https://github.com/rudrapatel1908/AegisRoad-v3)

</div>

---

## 📋 Table of Contents

- [What It Does](#-what-it-does)
- [Key Features](#-key-features)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Demo Accounts](#-demo-accounts)
- [End-to-End Workflow](#-end-to-end-workflow)
- [Module Breakdown](#-module-breakdown)
- [API Reference](#-api-reference)
- [Tech Stack](#-tech-stack)
- [Configuration](#️-configuration)
- [Blockchain Setup](#-blockchain--proof-of-repair)
- [PWA Installation](#-pwa--progressive-web-app)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🎯 What It Does

AegisRoad is a full-stack civic-tech platform that solves three interconnected problems plaguing Indian municipal infrastructure:

| Problem | AegisRoad Solution |
|---------|-------------------|
| Road defects go undetected for months | YOLOv8-Nano AI detects D00–D40 damage classes from dashcam images in real time |
| Contractor accountability is opaque | SpendWatch algorithmic scoring + immutable blockchain audit trail |
| Citizens have no transparency | Public hazard map + AegisChat AI assistant for instant civic queries |

---

## ✨ Key Features

- 🤖 **Edge AI Detection** — YOLOv8-Nano trained on RDD2022 (26,869 images) detects potholes, cracks, and surface damage with live GPS auto-pinning
- 🗺️ **Live Hazard Map** — Real-time GIS dashboard with proximity alerts and severity filtering
- 💬 **AegisChat** — Claude Sonnet 4 powered assistant grounded in live hazard data with session persistence
- 🚗 **Drive Mode** — V2I geofence alerts with bilingual voice warnings (English + Hindi) when approaching hazards
- 💰 **SpendWatch** — Algorithmic contractor efficiency scoring, budget disbursement tracking, and CSV audit export
- ⛓️ **Proof of Repair** — SHA-256 hashes anchored immutably on Avalanche Fuji Testnet
- 📱 **PWA** — Installable on Android and iOS, works offline
- 🔐 **Role-Based Auth** — Separate portals for Government Officers, Contractors, and Field Workers

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Git

### Option A — One Command (Windows)

```powershell
git clone https://github.com/rudrapatel1908/AegisRoad-v3.git
cd AegisRoad-v3
.\start-all.ps1
```

### Option B — Manual

**Terminal 1 — Backend**
```powershell
cd backend
copy .env.example .env
# Edit .env and fill in your API keys (see Configuration section)
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend**
```powershell
cd Frontend
npm install
npm run dev
```

### Access Points

| Service  | URL |
|----------|-----|
| 🌐 Frontend | http://localhost:3000 |
| 📡 Backend API | http://localhost:8000 |
| 📖 API Docs (Swagger) | http://localhost:8000/docs |

---

## 🏗️ Project Structure

```
AegisRoad-v3/
│
├── Frontend/                          React 18 + Vite PWA
│   ├── src/
│   │   ├── components/
│   │   │   ├── CommandCenter/         Government operations dashboard
│   │   │   ├── SpendWatch/            Contractor financial accountability
│   │   │   ├── HazardExplorer/        Public GIS hazard map
│   │   │   ├── EdgeAI/                YOLOv8 dashcam detection + GPS
│   │   │   ├── DriveMode/             V2I GPS alert system
│   │   │   ├── AegisChat/             Claude Sonnet 4 AI assistant
│   │   │   ├── ContractorPortal/      Contractor job management
│   │   │   ├── DriverMobile/          Field worker mobile HUD
│   │   │   ├── CitizenReport/         Public hazard reporting
│   │   │   ├── LandingPage/           Overview with live stats
│   │   │   └── AuthSystem/            JWT login + registration
│   │   ├── context/
│   │   │   ├── HazardContext.jsx      Live hazard state (30s polling)
│   │   │   └── SpendContext.jsx       Contractor data state
│   │   ├── services/
│   │   │   └── api.js                 REST client (proxied to :8000)
│   │   ├── App.jsx                    Root component + routing
│   │   └── data.js                    Seed/mock data constants
│   └── public/
│       ├── manifest.json              PWA manifest
│       ├── sw.js                      Service worker (offline support)
│       └── icons/                     PWA icons (72/96/128/192/512 + maskable)
│
├── backend/                           FastAPI + SQLite (dev) / PostgreSQL (prod)
│   ├── app/
│   │   ├── api/
│   │   │   ├── hazards.py             CRUD + PATCH status
│   │   │   ├── auth.py                JWT login + register
│   │   │   ├── contractors.py         Leaderboard + SpendWatch endpoints
│   │   │   ├── chat.py                AegisChat Claude integration
│   │   │   ├── predict.py             YOLOv8 inference proxy
│   │   │   └── proof.py               Blockchain PoR endpoints
│   │   ├── core/
│   │   │   ├── config.py              Pydantic settings (env vars)
│   │   │   └── database.py            SQLAlchemy engine + session
│   │   └── models.py                  Hazard, User, Contract, ChatSession models
│   ├── blockchain.py                  Web3 singleton + async PoR background task
│   ├── main.py                        FastAPI app + CORS + router registration
│   ├── requirements.txt
│   └── .env.example                   Environment variable template
│
├── contracts/
│   └── ProofOfRepair.sol              Solidity contract (Avalanche Fuji)
│
├── start-all.ps1                      One-command launcher (Windows)
└── README.md
```

---

## 👤 Demo Accounts

Click **Login / Sign Up → Quick Login** on the live site or use these credentials:

| Role | Username | Organization | Access |
|------|----------|--------------|--------|
| 🏛️ Government Officer | Chief Inspector Rao | Municipal Road Corp | Command Center, SpendWatch, all maps |
| 🏗️ Contractor | Sandra Arjun | BuildFast Pvt. Ltd. | Contractor Portal, job queue |
| 🔧 Field Worker | Sanjay Kumar | Eagle Eye Patrols | Driver Mobile HUD |
| 👁️ Observer | — | — | Public Map + Edge AI (no login needed) |

---

## 🔄 End-to-End Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     AEGISROAD v3.0 WORKFLOW                         │
├──────────┬──────────────────────────────────────────────────────────┤
│ STEP 1   │ DETECTION                                                │
│          │ Edge AI dashcam upload → YOLOv8 classifies D00–D40      │
│          │ Live GPS captures coordinates → hazard auto-pinned to map│
├──────────┼──────────────────────────────────────────────────────────┤
│ STEP 2   │ TRIAGE                                                   │
│          │ Government officer reviews hazard queue in Command Center │
│          │ Assigns contractor → SLA countdown timer starts          │
├──────────┼──────────────────────────────────────────────────────────┤
│ STEP 3   │ DISPATCH                                                 │
│          │ Contractor portal shows job queue + SLA deadlines        │
│          │ Penalty exposure visible before SLA breach               │
├──────────┼──────────────────────────────────────────────────────────┤
│ STEP 4   │ EXECUTION                                                │
│          │ Field worker: navigate → arrive → photo evidence         │
│          │ Driver Mobile HUD logs arrival + completion              │
├──────────┼──────────────────────────────────────────────────────────┤
│ STEP 5   │ AUDIT                                                    │
│          │ SpendWatch recalculates efficiency score (4-factor formula)│
│          │ Budget disbursement logged + CSV audit trail generated    │
├──────────┼──────────────────────────────────────────────────────────┤
│ STEP 6   │ BLOCKCHAIN ANCHORING                                     │
│          │ SHA-256(image_url + lat + lng) → submitProof() on-chain  │
│          │ TX hash written to hazards.tx_hash — immutable record    │
└──────────┴──────────────────────────────────────────────────────────┘
```

---

## 🧩 Module Breakdown

### 🤖 Edge AI — YOLOv8 Hazard Detection

- Model: YOLOv8-Nano trained on **RDD2022** dataset (26,869 images, 6 countries)
- Inference: Hosted on **Hugging Face Spaces** (Docker + FastAPI)
- Classes detected:

| Class | Type | Severity | SLA |
|-------|------|----------|-----|
| D00 | Longitudinal Crack | Low | 7 days |
| D10 | Transverse Crack | Medium | 72 hours |
| D20 | Alligator Cracking | High | 48 hours |
| D40 | Pothole | **Critical** | 24 hours |

- **Live GPS integration** — captures lat/lng on upload, auto-pins to public map
- **Reverse geocoding** — resolves road name via Nominatim API
- **Auto-report** — detected hazard created in DB and visible on map immediately

### 🚗 Drive Mode — V2I Alert System

- Real GPS tracking via `navigator.geolocation.watchPosition()`
- 500m geofence radius checks against all known hazards
- **Bilingual voice alerts** — English + Hindi via Web Speech API
- **Simulation mode** — demo NH-16 Vijayawada route for judges/presentations
- Phone vibration patterns by severity (Critical: 5 pulses, High: 3, Medium: 2)
- Push notifications when hazard detected within range

### 💬 AegisChat — AI Assistant

- Powered by **Claude Sonnet 4** (Anthropic)
- RAG-grounded: queries live hazard DB before every response
- Session persistence: full history stored in DB, restored across page reloads
- Feedback loop: thumbs up/down ratings via `POST /api/v1/chat/feedback`
- Fallback responses for off-topic queries (recipes, sports, etc.)

### 💰 SpendWatch — Financial Accountability

Efficiency score formula (PRD §6):

```
Score = (SLA_compliance × 0.40) + (Budget_efficiency × 0.30)
      + (Work_quality × 0.20) + (Civic_rating × 0.10)
```

- Live disbursement tracking per contractor
- CSV audit export with 7 columns
- Contractor leaderboard ranked by efficiency score
- SLA breach escalation with re-assignment capability

### ⛓️ Blockchain — Proof of Repair

- **Network**: Avalanche Fuji Testnet (Chain ID: 43113)
- **Contract**: `ProofOfRepair.sol` at `0xd9145CCE52D386f254917e481eB44e9943F39138`
- **Hash**: `SHA-256(image_url + "_" + lat + "_" + lng)`
- **Pipeline**: FastAPI BackgroundTask → web3.py → sign tx → broadcast → await receipt → write tx_hash to DB
- **Non-blocking**: API returns `202 Accepted` immediately; blockchain confirmation happens in background

---

## 📡 API Reference

### Hazards
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/hazards` | List all hazards with filtering |
| `POST` | `/api/hazards` | Create new hazard |
| `PATCH` | `/api/hazards/{id}` | Update status / assign contractor |

### Contractors & SpendWatch
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/contractors` | Contractor leaderboard |
| `GET` | `/api/spend/summary` | Budget summary by district |
| `PATCH` | `/api/v1/spend/contracts/{id}/disburse` | Disburse funds + recalculate score |
| `GET` | `/api/v1/spend/export` | Stream CSV audit report |

### AegisChat
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send message, get AI response |
| `GET` | `/api/v1/chat/session/{id}` | Retrieve full conversation history |
| `POST` | `/api/v1/chat/feedback` | Submit thumbs up/down rating |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login → JWT token |
| `POST` | `/api/auth/register` | Create account |

### Edge AI & Blockchain
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/predict` | Upload image → YOLOv8 inference |
| `GET` | `/api/v1/proof/health` | Blockchain connection status |
| `POST` | `/api/v1/proof/submit` | Anchor repair proof on Avalanche |

Full interactive docs: **[aegisroad-v3.onrender.com/docs](https://aegisroad-v3.onrender.com/docs)**

---

## 🧠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18, Vite 5, TailwindCSS | UI framework + styling |
| **Mapping** | Leaflet.js, react-leaflet | Interactive hazard map |
| **Charts** | Recharts | SpendWatch visualizations |
| **Backend** | FastAPI, Python 3.12 | REST API + background tasks |
| **ORM** | SQLAlchemy, Pydantic v2 | Database models + validation |
| **Database** | SQLite (dev) / PostgreSQL (prod) | Data persistence |
| **AI Model** | YOLOv8-Nano (Ultralytics) | Road defect detection |
| **AI Assistant** | Claude Sonnet 4 (Anthropic) | AegisChat RAG assistant |
| **Inference** | Hugging Face Spaces (Docker) | YOLOv8 API hosting |
| **Blockchain** | Avalanche Fuji, web3.py v7, Solidity | Proof of Repair anchoring |
| **Auth** | JWT (python-jose), bcrypt | Secure authentication |
| **PWA** | Web App Manifest, Service Worker | Mobile installability |
| **Frontend Deploy** | Vercel | Auto-deploy from GitHub |
| **Backend Deploy** | Render.com | FastAPI hosting + PostgreSQL |

---

## ⚙️ Configuration

### Backend — `backend/.env`

Copy `.env.example` to `.env` and fill in your values:

```env
# Database (SQLite default — set for PostgreSQL on Render)
DATABASE_URL=sqlite:///./aegisroad.db

# AI (get free key at console.anthropic.com)
ANTHROPIC_API_KEY=sk-ant-...

# YOLOv8 Inference (Hugging Face Space URL)
HF_SPACE_URL=https://hacksss-aegisroad-detector.hf.space

# Auth
SECRET_KEY=your-random-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Blockchain (optional — app works without these)
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
CONTRACT_ADDRESS=0xd9145CCE52D386f254917e481eB44e9943F39138
CONTRACT_ABI=[{"inputs":[{"internalType":"string","name":"_id","type":"string"},{"internalType":"string","name":"_proofHash","type":"string"}],"name":"submitProof","outputs":[],"stateMutability":"nonpayable","type":"function"}]
PRIVATE_KEY=0x...your_fuji_wallet_private_key
```

### Frontend — `Frontend/.env`

```env
VITE_API_URL=http://localhost:8000
```

For production (Vercel), set `VITE_API_URL` to your Render backend URL.

---

## ⛓️ Blockchain — Proof of Repair

### How It Works

```
Repair completed
      ↓
POST /api/v1/proof/submit
      ↓
FastAPI returns 202 immediately (non-blocking)
      ↓
BackgroundTask: SHA-256(image_url + lat + lng)
      ↓
web3.py builds + signs transaction
      ↓
broadcast to Avalanche Fuji Testnet
      ↓
await receipt confirmation
      ↓
UPDATE hazards SET tx_hash = '0x...' WHERE id = ticket_id
```

### Setup (5 minutes)

1. **Add Fuji to MetaMask** — Network Name: `Avalanche Fuji Testnet` · RPC: `https://api.avax-test.network/ext/bc/C/rpc` · Chain ID: `43113`
2. **Get free test AVAX** — [faucet.avax.network](https://faucet.avax.network)
3. **Deploy contract** — open [remix.ethereum.org](https://remix.ethereum.org) → paste `contracts/ProofOfRepair.sol` → compile → deploy on Injected Provider
4. **Fill `.env`** — set `CONTRACT_ADDRESS`, `PRIVATE_KEY`, `CONTRACT_ABI`
5. **Verify** — `GET /api/v1/proof/health` should return `"connected": true`

> **Note**: The app runs fully without blockchain credentials. Blockchain features are silently disabled when env vars are missing — no errors, no crashes.

---

## 📱 PWA — Progressive Web App

AegisRoad is installable as a native-like app on both platforms:

**Android (Chrome)**
- Chrome automatically shows "Add to Home Screen" banner
- Requires HTTPS (works on Vercel deployment)
- Full offline support via service worker

**iOS (Safari)**
- Tap **Share** → **Add to Home Screen**
- Full-screen standalone mode, no browser chrome

**Icons included**: 72×72, 96×96, 128×128, 192×192, 512×512 + maskable variants

---

## 🌐 Deployment

### Frontend → Vercel

```
Repository:       rudrapatel1908/AegisRoad-v3
Root Directory:   Frontend
Framework:        Vite
Build Command:    npm run build
Output Directory: dist

Environment Variables:
  VITE_API_URL = https://your-render-backend.onrender.com
  VITE_HF_SPACE_URL = https://hacksss-aegisroad-detector.hf.space
```

### Backend → Render.com

```
Repository:       rudrapatel1908/AegisRoad-v3
Root Directory:   backend
Runtime:          Python 3
Build Command:    pip install -r requirements.txt
Start Command:    uvicorn main:app --host 0.0.0.0 --port $PORT

Environment Variables: (all from backend/.env)
```

### AI Model → Hugging Face Spaces

```
Space: hacksss/AegisRoad-Detector
SDK:   Docker
Model: best.pt (YOLOv8-Nano trained on RDD2022)
```

---

## 🗺️ Roadmap

- [ ] WhatsApp/Telegram alert integration (Twilio)
- [ ] RAG with pgvector for semantic hazard search
- [ ] Multi-city dataset expansion (BIMSTEC countries)
- [ ] Native mobile app (React Native)
- [ ] Mainnet deployment (Avalanche C-Chain)
- [ ] Real-time WebSocket hazard updates

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built for the IIT Madras National Road Safety Hackathon 2026 — RoadWatch Track**

*Modernizing civic infrastructure · Holding contractors accountable · Saving taxpayer budgets across India and BIMSTEC nations*

[🌐 Live Demo](https://aegis-road-v3.vercel.app) · [📡 API](https://aegisroad-v3.onrender.com/docs) · [⛓️ Contract](https://testnet.snowtrace.io/address/0xd9145CCE52D386f254917e481eB44e9943F39138)

</div>