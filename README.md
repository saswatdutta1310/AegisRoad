# AegisRoad Frontend

AegisRoad is a modern civic infrastructure frontend built with React and Vite. It delivers an interactive municipal dashboard for road safety intelligence, contractor spend transparency, hazard reporting, and in-app monitoring.

# Deployed Link : road-show-one.vercel.app

## 🚀 What this app includes

- **Command Center**: Active incident monitoring with hazard ticket creation, SLA escalation controls, and operations visibility.
- **SpendWatch Dashboard**: Contract budget analytics, disbursement tracking, and contractor efficiency scoring.
- **Hazard Explorer**: Interactive road incident map with filters for severity, status, and location search.
- **AegisChat Assistant**: Conversational audit assistant for rapid queries over hazard and budget data.
- **Driver Mobile & Contractor Portal**: Role-specific demo panels for field workers and contractor coordination.
- **Landing Page**: Road defect reporting form, KPI highlights, and policy-forward product messaging.

## 💡 Key features

- Simulated civic hazard reporting workflow with live updates
- Visual budget and spend analytics for public infrastructure contracts
- Role-based dashboard panels for drivers, contractors, and command staff
- Real-time filtering of hazards by severity, assignment, and status
- Conversational assistant for quick data queries and audit-style summaries
- Responsive layout built for modern desktop and tablet experiences

## 📁 Project structure

- `src/App.jsx` — main app shell, navigation, and state orchestration
- `src/components/` — feature modules for each dashboard and workflow panel
- `src/data.js` — sample hazard, contract, and contractor data used by the UI
- `src/main.jsx` — React app bootstrap
- `src/index.css` — base styling and Tailwind integration
- `vite.config.ts` — Vite build configuration

## 🛠️ Built with

- React 19
- Vite 6
- Tailwind CSS 4
- Recharts for charts
- Leaflet / Google Maps wrapper for the map view
- React Router DOM for client-side navigation
- React Toastify for notifications

## ✅ Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the app in your browser:
   ```
   http://localhost:3000
   ```

## 📦 Build

To create a production build:

```bash
npm run build
```

## 🔧 Notes

- This project is configured to run on `0.0.0.0:3000` for local preview.
- Authentication state is simulated in the browser using local storage.
- The chat assistant is client-side simulated and works from the app's sample data.

## 💬 Want to extend it?

- Add real backend API endpoints for hazard reporting and contract data
- Replace simulated chat logic with a connected AI or knowledge graph service
- Wire the map to actual geospatial data sources and GPS feeds
- Add user authentication for separate driver/contractor dashboards

---

## 📌 Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and explore the dashboard.
