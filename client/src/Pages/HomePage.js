import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/post")
      .then((response) => {
        response.json().then((postsInfo) => {
          setPosts(postsInfo);
          setLoading(false);
        });
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-page">
      {posts.length > 0 && posts.map((post) => (
        <div key={post._id} className="post">
          <div className="image">
            <Link to={`/post/${post._id}`}>
              <img src={`http://localhost:4000/${post.cover}`} alt="" />
            </Link>
          </div>
          <div className="texts">
            <Link to={`/post/${post._id}`}>
              <h2>{post.title}</h2>
            </Link>
            <p className="info">
              <a className="author">{post.author.username}</a>
              <time>{new Date(post.createdAt).toLocaleDateString()}</time>
            </p>
            <p className="summary">{post.summary}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
