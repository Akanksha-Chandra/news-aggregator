import React, { useState } from "react";
import "../styles/Newsletter.css"; // Importing styles

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (!email.trim()) {
      alert("Please enter a valid email.");
      return;
    }
    alert(`Subscribed successfully with ${email}!`);
    setEmail("");
  };

  return (
    <div className="newsletter">
      <h3 className="newsletter-title">Stay Updated</h3>
      <div className="newsletter-form">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="newsletter-input"
        />
        <button onClick={handleSubscribe} className="newsletter-button">
          Subscribe
        </button>
      </div>
    </div>
  );
};

export default Newsletter;
