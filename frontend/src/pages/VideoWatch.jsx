import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import CommentSection from "../components/CommentSection";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import {
  HiOutlineThumbUp,
  HiThumbUp,
  HiOutlineShare,
  HiOutlineBookmark,
} from "react-icons/hi";

function formatViews(count) {
  if (!count) return "0 views";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`;
  return `${count} views`;
}

export default function VideoWatch() {
  const { videoId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/videos/${videoId}`);
        setVideo(res.data?.data);
      } catch {
        toast.error("Failed to load video");
      } finally {
        setLoading(false);
      }
    };
    if (videoId) fetchVideo();
  }, [videoId]);

  const handleLike = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await API.post(`/likes/toggle/v/${videoId}`);
      setLiked(!liked);
      toast.success(liked ? "Like removed" : "Liked!");
    } catch {
      toast.error("Failed to toggle like");
    }
  };

  const handleSubscribe = async () => {
    if (!user || !video) return;
    try {
      await API.post(`/subscriptions/c/${video.owner}`);
      toast.success(subscribed ? "Unsubscribed" : "Subscribed!");
      setSubscribed(!subscribed);
    } catch {
      toast.error("Failed to toggle subscription");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (loading) return <LoadingSpinner />;
  if (!video) return <div className="page-empty"><h3>Video not found</h3></div>;

  const videoUrl = video?.videoFile?.url || video?.videoFile || "";

  return (
    <div className="fade-in">
      <div className="video-watch-layout">
        <div>
          {/* Video Player */}
          <div className="video-player-container">
            <video controls autoPlay src={videoUrl}>
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Video Info */}
          <div className="video-info">
            <h1 className="video-title">{video.title}</h1>

            <div className="video-actions-bar">
              <div className="video-channel-info">
                <img
                  className="video-channel-avatar"
                  src={
                    video.ownerAvatar?.url ||
                    video.ownerAvatar ||
                    "https://ui-avatars.com/api/?name=U&background=e94560&color=fff"
                  }
                  alt={video.username || "Channel"}
                  onClick={() => navigate(`/channel/${video.username}`)}
                  style={{ cursor: "pointer" }}
                />
                <div>
                  <div
                    className="channel-name"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/channel/${video.username}`)}
                  >
                    {video.username || video.ownerDetails?.username || "Unknown"}
                  </div>
                </div>
                <button
                  className={`btn ${subscribed ? "btn-secondary" : "btn-primary"} btn-sm`}
                  onClick={handleSubscribe}
                  style={{ marginLeft: 12 }}
                >
                  {subscribed ? "Subscribed" : "Subscribe"}
                </button>
              </div>

              <div className="video-action-buttons">
                <button
                  className={`action-btn ${liked ? "active" : ""}`}
                  onClick={handleLike}
                >
                  {liked ? (
                    <HiThumbUp className="icon" />
                  ) : (
                    <HiOutlineThumbUp className="icon" />
                  )}
                  Like
                </button>
                <button className="action-btn" onClick={handleShare}>
                  <HiOutlineShare className="icon" />
                  Share
                </button>
                <button className="action-btn">
                  <HiOutlineBookmark className="icon" />
                  Save
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="video-description">
              <div className="desc-stats">
                {formatViews(video.views)} •{" "}
                {new Date(video.createdAt).toLocaleDateString()}
              </div>
              <div className="desc-text">
                {video.description || "No description"}
              </div>
            </div>
          </div>

          {/* Comments */}
          <CommentSection videoId={videoId} />
        </div>

        {/* Right Sidebar - placeholder for related videos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            Related Videos
          </h3>
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: "var(--radius-md)",
              padding: 24,
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "0.85rem",
            }}
          >
            More videos coming soon
          </div>
        </div>
      </div>
    </div>
  );
}
