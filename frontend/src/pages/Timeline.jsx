import { useState } from "react";
import styles from "../styles/Timeline.module.css";
import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";

const Timeline = () => {
  const [topic, setTopic] = useState("");
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic to generate a timeline");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    setTimelineData([]);

    try {
      const res = await fetch(`http://localhost:5000/generate_timeline?topic=${encodeURIComponent(topic)}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to generate timeline");
      }

      if (data.timeline && data.timeline.length > 0) {
        setTimelineData(data.timeline);
        if (data.message) {
          setMessage(data.message);
        }
      } else {
        setError(`No timeline data found for "${topic}". Try a different topic.`);
      }
    } catch (err) {
      console.error("Timeline error:", err);
      setError(`❌ ${err.message || "Could not generate timeline. Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleGenerate();
    }
  };

  const getIconColor = (index) => {
    // Colors for timeline icons
    const colors = ["#00bfff", "#4caf50", "#ff9800", "#e91e63", "#9c27b0"];
    return colors[index % colors.length];
  };

  return (
    <div className={styles.page}>
      <div className={styles.searchSection}>
        <h2>🧠 Generate a News Timeline</h2>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder='e.g. "AI Regulation", "Elections 2024"'
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleGenerate} disabled={loading}>
            {loading ? "Loading..." : "🔍 Generate"}
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.message}>{message}</p>}
        
        <div className={styles.examples}>
          Example topics: "AI Regulation", "Climate Bill", "Elections 2024"
        </div>
      </div>

      <div className={styles.timelineWrapper}>
        {timelineData.length > 0 ? (
          <VerticalTimeline>
            {timelineData.map((event, idx) => (
              <VerticalTimelineElement
                key={idx}
                date={event.date}
                iconStyle={{ background: getIconColor(idx), color: "#fff" }}
                contentStyle={{
                  background: "#1b2a44",
                  color: "#fff",
                  borderRadius: "12px",
                }}
                contentArrowStyle={{ borderRight: "7px solid #1b2a44" }}
              >
                <h4 className={styles.date}>🗓️ {event.date}</h4>
                <p className={styles.summary}>📝 {event.summary}</p>
                <div className={styles.sources}>
                  {event.sources?.map((src, i) => (
                    <a key={i} href={src.url} target="_blank" rel="noopener noreferrer">
                      🔗 {src.name || "Source"}
                    </a>
                  ))}
                </div>
              </VerticalTimelineElement>
            ))}
          </VerticalTimeline>
        ) : !loading && !error && (
          <div className={styles.placeholder}>
            <p>Enter a topic above to generate a timeline of related news events</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;