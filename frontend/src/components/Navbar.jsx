import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from "../styles/Navbar.module.css";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <div className={styles["navbar-container"]}>
      <nav className={styles.navbar}>
        {/* Logo */}
        <h1 className={styles.logo}>
          <Link to="/">DailyScope</Link>
        </h1>

        {/* Navigation Links */}
        <div className={styles.navLinks}>
          <Link to="/">🏠 Home</Link>
          <Link to="/categories">🗂️ Categories</Link>
          <Link to="/timeline">🧠 Timeline</Link>
          <Link to="/ask-newsbot">💬 Ask NewsBot</Link>
          <Link to="/search">🔍 Search</Link>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
