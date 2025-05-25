import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function PostPage() {
  const {id} = useParams();
  const [postInfo, setPostInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:4000/post/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }
        return response.json();
      })
      .then(postInfo => {
        setPostInfo(postInfo);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
      });
  }, [id]);

  if (error) return <div className="error">{error}</div>;
  if (!postInfo) return <div className="loading">Loading...</div>;

  return (
    <div className="post-page">
      <h1>{postInfo.title}</h1>
      <time>{format(new Date(postInfo.createdAt), "MMM d, yyyy")}</time>
      <div className = "author"></div>
      <div className="image">
        <img src={`http://localhost:4000/${postInfo.cover}`} alt="" />
      </div>
      <div className="content" dangerouslySetInnerHTML={{__html: postInfo.content}} />
      <div className="author">by {postInfo.author?.username || 'Anonymous'}</div>
    </div>
  );
}