import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MdPlayCircleFilled } from "react-icons/md";
import { HiOutlineCloudUpload } from "react-icons/hi";
import toast from "react-hot-toast";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.fullname || !form.username || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }
    if (!avatar) {
      setError("Avatar is required");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullname", form.fullname);
      formData.append("username", form.username);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("avatar", avatar);
      if (coverImage) formData.append("coverImage", coverImage);

      await register(formData);
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: 500 }}>
        <div className="auth-header">
          <div className="logo">
            <MdPlayCircleFilled className="logo-icon" />
            <span>VideoTube</span>
          </div>
          <p>Create your account</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Avatar Upload */}
          <div className="form-group" style={{ textAlign: "center" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                margin: "0 auto 12px",
                overflow: "hidden",
                border: "3px solid var(--accent)",
                background: "var(--bg-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
              }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <HiOutlineCloudUpload
                  style={{ fontSize: "1.8rem", color: "var(--text-muted)" }}
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0,
                  cursor: "pointer",
                }}
              />
            </div>
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
              }}
            >
              Upload Avatar *
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="fullname"
              className="form-input"
              placeholder="Enter your full name"
              value={form.fullname}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="Choose a username"
              value={form.username}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cover Image (optional)</label>
            <div className="file-upload" style={{ padding: 16 }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverImage(e.target.files[0])}
              />
              <div className="upload-text" style={{ fontSize: "0.82rem" }}>
                {coverImage ? coverImage.name : "Click to upload cover image"}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
