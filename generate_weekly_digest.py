from db import users_collection, digests_collection
from datetime import datetime
import requests
import os
from dotenv import load_dotenv

load_dotenv()

def generate_digest_from_preferences(email, preferences):
    if not preferences:
        print(f"[SKIP] No preferences for {email}")
        return None

    prompt = f"""
You are a helpful assistant. Generate a weekly news digest based on these topics:
{', '.join(preferences)}
Summarize major updates and developments from the past 7 days grouped by topic.
Use bullet points and explain clearly.
"""

    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}"},
        json={
            "model": "mixtral-8x7b-32768",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7
        }
    )

    if response.status_code != 200:
        print(f"[ERROR] Digest generation failed for {email}")
        return None

    summary = response.json()["choices"][0]["message"]["content"]

    digest = {
        "email": email,
        "content": summary,
        "generated_at": datetime.utcnow()
    }
    digests_collection.insert_one(digest)
    print(f"[SUCCESS] Digest saved for {email}")
    return digest


def run_weekly_digest_job():
    print("[INFO] Weekly digest generation started.")
    users = users_collection.find()

    for user in users:
        email = user["email"]
        preferences = user.get("preferences", [])
        generate_digest_from_preferences(email, preferences)

    print("[INFO] Weekly digest generation completed.")


if __name__ == "__main__":
    run_weekly_digest_job()
