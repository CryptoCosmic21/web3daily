import React, { useState, useEffect } from "react";
import axios from "axios";

// Helper function to convert rich text blocks into a plain string.
function renderRichText(richText) {
  if (Array.isArray(richText)) {
    return richText
      .map((block) => {
        if (block && block.children && Array.isArray(block.children)) {
          return block.children.map(child => child.text || "").join("");
        }
        return "";
      })
      .join("\n");
  }
  if (typeof richText === "object" && richText !== null) {
    return JSON.stringify(richText);
  }
  return richText;
}

export default function XFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await axios.get(
          "https://web3daily-cms-production.up.railway.app/api/xes"
        );
        console.log("API response:", res.data);
        const dataArray = Array.isArray(res.data.data) ? res.data.data : [];
        setPosts(dataArray);
      } catch (err) {
        console.error(
          "Error fetching posts:",
          err.response ? err.response.data : err.message
        );
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
          // Use attributes if available; otherwise, use the post object directly.
          const data = post && post.attributes ? post.attributes : post;
          const DisplayName = data.DisplayName || "Untitled";
          let TweetText = data.TweetText || "No content provided.";
          // If TweetText is an array (rich text), convert it to a string.
          if (Array.isArray(TweetText)) {
            TweetText = renderRichText(TweetText);
          }
          const TweetURL = data.TweetURL || "";
          const DatePosted = data.DatePosted || null;

          return (
            <div
              key={post.id}
              className="bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-700 transform hover:scale-105 transition-transform duration-200"
            >
              <h2 className="text-xl font-bold mb-1">{DisplayName}</h2>
              <p className="text-gray-400 mb-2">{TweetText}</p>
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
