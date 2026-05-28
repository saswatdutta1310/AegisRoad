<p align="center">
  <img src="https://img.shields.io/badge/AegisRoad-v3.0-0ea5e9?style=for-the-badge&logo=shield&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/FastAPI-0.136-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/YOLOv8-Nano-ff6f00?style=for-the-badge&logo=yolo&logoColor=white" />
  <img src="https://img.shields.io/badge/Claude-Sonnet_4-cc785c?style=for-the-badge&logo=anthropic&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-v4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

# 🛡️ AegisRoad v3.0 — AI-Powered Municipal Road Safety Platform

> **Real-time hazard intelligence · Contractor fiscal auditing · Edge AI defect detection · Conversational AI assistant**

AegisRoad is a **full-stack civic-tech platform** that empowers municipal officers, field drivers, and contractors with real-time road hazard intelligence, transparent spend tracking, and AI-powered defect detection. Built for the Indian civic infrastructure domain,  combines with **computer vision (YOLOv8)**, **large language models (Claude Sonnet 4)**, and **modern web technologies** into a unified command-and-control dashboard.

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph CLIENT["🖥️ Frontend — React 19 + Vite + Tailwind v4"]
        LP[🏠 Landing Page]
        CC[📊 Command Center]
        SW[💰 SpendWatch]
        HE[🗺️ Hazard Explorer]
        EA[📷 Edge AI]
        AC[🤖 AegisChat]
        DM[📱 Driver Mobile]
        CP[🔧 Contractor Portal]
        AUTH[🔐 Auth System]
    end

    subgraph API["⚡ Backend — FastAPI + Python 3.11"]
        HAZ["/api/hazards"]
        CON["/api/contractors"]
        PRE["/api/predict"]
        CHT["/api/chat"]
    end

    subgraph AI["🧠 AI Services"]
        YOLO["YOLOv8-Nano\n(Hugging Face Spaces)"]
        CLAUDE["Claude Sonnet 4\n(Anthropic API)"]
    end

    CC & HE & DM -->|GET/POST| HAZ
    SW & CP -->|GET| CON
    EA -->|POST image| PRE
    AC -->|POST message| CHT

    PRE -->|proxy image| YOLO
    CHT -->|LLM call| CLAUDE

    style CLIENT fill:#0f172a,stroke:#38bdf8,color:#e2e8f0
    style API fill:#0f172a,stroke:#22c55e,color:#e2e8f0
    style AI fill:#0f172a,stroke:#f59e0b,color:#e2e8f0
```

---

## 🔄 Data Flow Pipeline

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant FE as 🖥️ React Frontend
    participant BE as ⚡ FastAPI Backend
    participant HF as 🤖 HuggingFace (YOLOv8)
    participant AN as 🧠 Anthropic (Claude)

    Note over U,AN: Edge AI — Hazard Detection Flow
    U->>FE: Upload dashcam image
    FE->>BE: POST /api/predict (multipart)
    BE->>HF: Proxy image to HF Space
    HF-->>BE: Detections (class, bbox, confidence)
    BE-->>FE: JSON response
    FE->>U: Render bounding boxes + severity

    Note over U,AN: AegisChat — Conversational AI Flow
    U->>FE: Type question
    FE->>BE: POST /api/chat {message, history}
    BE->>AN: Claude Sonnet 4 API call
    AN-->>BE: AI-generated response
    BE-->>FE: {reply: "..."}
    FE->>U: Display assistant message

    Note over U,AN: Hazard Reporting Flow
    U->>FE: Submit hazard report
    FE->>BE: POST /api/hazards {road, lat, lng, severity}
    BE-->>FE: Created hazard with SLA
    FE->>U: Live update on map + dashboard
```

---

## 📁 Project Structure

