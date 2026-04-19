import { useState } from "react";

const T = {
  teal:"#45B7D1", mint:"#4ECDC4", coral:"#FF6B6B",
  dark:"#1A1A2E", mid:"#4A5568", light:"#F5F7FA",
  white:"#FFFFFF", border:"#E8EDF2", text:"#2D3748", muted:"#94A3B8",
};
const grad = `linear-gradient(135deg,${T.teal},${T.mint})`;

const FAECHER = {
  mathe:     { label:"Mathe",    emoji:"📐", color:"#FF6B6B", bg:"#FFF0F0" },
  deutsch:   { label:"Deutsch",  emoji:"📝", color:"#4ECDC4", bg:"#F0FFFE" },
  englisch:  { label:"Englisch", emoji:"🌍", color:"#45B7D1", bg:"#F0F8FF" },
  sachkunde: { label:"Sachkunde",emoji:"🔬", color:"#96CEB4", bg:"#F0FFF4" },
  sport:     { label:"Sport",    emoji:"⚽", color:"#DDA0DD", bg:"#FFF0FF" },
  kunst:     { label:"Kunst",    emoji:"🎨", color:"#FFB347", bg:"#FFF8F0" },
  musik:     { label:"Musik",    emoji:"🎵", color:"#F7C948", bg:"#FFFDF0" },
};

const KINDER_COLORS = [
  { color:"#FF6B6B", bg:"#FFF0F0" },
  { color:"#45B7D1", bg:"#F0F8FF" },
  { color:"#4ECDC4", bg:"#F0FFFE" },
  { color:"#DDA0DD", bg:"#FFF0FF" },
];
const KINDER_EMOJIS = ["🦋","⚽","🌟","🎸","🦊","🚀","🌈","🎨"];

const MOCK_ENTRIES = [
  {
    id:1, kindId:0, subject:"mathe", course:null,
    text:"Seite 34, Aufgaben 1–6. Addieren und Subtrahieren bis 1000.",
    author:"Papa Tomás", authorInitial:"T",
    confirms:["Mama Julia","Papa Max"], comments:[
      {id:1,author:"Mama Julia",initial:"J",text:"Danke! Haben das auch so 👍",time:"14:32"}
    ],
    dueDate:"Morgen", priority:"wichtig", time:"13:45"
  },
  {
    id:2, kindId:1, subject:"englisch", course:"B",
    text:"Vokabeln Unit 7 lernen – animals. Workbook Seite 52.",
    author:"Mama Sarah", authorInitial:"S",
    confirms:["Mama Julia"], comments:[],
    dueDate:"in 3 Tagen", priority:"normal", time:"14:10"
  },
  {
    id:3, kindId:0, subject:"deutsch", course:null,
    text:"Lies Seite 12–14 im Lesebuch. Fragen auf Arbeitsblatt beantworten.",
    author:"Mama Julia", authorInitial:"J",
    confirms:["Papa Max"], comments:[],
    dueDate:"in 2 Tagen", priority:"normal", time:"12:30"
  },
  {
    id:4, kindId:1, subject:"mathe", course:"A",
    text:"Arbeitsblatt Gleichungen – beide Seiten. Rechenweg zeigen!",
    author:"Papa Chris", authorInitial:"C",
    confirms:["Mama Sarah","Papa Max","Mama Lena"], comments:[],
    dueDate:"Morgen", priority:"wichtig", time:"13:00"
  },
];

function Avatar({ initial, size=32 }) {
  const colors = [T.coral,T.teal,T.mint,"#DDA0DD","#FFB347","#96CEB4"];
  const bg = colors[(initial||"?").charCodeAt(0) % colors.length];
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%", background:bg,
      color:"#fff", fontFamily:"Nunito", fontWeight:800, fontSize:size*0.38,
      display:"flex", alignItems:"center", justifyContent:"center",
      flexShrink:0, boxShadow:"0 2px 8px rgba(0,0,0,0.12)"
    }}>{initial}</div>
  );
}

