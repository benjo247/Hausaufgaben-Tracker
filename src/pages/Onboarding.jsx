import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchSchools, insertManualSchool } from "../lib/api.js";
import { getKursFaecher, getKlassen, SCHULARTEN_MAP, BUNDESLAENDER, SCHULART_EMOJI } from "../lib/schoolLogic.js";

const T = {
  teal:"#45B7D1", mint:"#4ECDC4", coral:"#FF6B6B",
  dark:"#1A1A2E", mid:"#4A5568", light:"#F5F7FA",
  white:"#FFFFFF", border:"#E8EDF2", text:"#2D3748", muted:"#94A3B8",
};
const grad = `linear-gradient(135deg,${T.teal},${T.mint})`;

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Btn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%", padding:"15px", borderRadius:16, border:"none",
      fontFamily:"Nunito", fontSize:16, fontWeight:800,
      cursor:disabled?"not-allowed":"pointer",
      background:disabled?"#E2E8F0":grad,
      color:disabled?T.muted:"#fff",
      boxShadow:disabled?"none":"0 6px 20px rgba(69,183,209,0.3)",
      transition:"all 0.18s ease",
    }}>
      {children}
    </button>
  );
}

function Dots({ step, total }) {
  return (
    <div style={{display:"flex", gap:6, justifyContent:"center", marginBottom:28}}>
      {Array.from({length:total}).map((_,i) => (
        <div key={i} style={{
          width:i===step?24:8, height:8, borderRadius:4,
          background:i===step?T.teal:i<step?T.mint+"90":T.border,
          transition:"all 0.3s ease"
        }}/>
      ))}
    </div>
  );
}

// ─── Screen 0: Einladung ─────────────────────────────────────────────────────
function ScreenInvite({ onNext }) {
  return (
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <div style={{background:grad, borderRadius:28, padding:"40px 24px 36px",
        textAlign:"center", marginBottom:20, boxShadow:"0 12px 40px rgba(69,183,209,0.3)"}}>
        <div style={{fontSize:60, marginBottom:14}}>📚</div>
        <div style={{fontFamily:"Caveat", fontSize:34, color:"#fff", fontWeight:700}}>
          Du wurdest eingeladen
        </div>
        <div style={{fontFamily:"Nunito", fontSize:14, color:"rgba(255,255,255,0.8)", marginTop:8}}>
          Grundschule am Park · Klasse 4b
        </div>
      </div>
      <div style={{padding:"12px 14px", background:"#F0FFF4", borderRadius:14,
        border:"1.5px solid #4ECDC430", marginBottom:20,
        fontFamily:"Nunito", fontSize:12, color:"#2D6A4F", lineHeight:1.5}}>
        🔒 <strong>Geschlossene Gruppe.</strong> Nur Personen mit diesem Link können beitreten.
      </div>
      <Btn onClick={onNext}>Jetzt beitreten →</Btn>
      <p style={{textAlign:"center", fontFamily:"Nunito", fontSize:12, color:T.muted, marginTop:10}}>
        Kein Account · Kein Passwort · Kostenlos
      </p>
    </div>
  );
}

