import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/sideBar/sideBar";
import SearchBar from "../../components/searchBar/searchBar";
import "./ShareKnowledge.css";
import NewNavBar from '../../components/newNavBar/newNavBar'
function ShareKnowledge() {
  const [videosToView, setVideosToView] = useState([]);
  const [groupedVideos, setGroupedVideos] = useState({});
  const [filteredVideos, setFilteredVideos] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:3001/videos", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          const videos = res.data.videos;
          setVideosToView(videos);
          groupVideosByTag(videos);
        })
        .catch((err) => {
          setError("Error fetching videos. Please check your authentication.");
          console.error("Error fetching videos:", err);
        });
    } else {
      setError("You need to be logged in to view videos.");
    }
  }, []);

  const groupVideosByTag = (videos) => {
    const grouped = videos.reduce((acc, video) => {
      const tag = video.tag || "Untagged";
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(video);
      return acc;
    }, {});
    setGroupedVideos(grouped);
    setFilteredVideos(grouped); // Set initial filtered videos
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredVideos(groupedVideos);
      return;
    }

    const filtered = Object.entries(groupedVideos).reduce((acc, [tag, videos]) => {
      if (tag.toLowerCase().includes(searchTerm.toLowerCase())) {
        acc[tag] = videos;
      }
      return acc;
    }, {});
    setFilteredVideos(filtered);
  };

  return (
    <div className="share-knowledge">
      <NewNavBar />
      <div className="content">
        
        <h2 className="upload-history-title">Videos Shared by Your Peers</h2>
        <SearchBar onSearch={handleSearch} />
        {error && <p className="error-message">{error}</p>}
        {Object.keys(filteredVideos).length === 0 ? (
          <p className="no-videos">No videos found.</p>
        ) : (
          Object.entries(filteredVideos).map(([tag, videos]) => (
            <div className="upload-history-group" key={tag}>
              <h3 className="upload-history-task">Tag: {tag}</h3>
              <ul className="upload-history-list">
                {videos.map((video) => (
                  <li className="upload-history-item" key={video._id}>
                    <h4 className="upload-history-video-title">{video.title}</h4>
                    <h5> Description :</h5>
                    <p className="upload-history-video-description">{video.description}</p>
                    <video className="upload-history-video" controls>
                      <source src={video.videoPath} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ShareKnowledge;
