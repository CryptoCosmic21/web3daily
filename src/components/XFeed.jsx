import React, { useState, useEffect } from "react";
import axios from "axios";

export default function XFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await axios.get("https://web3daily-cms-production.up.railway.app/api/xes");
        console.log("API response:", res.data);
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        setPosts(data);
      } catch (err) {
        console.error("Error fetching posts:", err.response ? err.response.data : err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">Loading posts...</p>;
  }

  if (!posts.length) {
    return <p className="text-center text-gray-500">No posts available.</p>;
  }

  return (
    <section className="p-4 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4">X Feed</h2>
      <div className="grid gap-4">
        {posts.map((post) => {
          let DisplayName, TweetText, TweetURL, DatePosted;
          if (post && post.attributes) {
            ({ DisplayName, TweetText, TweetURL, DatePosted } = post.attributes);
          } else {
            ({ DisplayName, TweetText, TweetURL, DatePosted } = post);
          }
          return (
            <div
              key={post.id}
              className="bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-700 transform hover:scale-105 transition-transform duration-200"
            >
              <h2 className="text-xl font-bold mb-1">{DisplayName || "Untitled"}</h2>
              <p className="text-gray-400 mb-2">{TweetText || "No content provided."}</p>
              {TweetURL && (
                <a
                  href={TweetURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline text-sm"
                >
                  View Original
                </a>
              )}
              {DatePosted && (
                <p className="text-sm text-gray-400 mt-2">
                  Posted on: {new Date(DatePosted).toLocaleString()}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
