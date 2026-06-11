"""
AegisRoad v3.0 — AegisChat API
Stages 1-4: Schema · Session Persistence · Feedback Loop · RAG Grounding
"""

from __future__ import annotations

import json
import re
import uuid
import httpx

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import or_
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.config import settings
from app.core.database import get_db
from app.models import ChatSession, ChatMessage, ChatFeedback, Hazard as HazardModel

router = APIRouter()

ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"

# ── Base system prompt ─────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are AegisChat, the AI assistant for AegisRoad v3.0 —
a civic-technology platform for road safety and infrastructure accountability
in India and BIMSTEC countries.

You help citizens, government officials, and contractors with:
1. Road damage reporting (potholes, cracks, surface damage)
2. Understanding hazard severity levels (D00, D10, D20, D40, D43)
3. Contractor accountability and SLA tracking
4. Public road spending transparency
5. Road safety tips and best practices

Severity guide:
- D00 Longitudinal Crack  → Medium severity
- D10 Transverse Crack    → Medium severity
- D20 Alligator Crack     → High severity
- D40 Pothole             → Critical severity (most dangerous)
- D43 Surface Damage      → Low severity

SLA response times:
- Critical (D40 Pothole)  → Must be fixed within 48 hours
- High (D20)              → 7 days
- Medium (D00, D10)       → 30 days
- Low (D43)               → 90 days

Always respond helpfully and concisely. Keep responses under 200 words."""


# ── Schemas ────────────────────────────────────────────────────────────────────

class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None        # pass to continue an existing session
    history: Optional[List[Message]] = []


class ChatResponse(BaseModel):
    session_id: str   = Field(..., description="UUID4 tracking this conversation")
    intent: str       = Field(..., description="Detected civic query category")
    reply: str        = Field(..., description="Markdown-formatted Claude response")
    sources: List[str] = Field(default_factory=list, description="Data rows used to ground the answer")
    success: bool     = True
    error: Optional[str] = None


class SessionMessage(BaseModel):
    id: int
    role: str
    content: str
    intent: Optional[str]
    sources: List[str]
    created_at: str


class SessionHistoryResponse(BaseModel):
    session_id: str
    messages: List[SessionMessage]
    total: int


class FeedbackRequest(BaseModel):
    session_id: str
    message_index: int = 0
    rating: str                 # "thumbs_up" or "thumbs_down"
    comment: str = ""


# ── Intent detection ───────────────────────────────────────────────────────────

def detect_intent(message: str) -> str:
    msg = message.lower()
    if any(w in msg for w in ["pothole", "crack", "hazard", "damage", "road", "d40", "d20", "d10", "d00"]):
        return "hazard_query"
    if any(w in msg for w in ["contractor", "spend", "budget", "sla", "money", "cost", "audit"]):
        return "spend_query"
    if any(w in msg for w in ["report", "complain", "file", "submit", "alert"]):
        return "report_intent"
    if any(w in msg for w in ["drive", "route", "navigate", "direction"]):
        return "navigation_query"
    return "general_query"


# ── Off-topic guard ────────────────────────────────────────────────────────────

OFF_TOPIC_PATTERNS = [
    r"\brecipe\b", r"\bcook\b", r"\bfood\b",
    r"\bsport\b", r"\bfootball\b", r"\bcricket\b",
    r"\bmovie\b", r"\bfilm\b", r"\bsong\b",
    r"\bpolitics\b", r"\belection\b",
    r"\bpython\b", r"\bjavascript\b", r"\bcoding\b",
    r"\bstock\b", r"\bcrypto\b",
    r"\bweather\b", r"\bhoroscope\b",
]

def is_off_topic(message: str) -> bool:
    msg = message.lower()
    return any(re.search(pat, msg) for pat in OFF_TOPIC_PATTERNS)


# ── RAG: hazard context retrieval ──────────────────────────────────────────────

def retrieve_relevant_hazards(message: str, db: Session, limit: int = 3) -> list[dict]:
    """
    Keyword-based retrieval for SQLite (local dev).
    On Render/PostgreSQL with pgvector, swap this function for an
    embedding cosine-similarity query — the rest of the code is identical.
    """
    keywords = [
        w for w in message.lower().split()
        if len(w) > 3 and w not in {"what", "when", "where", "which", "how", "tell", "about", "show", "give"}
    ]

    if not keywords:
        rows = db.query(HazardModel).order_by(HazardModel.id.desc()).limit(limit).all()
    else:
        filters = [
            or_(
                HazardModel.road_name.ilike(f"%{kw}%"),
                HazardModel.description.ilike(f"%{kw}%"),
                HazardModel.cls.ilike(f"%{kw}%"),
                HazardModel.severity.ilike(f"%{kw}%"),
            )
            for kw in keywords[:3]
        ]
        rows = db.query(HazardModel).filter(or_(*filters)).limit(limit).all()
        if not rows:
            rows = db.query(HazardModel).order_by(HazardModel.id.desc()).limit(limit).all()

    return [
        {
            "id":          r.id,
            "road":        r.road_name,
            "type":        r.cls,
            "severity":    r.severity,
            "status":      r.status,
            "description": r.description or "",
        }
        for r in rows
    ]


def build_grounded_system_prompt(hazards: list[dict]) -> str:
    """Inject retrieved hazard rows into the system prompt as grounding context."""
    if not hazards:
        context_block = "No specific hazard records retrieved."
    else:
        lines = [
            f"- Ticket #{h['id']} | {h['road']} | {h['type']} | "
            f"Severity: {h['severity']} | Status: {h['status']} | {h['description']}"
            for h in hazards
        ]
        context_block = "\n".join(lines)

    return f"""{SYSTEM_PROMPT}

