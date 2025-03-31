import React, { useState, useEffect } from "react";
import axios from "axios";

export default function XFeed() {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTweets() {
      try {
        const res = await axios.get("https://web3daily-cms.onrender.com/api/xes");
        // Assuming the returned data structure is { data: { data: [...] } }
        setTweets(res.data.data);
      } catch (err) {
        console.error("Error fetching tweets:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTweets();
  }, []);

  if (loading) {
    return <p className="text-white p-4">Loading tweets...</p>;
  }

  if (!tweets.length) {
    return <p className="text-white p-4">No tweets available.</p>;
  }

  return (
    <div className="text-white p-4">
      <h2 className="text-xl font-bold mb-4">X Feed</h2>
      {tweets.map((tweet) => {
        // Extract attributes (adjust keys as needed)
        const { DisplayName, TweetText, TweetURL } = tweet.attributes;
        return (
          <div
            key={tweet.id}
            className="bg-gray-800 p-4 rounded mb-4 transform hover:scale-105 transition-transform duration-200"
          >
            <h3 className="font-bold">{DisplayName || "Unknown"}</h3>
            <p>{TweetText || "No content available."}</p>
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
          </div>
        );
      })}
    </div>
  );
}
