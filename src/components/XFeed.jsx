import React, { useState, useEffect } from "react";
import axios from "axios";

// Helper function to convert rich text (array of blocks) into a string.
function renderRichText(richText) {
  if (Array.isArray(richText)) {
    return richText
      .map((block) => {
        if (block.children && Array.isArray(block.children)) {
          // Join all text values from the block's children.
          return block.children.map(child => child.text || "").join("");
        }
        return "";
      })
      .join("\n");
  }
  // If not an array, return it as is.
  return richText;
}

export default function XFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await axios.get("https://web3daily-cms-production.up.railway.app/api/xes");
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
          let displayName, tweetText, tweetUrl, datePosted;
          if (post.attributes) {
            displayName = post.attributes.DisplayName;
            tweetText = post.attributes.TweetText;
            tweetUrl = post.attributes.TweetURL;
            datePosted = post.attributes.DatePosted;
          } else {
            displayName = post.DisplayName;
            tweetText = post.TweetText;
            tweetUrl = post.TweetURL;
            datePosted = post.DatePosted;
          }

          // Convert rich text to a plain string if needed.
          const renderedTweetText = renderRichText(tweetText);

          return (
            <div
              key={post.id}
              className="bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-700 transform hover:scale-105 transition-transform duration-200"
            >
              <h2 className="text-xl font-bold mb-1">
                {displayName || "Untitled"}
              </h2>
              <p className="text-gray-400 mb-2">
                {renderedTweetText || "No content provided."}
              </p>
              {tweetUrl && (
                <a
                  href={tweetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline text-sm"
                >
                  View Original
                </a>
              )}
              {datePosted && (
                <p className="text-sm text-gray-400 mt-2">
                  Posted on: {new Date(datePosted).toLocaleString()}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
