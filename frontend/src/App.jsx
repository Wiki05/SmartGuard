import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { onAuthChange, normalizeUser, signOutUser, subscribeToUser } from "./api/authService";

// Pages
import LandingPage    from "./pages/LandingPage";
import AuthPage       from "./pages/AuthPage";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import HomePage       from "./pages/dashboard/HomePage";
import ChatPage       from "./pages/dashboard/ChatPage";
import GeneratorPage  from "./pages/dashboard/GeneratorPage";
import AuditorPage    from "./pages/dashboard/AuditorPage";
import AlertsPage     from "./pages/dashboard/AlertsPage";
import NewsPage       from "./pages/dashboard/NewsPage";
import TradingPage    from "./pages/dashboard/TradingPage";
import ProfilePage    from "./pages/dashboard/ProfilePage";
import SettingsPage   from "./pages/dashboard/SettingsPage";
import SecurityPage   from "./pages/dashboard/SecurityPage";

// Map URL path → sidebar page id
const PATH_TO_ID = {
  "/dashboard": "home",
  "/aichat":    "chat",
  "/generator": "generator",
  "/auditor":   "auditor",
  "/alerts":    "alerts",
  "/news":      "news",
  "/trading":   "trading",
  "/profile":   "profile",
  "/settings":  "settings",
  "/security":  "security",
};
const ID_TO_PATH = Object.fromEntries(Object.entries(PATH_TO_ID).map(([k,v])=>[v,k]));

/** Renders correct page component based on URL */
function DashboardContent({ user, onNavigate }) {
  const location = useLocation();
  const pageId   = PATH_TO_ID[location.pathname] || "home";

  const pages = {
    home:      <HomePage      user={user} onNavigate={onNavigate} />,
    chat:      <ChatPage      user={user} />,
    generator: <GeneratorPage />,
    auditor:   <AuditorPage   user={user} />,
    alerts:    <AlertsPage    user={user} />,
    news:      <NewsPage      />,
    trading:   <TradingPage   />,
    profile:   <ProfilePage   user={user} />,
    settings:  <SettingsPage  user={user} />,
    security:  <SecurityPage  user={user} />,
  };
  return pages[pageId] || pages.home;
}

/** Full dashboard shell */
function DashboardShell({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace />;

  const currentPageId   = PATH_TO_ID[location.pathname] || "home";
  const handlePageChange = (id) => navigate(ID_TO_PATH[id] || "/dashboard");
  const handleLogout     = async () => { await onLogout(); navigate("/", { replace: true }); };

  return (
    <DashboardLayout
      user={user}
      page={currentPageId}
      onPageChange={handlePageChange}
      onLogout={handleLogout}
    >
      <DashboardContent user={user} onNavigate={handlePageChange} />
    </DashboardLayout>
  );
}

/** Loading splash shown while Firebase resolves auth state */
function AuthLoading() {
  return (
    <div style={{
      minHeight: "100vh", background: "#000",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 16
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: "linear-gradient(135deg, #a8ff6c, #00e5ff)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 30px rgba(168,255,108,0.5)",
        animation: "spin 1.2s linear infinite"
      }} />
      <span style={{ color: "#444", fontSize: 13 }}>Connecting…</span>
    </div>
  );
}

export default function App() {
  const [user,        setUser]        = useState(undefined); // undefined = loading
  const [authChecked, setAuthChecked] = useState(false);

  // Listen to Firebase auth state — fires immediately on mount
  useEffect(() => {
    let unSubDoc = null;
    const unsubAuth = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        // 1. Set initial auth state
        const basic = normalizeUser(firebaseUser);
        setUser(basic);
        setAuthChecked(true);

        // 2. Subscribe to real-time Firestore data
        if (unSubDoc) unSubDoc();
        unSubDoc = subscribeToUser(firebaseUser.uid, (dbData) => {
          setUser(prev => {
            if (!prev) return { ...normalizeUser(firebaseUser), ...dbData };
            return { ...prev, ...dbData };
          });
        });
      } else {
        if (unSubDoc) unSubDoc();
        setUser(null);
        setAuthChecked(true);
      }
    });

    return () => {
      unsubAuth();
      if (unSubDoc) unSubDoc();
    };
  }, []);

  const handleLogin  = (u) => { if (u) setUser(u); };
  const handleLogout = async () => { await signOutUser(); setUser(null); };

  // While Firebase is still checking the persisted session, show a loading screen
  if (!authChecked) return <AuthLoading />;

  const dashEl = <DashboardShell user={user} onLogout={handleLogout} />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<LandingPage user={user} />} />
        <Route path="/login"     element={user ? <Navigate to="/dashboard" replace /> : <AuthPage onLogin={handleLogin} />} />
        {/* All dashboard routes share the same shell */}
        <Route path="/dashboard" element={dashEl} />
        <Route path="/aichat"    element={dashEl} />
        <Route path="/generator" element={dashEl} />
        <Route path="/auditor"   element={dashEl} />
        <Route path="/alerts"    element={dashEl} />
        <Route path="/news"      element={dashEl} />
        <Route path="/trading"   element={dashEl} />
        <Route path="/profile"   element={dashEl} />
        <Route path="/settings"  element={dashEl} />
        <Route path="/security"  element={dashEl} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
