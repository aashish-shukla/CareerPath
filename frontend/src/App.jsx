import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { authStore } from "./lib/state/authStore";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ProfileWizardPage } from "./pages/profile/ProfileWizardPage";
import { DashboardPage } from "./pages/app/DashboardPage";
import { RecommendationsPage } from "./pages/app/RecommendationsPage";
import { SkillGapPage } from "./pages/app/SkillGapPage";
import { ResourcesPage } from "./pages/app/ResourcesPage";
import ProfilePage from "./pages/app/ProfilePage";
import ChatPage from "./pages/app/ChatPage";
import AtsCheckerPage from "./pages/app/AtsCheckerPage";

function RequireAuth({ children }) {
  const location = useLocation();
  if (!authStore.isAuthed()) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}

export default function App() {
  useEffect(() => {
    const theme = localStorage.getItem("theme") || "light";
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/profile/wizard"
        element={
          <RequireAuth>
            <ProfileWizardPage />
          </RequireAuth>
        }
      />

      <Route
        path="/app/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/app/recommendations"
        element={
          <RequireAuth>
            <RecommendationsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/app/skill-gap"
        element={
          <RequireAuth>
            <SkillGapPage />
          </RequireAuth>
        }
      />
      <Route
        path="/app/resources"
        element={
          <RequireAuth>
            <ResourcesPage />
          </RequireAuth>
        }
      />
      <Route
        path="/app/profile"
        element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        }
      />
      <Route
        path="/app/chat"
        element={
          <RequireAuth>
            <ChatPage />
          </RequireAuth>
        }
      />
      <Route
        path="/app/ats-checker"
        element={
          <RequireAuth>
            <AtsCheckerPage />
          </RequireAuth>
        }
      />

      <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

