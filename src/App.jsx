import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Onboarding from "./pages/Onboarding.jsx";
import Feed       from "./pages/Feed.jsx";

// Lokaler State-Speicher (wird später durch Supabase Auth ersetzt)
const STORAGE_KEY = "hausaufgaben_user";

function loadUser() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
  catch { return null; }
}
export function saveUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}
export function clearUser() {
  localStorage.removeItem(STORAGE_KEY);
}

export default function App() {
  const [user, setUser] = useState(loadUser);

  const handleOnboardingDone = (userData) => {
    saveUser(userData);
    setUser(userData);
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
            ? <Feed user={user} onLogout={() => { clearUser(); setUser(null); }} />
            : <Navigate to="/onboarding" replace />
        }
      />
    </Routes>
  );
}
