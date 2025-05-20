import { Link, useNavigate } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext.jsx";
import styles from "../styles/Navbar.module.css";

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

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
          <Link to="/help">❓ Help</Link>
        </div>

        {/* Auth Section */}
        <div className={styles.authSection}>
          {isAuthenticated ? (
            <>
              <span className={styles.username}>Hi, {user?.username}</span>
              <Link to="/profile" className={styles.profileLink}>Profile</Link>
              <button onClick={logout} className={styles.authButton}>Logout</button>
            </>
          ) : (
            <Link to="/auth" className={styles.authButton}>Login / Signup</Link>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
