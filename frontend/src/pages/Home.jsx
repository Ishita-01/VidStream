import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api/axios";
import VideoCard from "../components/VideoCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { HiOutlineVideoCamera } from "react-icons/hi";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "";
  const sortType = searchParams.get("sortType") || "";

  const fetchVideos = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = { page: pageNum, limit: 12 };
      if (search) params.query = search;
      if (sortBy) params.sortBy = sortBy;
      if (sortType) params.sortType = sortType;

      const res = await API.get("/videos", { params });
      const data = res.data?.data;
      const docs = data?.docs || data || [];

      if (pageNum === 1) {
        setVideos(docs);
      } else {
        setVideos((prev) => [...prev, ...docs]);
      }
      setHasMore(data?.hasNextPage || false);
      setPage(pageNum);
    } catch {
      // API might fail if not logged in for video routes
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(1);
  }, [search, sortBy, sortType]);

  if (loading && page === 1) return <LoadingSpinner />;

  return (
    <div className="fade-in">
      {search && (
        <h2
          style={{
            fontSize: "1.2rem",
            fontWeight: 600,
            marginBottom: 20,
            color: "var(--text-secondary)",
          }}
        >
          Results for &quot;{search}&quot;
        </h2>
      )}

      {videos.length === 0 ? (
        <div className="page-empty">
          <div className="empty-icon">
            <HiOutlineVideoCamera />
          </div>
          <h3>No videos found</h3>
          <p>
            {search
              ? "Try a different search term"
              : "Be the first to upload a video!"}
          </p>
        </div>
      ) : (
        <>
          <div className="video-grid">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
          {hasMore && (
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <button
                className="btn btn-secondary"
                onClick={() => fetchVideos(page + 1)}
                disabled={loading}
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
