import React, { useState, useEffect } from "react";
import axios from "axios";

export default function XFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        // Updated endpoint to your Railway URL
        const res = await axios.get("https://web3daily-cms-production.up.railway.app/api/xes");
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
          const attrs = post.attributes;
          return (
            <div
              key={post.id}
              className="bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-700 transform hover:scale-105 transition-transform duration-200"
            >
              <h2 className="text-xl font-bold mb-1">
                {attrs?.DisplayName || "Untitled"}
              </h2>
              <p className="text-gray-400 mb-2">
                {attrs?.TweetText || attrs?.Description || "No content provided."}
              </p>
              {(attrs?.TweetURL || attrs?.VideoURL) && (
                <a
                  href={attrs?.TweetURL || attrs?.VideoURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline text-sm"
                >
                  View Original
                </a>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
