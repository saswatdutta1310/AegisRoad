"""
AegisRoad v3.0 — Contractors & SpendWatch API
PRD-compliant: spend/summary, spend/contracts, spend/export + efficiency formula

New in this version:
  PATCH /v1/spend/contracts/{id}/disburse  — live disbursement + algorithmic scoring
  GET   /v1/spend/export                   — streaming CSV audit export (DB-backed)
"""

import csv
import io
import json
import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models import Contract

router = APIRouter()


# ── Weighted Efficiency Score (PRD: 40/30/20/10) ──────────────────────────────

def calculate_efficiency_score(contractor: dict) -> float:
    """
    In-memory version used for the seed data leaderboard.
    Derives sub-scores from raw operational metrics.
    """
    contracts  = contractor.get("contracts", 10)
    repaired   = contractor.get("repaired", 8)
    budget     = contractor.get("budget", 50)
    spent      = contractor.get("spent", 45)
    avg_days   = contractor.get("avg_days", 3)
    active_sla = contractor.get("active_sla", 2)

    sla_score     = (repaired / contracts) if contracts > 0 else 0
    budget_score  = 1 - min(abs(spent - budget) / budget, 1)
    quality_score = max(0, 1 - (avg_days / 7))
    civic_score   = max(0, 1 - (active_sla / 5))

    final = (sla_score * 0.40 + budget_score * 0.30 +
             quality_score * 0.20 + civic_score * 0.10)
    return round(final * 100, 1)


def calculate_db_efficiency_score(
    sla_rating: float,
    budget_rating: float,
    quality_rating: float,
    civic_rating: float,
) -> float:
    """
    DB version: all four rating inputs are already normalised 0.0–1.0.
    Returns a 0–100 score stored back on the Contract row.

    Formula (PRD exact):
        Score = (SLA * 0.40) + (Budget * 0.30) + (Quality * 0.20) + (Civic * 0.10)
    """
    score = (
        sla_rating     * 0.40 +
        budget_rating  * 0.30 +
        quality_rating * 0.20 +
        civic_rating   * 0.10
    )
    return round(score * 100, 2)


# ── Seed data (in-memory, existing behaviour preserved) ───────────────────────

RAW_CONTRACTORS = [
    {
        "id": 1, "name": "Ramesh Road Works",     "district": "Vijayawada",
        "budget": 48,  "spent": 41, "avg_days": 1.8, "active_sla": 1,
        "contracts": 12, "repaired": 11,
    },
    {
        "id": 2, "name": "AP Infrastructure Ltd", "district": "Guntur",
        "budget": 62,  "spent": 58, "avg_days": 3.2, "active_sla": 2,
        "contracts": 10, "repaired": 7,
    },
    {
        "id": 3, "name": "National Highway Corp",  "district": "Mangalagiri",
        "budget": 120, "spent": 98, "avg_days": 1.1, "active_sla": 1,
        "contracts": 18, "repaired": 17,
    },
    {
        "id": 4, "name": "Coastal Road Builders",  "district": "Krishna",
        "budget": 35,  "spent": 34, "avg_days": 5.6, "active_sla": 3,
        "contracts": 8,  "repaired": 4,
    },
    {
        "id": 5, "name": "Deccan Infra Pvt Ltd",   "district": "Prakasam",
        "budget": 55,  "spent": 52, "avg_days": 4.1, "active_sla": 3,
        "contracts": 9,  "repaired": 6,
    },
]

CONTRACTORS = []
for c in RAW_CONTRACTORS:
    c["score"] = calculate_efficiency_score(c)
    CONTRACTORS.append(c)


# ── Pydantic schemas ───────────────────────────────────────────────────────────

class DisburseRequest(BaseModel):
    disbursement_amount: float = Field(
        ..., gt=0, description="Amount to disburse in lakhs (must be positive)"
    )


class ContractResponse(BaseModel):
    id:               int
    name:             str
    district:         str
    status:           str
    allocated_budget: float
    disbursed_budget: float
    sla_rating:       float
    budget_rating:    float
    quality_rating:   float
    civic_rating:     float
    efficiency_score: float
    tx_hash:          Optional[str]
    event_log:        List[dict]
    created_at:       str
    updated_at:       str

    class Config:
        from_attributes = True


# ── Existing in-memory routes (unchanged) ─────────────────────────────────────

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
    return {"contracts": CONTRACTORS}


@router.get("/spend/leaderboard")
def leaderboard():
    ranked = sorted(CONTRACTORS, key=lambda x: x["score"], reverse=True)
    return {"leaderboard": ranked}


