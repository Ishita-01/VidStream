import { useState, useEffect } from "react";
import API from "../api/axios";
import VideoCard from "../components/VideoCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { HiOutlineHeart } from "react-icons/hi";

export default function LikedVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiked = async () => {
      try {
        const res = await API.get("/likes/videos");
        const data = res.data?.data || [];
        // Map liked video data to standard video format
        const mapped = data.map((item) => item.likedVideo || item);
        setVideos(mapped);
      } catch {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLiked();
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
        Liked Videos
      </h1>

      {videos.length === 0 ? (
        <div className="page-empty">
          <div className="empty-icon">
            <HiOutlineHeart />
          </div>
          <h3>No liked videos</h3>
          <p>Videos you like will appear here.</p>
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
