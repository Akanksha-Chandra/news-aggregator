import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import '../styles/Auth.css';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });
      login(res.data.user);
      alert("Logged in!");
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <input type="email" placeholder="Email" value={email}
        onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password}
        onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
