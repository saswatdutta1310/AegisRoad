"""
blockchain.py — AegisRoad v3.0
Proof of Repair (PoR) anchoring on Avalanche Fuji Testnet via web3.py v7+

Place this file at:  backend/blockchain.py  (same folder as main.py)

Responsibilities:
  1. Initialize Web3 provider + contract at import time (singleton).
  2. Expose `record_on_chain_proof` as a FastAPI BackgroundTask.
  3. Write tx_hash + status back to the hazards table on success.

Compatible with:
  - web3.py v7.x  (Python 3.13)
  - SQLite locally  (reuses your existing SessionLocal)
  - PostgreSQL on Render  (same code path, auto-detected)
"""

from __future__ import annotations

from dotenv import load_dotenv
load_dotenv()

import asyncio
import hashlib
import json
import logging
import os
from typing import Optional

from web3 import Web3
from web3.exceptions import ContractLogicError, TransactionNotFound

# ── web3 v7 / v6 middleware compatibility shim ───────────────────────────────
try:
    from web3.middleware import ExtraDataToPOAMiddleware          # web3 v7+
except ImportError:
    try:
        from web3.middleware import geth_poa_middleware as ExtraDataToPOAMiddleware  # v6
    except ImportError:
        ExtraDataToPOAMiddleware = None                           # skip if neither found

logger = logging.getLogger("aegisroad.blockchain")


# ─────────────────────────────────────────────────────────────────────────────
# § 1  Environment & constants
# ─────────────────────────────────────────────────────────────────────────────

AVALANCHE_RPC_URL: str = os.environ.get(
    "AVALANCHE_RPC_URL",
    "https://api.avax-test.network/ext/bc/C/rpc",
)
CONTRACT_ADDRESS: str  = os.environ.get("CONTRACT_ADDRESS", "")
_CONTRACT_ABI_RAW: str = os.environ.get("CONTRACT_ABI", "[]")
PRIVATE_KEY: str       = os.environ.get("PRIVATE_KEY", "")
DATABASE_URL: str      = os.environ.get("DATABASE_URL", "")  # only used on Render

# Avalanche Fuji chain ID — never change for testnet
FUJI_CHAIN_ID: int   = 43113
GAS_LIMIT_FLOOR: int = 100_000
GAS_PRICE_GWEI: int  = 25        # Fuji base fee ≈ 25 Gwei


# ─────────────────────────────────────────────────────────────────────────────
# § 2  Web3 singleton
# ─────────────────────────────────────────────────────────────────────────────

def _build_web3() -> Optional[Web3]:
    """
    Connect to Avalanche Fuji.
    Returns None (app still boots) when env vars are missing — safe for local dev.
    """
    if not PRIVATE_KEY or not CONTRACT_ADDRESS:
        logger.warning(
            "PRIVATE_KEY or CONTRACT_ADDRESS not set — "
            "blockchain features disabled. App boots normally."
        )
        return None

    w3 = Web3(Web3.HTTPProvider(AVALANCHE_RPC_URL))

    # Inject PoA middleware — Avalanche C-Chain needs this for oversized headers
    if ExtraDataToPOAMiddleware is not None:
        try:
            w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)
        except Exception as e:
            logger.warning("Could not inject PoA middleware: %s", e)

    if not w3.is_connected():
        logger.error("Cannot connect to Avalanche RPC at %s", AVALANCHE_RPC_URL)
        return None

    logger.info("✅ Web3 connected — Avalanche Fuji | chain_id=%s", w3.eth.chain_id)
    return w3


def _build_contract(w3: Web3):
    """Load the deployed PoR contract from env-supplied address + ABI."""
    try:
        abi = json.loads(_CONTRACT_ABI_RAW)
    except json.JSONDecodeError as exc:
        logger.error("CONTRACT_ABI is not valid JSON: %s", exc)
        raise
    checksum_addr = Web3.to_checksum_address(CONTRACT_ADDRESS)
    return w3.eth.contract(address=checksum_addr, abi=abi)


# Module-level singletons — built once on first import
w3: Optional[Web3] = _build_web3()
contract             = _build_contract(w3) if w3 else None
WALLET_ADDRESS: str  = (
    w3.eth.account.from_key(PRIVATE_KEY).address
    if w3 and PRIVATE_KEY else ""
)
if WALLET_ADDRESS:
    logger.info("✅ PoR wallet: %s", WALLET_ADDRESS)


# ─────────────────────────────────────────────────────────────────────────────
# § 3  Database write-back
#      Reuses the SAME sync SessionLocal your existing hazards.py uses.
#      Works on SQLite locally AND PostgreSQL on Render — no code change needed.
# ─────────────────────────────────────────────────────────────────────────────

def _write_tx_to_db(ticket_id: str, tx_hash_hex: str) -> None:
    """
    Synchronous DB update — runs inside run_in_executor so it never blocks
    the async event loop.

    Updates the hazards row: sets tx_hash and status = 'Secured on Avalanche'.
    NOTE: ticket_id is cast to int because your Hazard.id is an Integer column.
    """
    try:
        from app.core.database import SessionLocal
        from sqlalchemy import text

        db = SessionLocal()
        try:
            db.execute(
                text(
                    """
                    UPDATE hazards
                    SET    tx_hash = :tx_hash,
                           status  = :status
                    WHERE  id = :ticket_id
                    """
                ),
                {
                    "tx_hash":   tx_hash_hex,
                    "status":    "Secured on Avalanche",
                    "ticket_id": int(ticket_id),   # cast: Hazard.id is Integer
                },
            )
            db.commit()
            logger.info("✅ DB updated | ticket=%s | tx=%s", ticket_id, tx_hash_hex)
        except Exception as db_exc:
            db.rollback()
            # DB failure is logged but does NOT retry the on-chain tx.
            # The tx already landed — reconcile manually using the logged hash.
            logger.error(
                "DB write-back FAILED for ticket %s "
                "(tx already on-chain: %s): %s",
                ticket_id, tx_hash_hex, db_exc, exc_info=True,
            )
        finally:
            db.close()

    except ImportError as imp_exc:
        logger.error("Could not import SessionLocal — DB write skipped: %s", imp_exc)


