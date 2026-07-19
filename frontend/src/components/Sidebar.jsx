import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  HiOutlineHome,
  HiOutlineFire,
  HiOutlineClock,
  HiOutlineHeart,
  HiOutlineCollection,
  HiOutlineUpload,
  HiOutlineUserCircle,
} from "react-icons/hi";

export default function Sidebar({ collapsed, mobileOpen, onClose }) {
  const { user } = useAuth();

  const mainItems = [
    { to: "/", icon: <HiOutlineHome />, label: "Home" },
    { to: "/?sortBy=views&sortType=desc", icon: <HiOutlineFire />, label: "Trending" },
  ];

  const userItems = user
    ? [
        { to: "/history", icon: <HiOutlineClock />, label: "History" },
        { to: "/liked-videos", icon: <HiOutlineHeart />, label: "Liked Videos" },
        { to: "/upload", icon: <HiOutlineUpload />, label: "Upload" },
        { to: `/channel/${user.username}`, icon: <HiOutlineUserCircle />, label: "Your Channel" },
      ]
    : [];

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <aside
        className={`sidebar ${collapsed ? "collapsed" : ""} ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        <div className="sidebar-section">
          {mainItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active" : ""}`
              }
              onClick={onClose}
            >
              <span className="icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {userItems.length > 0 && (
          <div className="sidebar-section">
            <div className="sidebar-label">You</div>
            {userItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? "active" : ""}`
                }
                onClick={onClose}
              >
                <span className="icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </aside>
    </>
  );
}