// ─── Screen 1: Name ───────────────────────────────────────────────────────────
function ScreenName({ onNext }) {
  const [role, setRole] = useState("Mama");
  const [name, setName] = useState("");
  const ROLES = ["Mama","Papa","Oma","Opa","Erz.berechtigte:r"];
  const preview = name.trim() ? `${role} ${name.trim()}` : null;
  const initials = preview ? preview.split(" ").map(w=>w[0]).join("").slice(0,2) : "?";
  const colors = [T.coral,T.teal,T.mint,"#DDA0DD","#FFB347"];
  const bg = colors[initials.charCodeAt(0)%colors.length];

  return (
    <div style={{animation:"fadeUp 0.35s ease"}}>
      <Dots step={0} total={4}/>
      <div style={{textAlign:"center", marginBottom:24}}>
        <div style={{fontFamily:"Caveat", fontSize:30, fontWeight:700, color:T.text}}>Wie heißt du?</div>
        <div style={{fontFamily:"Nunito", fontSize:13, color:T.muted, marginTop:4}}>
          Kein Nachname nötig.
        </div>
      </div>
      <div style={{display:"flex", justifyContent:"center", marginBottom:24}}>
        <div style={{width:76,height:76,borderRadius:"50%",background:bg,
          color:"#fff",fontFamily:"Nunito",fontWeight:800,fontSize:28,
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:"0 2px 10px rgba(0,0,0,0.15)"}}>
          {initials}
        </div>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center",marginBottom:16}}>
        {ROLES.map(r=>(
          <button key={r} onClick={()=>setRole(r)} style={{
            padding:"8px 14px",borderRadius:20,
            border:`2px solid ${role===r?T.teal:T.border}`,
            background:role===r?T.teal:T.white,
            color:role===r?"#fff":T.mid,
            fontFamily:"Nunito",fontSize:12,fontWeight:700,cursor:"pointer"}}>
            {r}
          </button>
        ))}
      </div>
      <input value={name} onChange={e=>setName(e.target.value)}
        placeholder="Dein Vorname…" maxLength={20}
        style={{width:"100%",padding:"14px 16px",borderRadius:14,
          border:`2px solid ${T.border}`,fontFamily:"Nunito",fontSize:15,
          fontWeight:600,outline:"none",background:"#FAFBFC",color:T.text,marginBottom:16}}/>
      {preview && (
        <div style={{padding:"10px 14px",background:T.light,borderRadius:12,
          fontFamily:"Nunito",fontSize:13,color:T.muted,marginBottom:16}}>
          Im Feed: <strong style={{color:T.text}}>{preview}</strong>
        </div>
      )}
      <Btn onClick={()=>onNext(preview)} disabled={!name.trim()}>Weiter →</Btn>
    </div>
  );
}

