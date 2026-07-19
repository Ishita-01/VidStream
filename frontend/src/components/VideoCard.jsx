import { useNavigate } from "react-router-dom";

function formatDuration(seconds) {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function formatViews(count) {
  if (!count) return "0 views";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`;
  return `${count} views`;
}

export default function VideoCard({ video }) {
  const navigate = useNavigate();

  const thumbnailUrl =
    video?.thumbnail?.url || video?.thumbnail || "https://placehold.co/640x360/1a1a2e/666?text=No+Thumbnail";

  const avatarUrl =
    video?.ownerDetails?.avatar?.url ||
    video?.ownerDetails?.avatar ||
    video?.owner?.avatar ||
    "https://ui-avatars.com/api/?name=U&background=e94560&color=fff&size=36";

  const channelName =
    video?.ownerDetails?.username ||
    video?.ownerDetails?.fullName ||
    video?.owner?.username ||
    video?.username ||
    "Unknown";

  const videoId = video?._id;

  return (
    <div className="video-card" onClick={() => navigate(`/watch/${videoId}`)}>
      <div className="video-card-thumbnail">
        <img src={thumbnailUrl} alt={video?.title || "Video"} />
        {video?.duration && (
          <span className="video-duration">
            {formatDuration(video.duration)}
          </span>
        )}
      </div>
      <div className="video-card-info">
        <div className="video-card-avatar">
          <img src={avatarUrl} alt={channelName} />
        </div>
        <div className="video-card-meta">
          <div className="video-card-title">{video?.title || "Untitled"}</div>
          <div
            className="video-card-channel"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/channel/${channelName}`);
            }}
          >
            {channelName}
          </div>
          <div className="video-card-stats">
            <span>{formatViews(video?.views)}</span>
            <span>•</span>
            <span>{timeAgo(video?.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
