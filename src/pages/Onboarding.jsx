import { useState } from "react";
import { searchSchools, insertManualSchool } from "../lib/api.js";
import { getKursFaecher, getKlassen, SCHULARTEN_MAP, BUNDESLAENDER, SCHULART_EMOJI } from "../lib/schoolLogic.js";

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

function Dots({ step, total }) {
  return (
    <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:28}}>
      {Array.from({length:total}).map((_,i)=>(
        <div key={i} style={{
          width:i===step?24:8, height:8, borderRadius:4,
          background:i===step?T.teal:i<step?T.mint+"90":T.border,
          transition:"all 0.3s ease"
        }}/>
      ))}
    </div>
  );
}

// ─── Screen 0: Einladung ──────────────────────────────────────────────────────
function ScreenInvite({ onNext }) {
  return (
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <div style={{background:grad,borderRadius:28,padding:"40px 24px 36px",
        textAlign:"center",marginBottom:20,
        boxShadow:"0 12px 40px rgba(69,183,209,0.3)"}}>
        <div style={{fontSize:60,marginBottom:14}}>📚</div>
        <div style={{fontFamily:"Caveat",fontSize:34,color:"#fff",fontWeight:700}}>
          Du wurdest eingeladen
        </div>
        <div style={{fontFamily:"Nunito",fontSize:14,
          color:"rgba(255,255,255,0.8)",marginTop:8}}>
          Grundschule am Park · Klasse 4b
        </div>
      </div>
      <div style={{padding:"12px 14px",background:"#F0FFF4",borderRadius:14,
        border:"1.5px solid #4ECDC430",marginBottom:20,
        fontFamily:"Nunito",fontSize:12,color:"#2D6A4F",lineHeight:1.5}}>
        🔒 <strong>Geschlossene Gruppe.</strong> Nur Personen mit diesem Link können beitreten.
      </div>
      <Btn onClick={onNext}>Jetzt beitreten →</Btn>
      <p style={{textAlign:"center",fontFamily:"Nunito",fontSize:12,
        color:T.muted,marginTop:10}}>
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
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontFamily:"Caveat",fontSize:30,fontWeight:700,color:T.text}}>
          Wie heißt du?
        </div>
        <div style={{fontFamily:"Nunito",fontSize:13,color:T.muted,marginTop:4}}>
          Kein Nachname nötig.
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"center",marginBottom:24}}>
        <div style={{width:76,height:76,borderRadius:"50%",background:bg,
          color:"#fff",fontFamily:"Nunito",fontWeight:800,fontSize:28,
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:"0 2px 10px rgba(0,0,0,0.15)"}}>
          {initials}
        </div>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",
        justifyContent:"center",marginBottom:16}}>
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
          fontWeight:600,outline:"none",background:"#FAFBFC",
          color:T.text,marginBottom:16}}/>
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

// ─── Screen 2: Kinder ─────────────────────────────────────────────────────────
function ScreenKinder({ onNext }) {
  const [kinder, setKinder] = useState([{ name:"", schule:null, klasse:null }]);

  const updateKind = (i, field, val) => {
    setKinder(prev => {
      const next = [...prev];
      next[i] = {...next[i], [field]:val};
      if(field==="schule") next[i].klasse = null;
      return next;
    });
  };

  const addKind = () => {
    if(kinder.length < 4)
      setKinder(prev=>[...prev,{name:"",schule:null,klasse:null}]);
  };

  const removeKind = (i) => setKinder(prev=>prev.filter((_,idx)=>idx!==i));

  const allValid = kinder.every(k=>k.name.trim()&&k.schule&&k.klasse);

  return (
    <div style={{animation:"fadeUp 0.35s ease"}}>
      <Dots step={1} total={4}/>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontFamily:"Caveat",fontSize:30,fontWeight:700,color:T.text}}>
          Deine Kinder
        </div>
        <div style={{fontFamily:"Nunito",fontSize:13,color:T.muted,marginTop:4}}>
          Für jedes Kind Schule und Klasse eintragen.
        </div>
      </div>

      {kinder.map((k,i)=>{
        const col   = KINDER_COLORS[i%KINDER_COLORS.length];
        const emoji = KINDER_EMOJIS[i%KINDER_EMOJIS.length];
        return (
          <KindForm key={i} index={i} kind={k} col={col} emoji={emoji}
            onChange={(field,val)=>updateKind(i,field,val)}
            onRemove={kinder.length>1?()=>removeKind(i):null}/>
        );
      })}

      {kinder.length < 4 && (
        <button onClick={addKind} style={{
          width:"100%",padding:"12px",borderRadius:14,marginBottom:16,
          border:`2px dashed ${T.border}`,background:"transparent",
          fontFamily:"Nunito",fontSize:14,fontWeight:700,
          color:T.muted,cursor:"pointer"}}>
          + Weiteres Kind hinzufügen
        </button>
      )}

      <Btn onClick={()=>onNext(kinder)} disabled={!allValid}>
        Weiter →
      </Btn>
    </div>
  );
}

