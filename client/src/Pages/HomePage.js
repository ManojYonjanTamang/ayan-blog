import React, { useEffect, useState } from "react";
import Post from "../Post";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/post", {
      credentials: "include"
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      return response.json();
    })
    .then(posts => {
      setPosts(posts);
      setError(null);
    })
    .catch(err => {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    });
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <>
      {posts.length > 0 && posts.map(post => (
        <Post key={post._id} {...post} />
      ))}
      {posts.length === 0 && !error && (
        <div className="no-posts">No posts yet. Be the first to create one!</div>
      )}
    </>
  );
}
