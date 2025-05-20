from db import users_collection, chat_collection, search_logs, saved_articles
from datetime import datetime
from bson import ObjectId

# User management functions
def create_user(email, name, preferences=None):
    """Create a new user in the database"""
    if preferences is None:
        preferences = []
        
    new_user = {
        "email": email,
        "name": name,
        "preferences": preferences,
        "created_at": datetime.utcnow()
    }
    
    result = users_collection.insert_one(new_user)
    new_user["_id"] = str(result.inserted_id)
    return new_user

def get_user_by_email(email):
    """Retrieve a user by email address"""
    user = users_collection.find_one({"email": email})
    if user:
        user["_id"] = str(user["_id"])
    return user

def update_user_preferences(email, preferences):
    """Update a user's news preferences"""
    result = users_collection.update_one(
        {"email": email},
        {"$set": {"preferences": preferences}}
    )
    return result.modified_count > 0

# Chat history functions
def save_chat_interaction(session_id, email, question, answer):
    """Save a chat interaction to the database"""
    chat_doc = {
        "session_id": session_id,
        "email": email,
        "question": question,
        "answer": answer,
        "timestamp": datetime.utcnow()
    }
    result = chat_collection.insert_one(chat_doc)
    return str(result.inserted_id)

def get_chat_history(email, session_id=None):
    """Get chat history for a user, optionally filtered by session"""
    query = {"email": email}
    if session_id:
        query["session_id"] = session_id
        
    chats = list(chat_collection.find(query).sort("timestamp", 1))
    for chat in chats:
        chat["_id"] = str(chat["_id"])
    return chats

# Search history functions
def log_search_query(email, query):
    """Log a search query for a user"""
    log_entry = {
        "email": email,
        "query": query,
        "timestamp": datetime.utcnow()
    }
    result = search_logs.insert_one(log_entry)
    return str(result.inserted_id)

def get_search_history(email, limit=10):
    """Get search history for a user"""
    history = list(search_logs.find({"email": email}).sort("timestamp", -1).limit(limit))
    for entry in history:
        entry["_id"] = str(entry["_id"])
    return history

# Saved articles functions
def save_article(email, article_data):
    """Save an article for a user"""
    # Ensure required fields are present
    required_fields = ["title", "url"]
    if not all(field in article_data for field in required_fields):
        raise ValueError("Article data must include title and url")
    
    article_doc = {
        "user_email": email,
        "title": article_data["title"],
        "description": article_data.get("description", ""),
        "url": article_data["url"],
        "source": article_data.get("source", ""),
        "image": article_data.get("image", ""),
        "published_at": article_data.get("published_at", ""),
        "saved_at": datetime.utcnow()
    }
    
    result = saved_articles.insert_one(article_doc)
    return str(result.inserted_id)

def get_saved_articles(email):
    """Get all saved articles for a user"""
    articles = list(saved_articles.find({"user_email": email}).sort("saved_at", -1))
    for article in articles:
        article["_id"] = str(article["_id"])
    return articles

def delete_saved_article(email, article_id):
    """Delete a saved article"""
    result = saved_articles.delete_one({
        "user_email": email,
        "_id": ObjectId(article_id)
    })
    return result.deleted_count > 0