function KindForm({ index, kind, col, emoji, onChange, onRemove }) {
  const [query, setQuery]   = useState("");
  const [results, setRes]   = useState([]);
  const [loading, setLoad]  = useState(false);
  const [timer, setTimer]   = useState(null);
  const [manual, setManual] = useState(false);
  const [manName, setManName] = useState("");
  const [manLand, setManLand] = useState("");
  const [manArt, setManArt]   = useState("");

  const klassen = kind.schule ? getKlassen(kind.schule.school_type, kind.schule.state) : [];

  const search = (q) => {
    setQuery(q);
    clearTimeout(timer);
    if(q.length<2){setRes([]);setLoad(false);return;}
    setLoad(true);
    setTimer(setTimeout(async()=>{
      const r = await searchSchools(q);
      setRes(r); setLoad(false);
    },350));
  };

  const handleManualConfirm = async() => {
    try {
      const s = await insertManualSchool({
        name:manName.trim(),state:manLand,school_type:manArt,city:"",zip:""
      });
      onChange("schule",s);
    } catch(e) {
      onChange("schule",{
        id:"manual-"+Date.now(),name:manName.trim(),
        state:manLand,school_type:manArt,source:"manual"
      });
    }
    setManual(false);
  };

  const schularten = SCHULARTEN_MAP[manLand] || SCHULARTEN_MAP.default;

  return (
    <div style={{background:T.white,borderRadius:20,padding:18,marginBottom:14,
      boxShadow:"0 3px 16px rgba(0,0,0,0.07)",
      borderLeft:`4px solid ${col.color}`}}>
      <div style={{display:"flex",alignItems:"center",
        justifyContent:"space-between",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:24}}>{emoji}</span>
          <div style={{fontFamily:"Nunito",fontWeight:800,fontSize:14,color:col.color}}>
            Kind {index+1}
          </div>
        </div>
        {onRemove && (
          <button onClick={onRemove} style={{background:"#FFF0F0",border:"none",
            borderRadius:"50%",width:28,height:28,cursor:"pointer",
            color:T.coral,fontSize:14}}>×</button>
        )}
      </div>

      {/* Name */}
      <input value={kind.name} onChange={e=>onChange("name",e.target.value)}
        placeholder="Vorname des Kindes…" maxLength={20}
        style={{width:"100%",padding:"11px 14px",borderRadius:12,
          border:`2px solid ${kind.name?col.color:T.border}`,
          fontFamily:"Nunito",fontSize:14,fontWeight:600,
          outline:"none",marginBottom:12,transition:"border-color 0.2s"}}/>

      {/* Schulsuche */}
      {!kind.schule && !manual && (
        <div style={{position:"relative",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10,
            border:`2px solid ${T.border}`,borderRadius:12,
            padding:"10px 14px",background:T.white}}>
            <span>🔍</span>
            <input value={query} onChange={e=>search(e.target.value)}
              placeholder="Schule suchen…"
              style={{flex:1,border:"none",outline:"none",fontFamily:"Nunito",
                fontSize:13,fontWeight:600,color:T.text,background:"transparent"}}/>
            {loading&&<div style={{width:16,height:16,borderRadius:"50%",
              border:`2px solid ${T.border}`,borderTopColor:T.teal,
              animation:"spin 0.7s linear infinite"}}/>}
          </div>
          {query.length>=2&&(
            <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,
              background:T.white,borderRadius:14,zIndex:200,overflow:"hidden",
              boxShadow:"0 8px 32px rgba(0,0,0,0.14)",
              border:`1.5px solid ${T.border}`}}>
              {!loading&&results.length===0?(
                <div style={{padding:"12px",textAlign:"center"}}>
                  <div style={{fontFamily:"Nunito",fontSize:12,color:T.muted,marginBottom:8}}>
                    Nicht gefunden.
                  </div>
                  <button onClick={()=>setManual(true)} style={{
                    background:T.light,border:`1.5px solid ${T.border}`,
                    borderRadius:10,padding:"6px 14px",cursor:"pointer",
                    fontFamily:"Nunito",fontSize:12,fontWeight:700,color:T.mid}}>
                    ✏️ Manuell eingeben
                  </button>
                </div>
              ):results.map((s,ri)=>(
                <button key={s.id} onClick={()=>{onChange("schule",s);setRes([]);setQuery("");}}
                  style={{width:"100%",padding:"10px 12px",background:"none",
                    border:"none",cursor:"pointer",textAlign:"left",
                    display:"flex",gap:8,alignItems:"flex-start",
                    borderBottom:ri<results.length-1?`1px solid ${T.border}`:"none"}}>
                  <span style={{fontSize:18,flexShrink:0}}>{SCHULART_EMOJI[s.school_type]||"🏫"}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"Nunito",fontWeight:800,fontSize:12,color:T.text,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</div>
                    <div style={{fontFamily:"Nunito",fontSize:10,color:T.muted}}>
                      {s.city} · {s.state} · {s.school_type}
                    </div>
                  </div>
                </button>
              ))}
              {results.length>0&&(
                <button onClick={()=>setManual(true)} style={{
                  width:"100%",padding:"8px 12px",background:"#FAFBFC",
                  border:"none",borderTop:`1px solid ${T.border}`,cursor:"pointer",
                  fontFamily:"Nunito",fontSize:11,fontWeight:700,
                  color:T.muted,textAlign:"center"}}>
                  ✏️ Manuell eingeben
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Manuell */}
      {manual && (
        <div style={{marginBottom:10,animation:"fadeUp 0.25s ease"}}>
          <button onClick={()=>setManual(false)} style={{
            background:"none",border:"none",cursor:"pointer",
            fontFamily:"Nunito",fontSize:12,fontWeight:700,
            color:T.muted,padding:"0 0 8px 0"}}>← Zurück</button>
          <input value={manName} onChange={e=>setManName(e.target.value)}
            placeholder="Schulname…"
            style={{width:"100%",padding:"10px 12px",borderRadius:10,
              border:`2px solid ${T.border}`,fontFamily:"Nunito",fontSize:13,
              fontWeight:600,outline:"none",marginBottom:8}}/>
          <select value={manLand} onChange={e=>{setManLand(e.target.value);setManArt("");}}
            style={{width:"100%",padding:"10px 12px",borderRadius:10,
              border:`2px solid ${T.border}`,fontFamily:"Nunito",fontSize:13,
              background:T.white,outline:"none",marginBottom:8}}>
            <option value="">Bundesland…</option>
            {BUNDESLAENDER.map(l=><option key={l} value={l}>{l}</option>)}
          </select>
          {manLand&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
              {schularten.map(s=>(
                <button key={s} onClick={()=>setManArt(s)} style={{
                  padding:"6px 12px",borderRadius:20,
                  border:`2px solid ${manArt===s?T.teal:T.border}`,
                  background:manArt===s?T.teal:T.white,
                  color:manArt===s?"#fff":T.mid,
                  fontFamily:"Nunito",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                  {s}
                </button>
              ))}
            </div>
          )}
          <Btn onClick={handleManualConfirm}
            disabled={!manName.trim()||!manLand||!manArt}>
            Speichern →
          </Btn>
        </div>
      )}

      {/* Gewählte Schule */}
      {kind.schule&&(
        <div style={{display:"flex",alignItems:"center",gap:8,
          padding:"8px 12px",background:"#F0FFFE",borderRadius:12,
          border:`1.5px solid ${T.mint}40`,marginBottom:10,
          animation:"fadeUp 0.25s ease"}}>
          <span>{SCHULART_EMOJI[kind.schule.school_type]||"🏫"}</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"Nunito",fontWeight:800,fontSize:12,color:T.text,
              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {kind.schule.name}
            </div>
            <div style={{fontFamily:"Nunito",fontSize:10,color:T.muted}}>
              {kind.schule.state} · {kind.schule.school_type}
            </div>
          </div>
          <button onClick={()=>{onChange("schule",null);onChange("klasse",null);}}
            style={{background:"#FFF0F0",border:"none",borderRadius:"50%",
              width:22,height:22,cursor:"pointer",color:T.coral,fontSize:12}}>×</button>
        </div>
      )}

      {/* Klasse */}
      {kind.schule&&(
        <div>
          <div style={{fontFamily:"Nunito",fontSize:10,fontWeight:700,
            color:T.muted,letterSpacing:"0.07em",marginBottom:8}}>KLASSE</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {klassen.map(kl=>(
              <button key={kl} onClick={()=>onChange("klasse",kl)} style={{
                width:40,height:40,borderRadius:10,border:"none",
                background:kind.klasse===kl?col.color:"#F0F4F8",
                color:kind.klasse===kl?"#fff":T.mid,
                fontFamily:"Nunito",fontWeight:800,fontSize:14,
                cursor:"pointer",transition:"all 0.15s ease",
                boxShadow:kind.klasse===kl?`0 3px 10px ${col.color}40`:"none"}}>
                {kl}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Screen 3: Datenschutz ────────────────────────────────────────────────────
function ScreenDatenschutz({ onNext }) {
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);

  const Toggle = ({checked, onToggle, children}) => (
    <div onClick={onToggle} style={{
      display:"flex",gap:14,padding:"16px",marginBottom:10,
      background:checked?"#F0FFFE":T.white,borderRadius:18,cursor:"pointer",
      border:`2px solid ${checked?T.mint:T.border}`,transition:"all 0.2s ease"}}>
      <div style={{flex:1,fontFamily:"Nunito",fontSize:13,color:T.text,
        fontWeight:600,lineHeight:1.55}}>{children}</div>
      <div style={{width:28,height:28,borderRadius:8,flexShrink:0,
        background:checked?grad:"#F0F4F8",
        border:`2px solid ${checked?"transparent":T.border}`,
        display:"flex",alignItems:"center",justifyContent:"center",
        transition:"all 0.2s ease"}}>
        {checked&&<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7l4 4 6-6" stroke="#fff" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>}
      </div>
    </div>
  );

  return (
    <div style={{animation:"fadeUp 0.35s ease"}}>
      <Dots step={2} total={4}/>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontFamily:"Caveat",fontSize:30,fontWeight:700,color:T.text}}>
          Kurz & wichtig
        </div>
        <div style={{fontFamily:"Nunito",fontSize:13,color:T.muted,marginTop:4}}>
          Damit alle sicher mitmachen können.
        </div>
      </div>
      <Toggle checked={a} onToggle={()=>setA(v=>!v)}>
        🔒 <strong>Datenschutz:</strong> Ich trage keine Kindernamen oder persönliche Daten ein – nur Hausaufgaben-Informationen.
      </Toggle>
      <Toggle checked={b} onToggle={()=>setB(v=>!v)}>
        🤝 <strong>Regeln:</strong> Nur Aufgaben eintragen die ich selbst kenne. Kommentare bleiben sachlich und freundlich.
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

// ─── Screen 4: Willkommen ─────────────────────────────────────────────────────
function ScreenWelcome({ displayName, kinder, onDone }) {
  const vorname = displayName?.split(" ")[1] || displayName;
  return (
    <div style={{textAlign:"center",animation:"fadeIn 0.4s ease"}}>
      <div style={{width:96,height:96,borderRadius:"50%",background:grad,
        margin:"0 auto 24px",display:"flex",alignItems:"center",justifyContent:"center",
        boxShadow:"0 12px 40px rgba(69,183,209,0.4)"}}>
        <span style={{fontSize:44}}>🎉</span>
      </div>
      <div style={{fontFamily:"Caveat",fontSize:34,fontWeight:700,color:T.text,marginBottom:8}}>
        Willkommen, {vorname}!
      </div>
      <div style={{fontFamily:"Nunito",fontSize:14,color:T.muted,
        marginBottom:24,lineHeight:1.6}}>
        Du bist jetzt dabei mit<br/>
        <strong style={{color:T.text}}>
          {kinder.map(k=>k.name).join(" & ")}
        </strong>
      </div>
      {/* Kinder-Übersicht */}
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:28}}>
        {kinder.map((k,i)=>{
          const col   = KINDER_COLORS[i%KINDER_COLORS.length];
          const emoji = KINDER_EMOJIS[i%KINDER_EMOJIS.length];
          return (
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,
              padding:"12px 16px",background:col.bg,borderRadius:14,
              border:`1.5px solid ${col.color}30`}}>
              <span style={{fontSize:22}}>{emoji}</span>
              <div style={{textAlign:"left"}}>
                <div style={{fontFamily:"Nunito",fontWeight:800,fontSize:13,color:col.color}}>
                  {k.name}
                </div>
                <div style={{fontFamily:"Nunito",fontSize:11,color:T.muted}}>
                  {k.schule?.name} · Klasse {k.klasse}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Btn onClick={onDone}>Feed öffnen →</Btn>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Onboarding({ onDone }) {
  const [step, setStep]         = useState(0);
  const [displayName, setName]  = useState("");
  const [kinder, setKinder]     = useState([]);

  const screens = [
    <ScreenInvite     onNext={()=>setStep(1)} />,
    <ScreenName       onNext={(n)=>{setName(n);setStep(2);}} />,
    <ScreenKinder     onNext={(k)=>{setKinder(k);setStep(3);}} />,
    <ScreenDatenschutz onNext={()=>setStep(4)} />,
    <ScreenWelcome    displayName={displayName} kinder={kinder}
      onDone={()=>onDone({displayName, kinder, joinedAt:new Date().toISOString()})} />,
  ];

  return (
    <div style={{minHeight:"100dvh",background:T.light,
      display:"flex",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:420,padding:"20px 20px 48px"}}>
        {step>0&&step<4&&(
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
