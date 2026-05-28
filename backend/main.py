from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import hazards, contractors, predict, chat

app = FastAPI(title="AegisRoad API", version="3.0.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

app.include_router(hazards.router,     prefix="/api")
app.include_router(contractors.router, prefix="/api")
app.include_router(predict.router,     prefix="/api")
app.include_router(chat.router,        prefix="/api")

@app.get("/")
def root():
    return {"status": "AegisRoad API v3.0 running", "docs": "/docs"}
