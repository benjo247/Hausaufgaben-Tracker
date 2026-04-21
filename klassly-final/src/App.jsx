import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { authClient, getCurrentUser } from "./lib/auth.js";
import Login   from "./pages/Login.jsx";
import Join    from "./pages/Join.jsx";
import Feed    from "./pages/Feed.jsx";

export default function App() {
  const [user, setUser]         = useState(undefined); // undefined = lädt noch
  const [membership, setMember] = useState(() => {
    try { return JSON.parse(localStorage.getItem("membership")); }
    catch { return null; }
  });

  // Session beim Start laden
  useEffect(() => {
    getCurrentUser().then(u => setUser(u || null));

    // Auf Session-Änderungen hören (z.B. nach OAuth Redirect)
    authClient.getSession().then(({ data }) => {
      if (data?.user) setUser(data.user);
      else setUser(null);
    });
  }, []);

  const handleJoined = (result) => {
    localStorage.setItem("membership", JSON.stringify(result));
    setMember(result);
  };

  const handleLogout = async () => {
    const { signOut } = await import("./lib/auth.js");
    await signOut();
    localStorage.removeItem("membership");
    setMember(null);
    setUser(null);
    window.location.href = "/login";
  };

  // Ladeanimation
  if (user === undefined) return (
    <div style={{minHeight:"100dvh", display:"flex", alignItems:"center",
      justifyContent:"center", background:"#F5F7FA"}}>
      <div style={{width:36, height:36, borderRadius:"50%",
        border:"3px solid #E8EDF2", borderTopColor:"#45B7D1",
        animation:"spin 0.7s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <Routes>
      {/* OAuth Callback */}
      <Route path="/auth/callback" element={<AuthCallback onUser={setUser}/>}/>

      {/* Login */}
      <Route path="/login" element={
        user ? <Navigate to="/" replace/> : <Login/>
      }/>

      {/* Gruppe beitreten */}
      <Route path="/join" element={
        !user         ? <Navigate to="/login" replace/> :
        membership    ? <Navigate to="/" replace/>      :
        <Join user={user} onJoined={handleJoined}/>
      }/>

      {/* Feed */}
      <Route path="/*" element={
        !user      ? <Navigate to="/login" replace/> :
        !membership? <Navigate to="/join"  replace/> :
        <Feed user={user} membership={membership} onLogout={handleLogout}/>
      }/>
    </Routes>
  );
}

// Wird nach Magic Link / OAuth aufgerufen
function AuthCallback({ onUser }) {
  useEffect(() => {
    getCurrentUser().then(u => {
      if (u) { onUser(u); window.location.href = "/"; }
      else window.location.href = "/login";
    });
  }, []);

  return (
    <div style={{minHeight:"100dvh", display:"flex", alignItems:"center",
      justifyContent:"center", background:"#F5F7FA"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:36, height:36, borderRadius:"50%",
          margin:"0 auto 14px", border:"3px solid #E8EDF2",
          borderTopColor:"#45B7D1", animation:"spin 0.7s linear infinite"}}/>
        <div style={{fontFamily:"Nunito", fontSize:14, color:"#94A3B8"}}>
          Einloggen…
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}
