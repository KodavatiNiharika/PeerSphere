import React, { useState } from "react";
import axios from "axios";

function VideoUpload() {
  const [videoDetails, setVideoDetails] = useState({
    username: "",
    description: "",
    mail: "",
    video: null,
    tag: "", // Added tag
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

    const { username, description, mail, video, tag } = videoDetails;

    if (!username || !description || !mail || !video || !tag) {
      alert("All fields are required, including selecting a video and providing a tag.");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("description", description);
    formData.append("mail", mail);
    formData.append("video", video);
    formData.append("tag", tag); // Append tag to form data

    const token = localStorage.getItem("token");

    try {
      const response = await axios.post("http://localhost:3001/videoUpload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert(response.data.message || "Video uploaded successfully.");
      resetForm();
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.response?.data?.message || "Error uploading video.");
    }
  };

  const resetForm = () => {
    setVideoDetails({
      username: "",
      description: "",
      mail: "",
      video: null,
      tag: "", // Reset tag
    });
  };

  return (
    <div>
      <h1>Upload a Video</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={videoDetails.username}
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
        <input
          type="email"
          name="mail"
          placeholder="Your Email"
          value={videoDetails.mail}
          onChange={handleInputChange}
          required
        />
        <br />
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          required
        />
        <br />
        <input
          type="text"
          name="tag"
          placeholder="Video tag"
          value={videoDetails.tag}
          onChange={handleInputChange}
          required
        />
        <br />
        <button type="submit">Upload Video</button>
      </form>
    </div>
  );
}

export default VideoUpload;
