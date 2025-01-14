import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './newNavBar.css';
import Sidebar from "../sideBar/sideBar"; // Corrected path to the Sidebar component
import VideoUpload from "../../pages/videoUpload/videoUpload";
function NewNavBar() {
    const [showSidebar, setShowSidebar] = useState(false);
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
    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
    };

    return (
        <nav>
            <Link to="/">Home</Link>
            <Link to="/videoUpload">Upload a Video</Link>
            <span onClick={toggleSidebar} className="profile-link">
                Your Profile
            </span>
            {showSidebar && <Sidebar />} {/* Sidebar will render here */}
            <span className="new-logout" onClick={handleLogout}>
            Logout
          </span>
        </nav>
    );
}

export default NewNavBar;
