import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from './pages/Register/Register';
import ShareKnowledge from "./pages/shareKnowledge/ShareKnowledge";
import UserProfile from './pages/UserProfile';
import VideoUpload from "./pages/videoUpload/videoUpload";
import UploadHistory from "./pages/uploadHistory/uploadHistory";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/shareKnowledge" element={<ShareKnowledge />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/videoUpload" element={<VideoUpload />} /> {/* Add route for video upload */}
        <Route path="/uploadHistory" element={<UploadHistory />} />
      </Routes>
    </Router>
  );
}

export default App;
