"""
AegisRoad v3.0 — Database Seeder
Run before uvicorn on Render.com to populate initial data
"""

import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base, SessionLocal
from app.models.models import Hazard, Contractor


def seed():
    print("🌱 Seeding database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # ── Hazards ──────────────────────────────────────────────────────────
        if db.query(Hazard).count() == 0:
            hazards = [
                Hazard(
                    road_name="NH-16, Vijayawada", lat=16.5417, lng=80.5152,
                    cls="D40", severity="critical", status="open",
                    sla_hours=24, reported=datetime.datetime.now(),
                    contractor="Ramesh Road Works"
                ),
                Hazard(
                    road_name="SH-47, Guntur", lat=16.3067, lng=80.4365,
                    cls="D20", severity="high", status="in_progress",
                    sla_hours=48, reported=datetime.datetime.now(),
                    contractor="AP Infrastructure Ltd"
                ),
                Hazard(
                    road_name="NH-65, Mangalagiri", lat=16.4307, lng=80.6241,
                    cls="D10", severity="medium", status="resolved",
                    sla_hours=72, reported=datetime.datetime.now(),
                    contractor="National Highway Corp"
                ),
                Hazard(
                    road_name="MDR-22, Tadepalle", lat=16.5820, lng=80.6278,
                    cls="D00", severity="low", status="in_progress",
                    sla_hours=96, reported=datetime.datetime.now(),
                    contractor="Coastal Road Builders"
                ),
                Hazard(
                    road_name="NH-16, Tenali", lat=16.2760, lng=80.4534,
                    cls="D40", severity="critical", status="open",
                    sla_hours=24, reported=datetime.datetime.now(),
                    contractor="Deccan Infra Pvt Ltd"
                ),
            ]
            db.add_all(hazards)
            print(f"  ✅ Added {len(hazards)} hazards")
        else:
            print("  ⏭️  Hazards already seeded")

        # ── Contractors ───────────────────────────────────────────────────────
        if db.query(Contractor).count() == 0:
            contractors = [
                Contractor(
                    name="Ramesh Road Works", district="Vijayawada",
                    score=87, avg_days=1.8, budget_lakhs=48,
                    spent_lakhs=41, active_sla=1
                ),
                Contractor(
                    name="AP Infrastructure Ltd", district="Guntur",
                    score=72, avg_days=3.2, budget_lakhs=62,
                    spent_lakhs=58, active_sla=2
                ),
                Contractor(
                    name="National Highway Corp", district="Mangalagiri",
                    score=91, avg_days=1.1, budget_lakhs=120,
                    spent_lakhs=98, active_sla=1
                ),
                Contractor(
                    name="Coastal Road Builders", district="Krishna",
                    score=55, avg_days=5.6, budget_lakhs=35,
                    spent_lakhs=34, active_sla=3
                ),
                Contractor(
                    name="Deccan Infra Pvt Ltd", district="Prakasam",
                    score=63, avg_days=4.1, budget_lakhs=55,
                    spent_lakhs=52, active_sla=3
                ),
            ]
            db.add_all(contractors)
            print(f"  ✅ Added {len(contractors)} contractors")
        else:
            print("  ⏭️  Contractors already seeded")

        db.commit()
        print("✅ Database seeded successfully")

    except Exception as e:
        print(f"❌ Seeding failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
