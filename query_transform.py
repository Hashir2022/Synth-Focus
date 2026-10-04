import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

def transform_query(raw_pitch):
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        return " ".join(raw_pitch.split())[:180]

    client = Groq(api_key=groq_key)
    prompt = f"""You are a market intelligence query optimizer for SynthFocus, an AI focus group platform.
Convert the following product pitch or business concept into a concise search query to find market benchmarks, direct competitors, and industry demand.

Rules:
- Extract core product features, target industry, and key keywords.
- Optimize for market research and competitor discovery.
- Keep it concise (under 12 words).
- Output ONLY the search query, nothing else.

Pitch: "{raw_pitch}"

Search query:"""

    try:
        response = client.chat.completions.create(
            model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_completion_tokens=100,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return " ".join(raw_pitch.split())[:180]

if __name__ == "__main__":
    test_pitch = "AI-powered focus group tool for SaaS startups"
    result = transform_query(test_pitch)
    print("RESULT:", result)