function KindChip({ kindId, kinder }) {
  const k     = kinder[kindId];
  const col   = KINDER_COLORS[kindId % KINDER_COLORS.length];
  const emoji = KINDER_EMOJIS[kindId % KINDER_EMOJIS.length];
  if (!k) return null;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      background:col.bg, color:col.color,
      border:`1.5px solid ${col.color}40`,
      borderRadius:20, padding:"2px 8px",
      fontFamily:"Nunito", fontSize:10, fontWeight:800, whiteSpace:"nowrap"
    }}>{emoji} {k.name} · {k.klasse}</span>
  );
}

function EntryCard({ entry, kinder, myName, onConfirm, onComment }) {
  const kindCol = KINDER_COLORS[entry.kindId % KINDER_COLORS.length];
  const fach    = FAECHER[entry.subject] || FAECHER.mathe;
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText]   = useState("");
  const iConfirmed = entry.confirms.includes(myName);
  const isMyEntry  = entry.author === myName;
  const COURSE_BG  = { A:"#1A1A2E", B:"#4A5568", C:"#94A3B8" };

  return (
    <div style={{
      background:T.white, borderRadius:20, padding:18, marginBottom:12,
      boxShadow:"0 2px 16px rgba(0,0,0,0.07)",
      borderLeft:`4px solid ${kindCol.color}`
    }}>
      <div style={{display:"flex", justifyContent:"space-between",
        alignItems:"flex-start", marginBottom:10, gap:8, flexWrap:"wrap"}}>
        <div style={{display:"flex", gap:6, alignItems:"center", flexWrap:"wrap"}}>
          <KindChip kindId={entry.kindId} kinder={kinder}/>
          <span style={{
            display:"inline-flex", alignItems:"center", gap:4,
            background:fach.color+"15", color:fach.color,
            border:`1.5px solid ${fach.color}30`,
            borderRadius:20, padding:"3px 10px",
            fontFamily:"Nunito", fontSize:11, fontWeight:700
          }}>
            {fach.emoji} {fach.label}
            {entry.course && (
              <span style={{background:COURSE_BG[entry.course]||T.mid,
                color:"#fff", borderRadius:6, padding:"1px 6px",
                fontSize:9, fontWeight:900}}>K.{entry.course}</span>
            )}
          </span>
          {entry.priority==="wichtig" && (
            <span style={{background:"#FF8C0018",color:"#FF8C00",
              border:"1.5px solid #FF8C0030",borderRadius:20,
              padding:"2px 8px",fontFamily:"Nunito",fontSize:10,fontWeight:700}}>
              🔴 Wichtig
            </span>
          )}
        </div>
        <span style={{
          fontFamily:"Nunito", fontSize:11, fontWeight:700, flexShrink:0,
          color:entry.dueDate==="Morgen"?"#FF8C00":T.muted,
          background:entry.dueDate==="Morgen"?"#FFF8F0":T.light,
          borderRadius:10, padding:"2px 8px"
        }}>📅 {entry.dueDate}</span>
      </div>

      <p style={{fontFamily:"Nunito",fontSize:14,color:T.text,
        margin:"0 0 12px",lineHeight:1.6,fontWeight:600}}>{entry.text}</p>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Avatar initial={entry.authorInitial} size={26}/>
          <span style={{fontFamily:"Nunito",fontSize:11,color:T.muted,fontWeight:600}}>
            {entry.author}
          </span>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>!isMyEntry&&onConfirm(entry.id)}
            disabled={isMyEntry}
            style={{
              background:iConfirmed?"#4ECDC420":"#F0F0F0",
              border:`1.5px solid ${iConfirmed?"#4ECDC4":"#E0E0E0"}`,
              borderRadius:20, padding:"4px 10px", cursor:isMyEntry?"default":"pointer",
              fontFamily:"Nunito", fontSize:11, fontWeight:700,
              color:iConfirmed?"#4ECDC4":"#888", opacity:isMyEntry?0.5:1
            }}>✓ {entry.confirms.length}</button>
          <button onClick={()=>setCommentsOpen(!commentsOpen)} style={{
            background:"#F0F0F0", border:"none", borderRadius:20,
            padding:"4px 10px", cursor:"pointer",
            fontFamily:"Nunito", fontSize:11, fontWeight:700, color:T.muted
          }}>💬 {entry.comments.length}</button>
        </div>
      </div>

      {commentsOpen && (
        <div style={{marginTop:10}}>
          {entry.comments.map(c=>(
            <div key={c.id} style={{display:"flex",gap:8,marginBottom:8}}>
              <Avatar initial={c.initial} size={24}/>
              <div style={{background:"#F8F8F8",borderRadius:12,padding:"6px 10px",flex:1}}>
                <div style={{fontFamily:"Nunito",fontSize:11,fontWeight:700,
                  color:"#555",marginBottom:2}}>{c.author} · {c.time}</div>
                <div style={{fontFamily:"Nunito",fontSize:12,color:T.text}}>{c.text}</div>
              </div>
            </div>
          ))}
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <input value={commentText} onChange={e=>setCommentText(e.target.value)}
              placeholder="Kommentar…"
              style={{flex:1,border:`1.5px solid ${T.border}`,borderRadius:20,
                padding:"6px 12px",fontFamily:"Nunito",fontSize:12,outline:"none"}}
              onKeyDown={e=>{if(e.key==="Enter"&&commentText.trim()){
                onComment(entry.id,commentText);setCommentText("");}}}/>
            <button onClick={()=>{if(commentText.trim()){
              onComment(entry.id,commentText);setCommentText("");}}}
              style={{background:T.teal,border:"none",borderRadius:20,
                color:"#fff",fontFamily:"Nunito",fontWeight:700,
                padding:"6px 12px",cursor:"pointer"}}>→</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddModal({ kinder, onClose, onAdd }) {
  const [selectedKind, setSelectedKind] = useState(null);
  const [subject, setSubject]           = useState("mathe");
  const [text, setText]                 = useState("");
  const [priority, setPriority]         = useState("normal");

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",
      display:"flex",alignItems:"flex-end",justifyContent:"center",
      zIndex:1000,backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div style={{background:T.white,borderRadius:"24px 24px 0 0",
        padding:"24px 20px 48px",width:"100%",maxWidth:480,
        maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>

        <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
          <div style={{fontFamily:"Caveat",fontSize:24,fontWeight:700,color:T.text}}>
            📚 Hausaufgabe eintragen
          </div>
          <button onClick={onClose} style={{background:"#F0F0F0",border:"none",
            borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:16}}>×</button>
        </div>

        <div style={{marginBottom:20}}>
          <div style={{fontFamily:"Nunito",fontSize:11,fontWeight:700,
            color:T.muted,letterSpacing:"0.07em",marginBottom:10}}>FÜR WELCHES KIND?</div>
          <div style={{display:"flex",gap:10}}>
            {kinder.map((k,i)=>{
              const col   = KINDER_COLORS[i%KINDER_COLORS.length];
              const emoji = KINDER_EMOJIS[i%KINDER_EMOJIS.length];
              const active = selectedKind===i;
              return (
                <button key={i} onClick={()=>setSelectedKind(i)} style={{
                  flex:1,padding:"14px 10px",borderRadius:16,border:"none",
                  background:active?col.color:col.bg,cursor:"pointer",
                  transition:"all 0.15s ease",
                  boxShadow:active?`0 4px 14px ${col.color}40`:"none",
                  transform:active?"scale(1.03)":"scale(1)"
                }}>
                  <div style={{fontSize:26,marginBottom:6}}>{emoji}</div>
                  <div style={{fontFamily:"Nunito",fontWeight:800,fontSize:13,
                    color:active?"#fff":col.color}}>{k.name}</div>
                  <div style={{fontFamily:"Nunito",fontSize:10,
                    color:active?"rgba(255,255,255,0.8)":T.muted,marginTop:2}}>
                    Kl. {k.klasse}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedKind !== null && (
          <>
            <div style={{marginBottom:14}}>
              <div style={{fontFamily:"Nunito",fontSize:11,fontWeight:700,
                color:T.muted,letterSpacing:"0.07em",marginBottom:8}}>FACH</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {Object.entries(FAECHER).map(([id,f])=>(
                  <button key={id} onClick={()=>setSubject(id)} style={{
                    background:subject===id?f.color:f.bg,
                    border:`2px solid ${f.color}`,borderRadius:20,padding:"5px 12px",
                    fontFamily:"Nunito",fontSize:12,fontWeight:700,
                    color:subject===id?"#fff":f.color,cursor:"pointer"}}>
                    {f.emoji} {f.label}
                  </button>
                ))}
              </div>
            </div>
            <textarea value={text} onChange={e=>setText(e.target.value)}
              placeholder="Was müssen die Kinder machen?"
              style={{width:"100%",minHeight:80,border:`2px solid ${T.border}`,
                borderRadius:14,padding:"10px 14px",fontFamily:"Nunito",
                fontSize:14,outline:"none",resize:"vertical",marginBottom:12}}/>
            <select value={priority} onChange={e=>setPriority(e.target.value)}
              style={{width:"100%",border:`2px solid ${T.border}`,borderRadius:12,
                padding:"10px 12px",fontFamily:"Nunito",fontSize:14,
                background:T.white,outline:"none",marginBottom:20}}>
              <option value="normal">Normal</option>
              <option value="wichtig">Wichtig</option>
              <option value="klassenarbeit">Klassenarbeit</option>
            </select>
            <button onClick={()=>{if(text.trim())onAdd({kindId:selectedKind,subject,text,priority});}}
              style={{width:"100%",background:grad,border:"none",borderRadius:16,
                padding:"14px",fontFamily:"Nunito",fontSize:16,fontWeight:800,
                color:"#fff",cursor:"pointer",
                boxShadow:"0 6px 20px rgba(69,183,209,0.4)"}}>
              ✓ Eintragen & Streak sichern 🔥
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function StatsRow({ entries, kinder }) {
  return (
    <div style={{display:"grid",
      gridTemplateColumns:`repeat(${Math.min(kinder.length+1,4)},1fr)`,
      gap:10,marginBottom:16}}>
      {kinder.map((k,i)=>{
        const col   = KINDER_COLORS[i%KINDER_COLORS.length];
        const emoji = KINDER_EMOJIS[i%KINDER_EMOJIS.length];
        const count  = entries.filter(e=>e.kindId===i).length;
        const urgent = entries.filter(e=>e.kindId===i&&e.dueDate==="Morgen").length;
        return (
          <div key={i} style={{background:T.white,borderRadius:16,padding:"12px 10px",
            textAlign:"center",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",
            borderTop:`3px solid ${col.color}`}}>
            <div style={{fontSize:18,marginBottom:2}}>{emoji}</div>
            <div style={{fontFamily:"Nunito",fontWeight:900,fontSize:20,color:col.color}}>
              {count}
            </div>
            <div style={{fontFamily:"Nunito",fontSize:10,color:T.muted,fontWeight:600}}>
              {k.name}
            </div>
            {urgent>0&&(
              <div style={{fontFamily:"Nunito",fontSize:9,fontWeight:700,
                color:"#FF8C00",marginTop:2}}>⚡ {urgent} morgen</div>
            )}
          </div>
        );
      })}
      <div style={{background:T.white,borderRadius:16,padding:"12px 10px",
        textAlign:"center",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",
        borderTop:`3px solid ${T.teal}`}}>
        <div style={{fontSize:18,marginBottom:2}}>🔥</div>
        <div style={{fontFamily:"Nunito",fontWeight:900,fontSize:20,color:T.teal}}>7</div>
        <div style={{fontFamily:"Nunito",fontSize:10,color:T.muted,fontWeight:600}}>Streak</div>
      </div>
    </div>
  );
}

export default function Feed({ user, onLogout }) {
  const displayName = user?.displayName || "Mama Lena";
  const initials    = displayName.split(" ").map(w=>w[0]).join("").slice(0,2);
  const kinder      = user?.kinder || [
    { name:"Emma",  klasse:"3b", schule:"Grundschule am Park" },
    { name:"Jonas", klasse:"7c", schule:"Gesamtschule Kassel" },
  ];

  const [entries, setEntries]       = useState(MOCK_ENTRIES);
  const [activeKind, setActiveKind] = useState(null);
  const [activeFach, setActiveFach] = useState(null);
  const [showAdd, setShowAdd]       = useState(false);
  const [tab, setTab]               = useState("feed");

  const filtered = entries
    .filter(e=>{
      if(activeKind!==null&&e.kindId!==activeKind)return false;
      if(activeFach&&e.subject!==activeFach)return false;
      return true;
    })
    .sort((a,b)=>{
      if(a.priority==="wichtig"&&b.priority!=="wichtig")return -1;
      if(b.priority==="wichtig"&&a.priority!=="wichtig")return 1;
      if(a.dueDate==="Morgen")return -1;
      if(b.dueDate==="Morgen")return 1;
      return 0;
    });

  const handleAdd = (data) => {
    setEntries(prev=>[{
      id:Date.now(),...data,
      author:displayName,authorInitial:initials,
      confirms:[],comments:[],dueDate:"noch offen",
      time:new Date().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})
    },...prev]);
    setShowAdd(false);
  };

  const handleConfirm = (id) => setEntries(prev=>prev.map(e=>{
    if(e.id!==id)return e;
    const has=e.confirms.includes(displayName);
    return{...e,confirms:has?e.confirms.filter(c=>c!==displayName):[...e.confirms,displayName]};
  }));

  const handleComment = (id,text) => setEntries(prev=>prev.map(e=>{
    if(e.id!==id)return e;
    return{...e,comments:[...e.comments,{
      id:Date.now(),author:displayName,initial:initials,text,
      time:new Date().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})
    }]};
  }));

  return (
    <div style={{minHeight:"100dvh",background:"#F5F7FA",
      maxWidth:480,margin:"0 auto",paddingBottom:80}}>

      {/* Header */}
      <div style={{background:grad,padding:"20px 20px 24px",
        position:"sticky",top:0,zIndex:100,
        boxShadow:"0 4px 20px rgba(69,183,209,0.25)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontFamily:"Caveat",fontSize:26,color:"#fff",fontWeight:700}}>
              Hausaufgaben 📚
            </div>
            <div style={{fontFamily:"Nunito",fontSize:12,
              color:"rgba(255,255,255,0.8)",marginTop:2}}>
              {displayName} · {kinder.length} {kinder.length===1?"Kind":"Kinder"}
            </div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {kinder.map((k,i)=>{
              const col=KINDER_COLORS[i%KINDER_COLORS.length];
              const emoji=KINDER_EMOJIS[i%KINDER_EMOJIS.length];
              const active=activeKind===i;
              return (
                <button key={i} onClick={()=>setActiveKind(active?null:i)} style={{
                  width:36,height:36,borderRadius:"50%",border:"none",
                  background:active?col.color:"rgba(255,255,255,0.25)",
                  fontSize:16,cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  transition:"all 0.2s ease",
                  boxShadow:active?`0 2px 10px ${col.color}60`:"none"
                }}>{emoji}</button>
              );
            })}
            <div style={{display:"flex",alignItems:"center",gap:4,
              background:"rgba(255,255,255,0.2)",borderRadius:20,padding:"5px 10px"}}>
              <span>🔥</span>
              <span style={{fontFamily:"Nunito",fontWeight:800,fontSize:12,color:"#fff"}}>7</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{padding:"16px 16px 0"}}>
        {tab==="feed" && (
          <>
            <StatsRow entries={entries} kinder={kinder}/>
            {/* Fach-Filter */}
            <div style={{display:"flex",gap:6,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
              <button onClick={()=>setActiveFach(null)} style={{
                padding:"5px 12px",borderRadius:20,
                border:`1.5px solid ${!activeFach?T.teal:T.border}`,
                background:!activeFach?T.teal:T.white,
                color:!activeFach?"#fff":T.muted,
                fontFamily:"Nunito",fontSize:11,fontWeight:700,
                cursor:"pointer",whiteSpace:"nowrap"
              }}>Alle Fächer</button>
              {Object.entries(FAECHER).map(([id,f])=>(
                <button key={id} onClick={()=>setActiveFach(activeFach===id?null:id)} style={{
                  padding:"5px 10px",borderRadius:20,
                  border:`1.5px solid ${f.color}`,
                  background:activeFach===id?f.color:f.color+"15",
                  color:activeFach===id?"#fff":f.color,
                  fontFamily:"Nunito",fontSize:11,fontWeight:700,
                  cursor:"pointer",whiteSpace:"nowrap"
                }}>{f.emoji} {f.label}</button>
              ))}
            </div>
            {filtered.length===0?(
              <div style={{textAlign:"center",padding:40,
                fontFamily:"Caveat",fontSize:20,color:T.muted}}>
                📭 Keine Einträge für diese Auswahl
              </div>
            ):filtered.map(e=>(
              <EntryCard key={e.id} entry={e} kinder={kinder}
                myName={displayName}
                onConfirm={handleConfirm}
                onComment={handleComment}/>
            ))}
          </>
        )}

        {tab==="settings" && (
          <div style={{background:T.white,borderRadius:20,padding:20,
            boxShadow:"0 2px 12px rgba(0,0,0,0.07)"}}>
            <div style={{fontFamily:"Nunito",fontWeight:800,fontSize:14,
              color:T.text,marginBottom:16}}>Konto</div>
            <div style={{fontFamily:"Nunito",fontSize:14,color:T.mid,marginBottom:4}}>
              {displayName}
            </div>
            <div style={{fontFamily:"Nunito",fontSize:12,color:T.muted,marginBottom:24}}>
              {kinder.length} {kinder.length===1?"Kind":"Kinder"} eingetragen
            </div>
            <button onClick={onLogout} style={{
              width:"100%",padding:"12px",borderRadius:14,
              border:`2px solid ${T.coral}`,background:"#FFF0F0",
              fontFamily:"Nunito",fontWeight:700,fontSize:14,
              color:T.coral,cursor:"pointer"}}>
              Gruppe verlassen
            </button>
          </div>
        )}
      </div>

      {tab==="feed" && (
        <button onClick={()=>setShowAdd(true)} style={{
          position:"fixed",bottom:90,right:"calc(50% - 220px)",
          width:56,height:56,borderRadius:"50%",
          background:"linear-gradient(135deg,#FF6B6B,#FF4500)",
          border:"none",color:"#fff",fontSize:28,cursor:"pointer",
          boxShadow:"0 6px 24px rgba(255,107,107,0.45)",
          display:"flex",alignItems:"center",justifyContent:"center",zIndex:200
        }}>+</button>
      )}

      <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
        width:"100%",maxWidth:480,background:T.white,
        borderTop:"1px solid #F0F0F0",display:"flex",
        boxShadow:"0 -4px 20px rgba(0,0,0,0.08)",zIndex:300}}>
        {[
          {id:"feed",icon:"📋",label:"Feed"},
          {id:"settings",icon:"⚙️",label:"Einstellungen"},
        ].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:1,padding:"12px 0 8px",background:"none",border:"none",
            cursor:"pointer",display:"flex",flexDirection:"column",
            alignItems:"center",gap:2,
            borderTop:`3px solid ${tab===t.id?T.teal:"transparent"}`,
            transition:"border-color 0.15s ease"}}>
            <span style={{fontSize:20}}>{t.icon}</span>
            <span style={{fontFamily:"Nunito",fontSize:11,fontWeight:700,
              color:tab===t.id?T.teal:"#AAA"}}>{t.label}</span>
          </button>
        ))}
      </nav>

      {showAdd && (
        <AddModal kinder={kinder} onClose={()=>setShowAdd(false)} onAdd={handleAdd}/>
      )}
    </div>
  );
}
