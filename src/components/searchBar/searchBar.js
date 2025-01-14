import React, { useState } from "react";
import "./searchBar.css";

const SearchBar = ({ onSearch }) => {
  const [searchInput, setSearchInput] = useState("");

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    onSearch(value); // Call the onSearch function to filter videos by tags
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={searchInput}
        onChange={handleInputChange}
        placeholder="Search videos by tag..."
        className="search-bar-input"
      />
    </div>
  );
};

export default SearchBar;