// ─── Screen 2: Schule (progressiv) ───────────────────────────────────────────
function ScreenSchule({ onNext }) {
  const [query, setQuery]   = useState("");
  const [results, setRes]   = useState([]);
  const [loading, setLoad]  = useState(false);
  const [school, setSchool] = useState(null);
  const [klasse, setKlasse] = useState(null);
  const [manual, setManual] = useState(false);
  const [manName, setManName] = useState("");
  const [manLand, setManLand] = useState("");
  const [manArt, setManArt]   = useState("");
  const [timer, setTimer]   = useState(null);

  const search = (q) => {
    setQuery(q);
    clearTimeout(timer);
    if(q.length<2){setRes([]);setLoad(false);return;}
    setLoad(true);
    setTimer(setTimeout(async()=>{
      const r = await searchSchools(q);
      setRes(r); setLoad(false);
    }, 350));
  };

  const klassen = school ? getKlassen(school.school_type, school.state) : [];
  const kursF   = school && klasse ? getKursFaecher(school.school_type, school.state, klasse) : [];
  const schularten = SCHULARTEN_MAP[manLand] || SCHULARTEN_MAP.default;

  const handleManualConfirm = async () => {
    const s = await insertManualSchool({
      name:manName.trim(), state:manLand, school_type:manArt, city:"", zip:""
    });
    setSchool(s); setManual(false);
  };

  const canContinue = school && klasse;

  return (
    <div style={{animation:"fadeUp 0.35s ease"}}>
      <Dots step={1} total={4}/>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontFamily:"Caveat",fontSize:30,fontWeight:700,color:T.text}}>Eure Schule</div>
        <div style={{fontFamily:"Nunito",fontSize:13,color:T.muted,marginTop:4}}>
          Such nach Name, Stadt oder PLZ.
        </div>
      </div>

      {/* Suchfeld */}
      {!school && !manual && (
        <div style={{position:"relative",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10,
            border:`2px solid ${T.border}`,borderRadius:14,padding:"12px 14px",background:T.white}}>
            <span>🔍</span>
            <input value={query} onChange={e=>search(e.target.value)}
              placeholder="z.B. Gesamtschule Kassel…"
              style={{flex:1,border:"none",outline:"none",fontFamily:"Nunito",
                fontSize:14,fontWeight:600,color:T.text,background:"transparent"}}/>
            {loading && <div style={{width:18,height:18,borderRadius:"50%",
              border:`2px solid ${T.border}`,borderTopColor:T.teal,
              animation:"spin 0.7s linear infinite"}}/>}
          </div>
          {query.length>=2 && (
            <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,
              background:T.white,borderRadius:16,zIndex:200,overflow:"hidden",
              boxShadow:"0 8px 32px rgba(0,0,0,0.14)",border:`1.5px solid ${T.border}`}}>
              <div style={{padding:"5px 14px",background:"#F0F8FF",
                borderBottom:`1px solid ${T.border}`,fontFamily:"Nunito",
                fontSize:10,color:T.muted}}>
                🔌 jedeschule.codefor.de · alle Bundesländer
              </div>
              {!loading && results.length===0 ? (
                <div style={{padding:"16px",textAlign:"center"}}>
                  <div style={{fontFamily:"Nunito",fontSize:13,color:T.muted,marginBottom:12}}>
                    Keine Schule gefunden.
                  </div>
                  <button onClick={()=>setManual(true)} style={{
                    background:T.light,border:`1.5px solid ${T.border}`,
                    borderRadius:12,padding:"8px 16px",cursor:"pointer",
                    fontFamily:"Nunito",fontSize:13,fontWeight:700,color:T.mid}}>
                    ✏️ Manuell eingeben
                  </button>
                </div>
              ) : results.map((s,i)=>(
                <button key={s.id} onClick={()=>{setSchool(s);setRes([]);setQuery("");}} style={{
                  width:"100%",padding:"12px 14px",background:"none",border:"none",
                  cursor:"pointer",textAlign:"left",display:"flex",gap:10,
                  borderBottom:i<results.length-1?`1px solid ${T.border}`:"none"}}>
                  <span style={{fontSize:20,flexShrink:0}}>{SCHULART_EMOJI[s.school_type]||"🏫"}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"Nunito",fontWeight:800,fontSize:13,color:T.text,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</div>
                    <div style={{fontFamily:"Nunito",fontSize:11,color:T.muted}}>
                      {s.zip} {s.city} · {s.state} · {s.school_type}
                    </div>
                  </div>
                </button>
              ))}
              {results.length>0 && (
                <button onClick={()=>setManual(true)} style={{
                  width:"100%",padding:"10px 14px",background:"#FAFBFC",border:"none",
                  borderTop:`1px solid ${T.border}`,cursor:"pointer",
                  fontFamily:"Nunito",fontSize:12,fontWeight:700,color:T.muted}}>
                  ✏️ Nicht dabei? Manuell eingeben
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Manuelle Eingabe */}
      {manual && (
        <div style={{background:T.white,borderRadius:20,padding:20,
          boxShadow:"0 3px 16px rgba(0,0,0,0.07)",marginBottom:12,animation:"reveal 0.3s ease"}}>
          <button onClick={()=>setManual(false)} style={{background:"none",border:"none",
            cursor:"pointer",fontFamily:"Nunito",fontSize:13,fontWeight:700,
            color:T.muted,padding:"0 0 12px 0"}}>← Zurück zur Suche</button>
          <input value={manName} onChange={e=>setManName(e.target.value)}
            placeholder="Schulname…"
            style={{width:"100%",padding:"12px 14px",borderRadius:12,
              border:`2px solid ${T.border}`,fontFamily:"Nunito",fontSize:14,
              fontWeight:600,outline:"none",marginBottom:10}}/>
          <select value={manLand} onChange={e=>{setManLand(e.target.value);setManArt("");}}
            style={{width:"100%",padding:"12px 14px",borderRadius:12,
              border:`2px solid ${T.border}`,fontFamily:"Nunito",fontSize:14,
              background:T.white,outline:"none",marginBottom:10}}>
            <option value="">Bundesland…</option>
            {BUNDESLAENDER.map(l=><option key={l} value={l}>{l}</option>)}
          </select>
          {manLand && (
            <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:14}}>
              {schularten.map(s=>(
                <button key={s} onClick={()=>setManArt(s)} style={{
                  padding:"7px 13px",borderRadius:20,
                  border:`2px solid ${manArt===s?T.teal:T.border}`,
                  background:manArt===s?T.teal:T.white,
                  color:manArt===s?"#fff":T.mid,
                  fontFamily:"Nunito",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  {s}
                </button>
              ))}
            </div>
          )}
          <Btn onClick={handleManualConfirm}
            disabled={!manName.trim()||!manLand||!manArt}>
            Schule speichern →
          </Btn>
        </div>
      )}

      {/* Gewählte Schule */}
      {school && (
        <div style={{background:"#F0FFFE",borderRadius:16,padding:"12px 14px",
          border:`1.5px solid ${T.mint}40`,display:"flex",gap:10,
          alignItems:"center",marginBottom:12,animation:"fadeIn 0.3s ease"}}>
          <span style={{fontSize:22}}>{SCHULART_EMOJI[school.school_type]||"🏫"}</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"Nunito",fontWeight:800,fontSize:13,color:T.text,
              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {school.name}
              {school.source==="manual"&&<span style={{marginLeft:6,background:"#FFF8F0",
                color:"#FFB347",borderRadius:10,padding:"1px 7px",fontSize:10,fontWeight:800}}>
                manuell</span>}
            </div>
            <div style={{fontFamily:"Nunito",fontSize:11,color:T.muted}}>
              {school.state} · {school.school_type}
            </div>
          </div>
          <button onClick={()=>{setSchool(null);setKlasse(null);}} style={{
            background:"#FFF0F0",border:"none",borderRadius:"50%",width:26,height:26,
            cursor:"pointer",color:T.coral,fontSize:14}}>×</button>
        </div>
      )}

      {/* Klassen-Picker */}
      {school && (
        <div style={{background:T.white,borderRadius:20,padding:20,
          boxShadow:"0 3px 16px rgba(0,0,0,0.07)",marginBottom:12,animation:"reveal 0.3s ease"}}>
          <div style={{fontFamily:"Nunito",fontSize:11,fontWeight:700,
            color:T.muted,letterSpacing:"0.07em",marginBottom:12}}>KLASSE</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {klassen.map(k=>(
              <button key={k} onClick={()=>setKlasse(k)} style={{
                width:48,height:48,borderRadius:14,border:"none",
                background:klasse===k?T.dark:"#F0F4F8",
                color:klasse===k?"#fff":T.mid,
                fontFamily:"Nunito",fontWeight:800,fontSize:16,
                cursor:"pointer",transition:"all 0.15s ease",
                boxShadow:klasse===k?"0 4px 14px rgba(26,26,46,0.25)":"none"}}>
                {k}
              </button>
            ))}
          </div>
          {klasse>7 && (
            <div style={{marginTop:10,padding:"9px 12px",background:"#FFFBEB",
              borderRadius:12,fontFamily:"Nunito",fontSize:12,color:"#92400E"}}>
              💡 Am besten bis Klasse 7 – du kannst aber trotzdem mitmachen.
            </div>
          )}
        </div>
      )}

      <Btn onClick={()=>onNext({school, klasse, kursF})} disabled={!canContinue}>
        {canContinue?"Weiter →":school?"Klasse wählen":"Schule suchen"}
      </Btn>
    </div>
  );
}

// ─── Screen 3: Datenschutz ────────────────────────────────────────────────────
function ScreenDatenschutz({ onNext }) {
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);

  const Toggle = ({checked, onToggle, children}) => (
    <div onClick={onToggle} style={{display:"flex",gap:14,padding:"16px",marginBottom:10,
      background:checked?"#F0FFFE":T.white,borderRadius:18,cursor:"pointer",
      border:`2px solid ${checked?T.mint:T.border}`,transition:"all 0.2s ease"}}>
      <div style={{flex:1,fontFamily:"Nunito",fontSize:13,color:T.text,
        fontWeight:600,lineHeight:1.55}}>{children}</div>
      <div style={{width:28,height:28,borderRadius:8,flexShrink:0,
        background:checked?grad:"#F0F4F8",
        border:`2px solid ${checked?"transparent":T.border}`,
        display:"flex",alignItems:"center",justifyContent:"center",
        transition:"all 0.2s ease"}}>
        {checked && <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7l4 4 6-6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>}
      </div>
    </div>
  );

  return (
    <div style={{animation:"fadeUp 0.35s ease"}}>
      <Dots step={2} total={4}/>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontFamily:"Caveat",fontSize:30,fontWeight:700,color:T.text}}>Kurz & wichtig</div>
        <div style={{fontFamily:"Nunito",fontSize:13,color:T.muted,marginTop:4}}>
          Damit alle sicher mitmachen können.
        </div>
      </div>
      <Toggle checked={a} onToggle={()=>setA(v=>!v)}>
        🔒 <strong>Datenschutz:</strong> Ich trage keine Kindernamen oder persönliche Daten ein – nur Hausaufgaben-Informationen.
      </Toggle>
      <Toggle checked={b} onToggle={()=>setB(v=>!v)}>
        🤝 <strong>Gemeinschaftsregeln:</strong> Nur Aufgaben eintragen, die ich selbst kenne. Kommentare sachlich und freundlich.
      </Toggle>
      <div style={{padding:"12px 14px",background:"#F8F0FF",borderRadius:14,
        border:"1.5px solid #DDA0DD30",fontFamily:"Nunito",fontSize:11,
        color:"#6B21A8",marginTop:4,marginBottom:20,lineHeight:1.6}}>
        🛡️ Max. 5 Einträge pro Tag. Admin kann Einträge löschen und Mitglieder entfernen.
      </div>
      <Btn onClick={onNext} disabled={!(a&&b)}>
        {a&&b?"Zustimmen & loslegen ✓":"Bitte beide Punkte bestätigen"}
      </Btn>
    </div>
  );
}

