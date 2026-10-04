import os
from dotenv import load_dotenv
from tavily import TavilyClient
from query_transform import transform_query

load_dotenv()

HIGH_CREDIBILITY = [
    "techcrunch.com", "producthunt.com", "g2.com", "capterra.com",
    "ycombinator.com", "bloomberg.com", "statista.com", "forbes.com",
    "crunchbase.com", "github.com"
]
MEDIUM_CREDIBILITY = [
    "medium.com", "dev.to", "venturebeat.com", "theverge.com", 
    "wired.com", "businessinsider.com", "news.ycombinator.com"
]
BLOCKED_DOMAINS = [
    "facebook.com", "twitter.com", "x.com", "instagram.com", 
    "tiktok.com", "quora.com", "pinterest.com"
]


def _run_search(tavily_client, query, max_results, include_domains=None, search_depth="basic"):
    kwargs = {
        "query": query,
        "search_depth": search_depth,
        "max_results": max_results,
        "exclude_domains": BLOCKED_DOMAINS,
    }
    if include_domains:
        kwargs["include_domains"] = include_domains
    return tavily_client.search(**kwargs).get("results", [])


def get_credibility(url):
    for domain in HIGH_CREDIBILITY:
        if domain in url:
            return "High"
    for domain in MEDIUM_CREDIBILITY:
        if domain in url:
            return "Medium"
    return "Low"

def is_blocked(url):
    return any(blocked in url for blocked in BLOCKED_DOMAINS)

def search_claim(raw_pitch):
    tavily_key = os.getenv("TAVILY_API_KEY")
    if not tavily_key:
        raise RuntimeError("TAVILY_API_KEY is missing")

    tavily_client = TavilyClient(api_key=tavily_key)
    
    # 1. Clean query generation: use transformed topic or raw pitch excerpt directly
    pitch_topic = transform_query(raw_pitch) if callable(transform_query) else raw_pitch[:100]
    optimized_query = f"{pitch_topic} industry competitors market analysis"

    search_plan = []
    combined_results = []

    # First pass: targeted query
    benchmark_results = _run_search(
        tavily_client,
        optimized_query,
        max_results=5,
        search_depth="basic",
    )
    combined_results.extend(benchmark_results)
    search_plan.append(f"Market benchmark pass found {len(benchmark_results)} industry sources")

    # Fallback pass if few results found
    if len(deduplicate_and_format(combined_results)) < 3:
        wide_results = _run_search(
            tavily_client,
            f"{pitch_topic} startups product market fit",
            max_results=5,
            search_depth=os.getenv("TAVILY_FALLBACK_SEARCH_DEPTH", "advanced"),
        )
        combined_results.extend(wide_results)
        search_plan.append(f"Wide market discovery found {len(wide_results)} references")

    return combined_results, optimized_query, search_plan

def deduplicate_and_format(results):
    seen_urls = set()
    formatted = []
    
    for r in results:
        url = r.get('url', '')
        if is_blocked(url):
            continue
        if url in seen_urls:
            continue
        seen_urls.add(url)
        
        formatted.append({
            "title": r.get('title', ''),
            "url": url,
            "credibility": get_credibility(url),
            "snippet": r.get('content', ''),
            "published_date": r.get('published_date', 'unknown')
        })
        
        if len(formatted) >= 5:
            break
    
    return formatted

def get_verified_sources(pitch_text):
    raw_results, optimized_query, search_plan = search_claim(pitch_text)
    sources = deduplicate_and_format(raw_results)
    return {
        "optimized_query": optimized_query,
        "sources": sources,
        "search_plan": search_plan,
    }

if __name__ == "__main__":
    pitch = "AI focus group for validating SaaS startup ideas"
    result = get_verified_sources(pitch)
    print(f"Optimized query: {result['optimized_query']}\n")
    for s in result['sources']:
        print(s)
        print("---")