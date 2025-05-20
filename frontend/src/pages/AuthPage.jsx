import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/AuthPage.module.css";

const AuthPage = () => {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await signup(form.name, form.email, form.password);
      }
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.authContainer}>
      <h2 className={styles.title}>{isLogin ? "Login" : "Sign Up"}</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className={styles.input}
            required
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <button type="submit" className={styles.submitButton}>
          {isLogin ? "Login" : "Sign Up"}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      <p
        onClick={() => setIsLogin((prev) => !prev)}
        className={styles.toggleText}
      >
        {isLogin
          ? "Don't have an account? Sign up"
          : "Already have an account? Login"}
      </p>
    </div>
  );
};

export default AuthPage;
