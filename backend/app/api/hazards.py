from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Hazard

router = APIRouter(prefix="/hazards", tags=["hazards"])

class HazardCreate(BaseModel):
    road_name: str
    lat: float
    lng: float
    cls: str
    severity: str
    contractor: Optional[str] = None
    description: Optional[str] = None

class HazardUpdate(BaseModel):
    status: Optional[str] = None
    contractor: Optional[str] = None
    completion_percent: Optional[int] = None

@router.get("/")
def list_hazards(db: Session = Depends(get_db)):
    return {"hazards": db.query(Hazard).all()}

@router.post("/")
def create_hazard(payload: HazardCreate, db: Session = Depends(get_db)):
    sla = {"D40":24, "D20":48, "D10":72, "D00":96}
    new_hazard = Hazard(
        road_name=payload.road_name,
        lat=payload.lat,
        lng=payload.lng,
        cls=payload.cls,
        severity=payload.severity,
        status="open",
        sla_hours=sla.get(payload.cls, 48),
        contractor=payload.contractor,
        description=payload.description
    )
    db.add(new_hazard)
    db.commit()
    db.refresh(new_hazard)
    return new_hazard

@router.patch("/{hazard_id}")
def update_hazard(hazard_id: int, payload: HazardUpdate, db: Session = Depends(get_db)):
    hazard = db.query(Hazard).filter(Hazard.id == hazard_id).first()
    if not hazard:
        raise HTTPException(status_code=404, detail="Hazard not found")
    
    if payload.status is not None:
        hazard.status = payload.status
    if payload.contractor is not None:
        hazard.contractor = payload.contractor
    if payload.completion_percent is not None:
        hazard.completion_percent = payload.completion_percent
    
    db.commit()
    db.refresh(hazard)
    return hazard