// ─── Willkommen ───────────────────────────────────────────────────────────────
function ScreenWelcome({ displayName, schule, onDone }) {
  const vorname = displayName?.split(" ")[1] || displayName;
  return (
    <div style={{textAlign:"center",animation:"fadeIn 0.4s ease"}}>
      <div style={{width:96,height:96,borderRadius:"50%",background:grad,
        margin:"0 auto 24px",display:"flex",alignItems:"center",justifyContent:"center",
        boxShadow:"0 12px 40px rgba(69,183,209,0.4)",animation:"pop 0.5s ease"}}>
        <span style={{fontSize:44}}>🎉</span>
      </div>
      <div style={{fontFamily:"Caveat",fontSize:34,fontWeight:700,color:T.text,marginBottom:8}}>
        Willkommen, {vorname}!
      </div>
      <div style={{fontFamily:"Nunito",fontSize:14,color:T.muted,marginBottom:32,lineHeight:1.6}}>
        Du bist jetzt dabei.<br/>
        <strong style={{color:T.text}}>{schule?.school?.name}</strong>
        {schule?.klasse && <> · Klasse {schule.klasse}</>}
      </div>
      <Btn onClick={onDone}>Feed öffnen →</Btn>
    </div>
  );
}

// ─── Onboarding Root ──────────────────────────────────────────────────────────
export default function Onboarding({ onDone }) {
  const [step, setStep]       = useState(0);
  const [displayName, setName] = useState("");
  const [schule, setSchule]   = useState(null);

  const handleName   = (n) => { setName(n); setStep(2); };
  const handleSchule = (s) => { setSchule(s); setStep(3); };
  const handleDaten  = ()  => { setStep(4); };
  const handleDone   = ()  => {
    onDone({ displayName, schule, joinedAt: new Date().toISOString() });
  };

  const screens = [
    <ScreenInvite    onNext={()=>setStep(1)} />,
    <ScreenName      onNext={handleName} />,
    <ScreenSchule    onNext={handleSchule} />,
    <ScreenDatenschutz onNext={handleDaten} />,
    <ScreenWelcome   displayName={displayName} schule={schule} onDone={handleDone} />,
  ];

  return (
    <div style={{minHeight:"100dvh",background:T.light,display:"flex",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:420,padding:"20px 20px 48px"}}>
        {step>0 && step<4 && (
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"center",padding:"0 0 16px"}}>
            <button onClick={()=>setStep(s=>s-1)} style={{background:"none",border:"none",
              cursor:"pointer",fontFamily:"Nunito",fontSize:13,fontWeight:700,
              color:T.muted,padding:0}}>← Zurück</button>
            <span style={{fontFamily:"Nunito",fontSize:12,color:T.muted}}>
              Schritt {step} von 4
            </span>
          </div>
        )}
        {screens[step]}
      </div>
    </div>
  );
}
