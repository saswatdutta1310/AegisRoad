from sqlalchemy import Column, Integer, String, Float, Text
from app.core.database import Base
import datetime


def _utc_now_iso():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    username        = Column(String, unique=True, index=True)
    email           = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role            = Column(String)
    orgName         = Column(String)


class Hazard(Base):
    __tablename__ = "hazards"

    id                 = Column(Integer, primary_key=True, index=True)
    road_name          = Column(String)
    lat                = Column(Float)
    lng                = Column(Float)
    cls                = Column(String)
    severity           = Column(String)
    status             = Column(String,  default="open")
    sla_hours          = Column(Integer)
    reported           = Column(String,  default=_utc_now_iso)
    contractor         = Column(String,  nullable=True)
    completion_percent = Column(Integer, default=0)
    description        = Column(String,  nullable=True)
    tx_hash            = Column(String,  nullable=True, default=None)


# ── SpendWatch: contracts table ────────────────────────────────────────────────

class Contract(Base):
    """
    Represents a public road infrastructure contract.
    Populated from the RAW_CONTRACTORS seed data in contractors.py
    and updated live via PATCH /v1/spend/contracts/{id}/disburse.
    """
    __tablename__ = "contracts"

    id                = Column(Integer, primary_key=True, index=True)
    name              = Column(String)                        # contractor name
    district          = Column(String)
    status            = Column(String,  default="active")     # active | completed | suspended

    # Budget tracking
    allocated_budget  = Column(Float,   default=0.0)          # total allocated (lakhs)
    disbursed_budget  = Column(Float,   default=0.0)          # running total disbursed

    # Scoring inputs (0.0 – 1.0 each, set by admin or computed)
    sla_rating        = Column(Float,   default=0.0)          # SLA compliance ratio
    budget_rating     = Column(Float,   default=0.0)          # budget efficiency ratio
    quality_rating    = Column(Float,   default=0.0)          # work quality ratio
    civic_rating      = Column(Float,   default=0.0)          # civic satisfaction ratio

    # Derived weighted score (stored after each disbursement)
    efficiency_score  = Column(Float,   default=0.0)          # 0–100

    # Blockchain Proof-of-Repair anchor
    tx_hash           = Column(String,  nullable=True, default=None)

    # Audit trail — JSON-encoded list of disbursement events
    event_log         = Column(Text,    nullable=True, default="[]")

    created_at        = Column(String,  default=_utc_now_iso)
    updated_at        = Column(String,  default=_utc_now_iso)


# ── Chat session tracking ──────────────────────────────────────────────────────

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id             = Column(String,  primary_key=True)
    created_at     = Column(String,  default=_utc_now_iso)
    last_active    = Column(String,  default=_utc_now_iso)
    intent_summary = Column(String,  nullable=True)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id         = Column(Integer, primary_key=True, index=True)
    session_id = Column(String,  index=True)
    role       = Column(String)
    content    = Column(String)
    intent     = Column(String,  nullable=True)
    sources    = Column(String,  nullable=True)
    created_at = Column(String,  default=_utc_now_iso)


# ── Citizen feedback loop ──────────────────────────────────────────────────────

class ChatFeedback(Base):
    __tablename__ = "chat_feedback"

    id            = Column(Integer, primary_key=True, index=True)
    session_id    = Column(String,  index=True)
    message_index = Column(Integer, default=0)
    rating        = Column(String)
    comment       = Column(String,  nullable=True)
    created_at    = Column(String,  default=_utc_now_iso)