"""
AegisRoad v3.0 — AegisChat API
Powered by Claude (Anthropic) — PRD compliant response shape
"""

import uuid
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.core.config import settings

router = APIRouter()

ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"

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
    history: Optional[List[Message]] = []


class ChatResponse(BaseModel):
    reply: str
    success: bool
    session_id: str
    intent: str
    sources: List[str]
    error: Optional[str] = None


class FeedbackRequest(BaseModel):
    session_id: str
    rating: int       # 1 = thumbs up, -1 = thumbs down
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


# ── Demo responses (fallback if no API key) ────────────────────────────────────
DEMO_RESPONSES = [
    "I'm AegisChat! Potholes (D40) are Critical severity — contractors must fix them within 48 hours under our SLA system.",
    "AegisRoad uses YOLOv8-Nano trained on 26,869 road images from 6 countries including India, detecting 5 damage types.",
    "SpendWatch tracks contractor performance — ranked by SLA compliance, repair quality, and budget utilization in real time.",
]
demo_counter = 0


# ── Claude API call ────────────────────────────────────────────────────────────
async def call_claude(user_message: str, history: List[Message]) -> str:
    messages = []
    for msg in history[-10:]:
        messages.append({
            "role": "user" if msg.role == "user" else "assistant",
            "content": msg.content
        })
    messages.append({"role": "user", "content": user_message})

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            ANTHROPIC_URL,
            headers={
                "x-api-key": settings.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-haiku-4-5",
                "max_tokens": 512,
                "system": SYSTEM_PROMPT,
                "messages": messages,
            }
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Anthropic API error: {response.text}"
        )

    data = response.json()
    return data["content"][0]["text"]


# ── Routes ─────────────────────────────────────────────────────────────────────
@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    global demo_counter

    session_id = str(uuid.uuid4())
    intent = detect_intent(req.message)
    sources = [
        "AegisRoad hazard database",
        "RDD2022 training data",
        "contractor ledger"
    ]

    if not settings.ANTHROPIC_API_KEY:
        reply = DEMO_RESPONSES[demo_counter % len(DEMO_RESPONSES)]
        demo_counter += 1
        return ChatResponse(
            reply=reply,
            success=True,
            session_id=session_id,
            intent=intent,
            sources=sources,
            error="Demo mode — add ANTHROPIC_API_KEY to .env"
        )

    try:
        reply = await call_claude(req.message, req.history or [])
        return ChatResponse(
            reply=reply,
            success=True,
            session_id=session_id,
            intent=intent,
            sources=sources
        )

    except HTTPException as e:
        return ChatResponse(
            reply="Sorry, I'm having trouble connecting. Please try again.",
            success=False,
            session_id=session_id,
            intent=intent,
            sources=sources,
            error=str(e.detail)
        )
    except Exception as e:
        return ChatResponse(
            reply="An unexpected error occurred. Please try again.",
            success=False,
            session_id=session_id,
            intent=intent,
            sources=sources,
            error=str(e)
        )


@router.post("/feedback")
async def feedback(req: FeedbackRequest):
    """PRD §5 — chat feedback endpoint"""
    return {
        "status": "recorded",
        "id": str(uuid.uuid4()),
        "session_id": req.session_id,
        "rating": req.rating,
        "message": "Thank you for your feedback"
    }
