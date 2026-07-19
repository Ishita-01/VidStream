import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import VideoCard from "../components/VideoCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { HiOutlineVideoCamera } from "react-icons/hi";

export default function Channel() {
  const { username } = useParams();
  const { user } = useAuth();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const fetchChannel = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/users/c/${username}`);
        setChannel(res.data?.data);
        setSubscribed(res.data?.data?.isSubscribed || false);
      } catch {
        toast.error("Channel not found");
      }

      try {
        const vRes = await API.get("/videos", {
          params: { query: "", limit: 20 },
        });
        // Filter videos by this channel's username
        const allVids = vRes.data?.data?.docs || vRes.data?.data || [];
        const channelVids = allVids.filter(
          (v) =>
            v.ownerDetails?.username === username ||
            v.username === username
        );
        setVideos(channelVids);
      } catch {
        setVideos([]);
      }

      setLoading(false);
    };

    if (username) fetchChannel();
  }, [username]);

  const handleSubscribe = async () => {
    if (!channel) return;
    try {
      await API.post(`/subscriptions/c/${channel._id}`);
      setSubscribed(!subscribed);
      // Increment/decrement subscriber count visually
      setChannel(prev => ({
        ...prev,
        subscribersCount: subscribed ? prev.subscribersCount - 1 : prev.subscribersCount + 1
      }));
      toast.success(subscribed ? "Unsubscribed" : "Subscribed!");
    } catch {
      toast.error("Failed to toggle subscription");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!channel)
    return (
      <div className="page-empty">
        <h3>Channel not found</h3>
      </div>
    );

  const isOwnChannel = user?.username === username;

  return (
    <div className="fade-in">
      {/* Banner */}
      <div className="channel-banner">
        {channel.coverImage ? (
          <img src={channel.coverImage} alt="Cover" />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            }}
          />
        )}
      </div>

      {/* Channel Header */}
      <div className="channel-header">
        <img
          className="channel-avatar-large"
          src={
            channel.avatar ||
            `https://ui-avatars.com/api/?name=${channel.fullName || username}&background=e94560&color=fff&size=100`
          }
          alt={username}
        />
        <div className="channel-details">
          <h1>{channel.fullName || channel.fullname || username}</h1>
          <div className="channel-handle">@{username}</div>
          <div className="channel-stats-row">
            <span>{channel.subscribersCount || 0} subscribers</span>
            <span>•</span>
            <span>
              {channel.channelsSubscribedToCount || 0} subscriptions
            </span>
          </div>
        </div>
        {!isOwnChannel && user && (
          <button
            className={`btn ${subscribed ? "btn-secondary" : "btn-primary"}`}
            onClick={handleSubscribe}
            style={{ marginLeft: "auto" }}
          >
            {subscribed ? "Subscribed" : "Subscribe"}
          </button>
        )}
      </div>

      {/* Videos */}
      <div style={{ marginTop: 32 }}>
        <h2
          style={{
            fontSize: "1.15rem",
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          Videos
        </h2>
        {videos.length === 0 ? (
          <div className="page-empty">
            <div className="empty-icon">
              <HiOutlineVideoCamera />
            </div>
            <h3>No videos yet</h3>
            <p>This channel hasn&apos;t uploaded any videos.</p>
          </div>
        ) : (
          <div className="video-grid">
            {videos.map((v) => (
              <VideoCard key={v._id} video={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
