# AI_NEWS_AGGREGATOR_WEBSITE

## Overview
An AI-powered news aggregator that fetches the latest news from **NewsAPI** and summarizes it using **Gemini AI**. The web application allows users to browse news articles, scroll through them smoothly, and ask AI questions.

## Features
- 📡 Fetches top news headlines from **NewsAPI**.
- 🧠 Uses **Gemini AI** to summarize news articles.
- 📜 Auto-scrolling news cards for easy browsing.
- 📱 Fully responsive design for all devices.
- 🤖 AI-powered chatbot for user queries.
- ⏳ Real-time news updates every 60 seconds.

## Installation & Setup

### 📌 Step 1: Clone the Repository
```bash
git clone https://github.com/Shriram-RZ/AI-NEWS-AGGREGATOR-WEBSITE.git
cd AI-NEWS-AGGREGATOR-WEBSITE
```

### 📌 Step 2: Create a Virtual Environment
```bash
python -m venv venv

venv\Scripts\activate    
```

### 📌 Step 3: Install Dependencies
Ensure you have Python installed, then run:
```bash
pip install -r requirements.txt
```

### 📌 Step 4: Set Up API Keys
Replace the placeholder API keys in `app.py` with your own:
- Get a **NewsAPI Key** from [https://newsapi.org/](https://newsapi.org/)
- Get a **Gemini AI API Key** from [https://aistudio.google.com/](https://aistudio.google.com/)

```python
NEWS_API_KEY = "your_newsapi_key"
GENAI_API_KEY = "your_gemini_api_key"
```

### 📌 Step 5: Run the Flask Server
```bash
python app.py
```

### 📌 Step 6: Open in Browser
Visit: **[http://127.0.0.1:5000/](http://127.0.0.1:5000/)**

## 📂 Project Structure
```
📂 ai-news-aggregator/
├── 📄 app.py              # Flask backend
├── 📂 templates/
│   ├── 📄 index.html      # Frontend UI
├── 📄 README.md           # Project documentation
├── 📄 requirements.txt    # Dependencies file
```

python -m spacy download en_core_web_sm


## 🚀 How It Works
1. 📰 News updates every **minute** automatically.
2. 🎭 Smooth scrolling news cards for better user experience.
3. 🤖 AI chatbot powered by **Gemini AI** for user queries.

## 🎨 UI Design
- ✅ Clean and modern layout.
- 🔄 Auto-scrolling news cards.
- 📱 Mobile-friendly and fully responsive.

## 🔮 Future Enhancements
- 🗂️ Category-based news filtering (Tech, Sports, Business, etc.).
- 🌎 Multi-language support.
- 📌 User login & saved news feature.



