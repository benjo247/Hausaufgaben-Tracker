import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Onboarding from "./pages/Onboarding.jsx";
import Feed       from "./pages/Feed.jsx";

const STORAGE_KEY = "hausaufgaben_user";

function loadUser() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
  catch { return null; }
}
function saveUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}
function clearUser() {
  localStorage.removeItem(STORAGE_KEY);
}

export default function App() {
  const [user, setUser] = useState(loadUser);

  const handleOnboardingDone = (userData) => {
    saveUser(userData);
    setUser(userData);
    window.location.href = "/";
  };

  const handleLogout = () => {
    clearUser();
    setUser(null);
    window.location.href = "/onboarding";
  };

  return (
    <Routes>
      <Route
        path="/onboarding/*"
        element={<Onboarding onDone={handleOnboardingDone} />}
      />
      <Route
        path="/*"
        element={
          user
            ? <Feed user={user} onLogout={handleLogout} />
            : <Navigate to="/onboarding" replace />
        }
      />
    </Routes>
  );
}
