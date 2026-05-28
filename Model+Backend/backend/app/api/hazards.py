from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/hazards", tags=["hazards"])

class HazardCreate(BaseModel):
    road_name: str
    lat: float
    lng: float
    cls: str
    severity: str
    contractor: Optional[str] = None

HAZARDS = [
    {"id":1,"lat":16.5417,"lng":80.5152,"cls":"D40","severity":"critical","road_name":"NH-16, Vijayawada","status":"open","sla_hours":24,"reported":"2026-05-23T10:02:00","contractor":"Ramesh Road Works"},
    {"id":2,"lat":16.3067,"lng":80.4365,"cls":"D20","severity":"high","road_name":"SH-47, Guntur","status":"in_progress","sla_hours":48,"reported":"2026-05-23T07:30:00","contractor":"AP Infrastructure Ltd"},
    {"id":3,"lat":16.4307,"lng":80.6241,"cls":"D10","severity":"medium","road_name":"NH-65, Mangalagiri","status":"resolved","sla_hours":72,"reported":"2026-05-22T14:00:00","contractor":"National Highway Corp"},
]

@router.get("/")
def list_hazards():
    return {"hazards": HAZARDS}

@router.post("/")
def create_hazard(payload: HazardCreate):
    sla = {"D40":24,"D20":48,"D10":72,"D00":96}
    new = {"id": len(HAZARDS)+1, "road_name": payload.road_name, "lat": payload.lat,
           "lng": payload.lng, "cls": payload.cls, "severity": payload.severity,
           "status": "open", "sla_hours": sla.get(payload.cls, 48)}
    HAZARDS.append(new)
    return new
