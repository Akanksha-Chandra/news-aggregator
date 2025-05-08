from flask import Flask, request, jsonify
from sources import fetch_all_news_sources
from flask_cors import CORS
import traceback
import json
import requests
import os
import traceback  # Add this import for error handling
from datetime import datetime, timedelta
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Configure CORS for all routes
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

# API keys
GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GNEWS_API_KEY:
    raise ValueError("GNEWS_API_KEY is missing in .env")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is missing in .env")

# Constants
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
HEADERS = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json"
}

# Session and cache
session = requests.Session()
summary_cache = {}
news_cache = {"data": None, "timestamp": datetime.utcnow()}

CATEGORIES = {
    "sports": ["football", "cricket", "basketball", "tennis", "hockey"],
    "technology": ["ai", "tech", "machine learning", "gadgets"],
    "health": ["health", "medicine", "fitness", "wellness"],
    "business": ["business", "finance", "economy", "market"],
    "entertainment": ["movies", "music", "celebrity", "tv"]
}

def fetch_news(query=None):
    try:
        if not query and news_cache["data"] and datetime.utcnow() - news_cache["timestamp"] < timedelta(minutes=30):
            print("Serving cached news")
            return news_cache["data"]

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

        news_list = [{
            "title": a.get("title", "No Title"),
            "description": a.get("description", "No Description"),
            "url": a.get("url", "#"),
            "image": a.get("image", "https://via.placeholder.com/150"),
            "published_at": a.get("publishedAt", "Unknown Date")
        } for a in articles[:10]]

        if not query:
            news_cache["data"] = news_list
            news_cache["timestamp"] = datetime.utcnow()

        return news_list

    except requests.exceptions.RequestException as e:
        print(f"Error fetching news: {e}")
        news_cache["data"] = []
        return [{"title": "Error", "description": "Could not fetch news.", "url": "#"}]

@app.route("/get_news", methods=["GET"])
def get_news():
    query = request.args.get("query", "").strip()
    news = fetch_news(query)
    return jsonify(news)

@app.route("/process_input", methods=["POST"])
def process_input():
    user_input = request.json.get("user_input", "").strip().lower()
    if not user_input:
        return jsonify({"response": "Please enter some text."})

    matched_category = next((cat for cat, keywords in CATEGORIES.items()
                             if any(keyword in user_input for keyword in keywords)), None)

    if not matched_category:
        return jsonify({"response": "Try a topic like sports, tech, health, etc."})

    news = fetch_news(user_input)
    if not news:
        return jsonify({"response": "No news found for this topic."})

    news_summary = "\n\n".join([
        f"🔹 {n['title']}\n📅 {n['published_at']}\n🌐 [Read more]({n['url']})"
        for n in news
    ])
    return jsonify({"response": f"📰 Latest {matched_category.capitalize()} News:\n\n{news_summary}"})

@app.route("/generate_timeline", methods=["GET", "OPTIONS"])
def generate_timeline():
    # Handle preflight OPTIONS request
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        return response
        
    try:
        topic = request.args.get("topic", "").strip()
        if not topic:
            return jsonify({"error": "Topic is required"}), 400

        print(f"Generating timeline for topic: {topic}")
        
        # Fetch news articles related to the topic
        articles = fetch_news(topic)
        if not articles or len(articles) == 0:
            print("No articles found for timeline")
            return jsonify({
                "timeline": [], 
                "message": "No news articles found for this topic."
            })

        # Format the news articles for the LLM
        formatted_news = ""
        for a in articles:
            formatted_news += (
                f"Title: {a.get('title', '')}\n"
                f"Description: {a.get('description', '')}\n"
                f"Published: {a.get('published_at', '')}\n"
                f"Source: {a.get('url', '')}\n\n"
            )

        print(f"Formatted {len(articles)} articles for timeline generation")
        
        # Prepare prompts for the LLM
        system_prompt = (
            "You are a news timeline generator. Your job is to extract key chronological events from news articles "
            "and summarize them in a structured format. For each major event:\n"
            "- Extract a clear date (or best guess from publish time)\n"
            "- Summarize the event clearly and concisely\n"
            "- Include the source name and URL\n"
            "Output a JSON array like this:\n"
            "[{\"date\": \"YYYY-MM-DD\", \"summary\": \"event summary\", \"sources\": [{\"name\": \"source\", \"url\": \"url\"}]}]"
        )

        user_prompt = f"Generate a timeline for the topic: {topic}\n\nArticles:\n{formatted_news}"

        # Use llama3-8b-8192 model which is definitely available on Groq
        payload = {
            "model": "llama3-8b-8192",  # Changed from llama3-70b-8192
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.7
        }

        # Log the request
        print(f"Sending request to Groq API for timeline generation")
        
        # Make the API call to Groq
        try:
            response = requests.post(GROQ_API_URL, headers=HEADERS, json=payload)
            
            # Debug info
            print(f"Groq API response status: {response.status_code}")
            if response.status_code != 200:
                print(f"Groq API error: {response.text}")
                
            response.raise_for_status()
            
            # Parse the LLM response
            raw_output = response.json()["choices"][0]["message"]["content"]
            print(f"Received raw output from Groq (length: {len(raw_output)})")
            
            # Extract the JSON part if it's embedded in other text
            json_start = raw_output.find('[')
            json_end = raw_output.rfind(']') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = raw_output[json_start:json_end]
                timeline = json.loads(json_str)
            else:
                # Fallback: try to parse the entire response as JSON
                timeline = json.loads(raw_output.strip())
                
            # Validate the timeline structure
            if not isinstance(timeline, list):
                raise ValueError("Timeline is not a list")
                
            print(f"Successfully parsed timeline with {len(timeline)} events")
            return jsonify({"timeline": timeline})
            
        except requests.exceptions.RequestException as e:
            print(f"Request error to Groq API: {e}")
            return jsonify({"error": "Failed to connect to language model service", "message": str(e)}), 500
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Raw output that failed parsing: {raw_output}")
            
            # Fallback: Generate a simple timeline directly from the articles
            fallback_timeline = generate_fallback_timeline(articles)
            return jsonify({
                "timeline": fallback_timeline,
                "message": "Used simplified timeline due to processing error"
            })
        except Exception as e:
            print(f"Timeline processing error: {e}")
            traceback.print_exc()
            return jsonify({"error": "Error processing timeline data", "message": str(e)}), 500

    except Exception as e:
        print(f"Unhandled exception in generate_timeline: {e}")
        traceback.print_exc()
        return jsonify({"error": "Failed to generate timeline", "message": str(e)}), 500


