<div align="center">
  <img src="https://img.icons8.com/color/96/000000/road-closure.png" alt="AegisRoad Logo" />
  
  # AegisRoad 🛡️🛣️
  **Next-Generation-Civic Infrastructure Automation Platform**
  
  [![React](https://img.shields.io/badge/React-19.x-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-3.0-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
</div>

<br />

AegisRoad automates how municipal governments detect road hazards, assign contractors with SLA deadlines, verify repairs with photo evidence, and audit public spend.

AegisRoad is a **full-stack civic-tech platform** for municipal officers, field drivers, and contractors — combining **YOLOv8** defect detection, **Claude Sonnet 4** (AegisChat), and role-based dashboards into one command-and-control system.

---

## 🚀 Quick Start (Windows)

```powershell
# From project root — opens backend + frontend in two terminals
.\start-all.ps1
```

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:3000 |

### Manual Start

**Backend**
```powershell
cd backend
copy .env.example .env
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

**Frontend**
```powershell
cd Frontend
npm install
npm run dev
```

---

## 🏗️ Project Structure

```
Road_Show/
├── Frontend/                 React + Vite UI
│   ├── src/components/       Role portals (Gov, Contractor, Worker)
│   ├── src/context/          HazardContext, SpendContext
│   ├── src/services/api.js   REST client (proxied to :8000)
│   └── src/data.js           Offline demo seed data
├── backend/                  FastAPI + SQLite
│   ├── app/api/              hazards, auth, contractors, chat, predict
│   └── main.py               App entry + demo DB seed
├── start-all.ps1             Launch both services
└── AegisRoad_Complete_Workflow_Guide.docx
```

---

## 👤 Demo Accounts

Use **Login / Sign Up** → Quick Login buttons:

| Role | Name | Organization |
|------|------|----------------|
| Government | Chief Inspector Rao | Municipal Road Corp |
| Contractor | Sandra Arjun | BuildFast Pvt. Ltd. |
| Field Worker | Sanjay Kumar | Eagle Eye Patrols |

With the backend running, full register/login stores users in SQLite with JWT tokens.

---

## 🔄 End-to-End Workflow

1. **Detection** — Edge AI upload or Citizen Report creates a hazard (D00–D40 class).
2. **Triage** — Government Command Center assigns contractor; SLA timer starts.
3. **Dispatch** — Contractor Portal shows job queue and penalty exposure.
4. **Execution** — Field worker uses Driver Mobile: navigate → arrive → photo evidence → resolve.
5. **Audit** — Spend Watch updates contractor scores; verified jobs clear the ledger.

---

## 🛠️ Configuration

| Variable | Location | Purpose |
|----------|----------|---------|
| `ANTHROPIC_API_KEY` | `backend/.env` | Powers AegisChat (Claude) |
| `HF_SPACE_URL` | `backend/.env` | Optional YOLO inference server |
| `SECRET_KEY` | `backend/.env` | JWT signing (change in production) |
| `VITE_API_URL` | `Frontend/.env` | Optional API override |

---

## 📡 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/hazards` | List hazards |
| POST | `/api/hazards` | Create hazard |
| PATCH | `/api/hazards/{id}` | Update status |
| GET | `/api/contractors` | Contractor leaderboard |
| POST | `/api/auth/login` | JWT authentication |
| POST | `/api/chat` | AegisChat AI |
| POST | `/api/predict` | Image defect detection |

---

## 🖥️ Portals

### Government
- **Command Center** — Hazard queue, SLA escalations
- **Spend Watch** — Budget & contractor accountability
- **Hazard Map** — Public GIS transparency
- **Edge AI** — Dashcam defect detection
- **Report Issue** — Citizen reporting

### Contractor
- **Contractor Portal** — Jobs, SLA timers, evidence upload, fleet sim

### Field Worker
- **Driver Mobile** — Navigation HUD, arrival log, photo proof, resolve

---

<div align="center">
  <i>Built to modernize civic infrastructure, hold contractors accountable, and save taxpayer budgets.</i>
</div>
