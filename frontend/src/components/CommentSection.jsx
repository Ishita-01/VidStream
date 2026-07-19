import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function CommentSection({ videoId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await API.get(`/comments/${videoId}`);
      const data = res.data?.data;
      setComments(data?.docs || data || []);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    if (videoId) fetchComments();
  }, [videoId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      await API.post(`/comments/${videoId}`, { content: newComment.trim() });
      setNewComment("");
      setShowActions(false);
      toast.success("Comment added!");
      fetchComments();
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNewComment("");
    setShowActions(false);
  };

  return (
    <div className="comments-section">
      <h3 className="comments-header">
        {comments.length} Comment{comments.length !== 1 ? "s" : ""}
      </h3>

      {user && (
        <div className="comment-input-wrapper">
          <img
            className="comment-input-avatar"
            src={user.avatar || "https://ui-avatars.com/api/?name=U&background=e94560&color=fff"}
            alt="You"
          />
          <div className="comment-input-form">
            <input
              type="text"
              className="comment-input"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onFocus={() => setShowActions(true)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            />
            {showActions && (
              <div className="comment-input-actions">
                <button className="btn btn-ghost btn-sm" onClick={handleCancel}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || loading}
                >
                  {loading ? "Posting..." : "Comment"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        {comments.map((c) => (
          <div className="comment-item fade-in" key={c._id}>
            <img
              className="comment-avatar"
              src={
                c.owner?.avatar ||
                "https://ui-avatars.com/api/?name=U&background=333&color=fff&size=36"
              }
              alt=""
            />
            <div className="comment-body">
              <div className="comment-author">
                {c.owner?.username || "User"}
                <span>{timeAgo(c.createdAt)}</span>
              </div>
              <div className="comment-text">{c.content}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