---
## GROUNDING CONTEXT (live database records)
The following hazard records are retrieved from the AegisRoad database
and are relevant to this conversation. Cite them specifically in your answer
using their Ticket # when appropriate. Do NOT fabricate ticket numbers
or road names outside this list.

{context_block}

---
## STRICT REFUSAL RULE
If the user's question is unrelated to road safety, infrastructure,
civic governance, or the AegisRoad platform (e.g. recipes, sports, coding,
entertainment, weather), respond with ONLY this exact sentence:
"I'm AegisChat — I can only assist with road safety and infrastructure queries."
Do not elaborate. Do not apologise. Do not answer the off-topic question.
"""


# ── Demo responses (fallback when no API key) ──────────────────────────────────

DEMO_RESPONSES = [
    "I'm AegisChat! Potholes (D40) are Critical severity — contractors must fix them within 48 hours under our SLA system.",
    "AegisRoad uses YOLOv8-Nano trained on 26,869 road images from 6 countries including India, detecting 5 damage types.",
    "SpendWatch tracks contractor performance — ranked by SLA compliance, repair quality, and budget utilization in real time.",
]
demo_counter = 0


# ── DB helpers ─────────────────────────────────────────────────────────────────

def get_or_create_session(session_id: Optional[str], db: Session) -> str:
    """Return an existing session_id or create a fresh ChatSession row."""
    import datetime
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    if session_id:
        existing = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if existing:
            existing.last_active = now
            db.commit()
            return session_id

    new_id = str(uuid.uuid4())
    db.add(ChatSession(id=new_id))
    db.commit()
    return new_id


def save_message(
    session_id: str,
    role: str,
    content: str,
    intent: Optional[str],
    sources: List[str],
    db: Session,
) -> None:
    """Persist one chat turn to chat_messages."""
    db.add(ChatMessage(
        session_id=session_id,
        role=role,
        content=content,
        intent=intent if role == "user" else None,
        sources=json.dumps(sources) if sources else None,
    ))
    db.commit()


def load_session_history(session_id: str, db: Session) -> List[Message]:
    """Load all prior turns as Message objects to feed back into Claude."""
    rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.id)
        .all()
    )
    return [Message(role=row.role, content=row.content) for row in rows]


# ── Claude API call ────────────────────────────────────────────────────────────

async def call_claude(
    user_message: str,
    history: List[Message],
    system_override: Optional[str] = None,
) -> str:
    messages = [{"role": m.role, "content": m.content} for m in history[-10:]]
    messages.append({"role": "user", "content": user_message})

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            ANTHROPIC_URL,
            headers={
                "x-api-key":          settings.ANTHROPIC_API_KEY,
                "anthropic-version":  "2023-06-01",
                "content-type":       "application/json",
            },
            json={
                "model":      "claude-sonnet-4-5",
                "max_tokens": 512,
                "system":     system_override or SYSTEM_PROMPT,
                "messages":   messages,
            },
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Anthropic API error: {response.text}",
        )
    return response.json()["content"][0]["text"]


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, db: Session = Depends(get_db)):
    global demo_counter

    session_id = get_or_create_session(req.session_id, db)
    intent     = detect_intent(req.message)

    # ── Demo mode ──────────────────────────────────────────────────────────────
    if not settings.ANTHROPIC_API_KEY:
        reply = DEMO_RESPONSES[demo_counter % len(DEMO_RESPONSES)]
        demo_counter += 1
        save_message(session_id, "user",      req.message, intent, [],  db)
        save_message(session_id, "assistant", reply,       None,   [],  db)
        return ChatResponse(
            session_id=session_id, intent=intent,
            reply=reply, sources=[],
            error="Demo mode — add ANTHROPIC_API_KEY to .env",
        )

    # ── Off-topic hard refusal ─────────────────────────────────────────────────
    if is_off_topic(req.message):
        refusal = "I'm AegisChat — I can only assist with road safety and infrastructure queries."
        save_message(session_id, "user",      req.message, "off_topic", [], db)
        save_message(session_id, "assistant", refusal,     None,        [], db)
        return ChatResponse(
            session_id=session_id, intent="off_topic",
            reply=refusal, sources=[],
        )

    # ── RAG: retrieve grounding context ───────────────────────────────────────
    relevant_hazards = retrieve_relevant_hazards(req.message, db)
    grounded_prompt  = build_grounded_system_prompt(relevant_hazards)
    sources = (
        [f"Ticket #{h['id']} — {h['road']} ({h['type']})" for h in relevant_hazards]
        or ["AegisRoad hazard database"]
    )

    # ── Load prior session turns ───────────────────────────────────────────────
    history = load_session_history(session_id, db)

    try:
        reply = await call_claude(req.message, history, system_override=grounded_prompt)

        save_message(session_id, "user",      req.message, intent, [],      db)
        save_message(session_id, "assistant", reply,       None,   sources, db)

        return ChatResponse(
            session_id=session_id, intent=intent,
            reply=reply, sources=sources,
        )

    except HTTPException as e:
        return ChatResponse(
            session_id=session_id, intent=intent,
            reply="Sorry, I'm having trouble connecting. Please try again.",
            success=False, sources=sources, error=str(e.detail),
        )
    except Exception as e:
        return ChatResponse(
            session_id=session_id, intent=intent,
            reply="An unexpected error occurred. Please try again.",
            success=False, sources=sources, error=str(e),
        )


@router.get("/v1/chat/session/{session_id}", response_model=SessionHistoryResponse)
def get_session(session_id: str, db: Session = Depends(get_db)):
    """Return full chronological conversation history for a session."""
    rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.id)
        .all()
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = [
        SessionMessage(
            id=row.id,
            role=row.role,
            content=row.content,
            intent=row.intent,
            sources=json.loads(row.sources) if row.sources else [],
            created_at=row.created_at,
        )
        for row in rows
    ]
    return SessionHistoryResponse(
        session_id=session_id,
        messages=messages,
        total=len(messages),
    )


@router.post("/v1/chat/feedback")
def submit_feedback(req: FeedbackRequest, db: Session = Depends(get_db)):
    """Log a thumbs-up / thumbs-down rating for a specific message turn."""
    session = db.query(ChatSession).filter(ChatSession.id == req.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if req.rating not in ("thumbs_up", "thumbs_down"):
        raise HTTPException(
            status_code=422,
            detail="rating must be 'thumbs_up' or 'thumbs_down'",
        )

    record = ChatFeedback(
        session_id=req.session_id,
        message_index=req.message_index,
        rating=req.rating,
        comment=req.comment or "",
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "status":        "recorded",
        "feedback_id":   record.id,
        "session_id":    req.session_id,
        "message_index": req.message_index,
        "rating":        req.rating,
    }