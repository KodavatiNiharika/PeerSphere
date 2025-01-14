import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navBar/Navbar";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Correct named import
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState(""); // State for email
  const [password, setPassword] = useState(""); // State for password
  const [error, setError] = useState(""); // State for error message
  const [loading, setLoading] = useState(false); // State for loading
  const navigate = useNavigate();

  // Handle login for students
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true); // Set loading state

    // Basic input validation
    if (!email || !password) {
      setError("Both email and password are required.");
      setLoading(false);
      return;
    }

    const loginData = { email, password }; // Prepare data for the request

    try {
      const response = await axios.post("http://localhost:3001/login", loginData);

      if (response.data.message === "Login successful") {
        // Extract the token and user data
        const { token, user } = response.data;

        if (!token) {
          setError("Token not received. Please contact support.");
          setLoading(false);
          return;
        }

        // Decode the token using jwtDecode
        const decodedToken = jwtDecode(token); 

        // Store token, decoded user data, and email in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("email", email); // Store email along with token
        localStorage.setItem("user", JSON.stringify(decodedToken)); // Store decoded user details

        // Redirect to the ShareKnowledge page
        navigate("/ShareKnowledge");
      } else {
        setError(response.data.message || "Invalid credentials.");
      }
    } catch (err) {
      // Enhanced error handling
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-container">
        <h1>Login</h1>
        <div className="login-box">
          <h2>Student Login</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={error && !email ? "input-error" : ""}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={error && !password ? "input-error" : ""}
            />
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? <span className="spinner"></span> : "Login"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
