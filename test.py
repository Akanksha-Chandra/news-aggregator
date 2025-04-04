import requests

GROQ_API_KEY = "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"
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json"
}

data = {
    "model": "llama3-8b-8192",
    "messages": [
        {"role": "system", "content": "You are a helpful AI that summarizes text."},
        {"role": "user", "content": "Summarize this: The quick brown fox jumps over the lazy dog."}
    ],
    "temperature": 0.7
}

response = requests.post(GROQ_API_URL, headers=headers, json=data)
print(response.json())
