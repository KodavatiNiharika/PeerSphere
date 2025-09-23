import React, { useState, useEffect } from "react";
import "./fileUploadHistory.css";
import NewNavBar from "../../components/newNavBar/newNavBar";

// Helper function to render file content based on its type
const renderFilePreview = (file) => {
  if (!file || !file.filePath) {
    return <p>Invalid file data.</p>;
  }

  const fileExtension = file.filePath.split('.').pop().toLowerCase();

  switch (fileExtension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <img src={file.filePath} alt={`Preview of ${file.title}`} className="file-preview-image" />;
    case 'pdf':
      return <iframe src={file.filePath} title={`Preview of ${file.title}`} className="file-viewer-pdf"></iframe>;
    default:
      // For other file types, provide a placeholder or a simple text
      return <p className="file-preview-placeholder">No preview available for this file type.</p>;
  }
};

const FileUploadHistory = () => {
  const [fileUploadHistory, setFileUploadHistory] = useState([]);
  const [groupedFiles, setGroupedFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFileUploadHistory = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Missing authentication details. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(" https://peersphere-3.onrender.com/api/fileUploadHistory", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch file upload history. Please try again.");
      }

      const data = await response.json();
      console.log(data);
      groupFilesByTag(data.fileUploadHistory || []);
    } catch (err) {
      setError(err.message || "An error occurred while fetching the file upload history.");
    } finally {
      setLoading(false);
    }
  };

  const groupFilesByTag = (files) => {
    const grouped = files.reduce((acc, file) => {
      const tag = file.tag || "General";
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(file);
      return acc;
    }, {});
    setGroupedFiles(grouped);
  };

  useEffect(() => {
    fetchFileUploadHistory();
  }, []);

  if (loading) {
    return <div className="file-upload-history-loading">Loading file upload history...</div>;
  }

  if (error) {
    return <div className="file-upload-history-error">Error: {error}</div>;
  }

  return (
    <>
      <NewNavBar />
      <div className="file-upload-history">
        <h2 className="file-upload-history-title">My File Upload History</h2>
        {Object.keys(groupedFiles).length === 0 ? (
          <p className="file-upload-history-no-uploads">No file uploads found.</p>
        ) : (
          Object.entries(groupedFiles).map(([tag, files]) => (
            <div className="file-upload-history-group" key={tag}>
              <h3 className="file-upload-history-task">Topic: {tag}</h3>
              <ul className="file-upload-history-list">
                {files.map((upload) => (
                  <li className="file-upload-history-item" key={upload._id || upload.filename}>
                    {/* Updated JSX to include "Title: " and "Description: " labels */}
                    <h4 className="file-upload-history-item-title">Title: {upload.title}</h4>                    
                    {/* Render the file preview */}
                    {renderFilePreview(upload)}
                    <p className="file-upload-history-description">Description: {upload.description}</p>
                    {/* Download Link */}
                    <a
                      href={upload.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="file-upload-history-link"
                    >
                      Download File
                    </a>
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

export default FileUploadHistory;
