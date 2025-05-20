import { useState } from "react";
import axios from "axios";
import '../styles/Auth.css';

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      await axios.post("http://localhost:5000/signup", {
        email,
        password,
      });
      alert("Signup successful!");
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <input type="email" placeholder="Email" value={email}
        onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password}
        onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleSignup}>Sign Up</button>
    </div>
  );
};

export default Signup;
