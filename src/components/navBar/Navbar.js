import React, { useState } from "react";
import { Link } from "react-router-dom";
import './Navbar.css';
import Sidebar from "../sideBar/sideBar"; // Corrected path to the Sidebar component

function Navbar() {
  const [showSidebar, setShowSidebar] = useState(false);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </nav>
  );
}

export default Navbar;
