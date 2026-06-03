from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import hazards, contractors, predict, chat, auth
from app.api.proof import router as proof_router          # ← NEW
from app.core.database import engine, SessionLocal
from app.models import Base, Hazard

# Create tables
Base.metadata.create_all(bind=engine)

def seed_demo_hazards():
    db = SessionLocal()
    try:
        if db.query(Hazard).count() > 0:
            return
        samples = [
            {"road_name": "NH65 Downtown Flyover", "lat": 16.5062, "lng": 80.6480, "cls": "D40", "severity": "critical", "status": "open", "sla_hours": 24, "description": "Pothole cluster detected by Edge AI"},
            {"road_name": "Industrial Zone B Ramp", "lat": 16.4412, "lng": 80.6215, "cls": "D20", "severity": "high", "status": "in_progress", "sla_hours": 48, "contractor": "BuildFast Pvt. Ltd.", "description": "Alligator cracking on entry ramp"},
            {"road_name": "Riverside Pkwy Southbound", "lat": 16.3988, "lng": 80.5921, "cls": "D10", "severity": "medium", "status": "in_progress", "sla_hours": 72, "contractor": "Apex Infrastruct", "description": "Guardrail impact damage"},
        ]
        for row in samples:
            db.add(Hazard(**row))
        db.commit()
    finally:
        db.close()

seed_demo_hazards()

app = FastAPI(title="AegisRoad API", version="3.0.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

app.include_router(auth.router,        prefix="/api")
app.include_router(hazards.router,     prefix="/api")
app.include_router(contractors.router, prefix="/api")
app.include_router(predict.router,     prefix="/api")
app.include_router(chat.router,        prefix="/api")
app.include_router(proof_router)                          # ← NEW (prefix /api/v1/proof built-in)

@app.get("/")
def root():
    return {"status": "AegisRoad API v3.0 running", "docs": "/docs"}