import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { FollowProvider } from "./context/FollowContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ConfirmEmail from "./pages/auth/ConfirmEmail";
import Feed from "./pages/feed/Feed";
import PostDetail from "./pages/posts/PostDetail";
import CreatePost from "./pages/posts/CreatePost";
import UserProfile from "./pages/profile/UserProfile";
import Settings from "./pages/profile/Settings";
import Chat from "./pages/chat/Chat";
import TagPage from "./pages/TagPage";
import Notifications from "./pages/Notifications";
import CurrentsFeed from "./pages/currents/CurrentsFeed";
import OnboardingSuggestions from "./pages/OnboardingSuggestions";
import Invite from "./pages/Invite";
import InviteLanding from "./pages/InviteLanding";
import Bottles from "./pages/Bottles";
import CreateWave from "./pages/posts/CreateWave";
import CreateCurrent from "./pages/posts/CreateCurrent";
import WaveStore from "./pages/WaveStore";
import WaveViewer from "./pages/posts/WaveViewer";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminVerifications from "./pages/admin/AdminVerifications";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminRoute from "./pages/admin/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import CreatorHub from "./pages/creator/CreatorHub";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";

const FALLBACK_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect fill='%23e5e7eb' width='40' height='40'/%3E%3Ctext x='20' y='26' text-anchor='middle' fill='%239ca3af' font-size='18' font-family='sans-serif'%3E?%3C/text%3E%3C/svg%3E";

export default function App() {
  useEffect(() => {
    const handler = (e) => {
      if (e.target?.tagName === "IMG" && e.target?.src?.includes("cloudinary") && !e.target.dataset?.fallback) {
        e.target.dataset.fallback = "1";
        e.target.src = FALLBACK_AVATAR;
      }
    };
    document.addEventListener("error", handler, true);
    return () => document.removeEventListener("error", handler, true);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
        <FollowProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingSuggestions /></ProtectedRoute>} />
            <Route path="/invite" element={<ProtectedRoute><Invite /></ProtectedRoute>} />
            <Route path="/invite/:code" element={<InviteLanding />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/confirm-email/:token" element={<ConfirmEmail />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/posts/:uuid" element={<PostDetail />} />
            <Route
              path="/posts/new"
              element={
                <ProtectedRoute>
                  <CreatePost />
                </ProtectedRoute>
              }
            />
            <Route path="/profile/:username" element={<UserProfile />} />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:uuid"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route path="/currents" element={<CurrentsFeed />} />
            <Route path="/bottles" element={<Bottles />} />
            <Route path="/wave-store" element={<WaveStore />} />
            <Route
              path="/waves/new"
              element={
                <ProtectedRoute>
                  <CreateWave />
                </ProtectedRoute>
              }
            />
            <Route
              path="/currents/new"
              element={
                <ProtectedRoute>
                  <CreateCurrent />
                </ProtectedRoute>
              }
            />
            <Route path="/tags/:tag" element={<TagPage />} />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />
          </Route>
          <Route path="/waves/view/:username" element={<WaveViewer />} />
          <Route path="/creator-hub" element={<ProtectedRoute><CreatorHub /></ProtectedRoute>} />
          <Route path="/creator-hub/:username" element={<Navigate to="/creator-hub" replace />} />
          <Route path="/users/:username/creator-hub" element={<ProtectedRoute><CreatorHub /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminRoute /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="verifications" element={<AdminVerifications />} />
              <Route path="roles" element={<AdminRoles />} />
            </Route>
          </Route>
        </Routes>
        </FollowProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