def generate_fallback_timeline(articles):
    """Generate a simple timeline directly from articles when the LLM fails"""
    import re
    from datetime import datetime
    
    timeline = []
    
    for article in articles:
        # Extract date from published_at or use current date
        date_str = article.get('published_at', '')
        try:
            # Try to extract YYYY-MM-DD format
            date_match = re.search(r'(\d{4}-\d{2}-\d{2})', date_str)
            if date_match:
                date = date_match.group(1)
            else:
                # Default to today if no date found
                date = datetime.utcnow().strftime('%Y-%m-%d')
        except:
            date = datetime.utcnow().strftime('%Y-%m-%d')
        
        # Create a timeline event
        event = {
            "date": date,
            "summary": article.get('title', 'Unknown event'),
            "sources": [{
                "name": "News Source",
                "url": article.get('url', '#')
            }]
        }
        
        timeline.append(event)
    
    # Sort timeline by date (newest first)
    timeline.sort(key=lambda x: x['date'], reverse=True)
    
    return timeline

def ask_groq_llm(prompt):
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Use a model that's definitely available on Groq
    payload = {
        "model": "llama3-8b-8192",  # Changed from mixtral-8x7b-32768 which might be causing issues
        "messages": [
            {"role": "system", "content": "You are NewsBot, an expert in summarizing current events clearly and completely."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 1000
    }
    
    try:
        print(f"Sending request to Groq API with payload: {json.dumps(payload)}")
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", json=payload, headers=headers)
        
        # Additional debug info
        print(f"Groq API Status Code: {response.status_code}")
        if response.status_code != 200:
            print(f"Groq API Error Response: {response.text}")
            
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"[Groq LLM Error Details]: {e}")
        print(f"Response content: {getattr(response, 'text', 'No response content')}")
        return f"I encountered an issue while processing your request. Error: {str(e)}"
    

@app.route("/ask_newsbot", methods=["POST", "OPTIONS"])
def ask_newsbot():
    # Handle preflight OPTIONS request
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        return response
        
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data received", "message": "Request body must be valid JSON"}), 400
            
        query = data.get("query", "").strip()
        if not query:
            return jsonify({"error": "Missing query", "message": "Query parameter is required"}), 400

        print(f"Processing query: {query}")
        
        # Step 1: Aggregate news from all sources
        try:
            news_data = fetch_all_news_sources(query)
            print(f"Fetched {len(news_data)} news items")
        except Exception as e:
            print(f"Error fetching news sources: {e}")
            traceback.print_exc()
            return jsonify({"error": "News source error", "message": str(e)}), 500
            
        if not news_data:
            # If no news data, return a simple response rather than an error
            return jsonify({"answer": f"Sorry, I couldn't find any recent news about '{query}'. Try a different topic or check back later."})

        # Step 2: Summarize top articles
        summaries = []
        for item in news_data[:8]:
            title = item.get("title", "").strip()
            desc = item.get("description", "").strip()
            content = item.get("content", "").strip()
            summary = f"• {title} — {desc or content or 'No description available'}"
            summaries.append(summary)

        combined_news = "\n".join(summaries)
        print(f"Combined news length: {len(combined_news)} characters")

        # Step 3: Construct LLM prompt
        prompt = (
            f"The user asked: '{query}'.\n\n"
            f"Here are recent news articles related to the query:\n{combined_news}\n\n"
            "Based on this, give a complete, clear summary of the topic from beginning to now, "
            "including background, major developments, and the current situation. "
            "Explain it in a way that's easy to understand even for someone new to the topic."
        )

        # Step 4: Ask Groq LLM
        try:
            final_answer = ask_groq_llm(prompt)
            print(f"Received answer from Groq (length: {len(final_answer)} characters)")
            return jsonify({"answer": final_answer})
        except Exception as e:
            print(f"Error from Groq LLM: {e}")
            traceback.print_exc()
            return jsonify({
                "error": "LLM error", 
                "message": f"Error processing with language model: {str(e)}",
                "answer": f"I'm having trouble processing your request about '{query}'. Technical issues are preventing me from generating a proper response right now."
            })

    except Exception as e:
        print(f"Unhandled exception in ask_newsbot: {e}")
        traceback.print_exc()
        return jsonify({
            "error": str(e), 
            "message": "Internal Server Error",
            "answer": "I encountered an unexpected error processing your request. Please try again later."
        }), 500
    
# ===== Groq Chat Completion Helper =====
def chat_completion(prompt):
    payload = {
        "model": "llama3-70b-8192",
        "messages": [
            {"role": "system", "content": "You are a helpful news assistant."},
            {"role": "user", "content": prompt}
        ]
    }
    try:
        res = requests.post(GROQ_API_URL, headers=HEADERS, json=payload)
        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"[Groq Chat Completion Error]: {e}")
        return "I'm sorry, I couldn't process your request."

if __name__ == "__main__":
    app.run(debug=True, port=5000)