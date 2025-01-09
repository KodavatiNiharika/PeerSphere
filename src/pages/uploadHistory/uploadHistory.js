import React, { useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';
import "./uploadHistory.css";

const UploadHistory = () => {
  const [uploadHistory, setUploadHistory] = useState([]);
  const [groupedVideos, setGroupedVideos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const fetchUploadHistory = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Missing authentication details. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      setEmail(decodedToken.email);

      const response = await fetch("http://localhost:3001/api/uploadHistory", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setError("Failed to fetch upload history. Please try again.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.uploadHistory && data.uploadHistory.length > 0) {
        setUploadHistory(data.uploadHistory);
        groupVideosByTag(data.uploadHistory); // Group videos by tag
      } else {
        setUploadHistory([]);
        setError("No uploads found for your account.");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching the upload history.");
    } finally {
      setLoading(false);
    }
  };

  const groupVideosByTag = (videos) => {
    const grouped = videos.reduce((acc, video) => {
      const tag = video.tag || "Untagged";
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(video);
      return acc;
    }, {});
    setGroupedVideos(grouped);
  };

  useEffect(() => {
    fetchUploadHistory();
  }, []);

  if (loading) {
    return <div className="loading-message">Loading upload history...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="upload-history-container">
      <h2>My Upload History</h2>
      <p>Email: {email}</p>
      {Object.keys(groupedVideos).length === 0 ? (
        <p>No uploads found for your account.</p>
      ) : (
        Object.entries(groupedVideos).map(([tag, videos]) => (
          <div key={tag} className="tag-group">
            <h3>Task: {tag}</h3>
            <ul className="upload-history-list">
              {videos.map((upload, index) => (
                <li key={index} className="upload-item">
                  <h4>{upload.title || "Untitled Video"}</h4>
                  <p>Date: {upload.date ? new Date(upload.date).toLocaleDateString() : "Unknown"}</p>
                  <p>Description: {upload.description || "No description provided."}</p>

                  {/* Render video */}
                  {upload.videoPath ? (
                    <video width="100%" controls>
                      <source src={upload.videoPath} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <p>Video not available</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default UploadHistory;
