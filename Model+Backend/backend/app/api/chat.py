from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
import anthropic
from ..core.config import settings

router = APIRouter(prefix="/chat", tags=["chat"])

SYSTEM = ("You are AegisChat, the AI assistant for AegisRoad road safety platform. "
          "Help citizens with road hazard queries, contractor accountability, and reporting. "
          "Be concise and civic-minded.")

class ChatRequest(BaseModel):
    message: str
    history: List[Dict] = []

@router.post("/")
async def chat(req: ChatRequest):
    try:
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        msgs = [m for m in req.history if m.get("role") in ("user","assistant")]
        msgs.append({"role":"user","content":req.message})
        res = client.messages.create(model="claude-sonnet-4-20250514",max_tokens=1000,system=SYSTEM,messages=msgs)
        return {"reply": res.content[0].text}
    except Exception as e:
        return {"reply": f"Service unavailable: {e}"}
