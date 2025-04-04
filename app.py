from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication

# Fetch API keys
GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Validate API keys
if not GNEWS_API_KEY:
    raise ValueError("GNEWS_API_KEY is missing. Please set it in the .env file.")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is missing. Please set it in the .env file.")

# API Configurations
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
HEADERS = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json"
}

# Use a session for better performance
session = requests.Session()

# Cache for reducing duplicate API calls
summary_cache = {}
news_cache = {"data": None, "timestamp": datetime.utcnow()}


def fetch_news(query=None):
    """Fetch news articles from GNews API."""
    try:
        # Check if cache is recent and the request is for top headlines (no query)
        if not query and news_cache["data"] and datetime.utcnow() - news_cache["timestamp"] < timedelta(minutes=30):
            print("Serving cached top news")  # Debugging statement
            return news_cache["data"]

        # Determine the API endpoint
        base_url = "https://gnews.io/api/v4/search" if query else "https://gnews.io/api/v4/top-headlines"
        params = {
            "q": query or "",
            "lang": "en",
            "country": "in",
            "token": GNEWS_API_KEY,
            "sortby": "publishedAt"
        }

        response = session.get(base_url, params=params)
        response.raise_for_status()
        articles = response.json().get("articles", [])

        news_list = []
        for article in articles[:10]:
            news_list.append({
                "title": article.get("title", "No Title"),
                "description": article.get("description", "No description available"),
                "url": article.get("url", "#"),
                "image": article.get("image", "https://via.placeholder.com/150"),
                "published_at": article.get("publishedAt", "Unknown Date")
            })

        # Cache only the home page news (top headlines), not search results
        if not query:
            news_cache["data"] = news_list
            news_cache["timestamp"] = datetime.utcnow()

        return news_list
    except requests.RequestException as e:
        return [{"title": "Error", "description": f"Failed to fetch news: {str(e)}", "url": "#"}]


@app.route("/get_news", methods=["GET"])
def get_news():
    """Fetch and return the latest news."""
    query = request.args.get("query", "").strip()
    news = fetch_news(query)
    return jsonify(news)


@app.route("/process_input", methods=["POST"])
def process_input():
    """Process user input and return a response."""
    user_input = request.json.get("user_input", "").strip().lower()
    if not user_input:
        return jsonify({"response": "Please enter some text."})

    topic = user_input
    news = fetch_news(topic)
    if not news:
        return jsonify({"response": "No news found for this topic."})

    news_summary = "\n\n".join([
        f"🔹 {n['title']}\n📅 {n['published_at']}\n🌐 [Read more]({n['url']})"
        for n in news
    ])
    return jsonify({"response": f"📰 Latest {topic.capitalize()} News in India:\n\n{news_summary}"})


if __name__ == "__main__":
    app.run(debug=True)
