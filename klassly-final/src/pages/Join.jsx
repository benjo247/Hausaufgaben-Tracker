import { useState, useEffect, useRef } from "react";
import { searchSchools } from "../lib/db.js";
import { getGroupsBySchool, joinOrCreateGroup } from "../lib/db.js";
import { getKursFaecher, getKlassen, SCHULART_EMOJI } from "../lib/schoolLogic.js";

const T = {
  teal:"#45B7D1", mint:"#4ECDC4", coral:"#FF6B6B",
  dark:"#1A1A2E", mid:"#4A5568", light:"#F5F7FA",
  white:"#FFFFFF", border:"#E8EDF2", text:"#2D3748", muted:"#94A3B8",
};
const grad = `linear-gradient(135deg,${T.teal},${T.mint})`;

const KINDER_COLORS = [
  { color:"#FF6B6B", bg:"#FFF0F0" },
  { color:"#45B7D1", bg:"#F0F8FF" },
  { color:"#4ECDC4", bg:"#F0FFFE" },
  { color:"#DDA0DD", bg:"#FFF0FF" },
];
const KINDER_EMOJIS = ["🦋","⚽","🌟","🎸","🦊","🚀","🌈","🎨"];

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
    }}>{children}</button>
  );
}

// ─── Step 1: Name ─────────────────────────────────────────────
function StepName({ onNext }) {
  const [role, setRole]     = useState("Mama");
  const [name, setName]     = useState("");
  const ROLES = ["Mama","Papa","Oma","Opa","Erz.berechtigte:r"];
  const preview = name.trim() ? `${role} ${name.trim()}` : null;

  return (
    <div>
      <div style={{textAlign:"center", marginBottom:24}}>
        <div style={{fontFamily:"Caveat", fontSize:30, fontWeight:700, color:T.text}}>
          Wie heißt du?
        </div>
        <div style={{fontFamily:"Nunito", fontSize:13, color:T.muted, marginTop:4}}>
          Kein Nachname nötig.
        </div>
      </div>
      <div style={{display:"flex", gap:6, flexWrap:"wrap",
        justifyContent:"center", marginBottom:16}}>
        {ROLES.map(r=>(
          <button key={r} onClick={()=>setRole(r)} style={{
            padding:"8px 14px", borderRadius:20,
            border:`2px solid ${role===r?T.teal:T.border}`,
            background:role===r?T.teal:T.white,
            color:role===r?"#fff":T.mid,
            fontFamily:"Nunito", fontSize:12, fontWeight:700, cursor:"pointer"
          }}>{r}</button>
        ))}
      </div>
      <input value={name} onChange={e=>setName(e.target.value)}
        placeholder="Dein Vorname…" maxLength={20}
        style={{width:"100%", padding:"14px 16px", borderRadius:14,
          border:`2px solid ${T.border}`, fontFamily:"Nunito", fontSize:15,
          fontWeight:600, outline:"none", background:"#FAFBFC",
          color:T.text, marginBottom:preview?12:20}}/>
      {preview && (
        <div style={{padding:"10px 14px", background:T.light, borderRadius:12,
          fontFamily:"Nunito", fontSize:13, color:T.muted, marginBottom:16}}>
          Im Feed sichtbar als: <strong style={{color:T.text}}>{preview}</strong>
        </div>
      )}
      <Btn onClick={()=>onNext(preview)} disabled={!name.trim()}>Weiter →</Btn>
    </div>
  );
}