# ── TASK 1: Contract Disbursement & Algorithmic Scoring ───────────────────────

@router.patch("/v1/spend/contracts/{contract_id}/disburse", response_model=ContractResponse)
def disburse_contract(
    contract_id: int,
    payload: DisburseRequest,
    db: Session = Depends(get_db),
):
    """
    PATCH /v1/spend/contracts/{id}/disburse

    1. Fetch the contract row — 404 if not found.
    2. Increment disbursed_budget by disbursement_amount.
    3. Append a timestamped event to the JSON event_log column.
    4. Recalculate the weighted Efficiency Score:
           Score = (SLA*0.40) + (Budget*0.30) + (Quality*0.20) + (Civic*0.10)
    5. Persist all changes and return the updated contract as JSON.
    """
    # ── 1. Fetch ───────────────────────────────────────────────────────────────
    try:
        contract = db.query(Contract).filter(Contract.id == contract_id).first()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database read error: {e}")

    if not contract:
        raise HTTPException(
            status_code=404,
            detail=f"Contract #{contract_id} not found.",
        )

    # ── 2. Increment disbursed total ───────────────────────────────────────────
    contract.disbursed_budget += payload.disbursement_amount

    # ── 3. Append timestamped event log entry ──────────────────────────────────
    try:
        log: list = json.loads(contract.event_log or "[]")
    except (json.JSONDecodeError, TypeError):
        log = []

    log.append({
        "event":      "disbursement",
        "amount":     payload.disbursement_amount,
        "running_total": contract.disbursed_budget,
        "timestamp":  datetime.datetime.now(datetime.timezone.utc).isoformat(),
    })
    contract.event_log = json.dumps(log)

    # ── 4. Recalculate weighted Efficiency Score ───────────────────────────────
    contract.efficiency_score = calculate_db_efficiency_score(
        sla_rating=contract.sla_rating,
        budget_rating=contract.budget_rating,
        quality_rating=contract.quality_rating,
        civic_rating=contract.civic_rating,
    )

    # ── 5. Persist ─────────────────────────────────────────────────────────────
    contract.updated_at = datetime.datetime.now(datetime.timezone.utc).isoformat()

    try:
        db.commit()
        db.refresh(contract)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database write error: {e}")

    # Build response with decoded event_log
    result = ContractResponse(
        id=contract.id,
        name=contract.name,
        district=contract.district,
        status=contract.status,
        allocated_budget=contract.allocated_budget,
        disbursed_budget=contract.disbursed_budget,
        sla_rating=contract.sla_rating,
        budget_rating=contract.budget_rating,
        quality_rating=contract.quality_rating,
        civic_rating=contract.civic_rating,
        efficiency_score=contract.efficiency_score,
        tx_hash=contract.tx_hash,
        event_log=json.loads(contract.event_log),
        created_at=contract.created_at,
        updated_at=contract.updated_at,
    )
    return result


# ── TASK 2: Streaming CSV Audit Export ────────────────────────────────────────

@router.get("/v1/spend/export")
def export_csv_db(db: Session = Depends(get_db)):
    """
    GET /v1/spend/export

    Streams a CSV file of all active contracts directly to the client.
    Columns: Contract ID, Contractor Name, District, Allocated Budget,
             Disbursed Budget, Efficiency Score, Avalanche Tx Hash.

    Headers:
        Content-Disposition: attachment; filename="aegisroad_contracts_audit.csv"
        Content-Type: text/csv
    """
    # ── Query all active contracts ─────────────────────────────────────────────
    try:
        contracts = (
            db.query(Contract)
            .filter(Contract.status == "active")
            .order_by(Contract.id)
            .all()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database read error: {e}")

    # ── Build CSV in memory ────────────────────────────────────────────────────
    output = io.StringIO()
    fieldnames = [
        "Contract ID",
        "Contractor Name",
        "District",
        "Allocated Budget",
        "Disbursed Budget",
        "Efficiency Score",
        "Avalanche Tx Hash",
    ]
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()

    for c in contracts:
        writer.writerow({
            "Contract ID":       c.id,
            "Contractor Name":   c.name,
            "District":          c.district,
            "Allocated Budget":  c.allocated_budget,
            "Disbursed Budget":  c.disbursed_budget,
            "Efficiency Score":  c.efficiency_score,
            "Avalanche Tx Hash": c.tx_hash or "—",
        })

    output.seek(0)

    # ── Stream response ────────────────────────────────────────────────────────
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="aegisroad_contracts_audit.csv"',
        },
    )