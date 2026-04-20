import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Correct named import
import "./Login.css";
const backend_url = process.env.REACT_APP_BACKEND_URL;
const Login = () => {
  const [username, setUsername] = useState(""); // State for email
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
    if (!username || !password) {
      setError("Both username and password are required.");
      setLoading(false);
      return;
    }

    const loginData = { username, password }; // Prepare data for the request

    try {
      const response = await axios.post(`${backend_url}/login`, loginData);

      if (response.data.message === "Login successful") {
        // Extract the token and user data
        const { token } = response.data;

        if (!token) {
          setError("Token not received. Please contact support.");
          setLoading(false);
          return;
        }

        // Decode the token using jwtDecode
        const decodedToken = jwtDecode(token); 

        // Store token, decoded user data, and email in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("username", username); // Store username along with token
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
//JSX sees the {handleSubmit} and evaluates it as a JavaScript expression it finds that handleSubmit is a function.
  return (
    <>
      <div className="login-container">
        <h1>Login</h1>
        <div className="login-box">
          <h2>Student Login</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={error && !username ? "input-error" : ""}
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
          
          <div style={{ marginTop: "20px" }}>
            <p>
              New user ? {" "}
              <Link to="/register">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