```mermaid
graph LR
    subgraph ROOT["📂 Road_Show"]
        direction TB
        GI[".gitignore"]

        subgraph FE["📂 Frontend/"]
            direction TB
            FE_APP["src/App.jsx — App shell & navigation"]
            FE_MAIN["src/main.jsx — React bootstrap"]
            FE_CSS["src/index.css — Tailwind + theme tokens"]
            FE_DATA["src/data.js — Static seed data"]

            subgraph COMP["📂 components/"]
                C1["CommandCenter.jsx"]
                C2["SpendWatch.jsx"]
                C3["HazardExplorer.jsx"]
                C4["EdgeAI.jsx"]
                C5["AegisChat.jsx"]
                C6["DriverMobile.jsx"]
                C7["ContractorPortal.jsx"]
                C8["LandingPage.jsx"]
                C9["AuthSystem.jsx"]
                C10["InteractiveMap.jsx"]
            end

            subgraph CTX["📂 context/"]
                CX1["HazardContext.jsx"]
                CX2["SpendContext.jsx"]
            end

            subgraph SVC["📂 services/"]
                SV1["api.js — API client + adapters"]
            end
        end

        subgraph BE["📂 backend/"]
            direction TB
            BE_MAIN["main.py — FastAPI entrypoint"]
            BE_REQ["requirements.txt"]

            subgraph BAPI["📂 app/api/"]
                BA1["hazards.py — CRUD hazard endpoints"]
                BA2["contractors.py — Contractor data"]
                BA3["predict.py — YOLOv8 proxy"]
                BA4["chat.py — Claude Sonnet 4"]
            end

            subgraph BCORE["📂 app/core/"]
                BC1["config.py — Pydantic settings"]
            end
        end
    end

    style ROOT fill:#020617,stroke:#334155,color:#e2e8f0
    style FE fill:#0c1631,stroke:#38bdf8,color:#e2e8f0
    style BE fill:#0c1631,stroke:#22c55e,color:#e2e8f0
    style COMP fill:#1e293b,stroke:#475569,color:#cbd5e1
    style CTX fill:#1e293b,stroke:#475569,color:#cbd5e1
    style SVC fill:#1e293b,stroke:#475569,color:#cbd5e1
    style BAPI fill:#1e293b,stroke:#475569,color:#cbd5e1
    style BCORE fill:#1e293b,stroke:#475569,color:#cbd5e1
```

---

## 🚀 Features

### 📊 Command Center
Real-time incident monitoring dashboard with hazard ticket creation, SLA countdown timers, escalation controls, and operational visibility across all districts.

### 💰 SpendWatch Dashboard
Contract budget analytics with disbursement tracking, contractor efficiency scoring, overspend detection, and fiscal transparency charts powered by Recharts.

### 🗺️ Hazard Explorer
Interactive GIS-powered road incident map with severity-based filtering (Critical/High/Medium/Low), status toggles, location search, and clustered markers.

### 📷 Edge AI — YOLOv8 Defect Detection
Upload dashcam footage and receive instant road defect detections. The YOLOv8-Nano model classifies pavement distress (D00–D40) with bounding boxes and confidence scores. Runs on Hugging Face Spaces for zero-infrastructure inference.

### 🤖 AegisChat — Claude Sonnet 4 Assistant
Conversational AI assistant that answers questions about active hazards, contractor performance, budget utilisation, and SLA compliance. Powered by Anthropic's Claude Sonnet 4 with full conversation history.

### 📱 Driver Mobile Panel
Field-officer interface for reporting hazards on-the-go, viewing assigned repair tasks, and updating ticket statuses from the ground.

### 🔧 Contractor Portal
Role-specific dashboard for contractors to view assigned repair jobs, track SLA deadlines, update work progress, and review performance scores.

### 🔐 Authentication System
Simulated role-based authentication with support for Officer, Driver, and Contractor personas. Each role unlocks a different dashboard perspective.

---

## 🧠 AI Models

| Model | Purpose | Hosted On | Integration |
|-------|---------|-----------|-------------|
| **YOLOv8-Nano** | Road surface defect detection (D00–D40 pavement distress classification) | Hugging Face Spaces | `POST /api/predict` → proxy to HF Space |
| **Claude Sonnet 4** | Conversational AI for hazard/spend queries and audit summaries | Anthropic API | `POST /api/chat` → Anthropic SDK |

### Defect Classification Codes

| Code | Defect Type | SLA (Hours) |
|------|-------------|-------------|
| `D40` | Severe pothole / structural failure | 24h |
| `D20` | Longitudinal crack / major wear | 48h |
| `D10` | Lateral crack / surface degradation | 72h |
| `D00` | Minor cosmetic defect | 96h |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 6, Tailwind CSS v4 |
| **Backend** | FastAPI, Python 3.11, Uvicorn |
| **AI/ML** | YOLOv8-Nano (ONNX), Claude Sonnet 4 (Anthropic) |
| **Charts** | Recharts |
| **Maps** | Leaflet / Google Maps API |
| **HTTP Client** | httpx (backend), fetch (frontend) |
| **State Mgmt** | React Context API (HazardContext, SpendContext) |
| **Notifications** | React Toastify |
| **Styling** | Tailwind CSS v4 + custom glassmorphism utilities |

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.11
- **Anthropic API Key** (for AegisChat)

