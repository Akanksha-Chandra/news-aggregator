from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Get MongoDB URI from environment
MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("MONGO_URI is missing in .env")

# Connect to MongoDB Atlas
client = MongoClient(MONGO_URI)

# Select your database
db = client["news_app"]

# Collections
users_collection = db["users"]
chat_collection = db["chats"]
search_logs = db["search_logs"]
