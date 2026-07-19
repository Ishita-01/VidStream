import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  HiOutlineMenu,
  HiOutlineSearch,
  HiOutlineBell,
  HiOutlineUpload,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineLogout,
} from "react-icons/hi";
import { MdPlayCircleFilled } from "react-icons/md";

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-btn" onClick={onToggleSidebar}>
          <HiOutlineMenu />
        </button>
        <Link to="/" className="navbar-logo">
          <MdPlayCircleFilled className="logo-icon" />
          <span>VideoTube</span>
        </Link>
      </div>

      <form className="navbar-search" onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn">
            <HiOutlineSearch />
          </button>
        </div>
      </form>

      <div className="navbar-right">
        {user ? (
          <>
            <button
              className="nav-icon-btn"
              onClick={() => navigate("/upload")}
              title="Upload"
            >
              <HiOutlineUpload />
            </button>
            <button className="nav-icon-btn" title="Notifications">
              <HiOutlineBell />
            </button>
            <div ref={menuRef} style={{ position: "relative" }}>
              <div
                className="user-avatar-btn"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <img
                  src={user.avatar || "https://ui-avatars.com/api/?name=U&background=e94560&color=fff"}
                  alt={user.username}
                />
              </div>
              {menuOpen && (
                <div className="user-menu">
                  <div className="user-menu-header">
                    <img
                      src={user.avatar || "https://ui-avatars.com/api/?name=U&background=e94560&color=fff"}
                      alt={user.username}
                    />
                    <div className="user-info">
                      <h4>{user.fullname}</h4>
                      <p>@{user.username}</p>
                    </div>
                  </div>
                  <Link to={`/channel/${user.username}`}>
                    <button
                      className="user-menu-item"
                      onClick={() => setMenuOpen(false)}
                    >
                      <HiOutlineUser /> Your Channel
                    </button>
                  </Link>
                  <Link to="/profile">
                    <button
                      className="user-menu-item"
                      onClick={() => setMenuOpen(false)}
                    >
                      <HiOutlineCog /> Settings
                    </button>
                  </Link>
                  <button
                    className="user-menu-item danger"
                    onClick={handleLogout}
                  >
                    <HiOutlineLogout /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="auth-buttons">
            <Link to="/login">
              <button className="btn btn-ghost btn-sm">Sign In</button>
            </Link>
            <Link to="/register">
              <button className="btn btn-primary btn-sm">Sign Up</button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
