import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ShareKnowledge.css";
import Sidebar from "../../components/sideBar/sideBar";

function ShareKnowledge() {
  const [videosToView, setVideosToView] = useState([]); // State to store available videos for students

  useEffect(() => {
    // Fetch available videos for students
    axios
      .get("http://localhost:3001/uploads/videos") // Correct endpoint
      .then((res) => setVideosToView(res.data)) // Assuming response data is in the correct format
      .catch((err) => console.error("Error fetching videos:", err));
  }, []);

  return (
    <>
      <Sidebar />
      <div style={{ padding: "20px" }}>
        <h1>Available Videos</h1>
        <div className="video-container">
          {videosToView.length > 0 ? (
            videosToView.map((video) => (
              <div key={video._id} className="video-item">
                <h2>{video.name}</h2> {/* Display video name */}
                <p>{video.description}</p> {/* Display video description */}
                <video width="300" controls>
                  <source
                    src={`http://localhost:3001/${video.videoPath}`} // Correct path to video
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            ))
          ) : (
            <p>No videos available</p>
          )}
        </div>
      </div>
    </>
  );
}

export default ShareKnowledge;
