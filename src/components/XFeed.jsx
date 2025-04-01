import React, { useState, useEffect } from "react";
import axios from "axios";

export default function XFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await axios.get("https://web3daily-cms.onrender.com/api/xes");
        // Expected response structure: { data: { data: [ { id, attributes: { ... } }, ... ] } }
        setPosts(res.data.data);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  if (loading) {
    return <p className="text-white p-4">Loading posts...</p>;
  }

  if (!posts.length) {
    return <p className="text-white p-4">No posts available.</p>;
  }

  return (
    <div className="text-white p-4">
      <h2 className="text-xl font-bold mb-4">X Feed</h2>
      {posts.map((post) => {
        const {
          Username,
          DisplayName,
          Avatar,
          TweetText,
          DatePosted,
          Likes,
          Retweets,
          Hashtag,
          TweetURL,
          Mentions
        } = post.attributes;
        return (
          <div
            key={post.id}
            className="bg-gray-800 p-4 rounded mb-4 transform hover:scale-105 transition-transform duration-200"
          >
            <h3 className="font-bold">{DisplayName || "Unknown"}</h3>
            <p>{TweetText || "No content available."}</p>
            <p className="text-sm text-gray-400">
              Posted on: {new Date(DatePosted).toLocaleString()}
            </p>
            {TweetURL && (
              <a
                href={TweetURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline mt-2 inline-block"
              >
                View Original
              </a>
            )}
            <div className="mt-2 text-sm">
              <span>Likes: {Likes}</span> | <span>Retweets: {Retweets}</span>
            </div>
            {/* Optionally, render hashtags and mentions if needed */}
          </div>
        );
      })}
    </div>
  );
}
