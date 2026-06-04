from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import hazards, contractors, predict, chat, auth
from app.api.proof import router as proof_router
from app.core.database import engine, SessionLocal
from app.models import Base, Hazard, Contract

Base.metadata.create_all(bind=engine)


def seed_demo_hazards():
    db = SessionLocal()
    try:
        if db.query(Hazard).count() > 0:
            return
        samples = [
            {
                "road_name": "NH65 Downtown Flyover",
                "lat": 16.5062, "lng": 80.6480,
                "cls": "D40", "severity": "critical",
                "status": "open", "sla_hours": 24,
                "description": "Pothole cluster detected by Edge AI",
            },
            {
                "road_name": "Industrial Zone B Ramp",
                "lat": 16.4412, "lng": 80.6215,
                "cls": "D20", "severity": "high",
                "status": "in_progress", "sla_hours": 48,
                "contractor": "BuildFast Pvt. Ltd.",
                "description": "Alligator cracking on entry ramp",
            },
            {
                "road_name": "Riverside Pkwy Southbound",
                "lat": 16.3988, "lng": 80.5921,
                "cls": "D10", "severity": "medium",
                "status": "in_progress", "sla_hours": 72,
                "contractor": "Apex Infrastruct",
                "description": "Guardrail impact damage",
            },
        ]
        for row in samples:
            db.add(Hazard(**row))
        db.commit()
    finally:
        db.close()


def seed_demo_contracts():
    db = SessionLocal()
    try:
        if db.query(Contract).count() > 0:
            return
        # Mirrors RAW_CONTRACTORS from contractors.py.
        # Ratings are derived from the same operational metrics
        # so efficiency_score matches the in-memory leaderboard.
        samples = [
            {
                "id": 1, "name": "Ramesh Road Works",     "district": "Vijayawada",
                "status": "active",
                "allocated_budget": 48.0, "disbursed_budget": 41.0,
                # sla: 11/12=0.92  budget: 1-|41-48|/48=0.85  quality: 1-1.8/7=0.74  civic: 1-1/5=0.80
                "sla_rating": 0.92, "budget_rating": 0.85,
                "quality_rating": 0.74, "civic_rating": 0.80,
                "efficiency_score": 84.7,
            },
            {
                "id": 2, "name": "AP Infrastructure Ltd", "district": "Guntur",
                "status": "active",
                "allocated_budget": 62.0, "disbursed_budget": 58.0,
                # sla: 7/10=0.70  budget: 1-|58-62|/62=0.94  quality: 1-3.2/7=0.54  civic: 1-2/5=0.60
                "sla_rating": 0.70, "budget_rating": 0.94,
                "quality_rating": 0.54, "civic_rating": 0.60,
                "efficiency_score": 71.0,
            },
            {
                "id": 3, "name": "National Highway Corp",  "district": "Mangalagiri",
                "status": "active",
                "allocated_budget": 120.0, "disbursed_budget": 98.0,
                # sla: 17/18=0.94  budget: 1-|98-120|/120=0.82  quality: 1-1.1/7=0.84  civic: 1-1/5=0.80
                "sla_rating": 0.94, "budget_rating": 0.82,
                "quality_rating": 0.84, "civic_rating": 0.80,
                "efficiency_score": 87.8,
            },
            {
                "id": 4, "name": "Coastal Road Builders",  "district": "Krishna",
                "status": "active",
                "allocated_budget": 35.0, "disbursed_budget": 34.0,
                # sla: 4/8=0.50  budget: 1-|34-35|/35=0.97  quality: 1-5.6/7=0.20  civic: 1-3/5=0.40
                "sla_rating": 0.50, "budget_rating": 0.97,
                "quality_rating": 0.20, "civic_rating": 0.40,
                "efficiency_score": 57.1,
            },
            {
                "id": 5, "name": "Deccan Infra Pvt Ltd",   "district": "Prakasam",
                "status": "active",
                "allocated_budget": 55.0, "disbursed_budget": 52.0,
                # sla: 6/9=0.67  budget: 1-|52-55|/55=0.95  quality: 1-4.1/7=0.41  civic: 1-3/5=0.40
                "sla_rating": 0.67, "budget_rating": 0.95,
                "quality_rating": 0.41, "civic_rating": 0.40,
                "efficiency_score": 67.9,
            },
        ]
        for row in samples:
            db.add(Contract(**row))
        db.commit()
    finally:
        db.close()


seed_demo_hazards()
seed_demo_contracts()

app = FastAPI(title="AegisRoad API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,        prefix="/api")
app.include_router(hazards.router,     prefix="/api")
app.include_router(contractors.router, prefix="/api")
app.include_router(predict.router,     prefix="/api")
app.include_router(chat.router,        prefix="/api")
app.include_router(proof_router)


@app.get("/")
def root():
    return {"status": "AegisRoad API v3.0 running", "docs": "/docs"}