### 1. Clone the Repository

```bash
git clone https://github.com/saswatdutta1310/Road_Show.git
cd Road_Show
```

### 2. Start the Backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
ANTHROPIC_API_KEY=sk-ant-xxxxx
HF_SPACE_URL=https://hacksss-aegisroad-detector.hf.space
DATABASE_URL=postgresql://user:password@host:5432/aegisroad
```

Start the server:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

> The API docs will be available at `http://localhost:8000/docs`

### 3. Start the Frontend

Open a **new terminal**:

```bash
cd Frontend
npm install
npm run dev
```

> The app will be available at `http://localhost:3000`

### 4. Verify Everything Works

```mermaid
graph LR
    A["Open localhost:3000"] --> B["Navigate tabs"]
    B --> C{"Test each module"}
    C --> D["📊 Command Center — loads hazards?"]
    C --> E["📷 Edge AI — upload an image"]
    C --> F["🤖 AegisChat — ask a question"]
    C --> G["💰 SpendWatch — shows contractors?"]
    D & E & F & G --> H["✅ All systems go!"]

    style H fill:#16a34a,stroke:#15803d,color:#fff
```

---

## 🌐 API Reference

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|-------------|
| `GET` | `/api/hazards` | List all active hazards | — |
| `POST` | `/api/hazards` | Create a new hazard report | `{road_name, lat, lng, cls, severity}` |
| `GET` | `/api/contractors` | List all contractors (sorted by score) | — |
| `GET` | `/api/contractors/{id}` | Get contractor by ID | — |
| `POST` | `/api/predict` | Run YOLOv8 inference on uploaded image | `multipart/form-data (file)` |
| `POST` | `/api/chat` | Send message to Claude Sonnet 4 | `{message, history[]}` |

---

## 🚢 Deployment

```mermaid
graph TB
    subgraph PROD["☁️ Production Deployment"]
        direction LR
        subgraph RENDER["Render.com"]
            BE_PROD["FastAPI Backend\nRoot: backend/\nuvicorn main:app"]
        end

        subgraph VERCEL["Vercel"]
            FE_PROD["React Frontend\nRoot: Frontend/\nnpm run build"]
        end

        subgraph HF["Hugging Face"]
            MODEL["YOLOv8-Nano\nSpaces Inference"]
        end
    end

    FE_PROD -->|VITE_API_URL| BE_PROD
    BE_PROD -->|HF_SPACE_URL| MODEL

    style PROD fill:#020617,stroke:#334155,color:#e2e8f0
    style RENDER fill:#0f172a,stroke:#22c55e,color:#e2e8f0
    style VERCEL fill:#0f172a,stroke:#38bdf8,color:#e2e8f0
    style HF fill:#0f172a,stroke:#f59e0b,color:#e2e8f0
```

### Deploy Backend (Render.com — Free Tier)

1. Push repo to GitHub
2. Create a **Web Service** on [Render.com](https://render.com)
3. Set **Root Directory** → `backend`
4. **Build Command** → `pip install -r requirements.txt`
5. **Start Command** → `uvicorn main:app --host 0.0.0.0 --port 10000`
6. Add environment variables: `ANTHROPIC_API_KEY`, `HF_SPACE_URL`

### Deploy Frontend (Vercel — Free Tier)

1. Import repo on [Vercel.com](https://vercel.com)
2. Set **Root Directory** → `Frontend`
3. **Framework Preset** → Vite
4. Add environment variable: `VITE_API_URL` → your Render backend URL
5. Deploy!

---

## 🔒 Security

- **API keys are never committed** — `.gitignore` excludes `backend/.env`
- **GitHub Push Protection** is enabled — secrets are blocked at push time
- **CORS** is configured via FastAPI middleware
- **Environment secrets** should be set via your hosting provider's dashboard (Render/Vercel), not in code

---

## 🗺️ Roadmap

- [ ] PostgreSQL + pgvector for persistent hazard storage and vector search
- [ ] Real-time WebSocket updates for live hazard feeds
- [ ] Mobile-responsive PWA for field officers
- [ ] Multi-district map with GeoJSON boundary overlays
- [ ] Automated SLA escalation email/SMS alerts
- [ ] RAG-based AegisChat with embedded hazard knowledge base
- [ ] Contractor invoice upload with OCR extraction

---

## 👥 Team

Built with ❤️ for civic infrastructure by **Team AegisRoad**

---

## 📝 License

This project is for educational and hackathon demonstration purposes.
