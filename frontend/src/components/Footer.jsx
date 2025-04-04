import React from "react";
import Newsletter from "../components/Newsletter"; // Importing correctly
import "../styles/Footer.css"; // Importing Footer styles

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <br></br>
        <Newsletter /> {/* Placed inside a container */}
        <br></br>
        <p className="footer-text">© 2025 DailyScope. All Rights Reserved.</p>
        <br></br>
      </div>
    </footer>
  );
};

export default Footer;
