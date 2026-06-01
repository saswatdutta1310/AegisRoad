"""
AegisRoad v3.0 — Contractors & SpendWatch API
PRD-compliant: spend/summary, spend/contracts, spend/export + efficiency formula
"""

import csv
import io
import uuid
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# ── Efficiency Score Formula (PRD: 40% SLA + 30% Budget + 20% Quality + 10% Civic) ──
def calculate_efficiency_score(contractor: dict) -> float:
    contracts     = contractor.get("contracts", 10)
    repaired      = contractor.get("repaired", 8)
    budget        = contractor.get("budget", 50)
    spent         = contractor.get("spent", 45)
    avg_days      = contractor.get("avg_days", 3)
    active_sla    = contractor.get("active_sla", 2)

    # 40% — SLA compliance
    sla_score     = (repaired / contracts) if contracts > 0 else 0

    # 30% — Budget efficiency (closer to budget = better)
    budget_score  = 1 - min(abs(spent - budget) / budget, 1)

    # 20% — Work quality (faster = better, max 7 days)
    quality_score = max(0, 1 - (avg_days / 7))

    # 10% — Civic rating (fewer active SLAs = better)
    civic_score   = max(0, 1 - (active_sla / 5))

    final = (sla_score * 0.40 + budget_score * 0.30 +
             quality_score * 0.20 + civic_score * 0.10)
    return round(final * 100, 1)


# ── Seed data ──────────────────────────────────────────────────────────────────
RAW_CONTRACTORS = [
    {
        "id": 1, "name": "Ramesh Road Works",    "district": "Vijayawada",
        "budget": 48,  "spent": 41, "avg_days": 1.8, "active_sla": 1,
        "contracts": 12, "repaired": 11,
    },
    {
        "id": 2, "name": "AP Infrastructure Ltd", "district": "Guntur",
        "budget": 62,  "spent": 58, "avg_days": 3.2, "active_sla": 2,
        "contracts": 10, "repaired": 7,
    },
    {
        "id": 3, "name": "National Highway Corp", "district": "Mangalagiri",
        "budget": 120, "spent": 98, "avg_days": 1.1, "active_sla": 1,
        "contracts": 18, "repaired": 17,
    },
    {
        "id": 4, "name": "Coastal Road Builders", "district": "Krishna",
        "budget": 35,  "spent": 34, "avg_days": 5.6, "active_sla": 3,
        "contracts": 8,  "repaired": 4,
    },
    {
        "id": 5, "name": "Deccan Infra Pvt Ltd",  "district": "Prakasam",
        "budget": 55,  "spent": 52, "avg_days": 4.1, "active_sla": 3,
        "contracts": 9,  "repaired": 6,
    },
]

# Pre-compute scores
CONTRACTORS = []
for c in RAW_CONTRACTORS:
    c["score"] = calculate_efficiency_score(c)
    CONTRACTORS.append(c)


# ── Routes ─────────────────────────────────────────────────────────────────────
@router.get("/contractors")
def get_contractors():
    return {"contractors": CONTRACTORS}


@router.get("/contractors/{contractor_id}")
def get_contractor(contractor_id: int):
    for c in CONTRACTORS:
        if c["id"] == contractor_id:
            return c
    return {"error": "Contractor not found"}


@router.get("/spend/summary")
def spend_summary():
    """PRD P2.3 — spend summary with efficiency breakdown"""
    summary = []
    for c in CONTRACTORS:
        summary.append({
            "district":   c["district"],
            "contractor": c["name"],
            "allocated":  c["budget"],
            "disbursed":  c["spent"],
            "efficiency": round(c["score"] / 100, 2),
        })

    total_allocated = sum(c["budget"] for c in CONTRACTORS)
    total_disbursed = sum(c["spent"]  for c in CONTRACTORS)
    avg_efficiency  = round(
        sum(c["score"] for c in CONTRACTORS) / len(CONTRACTORS) / 100, 2
    )

    return {
        "summary":         summary,
        "total_allocated": total_allocated,
        "total_disbursed": total_disbursed,
        "avg_efficiency":  avg_efficiency,
    }


@router.get("/spend/contracts")
def get_contracts():
    """PRD P2.3 — all contracts list"""
    return {"contracts": CONTRACTORS}


@router.get("/spend/export")
def export_csv():
    """PRD P2.3 — CSV export of contractor data"""
    output = io.StringIO()
    fieldnames = ["id", "name", "district", "score", "budget",
                  "spent", "avg_days", "active_sla", "contracts", "repaired"]
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    for c in CONTRACTORS:
        writer.writerow({k: c[k] for k in fieldnames})
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=aegisroad_contracts.csv"
        }
    )


@router.get("/spend/leaderboard")
def leaderboard():
    """Ranked contractors by efficiency score"""
    ranked = sorted(CONTRACTORS, key=lambda x: x["score"], reverse=True)
    return {"leaderboard": ranked}
