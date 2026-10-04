import json
import os
import re
from pathlib import Path
from typing import Any
from dotenv import load_dotenv
from groq import Groq

# Load .env from backend directory
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)


def get_groq_client() -> tuple[Groq | None, str | None]:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None, "GROQ_API_KEY missing from environment."
    try:
        client = Groq(api_key=api_key)
        return client, None
    except Exception as e:
        return None, str(e)


def extract_json_safely(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    if "```" in cleaned:
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
        if match:
            cleaned = match.group(1).strip()
    
    start_idx = cleaned.find('{')
    end_idx = cleaned.rfind('}')
    
    if start_idx != -1 and end_idx != -1:
        cleaned = cleaned[start_idx:end_idx + 1]
        
    return json.loads(cleaned)


def reason_about_claim(pitch_text: str, sources: list[Any]) -> tuple[dict[str, Any], list[str]]:
    client, init_error = get_groq_client()
    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    warnings: list[str] = []

    if not client:
        return _fallback_reasoning(init_error or "Groq client missing"), [init_error or "Groq API key not configured."]

    formatted_sources = "\n".join([f"- {getattr(s, 'title', '')}: {getattr(s, 'snippet', '')}" for s in sources[:3]]) if sources else "No external search benchmarks available."

    try:
        print(f"\n🚀 Running Groq Persona Simulation using model: {model}...", flush=True)

        # STEP 1: VC / Investor Agent Evaluation
        vc_prompt = f"""You are a Silicon Valley VC Investor Agent.
Evaluate this startup brief strictly on TAM, CAC/LTV, unit economics, and monetization viability.
Startup Brief: {pitch_text}
Market Benchmarks: {formatted_sources}

Write a 2-sentence critique focusing purely on business viability."""

        vc_res = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a concise Silicon Valley VC Investor AI Agent."},
                {"role": "user", "content": vc_prompt}
            ],
            max_tokens=350,
        )
        vc_critique = vc_res.choices[0].message.content.strip().replace('"', "'").replace('\n', ' ')
        print("✅ VC Agent Response Received.", flush=True)

        # STEP 2: Gen-Z Consumer Agent Debates VC
        genz_prompt = f"""You are a Gen-Z Consumer & UX Persona Agent.
Read the startup brief and the VC's critique below. Challenge the VC's assumptions, test user onboarding friction, viral appeal, and value clarity.
Startup Brief: {pitch_text}
VC Critique: {vc_critique}

Write a 2-sentence critique focusing on user adoption and UX friction."""

        genz_res = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a direct Gen-Z Consumer & UX Persona AI Agent."},
                {"role": "user", "content": genz_prompt}
            ],
            max_tokens=350,
        )
        genz_critique = genz_res.choices[0].message.content.strip().replace('"', "'").replace('\n', ' ')
        print("✅ Gen-Z Agent Response Received.", flush=True)

        # STEP 3: Legal & Consensus Synthesis Agent (Dynamic Score Evaluation)
        legal_prompt = f"""You are the Legal, Compliance, & Consensus Lead AI Agent.
Synthesize the startup brief and debate transcript into a JSON report.

Startup Brief: {pitch_text}
VC Critique: {vc_critique}
Gen-Z Critique: {genz_critique}

INSTRUCTIONS:
Evaluate the startup pitch dynamically based on the critiques above.
- If the brief is vague, incomplete, or weak (e.g., 'test run' or missing business logic), set 'trust_score' between 15 and 45, and 'verdict' to 'Low Viability' or 'Niche Appeal'.
- If the brief is detailed, clear, and scalable, set 'trust_score' between 70 and 95, and 'verdict' to 'High Viability' or 'Moderate Viability'.

Return a JSON object with EXACTLY these schema keys:
{{
  "verdict": "<evaluated_verdict_string>",
  "trust_score": <calculated_integer_score_between_10_and_98>,
  "summary": {{
    "english": "<2-sentence executive summary combining all 3 persona points>",
    "urdu": "<Urdu summary translation>"
  }},
  "key_findings": [
    "[VC Agent]: {vc_critique}",
    "[Gen-Z Agent]: {genz_critique}",
    "[Legal Agent]: <Your 1-sentence legal and regulatory analysis>"
  ]
}}"""

        final_res = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are an executive consensus AI agent. You MUST respond ONLY with a single valid raw JSON object matching the requested schema. Calculate the score dynamically based on the input."},
                {"role": "user", "content": legal_prompt}
            ],
            response_format={"type": "json_object"},
            max_tokens=3500,
        )
        
        raw_text = final_res.choices[0].message.content
        parsed = extract_json_safely(raw_text)
        print(f"🎉 All Agents Completed Successfully! Evaluated Score: {parsed.get('trust_score')}\n", flush=True)
        return parsed, warnings

    except Exception as exc:
        print(f"\n❌ GROQ SIMULATION ERROR: {exc}\n", flush=True)
        return _fallback_reasoning(str(exc)), [f"LLM execution error: {exc}"]


def _fallback_reasoning(reason: str) -> dict[str, Any]:
    return {
        "verdict": "Moderate Viability",
        "trust_score": 70,
        "summary": {
            "english": f"Fallback evaluation triggered. Details: {reason}",
            "urdu": "مصنوعات کی تصدیق کا عمل مکمل ہوا۔"
        },
        "key_findings": [
            "[VC Agent]: Evaluating unit economics and TAM scale...",
            "[Gen-Z Agent]: Testing user friction and viral adoption hooks...",
            "[Legal Agent]: Checking regulatory exposure and privacy rules..."
        ]
    }