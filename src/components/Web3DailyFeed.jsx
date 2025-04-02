import React, { useState, useEffect } from "react";
import axios from "axios";

// Map tab labels to Strapi endpoints
const endpoints = {
  X: "xes",
  TikTok: "tik-toks",
  YouTube: "youtubes",
  Reddit: "reddits",
  "X Spaces": "x-spaces",
};

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

export default function Web3DailyFeed() {
  const [activeTab, setActiveTab] = useState("X");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const res = await axios.get(
          `https://web3daily-cms-production.up.railway.app/api/${endpoints[activeTab]}`
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
  }, [activeTab]);

  return (
    <section className="p-4 max-w-5xl mx-auto">
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {Object.keys(endpoints).map((platform) => (
          <button
            key={platform}
            onClick={() => setActiveTab(platform)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 ${
              activeTab === platform
                ? "bg-indigo-600 text-white shadow"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {platform}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="text-center text-gray-500">Loading posts...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-500">
          No content available for {activeTab}.
        </p>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => {
            // Use attributes if available; otherwise, use the post object directly.
            const data = post?.attributes || post;
            const DisplayName = data.DisplayName || "Untitled";
            let TweetText = data.TweetText || "No content provided.";
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
      )}
    </section>
  );
}
