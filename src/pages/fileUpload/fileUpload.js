import React, { useState } from "react";
import axios from "axios";
import NewNavBar from "../../components/newNavBar/newNavBar";
import './fileUpload.css';
import { useNavigate } from 'react-router-dom';

function FileUpload() {
  const navigate = useNavigate();
  const [fileDetails, setFileDetails] = useState({
    title: "",
    description: "",
    tag: "ML", // Set default to ML
    file: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFileDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert("Please select a valid file.");
      return;
    }
    setFileDetails((prev) => ({ ...prev, file: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, description, tag, file } = fileDetails;

    if (!title || !description || !tag || !file) {
      alert("All fields are required, including selecting a file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("tag", tag);
    formData.append("file", file); // The file itself

    const token = localStorage.getItem("token"); // Ensure the token exists

    try {
      const response = await axios.post(" https://peersphere-3.onrender.com/fileUpload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Ensure multipart format
        },
      });

      alert(response.data.message || "File uploaded successfully.");
      resetForm();
      navigate("/");
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.response?.data?.message || "Error uploading file.");
    }
  };

  const resetForm = () => {
    setFileDetails({
      title: "",
      description: "",
      tag: "ML", // Reset default to ML
      file: null,
    });
  };

  return (
    <>
      <NewNavBar />
      <div className="file-upload">
        <h1>Upload a File</h1>
        <form className="file-upload-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="File Title"
            value={fileDetails.title}
            onChange={handleInputChange}
            required
          />
          <br />
          <textarea
            name="description"
            placeholder="File Description"
            value={fileDetails.description}
            onChange={handleInputChange}
            required
          ></textarea>
          <br />
          <select
            name="tag"
            value={fileDetails.tag}
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
            onChange={handleFileChange}
            required
          />
          <br />
          <button className="file-upload-button" type="submit">Upload File</button>
        </form>
      </div>
    </>
  );
}

export default FileUpload;
