import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VideoWatch from "./pages/VideoWatch";
import Upload from "./pages/Upload";
import Channel from "./pages/Channel";
import Profile from "./pages/Profile";
import LikedVideos from "./pages/LikedVideos";
import WatchHistory from "./pages/WatchHistory";
import "./App.css";

function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setMobileOpen(!mobileOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  return (
    <>
      <Navbar onToggleSidebar={toggleSidebar} />
      <div className="app-layout">
        <Sidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
        <main
          className={`main-content ${
            sidebarCollapsed ? "sidebar-collapsed" : ""
          }`}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/watch/:videoId" element={<VideoWatch />} />
            <Route path="/channel/:username" element={<Channel />} />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/liked-videos"
              element={
                <ProtectedRoute>
                  <LikedVideos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <WatchHistory />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: "toast-custom",
            duration: 3000,
            style: {
              background: "rgba(22, 33, 62, 0.95)",
              color: "#eee",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
            },
          }}
        />
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
