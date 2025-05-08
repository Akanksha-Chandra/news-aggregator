import os
import requests
import feedparser
from datetime import datetime
from dotenv import load_dotenv
import urllib.parse

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")


def safe_request(url, headers=None):
    try:
        response = requests.get(url, headers=headers or {}, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"[ERROR] Failed to fetch from URL: {url}\n{e}")
        return {}


def get_gnews(query):
    if not GNEWS_API_KEY:
        print("[WARN] Missing GNEWS_API_KEY")
        return []

    url = f"https://gnews.io/api/v4/search?q={query}&token={GNEWS_API_KEY}&lang=en"
    data = safe_request(url)
    articles = data.get("articles", [])

    return [
        {
            "title": a.get("title", ""),
            "description": a.get("description", ""),
            "url": a.get("url", ""),
            "source": {"name": a.get("source", {}).get("name", "GNews")}
        }
        for a in articles
    ]


def get_google_news_rss(query):
    encoded_query = urllib.parse.quote(query)
    rss_url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-IN&gl=IN&ceid=IN:en"
    
    try:
        feed = feedparser.parse(rss_url)
        return [
            {
                "title": entry.get("title", ""),
                "description": entry.get("summary", ""),
                "url": entry.get("link", ""),
                "source": {"name": "Google News"}
            }
            for entry in feed.entries[:10]
        ]
    except Exception as e:
        print(f"[ERROR] Google RSS error: {e}")
        return []


def get_reddit_news():
    headers = {"User-Agent": "NewsBot/1.0"}
    url = "https://www.reddit.com/r/worldnews/top/.json?limit=10"
    data = safe_request(url, headers=headers)

    children = data.get("data", {}).get("children", [])
    return [
        {
            "title": item["data"].get("title", ""),
            "description": "",
            "url": item["data"].get("url", ""),
            "source": {"name": "Reddit - r/worldnews"}
        }
        for item in children
    ]


def get_hackernews_top():
    url = "https://hacker-news.firebaseio.com/v0/topstories.json"
    try:
        top_ids = requests.get(url, timeout=10).json()[:10]
        articles = []
        for story_id in top_ids:
            story = safe_request(f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json")
            if story and "title" in story:
                articles.append({
                    "title": story.get("title", ""),
                    "description": "",
                    "url": story.get("url", ""),
                    "source": {"name": "Hacker News"}
                })
        return articles
    except Exception as e:
        print(f"[ERROR] Hacker News fetch failed: {e}")
        return []


def get_wikipedia_current_events():
    date_path = datetime.utcnow().strftime("%m/%d")
    url = f"https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/{date_path}"
    data = safe_request(url)

    events = data.get("events", [])
    return [
        {
            "title": e.get("text", ""),
            "description": "",
            "url": e.get("pages", [{}])[0].get("content_urls", {}).get("desktop", {}).get("page", ""),
            "source": {"name": "Wikipedia - On This Day"}
        }
        for e in events
    ]


def fetch_all_news_sources(query="world"):
    all_news = (
        get_gnews(query) +
        get_google_news_rss(query) +
        get_reddit_news() +
        get_hackernews_top() +
        get_wikipedia_current_events()
    )

    # Deduplicate by title
    seen_titles = set()
    unique_news = []
    for item in all_news:
        title = item.get("title", "")
        if title and title not in seen_titles:
            seen_titles.add(title)
            unique_news.append(item)

    return unique_news
