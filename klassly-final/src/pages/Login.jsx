import { useState, useEffect } from "react";
import { authClient, signUpWithEmail, signInWithEmail, signInWithGoogle } from "../lib/auth.js";

const T = {
  teal:"#45B7D1", mint:"#4ECDC4", coral:"#FF6B6B",
  white:"#FFFFFF", border:"#E8EDF2", text:"#2D3748", muted:"#94A3B8",
  light:"#F5F7FA",
};
const grad = `linear-gradient(135deg,${T.teal},${T.mint})`;

export default function Login() {
  const [mode, setMode]       = useState("signin"); // "signin" | "signup"
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async () => {
    if (!email || !password) { setError("Bitte E-Mail und Passwort eingeben."); return; }
    if (mode === "signup" && password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen lang sein."); return;
    }
    setLoading(true); setError("");
    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
      // App.jsx erkennt den neuen Session-State automatisch
      window.location.href = "/";
    } catch (e) {
      setError(e.message || "Fehler. Bitte nochmal versuchen.");
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true); setError("");
    try {
      await signInWithGoogle();
      // Redirect passiert automatisch durch OAuth
    } catch (e) {
      setError("Google Login fehlgeschlagen.");
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:"100dvh", background:T.light,
      display:"flex", justifyContent:"center", alignItems:"center", padding:20}}>
      <div style={{width:"100%", maxWidth:400}}>

        {/* Logo */}
        <div style={{textAlign:"center", marginBottom:36}}>
          <div style={{width:76, height:76, borderRadius:22, background:grad,
            margin:"0 auto 14px", display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:38,
            boxShadow:"0 8px 32px rgba(69,183,209,0.35)"}}>📚</div>
          <div style={{fontFamily:"Caveat", fontSize:30, fontWeight:700, color:T.text}}>
            Hausaufgaben
          </div>
          <div style={{fontFamily:"Nunito", fontSize:13, color:T.muted, marginTop:4}}>
            Eltern organisieren sich selbst.
          </div>
        </div>

        <div style={{background:T.white, borderRadius:24, padding:28,
          boxShadow:"0 4px 24px rgba(0,0,0,0.08)"}}>

          {/* Tab-Switcher */}
          <div style={{display:"flex", background:T.light, borderRadius:12,
            padding:4, marginBottom:24}}>
            {["signin","signup"].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setError("");}} style={{
                flex:1, padding:"9px", borderRadius:10, border:"none",
                background:mode===m?T.white:"transparent",
                fontFamily:"Nunito", fontSize:14, fontWeight:700,
                color:mode===m?T.text:T.muted, cursor:"pointer",
                boxShadow:mode===m?"0 1px 6px rgba(0,0,0,0.08)":"none",
                transition:"all 0.2s"
              }}>
                {m==="signin"?"Anmelden":"Registrieren"}
              </button>
            ))}
          </div>

          {/* Fehlermeldung */}
          {error && (
            <div style={{padding:"10px 14px", background:"#FFF0F0",
              borderRadius:10, border:`1.5px solid ${T.coral}30`,
              fontFamily:"Nunito", fontSize:13, color:T.coral,
              marginBottom:14}}>{error}</div>
          )}

          {/* Name (nur bei Registrierung) */}
          {mode==="signup" && (
            <div style={{marginBottom:10}}>
              <input value={name} onChange={e=>setName(e.target.value)}
                placeholder="Dein Name (z.B. Mama Lena)"
                style={{width:"100%", padding:"13px 14px", borderRadius:12,
                  border:`2px solid ${T.border}`, fontFamily:"Nunito",
                  fontSize:14, fontWeight:600, outline:"none",
                  color:T.text, background:"#FAFBFC",
                  transition:"border-color 0.2s", boxSizing:"border-box"}}
                onFocus={e=>e.target.style.borderColor=T.teal}
                onBlur={e=>e.target.style.borderColor=T.border}/>
            </div>
          )}

          {/* E-Mail */}
          <div style={{marginBottom:10}}>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="deine@email.de"
              onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
              style={{width:"100%", padding:"13px 14px", borderRadius:12,
                border:`2px solid ${T.border}`, fontFamily:"Nunito",
                fontSize:14, fontWeight:600, outline:"none",
                color:T.text, background:"#FAFBFC", boxSizing:"border-box"}}
              onFocus={e=>e.target.style.borderColor=T.teal}
              onBlur={e=>e.target.style.borderColor=T.border}/>
          </div>

          {/* Passwort */}
          <div style={{marginBottom:20}}>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
              placeholder={mode==="signup"?"Passwort (mind. 8 Zeichen)":"Passwort"}
              onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
              style={{width:"100%", padding:"13px 14px", borderRadius:12,
                border:`2px solid ${T.border}`, fontFamily:"Nunito",
                fontSize:14, fontWeight:600, outline:"none",
                color:T.text, background:"#FAFBFC", boxSizing:"border-box"}}
              onFocus={e=>e.target.style.borderColor=T.teal}
              onBlur={e=>e.target.style.borderColor=T.border}/>
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} style={{
            width:"100%", padding:"14px", borderRadius:14, border:"none",
            background:loading?"#E2E8F0":grad,
            color:loading?T.muted:"#fff",
            fontFamily:"Nunito", fontSize:15, fontWeight:800,
            cursor:loading?"not-allowed":"pointer",
            boxShadow:loading?"none":"0 6px 20px rgba(69,183,209,0.3)",
            marginBottom:16, transition:"all 0.2s"
          }}>
            {loading?"Bitte warten…":mode==="signin"?"Anmelden →":"Konto erstellen →"}
          </button>

          {/* Trennlinie */}
          <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:14}}>
            <div style={{flex:1, height:1, background:T.border}}/>
            <span style={{fontFamily:"Nunito", fontSize:12, color:T.muted}}>oder</span>
            <div style={{flex:1, height:1, background:T.border}}/>
          </div>

          {/* Google */}
          <button onClick={handleGoogle} disabled={loading} style={{
            width:"100%", padding:"13px", borderRadius:14,
            border:`2px solid ${T.border}`, background:T.white,
            display:"flex", alignItems:"center", justifyContent:"center", gap:10,
            fontFamily:"Nunito", fontSize:14, fontWeight:700, color:T.text,
            cursor:"pointer", transition:"all 0.2s"
          }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
              <path fill="#34A853" d="M6.3 14.7l7 5.1C15.2 17.6 19.4 15 24 15c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2c-7.6 0-14.2 4.3-17.7 10.7z" transform="translate(0,2)"/>
              <path fill="#FBBC05" d="M24 46c5.5 0 10.5-1.9 14.3-5l-6.6-5.4C29.7 37.4 27 38.2 24 38.2c-5.7 0-10.6-3.9-12.3-9.1l-7 5.4C8.2 41.8 15.5 46 24 46z"/>
              <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.8 2.4-2.3 4.4-4.3 5.7l6.6 5.4c4-3.7 6.3-9.2 6.3-15.6 0-1.3-.2-2.7-.5-4z" transform="translate(-.5,0)"/>
            </svg>
            Mit Google anmelden
          </button>

          <p style={{fontFamily:"Nunito", fontSize:11, color:T.muted,
            textAlign:"center", marginTop:16, lineHeight:1.5}}>
            Deine Daten sind sicher. Kein Spam, kein Weitergeben.
          </p>
        </div>
      </div>
    </div>
  );
}
