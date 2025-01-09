import React, { useEffect, useState } from "react";

function PostList() {
  const [posts, setPosts] = useState([]);

  // Mock Data
  const mockPosts = [
    { id: 1, title: "How to Learn React", content: "Start with components and hooks." },
    { id: 2, title: "Understanding Node.js", content: "Learn about middleware and the event loop." },
    { id: 3, title: "JavaScript ES6 Features", content: "Explore arrow functions, destructuring, and more." },
  ];

  // Simulating data fetching
  useEffect(() => {
    // Simulate an API call with a timeout
    const fetchPosts = () => {
      setTimeout(() => {
        setPosts(mockPosts); // Set the mock data
      }, 1000); // Simulates a 1-second delay
    };

    fetchPosts();
  }, []);

  return (
    <div>
      <h1>Knowledge Sharing Posts</h1>
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.id} style={{ border: "1px solid #ddd", margin: "10px", padding: "10px" }}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
          </div>
        ))
      ) : (
        <p>Loading posts...</p> // Loading message while posts are being "fetched"
      )}
    </div>
  );
}

export default PostList;
