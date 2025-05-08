import { useState, useEffect, useRef } from "react";
import styles from "../styles/Chatbot.module.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef(null);

  const formatText = (text) => {
    if (!text) return "";
    const cleanText = text.replace(/\*\*/g, "");
    const lines = cleanText.split(/(?=\d+\.\s)/g).map(line => line.trim());
    return lines.join("\n\n");
  };

  // Simple fallback method when the AI summarization fails
  const getFallbackNews = async (query) => {
    try {
      const response = await fetch(`http://localhost:5000/get_news?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Failed to fetch news");
      
      const news = await response.json();
      if (!news || news.length === 0) {
        return "No news found for this topic.";
      }
      
      // Create a simple formatted list of news
      return news.slice(0, 5).map(item => (
        `• ${item.title}\n  ${item.description || ""}\n  Published: ${item.published_at || "N/A"}`
      )).join("\n\n");
    } catch (err) {
      console.error("Error fetching fallback news:", err);
      return "Unable to retrieve news at this time.";
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/ask_newsbot", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ query: input }),
      });

      const data = await response.json();
      
      // Check for various error conditions
      if (!response.ok || data.error) {
        console.error("Backend error:", data);
        
        // Try to get basic news as fallback
        const fallbackNews = await getFallbackNews(input);
        const errorMessage = 
          `⚠️ I couldn't generate a comprehensive answer about "${input}" right now.\n\n` +
          `Here are some related news items instead:\n\n${fallbackNews}`;
          
        setMessages(prev => [...prev, { role: "bot", content: errorMessage }]);
        return;
      }

      const formatted = formatText(data.answer || "No answer available.");
      const botMessage = { role: "bot", content: formatted };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
      
      // Try to get basic news as fallback
      const fallbackNews = await getFallbackNews(input);
      const errorMessage = 
        `⚠️ Sorry, I encountered a technical issue.\n\n` +
        `Here are some news items about "${input}" instead:\n\n${fallbackNews}`;
        
      setMessages(prev => [...prev, { role: "bot", content: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={styles.chatContainer}>
      <h2>🤖 Ask NewsBot</h2>

      <div className={styles.chatBox} ref={chatBoxRef}>
        {messages.length === 0 && (
          <div className={styles.welcomeMessage}>
            <p>👋 Welcome to NewsBot! Ask me about any current events or news topics.</p>
            <p>Try questions like:</p>
            <ul>
              <li>"What's happening in the Middle East?"</li>
              <li>"Latest tech industry news"</li>
              <li>"Update me on climate change developments"</li>
            </ul>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`${styles.message} ${msg.role === "user" ? styles.user : styles.bot}`}
          >
            <strong>{msg.role === "user" ? "You:" : "NewsBot:"}</strong>
            <pre className={styles.formattedText}>{msg.content}</pre>
          </div>
        ))}
        {loading && <p className={styles.loading}>Typing...</p>}
      </div>

      <div className={styles.inputSection}>
        <textarea
          value={input}
          placeholder="Ask something like: 'What happened in Gaza?'"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
        />
        <button onClick={sendMessage} disabled={loading}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;