// ─── Step 2: Schule suchen ────────────────────────────────────
function StepSchool({ onNext }) {
  const [query, setQuery]   = useState("");
  const [results, setRes]   = useState([]);
  const [loading, setLoad]  = useState(false);
  const [school, setSchool] = useState(null);
  const timer               = useRef(null);

  const search = (q) => {
    setQuery(q);
    clearTimeout(timer.current);
    if(q.length<2){setRes([]);setLoad(false);return;}
    setLoad(true);
    timer.current=setTimeout(async()=>{
      const r = await searchSchools(q);
      setRes(r); setLoad(false);
    },350);
  };

  return (
    <div>
      <div style={{textAlign:"center", marginBottom:24}}>
        <div style={{fontFamily:"Caveat", fontSize:30, fontWeight:700, color:T.text}}>
          Eure Schule
        </div>
        <div style={{fontFamily:"Nunito", fontSize:13, color:T.muted, marginTop:4}}>
          Such nach Name, Stadt oder PLZ.
        </div>
      </div>

      {!school ? (
        <div style={{position:"relative", marginBottom:12}}>
          <div style={{display:"flex", alignItems:"center", gap:10,
            border:`2px solid ${T.border}`, borderRadius:14,
            padding:"12px 14px", background:T.white}}>
            <span>🔍</span>
            <input value={query} onChange={e=>search(e.target.value)}
              placeholder="z.B. Gesamtschule Frankfurt…"
              autoFocus
              style={{flex:1, border:"none", outline:"none",
                fontFamily:"Nunito", fontSize:14, fontWeight:600,
                color:T.text, background:"transparent"}}/>
            {loading&&<div style={{width:18,height:18,borderRadius:"50%",
              border:`2px solid ${T.border}`,borderTopColor:T.teal,
              animation:"spin 0.7s linear infinite"}}/>}
          </div>
          {query.length>=2&&(
            <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,
              background:T.white,borderRadius:16,zIndex:200,overflow:"hidden",
              boxShadow:"0 8px 32px rgba(0,0,0,0.14)",border:`1.5px solid ${T.border}`}}>
              <div style={{padding:"5px 14px",background:"#F0F8FF",
                borderBottom:`1px solid ${T.border}`,fontFamily:"Nunito",
                fontSize:10,color:T.muted}}>
                🔌 jedeschule.codefor.de · ~33.000 Schulen
              </div>
              {!loading&&results.length===0?(
                <div style={{padding:"16px",textAlign:"center",
                  fontFamily:"Nunito",fontSize:13,color:T.muted}}>
                  Keine Schule gefunden – probiere einen anderen Begriff.
                </div>
              ):results.map((s,i)=>(
                <button key={s.id} onClick={()=>setSchool(s)} style={{
                  width:"100%",padding:"12px 14px",background:"none",
                  border:"none",cursor:"pointer",textAlign:"left",
                  display:"flex",gap:10,alignItems:"flex-start",
                  borderBottom:i<results.length-1?`1px solid ${T.border}`:"none",
                  transition:"background 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.light}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <span style={{fontSize:22,flexShrink:0}}>
                    {SCHULART_EMOJI[s.school_type]||"🏫"}
                  </span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"Nunito",fontWeight:800,fontSize:13,
                      color:T.text,overflow:"hidden",textOverflow:"ellipsis",
                      whiteSpace:"nowrap"}}>{s.name}</div>
                    <div style={{fontFamily:"Nunito",fontSize:11,color:T.muted}}>
                      {s.zip} {s.city} · {s.state} · {s.school_type}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{background:"#F0FFFE",borderRadius:16,padding:"14px",
          border:`1.5px solid ${T.mint}40`,marginBottom:16,
          display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontSize:24}}>{SCHULART_EMOJI[school.school_type]||"🏫"}</span>
          <div style={{flex:1}}>
            <div style={{fontFamily:"Nunito",fontWeight:800,fontSize:14,color:T.text}}>
              {school.name}
            </div>
            <div style={{fontFamily:"Nunito",fontSize:11,color:T.muted}}>
              {school.city} · {school.state}
            </div>
          </div>
          <button onClick={()=>setSchool(null)} style={{
            background:"#FFF0F0",border:"none",borderRadius:"50%",
            width:28,height:28,cursor:"pointer",color:T.coral,fontSize:14}}>×</button>
        </div>
      )}

      <Btn onClick={()=>onNext(school)} disabled={!school}>Weiter →</Btn>
    </div>
  );
}

// ─── Step 3: Klasse wählen ────────────────────────────────────
function StepClass({ school, onNext }) {
  const [groups, setGroups]   = useState([]);
  const [grade, setGrade]     = useState(null);
  const [section, setSection] = useState("");
  const [loading, setLoading] = useState(true);

  const klassen = getKlassen(school.school_type, school.state);

  useEffect(()=>{
    getGroupsBySchool(school.id).then(g=>{
      setGroups(g); setLoading(false);
    }).catch(()=>setLoading(false));
  },[school.id]);

  const existingGroup = groups.find(g=>
    g.grade===grade && (g.section||"").toLowerCase()===(section||"").toLowerCase()
  );

  return (
    <div>
      <div style={{textAlign:"center", marginBottom:24}}>
        <div style={{fontFamily:"Caveat", fontSize:30, fontWeight:700, color:T.text}}>
          Welche Klasse?
        </div>
        <div style={{fontFamily:"Nunito", fontSize:13, color:T.muted, marginTop:4}}>
          {school.name}
        </div>
      </div>

      {/* Klassen-Picker */}
      <div style={{background:T.white,borderRadius:20,padding:20,
        boxShadow:"0 3px 16px rgba(0,0,0,0.07)",marginBottom:12}}>
        <div style={{fontFamily:"Nunito",fontSize:11,fontWeight:700,
          color:T.muted,letterSpacing:"0.07em",marginBottom:12}}>KLASSE</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
          {klassen.map(k=>(
            <button key={k} onClick={()=>setGrade(k)} style={{
              width:48,height:48,borderRadius:14,border:"none",
              background:grade===k?T.dark:"#F0F4F8",
              color:grade===k?"#fff":T.mid,
              fontFamily:"Nunito",fontWeight:800,fontSize:16,
              cursor:"pointer",transition:"all 0.15s ease",
              boxShadow:grade===k?"0 4px 14px rgba(26,26,46,0.25)":"none"
            }}>{k}</button>
          ))}
        </div>

        {grade && (
          <div style={{animation:"fadeUp 0.25s ease"}}>
            <div style={{fontFamily:"Nunito",fontSize:11,fontWeight:700,
              color:T.muted,letterSpacing:"0.07em",marginBottom:8}}>
              KLASSEN-BUCHSTABE (OPTIONAL)
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {["","a","b","c","d","e"].map(s=>(
                <button key={s} onClick={()=>setSection(s)} style={{
                  minWidth:44,height:40,borderRadius:12,border:"none",
                  background:section===s?T.teal:"#F0F4F8",
                  color:section===s?"#fff":T.mid,
                  fontFamily:"Nunito",fontWeight:800,fontSize:14,
                  cursor:"pointer",transition:"all 0.15s ease",
                  padding:"0 12px"
                }}>{s||"–"}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bestehende Gruppe anzeigen */}
      {existingGroup && grade && (
        <div style={{
          padding:"12px 14px",background:"#F0FFF4",borderRadius:14,
          border:"1.5px solid #4ECDC430",marginBottom:12,
          display:"flex",gap:10,alignItems:"center",
          animation:"fadeUp 0.25s ease"
        }}>
          <span style={{fontSize:20}}>👥</span>
          <div style={{fontFamily:"Nunito",fontSize:12,color:"#2D6A4F",lineHeight:1.5}}>
            <strong>{existingGroup.member_count} Eltern</strong> sind schon in dieser Klasse. Du siehst sofort ihre Einträge!
          </div>
        </div>
      )}

      {grade && !existingGroup && (
        <div style={{padding:"12px 14px",background:"#FFF8F0",borderRadius:14,
          border:"1.5px solid #FFB34730",marginBottom:12,
          fontFamily:"Nunito",fontSize:12,color:"#92400E",lineHeight:1.5}}>
          ✨ Du wärst der erste Elternteil in Klasse {grade}{section} – du richtest die Gruppe ein!
        </div>
      )}

      <Btn onClick={()=>onNext({grade, section})}
        disabled={!grade}>
        {grade ? `Klasse ${grade}${section} wählen →` : "Klasse wählen"}
      </Btn>
    </div>
  );
}

// ─── Step 4: Kinder eintragen ─────────────────────────────────
function StepChildren({ school, grade, section, onNext }) {
  const [kinder, setKinder] = useState([{name:""}]);

  const update = (i, val) => setKinder(prev=>{
    const next=[...prev]; next[i]={...next[i],name:val}; return next;
  });
  const add = () => kinder.length<4 && setKinder(p=>[...p,{name:""}]);
  const remove = (i) => setKinder(p=>p.filter((_,idx)=>idx!==i));
  const allValid = kinder.every(k=>k.name.trim());

  return (
    <div>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontFamily:"Caveat",fontSize:30,fontWeight:700,color:T.text}}>
          Deine Kinder
        </div>
        <div style={{fontFamily:"Nunito",fontSize:13,color:T.muted,marginTop:4}}>
          Klasse {grade}{section} · {school.name}
        </div>
      </div>

      {kinder.map((k,i)=>{
        const col=KINDER_COLORS[i%KINDER_COLORS.length];
        const emoji=KINDER_EMOJIS[i%KINDER_EMOJIS.length];
        return (
          <div key={i} style={{display:"flex",gap:10,alignItems:"center",
            marginBottom:10}}>
            <span style={{fontSize:24}}>{emoji}</span>
            <input value={k.name} onChange={e=>update(i,e.target.value)}
              placeholder={`Vorname Kind ${i+1}…`} maxLength={20}
              style={{flex:1,padding:"12px 14px",borderRadius:12,
                border:`2px solid ${k.name?col.color:T.border}`,
                fontFamily:"Nunito",fontSize:14,fontWeight:600,
                outline:"none",transition:"border-color 0.2s"}}/>
            {kinder.length>1&&(
              <button onClick={()=>remove(i)} style={{
                background:"#FFF0F0",border:"none",borderRadius:"50%",
                width:32,height:32,cursor:"pointer",
                color:T.coral,fontSize:16,flexShrink:0}}>×</button>
            )}
          </div>
        );
      })}

      {kinder.length<4&&(
        <button onClick={add} style={{
          width:"100%",padding:"12px",borderRadius:14,marginBottom:16,
          border:`2px dashed ${T.border}`,background:"transparent",
          fontFamily:"Nunito",fontSize:14,fontWeight:700,
          color:T.muted,cursor:"pointer"}}>
          + Weiteres Kind
        </button>
      )}

      <div style={{height:8}}/>
      <Btn onClick={()=>onNext(kinder)} disabled={!allValid}>
        Beitreten →
      </Btn>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────
export default function Join({ user, onJoined }) {
  const [step, setStep]       = useState(0);
  const [displayName, setName]= useState("");
  const [school, setSchool]   = useState(null);
  const [classInfo, setClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleJoin = async (kinder) => {
    setLoading(true); setError("");
    try {
      const result = await joinOrCreateGroup({
        school_id: school.id,
        grade: classInfo.grade,
        section: classInfo.section || null,
        display_name: displayName,
        children: kinder.map(k=>({name:k.name})),
      });
      onJoined(result);
    } catch(e) {
      setError(e.message || "Fehler beim Beitreten");
      setLoading(false);
    }
  };

  const steps = [
    <StepName    onNext={(n)=>{setName(n);setStep(1);}}/>,
    <StepSchool  onNext={(s)=>{setSchool(s);setStep(2);}}/>,
    <StepClass   school={school} onNext={(c)=>{setClass(c);setStep(3);}}/>,
    <StepChildren school={school} grade={classInfo?.grade}
      section={classInfo?.section} onNext={handleJoin}/>,
  ];

  return (
    <div style={{minHeight:"100dvh",background:T.light,
      display:"flex",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:420,padding:"20px 20px 48px"}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}>
          {step>0&&(
            <button onClick={()=>setStep(s=>s-1)} style={{
              background:T.white,border:`1.5px solid ${T.border}`,
              borderRadius:10,padding:"6px 12px",cursor:"pointer",
              fontFamily:"Nunito",fontSize:12,fontWeight:700,color:T.mid}}>
              ← Zurück
            </button>
          )}
          {/* Progress dots */}
          <div style={{display:"flex",gap:6,marginLeft:"auto"}}>
            {[0,1,2,3].map(i=>(
              <div key={i} style={{
                width:i===step?24:8,height:8,borderRadius:4,
                background:i===step?T.teal:i<step?T.mint+"90":T.border,
                transition:"all 0.3s ease"
              }}/>
            ))}
          </div>
        </div>

        {error&&(
          <div style={{padding:"12px 14px",background:"#FFF0F0",
            borderRadius:12,border:`1.5px solid ${T.coral}30`,
            fontFamily:"Nunito",fontSize:13,color:T.coral,
            marginBottom:16}}>{error}</div>
        )}

        {loading ? (
          <div style={{textAlign:"center",padding:60}}>
            <div style={{width:40,height:40,borderRadius:"50%",margin:"0 auto 16px",
              border:`3px solid ${T.border}`,borderTopColor:T.teal,
              animation:"spin 0.7s linear infinite"}}/>
            <div style={{fontFamily:"Nunito",fontSize:14,color:T.muted}}>
              Gruppe wird eingerichtet…
            </div>
          </div>
        ) : steps[step]}
      </div>
    </div>
  );
}
