import React from "react";
import Navbar from '../../components/navBar/Navbar'
import PostList from "../../components/PostList";
import './Home.css';
function Home() {
  return (
    <div>
      <h1>Welcome to the EdTech Platform</h1>
      <Navbar/>
      <PostList/>
    </div>
  );
}

export default Home;
