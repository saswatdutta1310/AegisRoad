from sqlalchemy import Column, Integer, String, Float
from app.core.database import Base
import datetime

def _utc_now_iso():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)
    orgName = Column(String)

class Hazard(Base):
    __tablename__ = "hazards"
    
    id = Column(Integer, primary_key=True, index=True)
    road_name = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    cls = Column(String)
    severity = Column(String)
    status = Column(String, default="open")
    sla_hours = Column(Integer)
    reported = Column(String, default=_utc_now_iso)
    contractor = Column(String, nullable=True)
    completion_percent = Column(Integer, default=0)
    description = Column(String, nullable=True)
