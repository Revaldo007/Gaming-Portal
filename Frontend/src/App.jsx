import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import GamingPortal from "./GamingPortal";
import { THEME } from "./theme";

function Root() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: THEME.bg, fontFamily: "Inter, system-ui, sans-serif" }}
      >
        <p style={{ color: THEME.muted }}>Loading…</p>
      </div>
    );
  }

  return user ? <GamingPortal /> : <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}