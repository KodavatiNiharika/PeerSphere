import React from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    const isConfirmed = window.confirm("Are you sure you want to log out?");
    
    if (isConfirmed) {
      // Clear the token from localStorage
      localStorage.removeItem("token");

      // Optionally, clear other user-related data
      // localStorage.removeItem("userData");

      // Redirect to the login page or homepage
      navigate("/login"); // Change to the desired route after logout
    }
  };

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Logout;
