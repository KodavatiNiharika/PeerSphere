import React, { useState, useEffect } from "react";
import "./uploadHistory.css";
import NewNavBar from '../../components/newNavBar/newNavBar'

const UploadHistory = () => {
  const [uploadHistory, setUploadHistory] = useState([]);
  const [groupedVideos, setGroupedVideos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUploadHistory = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Missing authentication details. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(" https://peersphere-3.onrender.com/api/uploadHistory", {
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
      groupVideosByTag(data.uploadHistory);
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
    return <div className="upload-history-loading">Loading upload history...</div>;
  }

  if (error) {
    return <div className="upload-history-error">Error: {error}</div>;
  }

  return (
    <>
    <NewNavBar />
    
    <div className="upload-history">
      <h2 className="upload-history-title">My Upload History</h2>
      {Object.keys(groupedVideos).length === 0 ? (
        <p className="upload-history-no-uploads">No uploads found.</p>
      ) : (
        Object.entries(groupedVideos).map(([tag, videos]) => (
          <div className="upload-history-group" key={tag}>
            <h3 className="upload-history-task">Topic: {tag}</h3>
            <ul className="upload-history-list">
              {videos.map((upload, index) => (
                <li className="upload-history-item" key={index}>
                  <h4 className="upload-history-video-title">{upload.title}</h4>
                  <video className="upload-history-video" controls>
                    <source src={upload.videoPath} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  <p className="upload-history-video-description">Description: {upload.description}</p>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
    </>
  );
};

export default UploadHistory;
