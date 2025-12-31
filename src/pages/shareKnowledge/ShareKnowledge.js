import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/sideBar/sideBar";
import SearchBar from "../../components/searchBar/searchBar";
import "./ShareKnowledge.css";
import NewNavBar from '../../components/newNavBar/newNavBar';
const backend_url = process.env.REACT_APP_BACKEND_URL;
// Helper function to render file content based on its type
const renderFileContent = (file) => {
  const fileExtension = file.filePath.split('.').pop().toLowerCase();

  switch (fileExtension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <img src={file.filePath} alt={file.title} className="file-preview-image" />;
    case 'pdf':
      return <iframe src={file.filePath} className="file-viewer-pdf" title={file.title}></iframe>;
    default:
      // For other file types, you can show a generic placeholder or an icon.
      // This will ensure something is visible even without a full preview.
      return (
        <div className="file-placeholder">
          <p>Preview not available</p>
          <p>File Type: {fileExtension.toUpperCase()}</p>
        </div>
      );
  }
};

function ShareKnowledge() {
  const [videosToView, setVideosToView] = useState([]);
  const [filesToView, setFilesToView] = useState([]);
  const [groupedVideos, setGroupedVideos] = useState({});
  const [groupedFiles, setGroupedFiles] = useState({});
  const [filteredVideos, setFilteredVideos] = useState({});
  const [filteredFiles, setFilteredFiles] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You need to be logged in to view videos and files.");
      return;
    }

    try {

      const fileRes = await axios.get(`${backend_url}/files`, { headers: { Authorization: `Bearer ${token}` } });
      const files = fileRes.data.files || [];
      setFilesToView(files);
      groupFilesByTag(files);

      const videoRes = await axios.get(`${backend_url}/videos`, { headers: { Authorization: `Bearer ${token}` } });
      const videos = videoRes.data.videos || [];
      setVideosToView(videos);
      groupVideosByTag(videos);
      

    } catch (err) {
      console.error(err);
      setError("Failed to fetch videos/files.");
    }
  };
  fetchData();
  const intervalId = setInterval(fetchData, 5000); // poll every 5 seconds

  return () => clearInterval(intervalId); // cleanup on unmount
  },[]);

  const groupVideosByTag = (videos) => {
    const grouped = videos.reduce((acc, video) => {
      const tag = video.tag || "Untagged";
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(video);
      return acc;
    }, {});
    setGroupedVideos(grouped);
    setFilteredVideos(grouped);
  };

  const groupFilesByTag = (files) => {
    const grouped = files.reduce((acc, file) => {
      const tag = file.tag || "Untagged";
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(file);
      return acc;
    }, {});
    setGroupedFiles(grouped);
    setFilteredFiles(grouped);
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredVideos(groupedVideos);
      setFilteredFiles(groupedFiles);
      return;
    }
    const filteredVideos = Object.entries(groupedVideos).reduce((acc, [tag, videos]) => { //acc will store videos under their respective tags
      if (tag.toLowerCase().includes(searchTerm.toLowerCase())) {
        acc[tag] = videos;
      }
      return acc;
    }, {});
    const filteredFiles = Object.entries(groupedFiles).reduce((acc, [tag, files]) => {
      if (tag.toLowerCase().includes(searchTerm.toLowerCase())) {
        acc[tag] = files;
      }
      return acc;
    }, {});
    setFilteredVideos(filteredVideos);
    setFilteredFiles(filteredFiles);
  };

  return (
    <div className="share-knowledge">
      <NewNavBar />
      <div className="content">
        <h2 className="upload-history-title">Videos and Files Shared by Your Peers</h2>
        <SearchBar onSearch={handleSearch} />
        {error && <p className="error-message">{error}</p>}

        {/* Videos rendering section remains the same */}
        {Object.keys(filteredVideos).length === 0 ? (
          <p className="no-videos">No videos found.</p>
        ) : (
          Object.entries(filteredVideos).map(([tag, videos]) => (
            <div className="upload-history-group" key={tag}>
              <h3 className="upload-history-task">Video Tag: {tag}</h3>
              <ul className="upload-history-list">
                {videos.map((video) => (
                  <li className="upload-history-item" key={video._id}>
                    <p className="upload-history-video-title">{video.title}</p>
                    <h5>Description:</h5>
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

        {/* Files section */}
        {Object.keys(filteredFiles).length === 0 ? (
          <p className="no-files">No files found.</p>
        ) : (
          Object.entries(filteredFiles).map(([tag, files]) => (
            <div className="upload-history-group" key={tag}>
              <h3 className="upload-history-task">File Tag: {tag}</h3>
              <ul className="upload-history-list">
                {files.map((file) => ( 
                  <li className="upload-history-item" key={file._id}>
                    <p>
                      <span className="file-info-label">Title: </span>
                      <span className="upload-history-file-title">{file.title}</span>
                    </p>
                    <p>
                      <span className="file-info-label">Description: </span>
                      <span className="upload-history-file-description">{file.description}</span>
                    </p>
                    {renderFileContent(file)}
                    <a href={`${backend_url}/file/${file._id}`} download>
                    Download File
                  </a>

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
