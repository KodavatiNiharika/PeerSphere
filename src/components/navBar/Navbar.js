import React from "react";
import {Link} from 'react-router-dom';
import './Navbar.css';
import ShareKnowledge from "../../pages/shareKnowledge/ShareKnowledge";
function Navbar() {
    return (
        <nav>
            <Link to="/"> Home </Link>
            <Link to="/ShareKnowledge">Share Knowledge</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
        </nav>
        
    );
}
export default Navbar;