import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { HiOutlineCloudUpload, HiOutlineFilm, HiOutlinePhotograph } from "react-icons/hi";

export default function Upload() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "" });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !videoFile || !thumbnail) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("videoFile", videoFile);
      formData.append("thumbnail", thumbnail);

      await API.post("/videos", formData, {
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total);
          setProgress(pct);
        },
      });

      toast.success("Video uploaded successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="upload-page fade-in-up">
      <h1>Upload Video</h1>

      <form onSubmit={handleSubmit}>
        <div className="upload-form-grid">
          {/* Video File */}
          <div className="full-width">
            <label className="form-label">Video File *</label>
            <div className="file-upload">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
              />
              <div className="upload-icon">
                {videoFile ? <HiOutlineFilm /> : <HiOutlineCloudUpload />}
              </div>
              <div className="upload-text">
                {videoFile ? videoFile.name : "Click or drag to upload video"}
              </div>
              <div className="upload-hint">MP4, WebM, AVI supported</div>
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="form-label">Thumbnail *</label>
            <div className="file-upload" style={{ padding: 16 }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
              {thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  style={{
                    maxHeight: 120,
                    borderRadius: 8,
                    margin: "0 auto",
                  }}
                />
              ) : (
                <>
                  <div className="upload-icon">
                    <HiOutlinePhotograph />
                  </div>
                  <div className="upload-text">Upload thumbnail</div>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="full-width">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                name="title"
                className="form-input"
                placeholder="Enter video title"
                value={form.title}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Description */}
          <div className="full-width">
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                name="description"
                className="form-input"
                placeholder="Describe your video"
                rows={4}
                value={form.description}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {loading && (
          <div
            style={{
              margin: "20px 0",
              background: "var(--bg-surface)",
              borderRadius: 8,
              overflow: "hidden",
              height: 6,
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "var(--accent)",
                transition: "width 0.3s ease",
                borderRadius: 8,
              }}
            />
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
          style={{ marginTop: 8 }}
        >
          {loading ? `Uploading... ${progress}%` : "Upload Video"}
        </button>
      </form>
    </div>
  );
}
