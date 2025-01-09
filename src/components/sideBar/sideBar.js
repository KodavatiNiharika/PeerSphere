import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./sideBar.css";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      // Clear authentication-related data
      localStorage.removeItem("token"); // Example: Removing token from localStorage
      localStorage.removeItem("user"); // Optional: Remove user details if stored

      // Redirect to the login page or refresh the state
      navigate("/login"); // Redirects to the login page
    }
  };

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Dashboard</h2>
      <ul className="sidebar-menu">
        <li>
          <Link to="/profile">Profile</Link>
        </li>
        <li>
          <Link to="/uploadHistory">Upload History</Link>
        </li>
        <li>
          <Link to="/videoUpload">Upload a Video</Link>
        </li>
        <li>
          <Link to="/enrolled-courses">Enrolled Courses</Link>
        </li>
        <li>
          <button className="logout" onClick={handleLogout}>
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
