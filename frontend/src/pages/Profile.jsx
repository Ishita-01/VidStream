import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Profile() {
  const { user, setUser, loading: authLoading } = useAuth();
  const [form, setForm] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
  });
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  if (authLoading) return <LoadingSpinner />;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    if (!form.fullname || !form.email) {
      toast.error("All fields are required");
      return;
    }
    setSaving(true);
    try {
      const res = await API.patch("/users/update-Account", form);
      setUser(res.data?.data);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await API.patch("/users/avatar", formData);
      setUser(res.data?.data);
      toast.success("Avatar updated!");
    } catch {
      toast.error("Failed to update avatar");
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("coverImage", file);
    try {
      const res = await API.patch("/users/cover-image", formData);
      setUser(res.data?.data);
      toast.success("Cover image updated!");
    } catch {
      toast.error("Failed to update cover image");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwords.oldPassword || !passwords.newPassword) {
      toast.error("All fields required");
      return;
    }
    setChangingPw(true);
    try {
      await API.post("/users/change-password", passwords);
      toast.success("Password changed!");
      setPasswords({ oldPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="profile-page fade-in-up">
      <h1>Profile Settings</h1>

      {/* Avatar Section */}
      <div className="profile-avatar-section">
        <div style={{ position: "relative" }}>
          <img
            className="profile-avatar-preview"
            src={
              user?.avatar ||
              "https://ui-avatars.com/api/?name=U&background=e94560&color=fff&size=80"
            }
            alt="Avatar"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              cursor: "pointer",
              borderRadius: "50%",
            }}
          />
        </div>
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>
            {user?.fullname}
          </h3>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              marginBottom: 8,
            }}
          >
            @{user?.username}
          </p>
          <span
            style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}
          >
            Click avatar to change
          </span>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
            Change Cover
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>

      {/* Update Details */}
      <form onSubmit={handleUpdateDetails}>
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            marginBottom: 16,
            marginTop: 32,
          }}
        >
          Account Details
        </h2>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            name="fullname"
            className="form-input"
            value={form.fullname}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-input"
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* Change Password */}
      <form onSubmit={handleChangePassword} style={{ marginTop: 40 }}>
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          Change Password
        </h2>
        <div className="form-group">
          <label className="form-label">Current Password</label>
          <input
            type="password"
            className="form-input"
            value={passwords.oldPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, oldPassword: e.target.value })
            }
          />
        </div>
        <div className="form-group">
          <label className="form-label">New Password</label>
          <input
            type="password"
            className="form-input"
            value={passwords.newPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, newPassword: e.target.value })
            }
          />
        </div>
        <button
          type="submit"
          className="btn btn-secondary"
          disabled={changingPw}
        >
          {changingPw ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}
