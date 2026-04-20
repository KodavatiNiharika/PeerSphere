import React, { useState } from "react";
import "./Register.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
const backend_url = process.env.REACT_APP_BACKEND_URL; 
const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state during submission

    if (!username || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      setSuccess("");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setSuccess("");
      setLoading(false);
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await axios.post(`${backend_url}/register`, {
        username,
        email,
        password,
      });
      if (response.status === 201) {
        const { token } = response.data;

        // Store the token and email in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);

        setSuccess("Registration successful! Redirecting to home page...");
        setTimeout(() => {
          navigate("/shareKnowledge");
        }, 2000);
      } else {
        setError(response.data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="register-container">
      <h1>Register</h1>
      <div className="register-box">
        <h2>Student Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="Enter your name"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="Confirm your password"
        />

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <button className="register-button" type="submit" disabled={loading}>
          {loading ? <span className="spinner"></span> : "Register"}
        </button>
      </form>

      <div style={{ marginTop: "20px" }}>
        <p>
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
      </div>
    </div>
    </>
  );
};

export default Register;