# ─────────────────────────────────────────────────────────────────────────────
# § 4  SHA-256 proof hash
# ─────────────────────────────────────────────────────────────────────────────

def _sha256_proof(image_url: str, lat: float, lng: float) -> str:
    """Return 0x-prefixed SHA-256 hex of '{image_url}_{lat}_{lng}'."""
    raw = f"{image_url}_{lat}_{lng}"
    return "0x" + hashlib.sha256(raw.encode("utf-8")).hexdigest()


# ─────────────────────────────────────────────────────────────────────────────
# § 5  Background task — called by FastAPI after HTTP response is sent
# ─────────────────────────────────────────────────────────────────────────────

async def record_on_chain_proof(
    ticket_id: str,
    image_url: str,
    lat: float,
    lng: float,
) -> None:
    """
    FastAPI BackgroundTask — client never waits for this.

    Flow:
      1. SHA-256 hash the evidence (image_url + lat + lng)
      2. Fetch nonce from Fuji
      3. Estimate gas, build transaction
      4. Sign + broadcast
      5. Wait for mining receipt
      6. Write tx_hash to hazards table
    """
    if w3 is None or contract is None:
        logger.warning(
            "Blockchain not initialised — skipping PoR for ticket %s", ticket_id
        )
        return

    proof_hash = _sha256_proof(image_url, lat, lng)
    logger.info("PoR started | ticket=%s | proof=%s", ticket_id, proof_hash)

    loop = asyncio.get_event_loop()

    # ── 5a  Nonce ────────────────────────────────────────────────────────────
    try:
        nonce: int = await loop.run_in_executor(
            None,
            lambda: w3.eth.get_transaction_count(WALLET_ADDRESS, "pending"),
        )
    except Exception as exc:
        logger.error("Failed to fetch nonce | ticket=%s: %s", ticket_id, exc)
        return

    # ── 5b  Gas estimation ───────────────────────────────────────────────────
    try:
        raw_estimate: int = await loop.run_in_executor(
            None,
            lambda: contract.functions.submitProof(
                ticket_id, proof_hash
            ).estimate_gas({"from": WALLET_ADDRESS}),
        )
        gas_limit = int(raw_estimate * 1.25)   # 25% safety buffer
    except Exception as gas_exc:
        logger.warning(
            "Gas estimation failed (%s) — using floor %d", gas_exc, GAS_LIMIT_FLOOR
        )
        gas_limit = GAS_LIMIT_FLOOR

    # ── 5c  Build transaction ────────────────────────────────────────────────
    try:
        tx = contract.functions.submitProof(
            ticket_id, proof_hash
        ).build_transaction(
            {
                "chainId":  FUJI_CHAIN_ID,
                "from":     WALLET_ADDRESS,
                "nonce":    nonce,
                "gas":      gas_limit,
                "gasPrice": w3.to_wei(GAS_PRICE_GWEI, "gwei"),
            }
        )
    except ContractLogicError as exc:
        logger.error("Contract logic error | ticket=%s: %s", ticket_id, exc)
        return
    except Exception as exc:
        logger.error("tx build failed | ticket=%s: %s", ticket_id, exc, exc_info=True)
        return

    # ── 5d  Sign + broadcast ─────────────────────────────────────────────────
    try:
        signed = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
        tx_hash_bytes = await loop.run_in_executor(
            None,
            lambda: w3.eth.send_raw_transaction(signed.raw_transaction),
        )
        tx_hash_hex: str = tx_hash_bytes.hex()
        logger.info("PoR broadcast | ticket=%s | tx=%s", ticket_id, tx_hash_hex)
    except Exception as exc:
        logger.error(
            "Broadcast failed | ticket=%s: %s", ticket_id, exc, exc_info=True
        )
        return

    # ── 5e  Wait for mining receipt ──────────────────────────────────────────
    try:
        receipt = await loop.run_in_executor(
            None,
            lambda: w3.eth.wait_for_transaction_receipt(
                tx_hash_bytes,
                timeout=120,     # Fuji mines in ~2s; 120s is very safe
                poll_latency=2,
            ),
        )
        if receipt["status"] != 1:
            logger.error(
                "Tx REVERTED on-chain | ticket=%s | tx=%s", ticket_id, tx_hash_hex
            )
            return
        logger.info(
            "✅ PoR confirmed | ticket=%s | block=%s | tx=%s",
            ticket_id, receipt["blockNumber"], tx_hash_hex,
        )
    except TransactionNotFound:
        logger.error(
            "Tx not found after timeout | ticket=%s | tx=%s", ticket_id, tx_hash_hex
        )
        return
    except Exception as exc:
        logger.error(
            "Receipt await failed | ticket=%s: %s", ticket_id, exc, exc_info=True
        )
        return

    # ── 5f  Write tx_hash to database ────────────────────────────────────────
    await loop.run_in_executor(None, _write_tx_to_db, ticket_id, tx_hash_hex)