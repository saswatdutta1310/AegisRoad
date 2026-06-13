"""
proof.py — AegisRoad v3.0
FastAPI router for Proof of Repair endpoint.

Place this file at:  backend/app/api/proof.py  (next to hazards.py)
"""

from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from pydantic import BaseModel, AnyHttpUrl, field_validator

from blockchain import record_on_chain_proof

router = APIRouter(prefix="/api/v1/proof", tags=["Proof of Repair"])


# ── Request / Response schemas ────────────────────────────────────────────────

class ProofRequest(BaseModel):
    ticket_id: str          # pass the hazard ID as a string e.g. "42"
    image_url: AnyHttpUrl   # must be a valid URL
    lat: float
    lng: float

    @field_validator("lat")
    @classmethod
    def validate_lat(cls, v: float) -> float:
        if not -90 <= v <= 90:
            raise ValueError("lat must be between -90 and 90")
        return v

    @field_validator("lng")
    @classmethod
    def validate_lng(cls, v: float) -> float:
        if not -180 <= v <= 180:
            raise ValueError("lng must be between -180 and 180")
        return v


class ProofAcceptedResponse(BaseModel):
    message: str
    ticket_id: str
    status: str


# ── POST /api/v1/proof/submit ────────────────────────────────────────────────

@router.post(
    "/submit",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=ProofAcceptedResponse,
    summary="Anchor a Proof of Repair on Avalanche Fuji",
)
async def submit_proof_of_repair(
    payload: ProofRequest,
    background_tasks: BackgroundTasks,
) -> ProofAcceptedResponse:
    """
    Client gets 202 Accepted immediately.
    Blockchain anchoring + DB write happen in the background — zero API latency.
    """
    if not payload.ticket_id.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="ticket_id must not be empty.",
        )

    background_tasks.add_task(
        record_on_chain_proof,
        ticket_id=payload.ticket_id,
        image_url=str(payload.image_url),
        lat=payload.lat,
        lng=payload.lng,
    )

    return ProofAcceptedResponse(
        message="Proof of Repair anchoring initiated on Avalanche Fuji Testnet.",
        ticket_id=payload.ticket_id,
        status="pending_on_chain",
    )


# ── GET /api/v1/proof/health ─────────────────────────────────────────────────

@router.get("/health", summary="Check blockchain connectivity")
async def blockchain_health():
    """
    Quick check to verify Web3 is connected to Avalanche Fuji.
    Open this in browser: http://localhost:8000/api/v1/proof/health
    """
    from blockchain import w3, WALLET_ADDRESS, CONTRACT_ADDRESS
    return {
        "connected": w3 is not None and w3.is_connected(),
        "network":   "Avalanche Fuji Testnet",
        "wallet":    WALLET_ADDRESS  or "not configured",
        "contract":  CONTRACT_ADDRESS or "not configured",
    }