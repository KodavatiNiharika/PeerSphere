import React, { useState } from "react";
import axios from "axios";
import NewNavBar from "../../components/newNavBar/newNavBar";
import './videoUpload.css'
import { useNavigate } from 'react-router-dom';


function VideoUpload() {
  const navigate = useNavigate();
  const [videoDetails, setVideoDetails] = useState({
    title: "",
    description: "",
    tag: "ML", // Set default to ML
    video: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVideoDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("video/")) {
      alert("Please select a valid video file.");
      return;
    }
    setVideoDetails((prev) => ({ ...prev, video: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, description, tag, video } = videoDetails;

    if (!title || !description || !tag || !video) {
      alert("All fields are required, including selecting a video.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("tag", tag);
    formData.append("video", video); // The file itself

    const token = localStorage.getItem("token"); // Ensure the token exists

    try {
      const response = await axios.post("http://localhost:3001/videoUpload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Ensure multipart format
        },
      });

      alert(response.data.message || "Video uploaded successfully.");
      resetForm();
      navigate("/");
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.response?.data?.message || "Error uploading video.");
    }
  };

  const resetForm = () => {
    setVideoDetails({
      title: "",
      description: "",
      tag: "ML", // Reset default to ML
      video: null,
    });
  };

  return (
    <>
      <NewNavBar />
      <div className="video-upload">
        <h1 >Upload a Video</h1>
        <form className="video-upload-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Video Title"
            value={videoDetails.title}
            onChange={handleInputChange}
            required
          />
          <br />
          <textarea
            name="description"
            placeholder="Video Description"
            value={videoDetails.description}
            onChange={handleInputChange}
            required
          ></textarea>
          <br />
          <select
            name="tag"
            value={videoDetails.tag}
            onChange={handleInputChange}
            required
          >
            <option value="ML">ML</option>
            <option value="OS">OS</option>
            <option value="DBMS">DBMS</option>
            <option value="CN">CN</option>
            <option value="CNS">CNS</option>
            <option value="DSA">DSA</option>
          </select>
          <br />
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            required
          />
          <br />
          <button className="video-upload-button" type="submit">Upload Video</button>
        </form>
      </div>
    </>
  );
}

export default VideoUpload;
