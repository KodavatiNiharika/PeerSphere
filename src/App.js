import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from './pages/Register/Register';
import ShareKnowledge from "./pages/shareKnowledge/ShareKnowledge";
import UserProfile from './pages/UserProfile';
import VideoUpload from "./pages/videoUpload/videoUpload";
import UploadHistory from "./pages/uploadHistory/uploadHistory";
import Sidebar from "./components/sideBar/sideBar";
import LogOut from "./components/logOut/logOut";
import Navbar from "./components/navBar/Navbar";
import FileUpload from "./pages/fileUpload/fileUpload";
import FileUploadHistory from "./pages/fileUploadHistory/fileUploadHistory";
import NewNavBar from "./components/newNavBar/newNavBar";

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
        <Route path="/fileUpload" element={<FileUpload />} />
        <Route path="/uploadHistory" element={<UploadHistory />} />
        <Route path="/Sidebar" element={<Sidebar />} />
        <Route path="/logOut" element={<LogOut/>} />
        <Route path="/navbar" element={<Navbar/>} />
        <Route path="/newNavBar" element={<NewNavBar/>}/>
        <Route path="/fileUploadHistory" element={<FileUploadHistory/>} />
      </Routes>
    </Router>
  );
}

export default App;
