import React, { useState, useEffect } from "react";
import axios from "axios";

// Map tab labels to Strapi endpoints
const endpoints = {
  "X": "xes",
  "TikTok": "tik-toks",
  "YouTube": "youtubes",
  "Reddit": "reddits",
  "X Spaces": "x-spaces",
};

export default function Web3DailyFeed() {
  const [activeTab, setActiveTab] = useState("X");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const res = await axios.get(
          `https://web3daily-cms.onrender.com/api/${endpoints[activeTab]}`
        );
        setPosts(res.data.data);
      } catch (err) {
        console.error("Error fetching posts:", err);
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
                ? "bg-indigo-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {platform}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-500">
          No content available for {activeTab}.
        </p>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => {
            const attrs = post.attributes;
            return (
              <div
                key={post.id}
                className="bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-700"
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
      )}
    </section>
  );
}
