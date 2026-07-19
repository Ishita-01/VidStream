import { useState, useEffect } from "react";
import API from "../api/axios";
import VideoCard from "../components/VideoCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { HiOutlineClock } from "react-icons/hi";

export default function WatchHistory() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get("/users/history");
        setVideos(res.data?.data || []);
      } catch (err) {
        console.error("Watch History Error:", err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in">
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          marginBottom: 24,
        }}
      >
        Watch History
      </h1>

      {videos.length === 0 ? (
        <div className="page-empty">
          <div className="empty-icon">
            <HiOutlineClock />
          </div>
          <h3>No watch history</h3>
          <p>Videos you watch will appear here.</p>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map((v) => (
            <VideoCard key={v._id} video={v} />
          ))}
        </div>
      )}
    </div>
  );
}
