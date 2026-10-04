import time

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from cache import (
    claim_id_from_hash,
    get_cached_verification,
    hash_claim,
    list_recent_verifications,
    save_verification,
)
from media_processing import extract_text_from_image_file, transcribe_audio_file
from reasoning import reason_about_claim
from schemas import AgentLog, FeedItem, Source, VerifyRequest, VerifyResponse
from search import search_claim, deduplicate_and_format

load_dotenv()
app = FastAPI(title="SynthFocus AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def extract_pitch_text(payload: VerifyRequest) -> str:
    if payload.input_type == "text":
        return payload.content.strip()

    raise HTTPException(
        status_code=501,
        detail=f"{payload.input_type} input is planned but not implemented yet.",
    )


def analyze_product_pitch(
    pitch_text: str,
    input_type: str = "text",
    extracted_text: str | None = None,
    initial_agent_logs: list[AgentLog] | None = None,
):
    start = time.perf_counter()
    if not pitch_text:
        raise HTTPException(status_code=400, detail="Product pitch content is required.")

    pitch_hash = hash_claim(pitch_text)
    session_id = claim_id_from_hash(pitch_hash)
    agent_logs = list(initial_agent_logs or [])
    agent_logs.append(
        AgentLog(
            agent_name="Pitch Ingestion Agent",
            status="completed",
            message="Product pitch ingested and normalized",
        )
    )

    # cached = get_cached_verification(pitch_hash)
    # if cached:
    #     cached["is_cached"] = True
    #     cached["processing_time_seconds"] = round(time.perf_counter() - start, 2)
    #     cached["agent_logs"] = [
    #         log.model_dump() for log in agent_logs
    #     ] + [
    #         {
    #             "agent_name": "Cache Agent",
    #             "status": "completed",
    #             "message": "Served duplicate focus group session from cache",
    #         }
    #     ]
    #     cached["extracted_text"] = extracted_text
    #     return cached

    warnings: list[str] = []
    try:
        raw_results, optimized_query, search_plan = search_claim(pitch_text)
        formatted_sources = deduplicate_and_format(raw_results)
        agent_logs.append(
            AgentLog(
                agent_name="Market Intelligence Agent",
                status="completed",
                message=f"Retrieved {len(formatted_sources)} market benchmarks. {'; '.join(search_plan)}",
            )
        )
    except Exception as exc:
        optimized_query = pitch_text
        search_plan = []
        formatted_sources = []
        agent_logs.append(
            AgentLog(
                agent_name="Market Intelligence Agent",
                status="failed",
                message="Market benchmark search failed; evaluating with internal persona knowledge base",
            )
        )
        warnings.append(f"Market search warning; evaluation based on model priors. Details: {exc}")

    sources = [Source(**source) for source in formatted_sources]
    
    # Runs the synthetic focus group personas (Skeptic, Innovator, Price Seeker)
    reasoning, reasoning_warnings = reason_about_claim(pitch_text, sources)
    warnings.extend(reasoning_warnings)

    agent_logs.append(
        AgentLog(
            agent_name="SynthFocus Persona Simulation Agent",
            status="completed" if not reasoning_warnings else "failed",
            message=(
                "Synthesized consensus across Skeptic, Innovator, and Value-Oriented consumer personas"
                if not reasoning_warnings
                else "Used fallback focus group evaluation due to LLM pass timeout"
            ),
        )
    )
    agent_logs.append(
        AgentLog(
            agent_name="Session Cache Agent",
            status="completed",
            message="Saved focus group report for fast retrieval",
        )
    )

    response = {
        "claim_id": session_id,
        "is_cached": False,
        "verdict": reasoning.get("verdict", "Market Viability Assessed"),
        "trust_score": reasoning.get("trust_score", 75),  # Serves as Market Fit Score
        "summary": reasoning.get("summary", ""),
        "key_findings": reasoning.get("key_findings", []),
        "sources": [source.model_dump() for source in sources],
        "agent_logs": [log.model_dump() for log in agent_logs],
        "processing_time_seconds": round(time.perf_counter() - start, 2),
        "warnings": warnings,
        "claim": pitch_text,
        "claim_hash": pitch_hash,
        "input_type": input_type,
        "optimized_query": optimized_query,
        "search_plan": search_plan,
        "extracted_text": extracted_text,
    }

    save_verification(pitch_hash, response)
    return response


@app.post("/api/verify", response_model=VerifyResponse)
def verify_claim(payload: VerifyRequest):
    pitch_text = extract_pitch_text(payload)
    return analyze_product_pitch(pitch_text, input_type=payload.input_type)


@app.post("/api/verify-file", response_model=VerifyResponse)
def verify_uploaded_file(input_type: str = Form(...), file: UploadFile = File(...)):
    if input_type not in {"audio", "image"}:
        raise HTTPException(status_code=400, detail="input_type must be audio or image.")

    try:
        if input_type == "audio":
            extracted_text = transcribe_audio_file(file)
            media_message = "Pitch audio transcribed with local faster-whisper"
        else:
            extracted_text = extract_text_from_image_file(file)
            media_message = "Slide / Pitch deck image text extracted with OCR"
    except RuntimeError as exc:
        raise HTTPException(status_code=501, detail=str(exc)) from exc

    media_log = AgentLog(
        agent_name="Media Transcription Agent",
        status="completed",
        message=media_message,
    )
    return analyze_product_pitch(
        extracted_text,
        input_type=input_type,
        extracted_text=extracted_text,
        initial_agent_logs=[media_log],
    )


@app.post("/agent/search")
def search_evidence(payload: VerifyRequest):
    pitch_text = payload.content.strip()
    if not pitch_text:
        raise HTTPException(status_code=400, detail="Pitch content is required.")
    raw_results, optimized_query, search_plan = search_claim(pitch_text)
    sources = deduplicate_and_format(raw_results)
    return {"optimized_query": optimized_query, "sources": sources, "search_plan": search_plan}


@app.get("/api/feed", response_model=list[FeedItem])
def verification_feed(limit: int = 20):
    safe_limit = max(1, min(limit, 50))
    return list_recent_verifications(safe_limit)


@app.get("/")
def health_check():
    return {"status": "SynthFocus AI Autonomous Focus Group API running"}