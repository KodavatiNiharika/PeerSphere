import React from "react";
import "./Home.css";
import ShareKnowledge from "../shareKnowledge/ShareKnowledge";
import Login from "../Login/Login";

function Home() {
  const token = localStorage.getItem("token");
  // console.log(token);
  return (
    <div>
      {token ? <ShareKnowledge /> : <Login />}
    </div>
  );
}

export default Home;