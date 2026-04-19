import { useState } from "react";

const T = {
  teal:"#45B7D1", mint:"#4ECDC4", coral:"#FF6B6B",
  dark:"#1A1A2E", mid:"#4A5568", light:"#F5F7FA",
  white:"#FFFFFF", border:"#E8EDF2", text:"#2D3748", muted:"#94A3B8",
};
const grad = `linear-gradient(135deg,${T.teal},${T.mint})`;

const SUBJECTS = [
  {id:"mathe",    label:"Mathe",    emoji:"📐", color:"#FF6B6B", bg:"#FFF0F0"},
  {id:"englisch", label:"Englisch", emoji:"🌍", color:"#45B7D1", bg:"#F0F8FF"},
  {id:"deutsch",  label:"Deutsch",  emoji:"📝", color:"#4ECDC4", bg:"#F0FFFE"},
  {id:"sachkunde",label:"Sachkunde",emoji:"🔬", color:"#96CEB4", bg:"#F0FFF4"},
  {id:"sport",    label:"Sport",    emoji:"⚽", color:"#DDA0DD", bg:"#FFF0FF"},
  {id:"kunst",    label:"Kunst",    emoji:"🎨", color:"#FFB347", bg:"#FFF8F0"},
  {id:"musik",    label:"Musik",    emoji:"🎵", color:"#F7C948", bg:"#FFFDF0"},
];

const MOCK_ENTRIES = [
  {id:1,subject:"mathe",course:"A",author:"Papa Tomás",authorInitial:"T",
   text:"Seite 47, Aufgaben 1–5. Brüche addieren.",
   date:"heute",dueDate:"in 3 Tagen",priority:"normal",
   confirms:["Mama Julia","Papa Max"],comments:[
     {id:1,author:"Mama Julia",initial:"J",text:"Danke! Haben das auch so 👍",time:"14:32"}
   ],time:"13:45"},
  {id:2,subject:"englisch",course:"B",author:"Mama Sarah",authorInitial:"S",
   text:"Vokabeln Unit 7 lernen – animals. Workbook Seite 52.",
   date:"heute",dueDate:"Morgen",priority:"wichtig",
   confirms:["Mama Julia"],comments:[],time:"12:10"},
  {id:3,subject:"deutsch",course:"A",author:"Papa Chris",authorInitial:"C",
   text:"Aufsatz über Lieblingstier, mind. 8 Sätze.",
   date:"gestern",dueDate:"in 4 Tagen",priority:"normal",
   confirms:[],comments:[],time:"16:00"},
];

function Avatar({initial, size=36}) {
  const colors=["#FF6B6B","#4ECDC4","#45B7D1","#DDA0DD","#FFB347","#96CEB4"];
  const bg=colors[(initial||"?").charCodeAt(0)%colors.length];
  return <div style={{width:size,height:size,borderRadius:"50%",background:bg,
    color:"#fff",fontFamily:"Nunito",fontWeight:800,fontSize:size*0.38,
    display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
    boxShadow:"0 2px 8px rgba(0,0,0,0.12)"}}>{initial}</div>;
}

function EntryCard({entry, myName, onConfirm, onComment}) {
  const s = SUBJECTS.find(x=>x.id===entry.subject)||SUBJECTS[0];
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText]   = useState("");
  const iConfirmed = entry.confirms.includes(myName);
  const isMyEntry  = entry.author===myName;
  const COURSE_BG  = {A:"#1A1A2E",B:"#4A5568",C:"#94A3B8"};

  return (
    <div style={{background:T.white,borderRadius:20,padding:20,marginBottom:14,
      boxShadow:"0 2px 16px rgba(0,0,0,0.07)",borderLeft:`4px solid ${s.color}`}}>
      <div style={{display:"flex",justifyContent:"space-between",
        alignItems:"flex-start",marginBottom:10}}>
        <span style={{display:"inline-flex",alignItems:"center",gap:4,
          background:s.bg,color:s.color,border:`1.5px solid ${s.color}40`,
          borderRadius:20,padding:"3px 10px",fontFamily:"Nunito",fontSize:12,fontWeight:700}}>
          {s.emoji} {s.label}
          {entry.course && <span style={{background:COURSE_BG[entry.course]||T.mid,
            color:"#fff",borderRadius:6,padding:"1px 6px",fontSize:10,fontWeight:900}}>
            K.{entry.course}</span>}
        </span>
        {entry.priority==="wichtig" && (
          <span style={{background:"#FF8C0020",color:"#FF8C00",borderRadius:20,
            padding:"2px 8px",fontSize:11,fontWeight:700,fontFamily:"Nunito",
            border:"1.5px solid #FF8C0040"}}>🔴 Wichtig</span>
        )}
      </div>
      <p style={{fontFamily:"Nunito",fontSize:15,color:T.text,
        margin:"8px 0 12px",lineHeight:1.6,fontWeight:600}}>{entry.text}</p>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Avatar initial={entry.authorInitial} size={28}/>
          <span style={{fontFamily:"Nunito",fontSize:12,color:T.muted,fontWeight:600}}>
            {entry.author}
          </span>
          <span style={{fontFamily:"Nunito",fontSize:11,fontWeight:700,
            color:entry.dueDate==="Morgen"?"#FF8C00":T.muted,
            background:entry.dueDate==="Morgen"?"#FFF8F0":T.light,
            borderRadius:10,padding:"2px 8px"}}>
            📅 {entry.dueDate}
          </span>
        </div>
        <button onClick={()=>!isMyEntry&&onConfirm(entry.id)}
          disabled={isMyEntry}
          style={{display:"flex",alignItems:"center",gap:5,
            background:iConfirmed?"#4ECDC420":"#F0F0F0",
            border:`1.5px solid ${iConfirmed?"#4ECDC4":"#E0E0E0"}`,
            borderRadius:20,padding:"5px 10px",cursor:isMyEntry?"default":"pointer",
            fontFamily:"Nunito",fontSize:11,fontWeight:700,
            color:iConfirmed?"#4ECDC4":"#888",opacity:isMyEntry?0.5:1}}>
          ✓ {entry.confirms.length}
        </button>
      </div>
      {/* Kommentare */}
      <div style={{marginTop:8}}>
        <button onClick={()=>setCommentsOpen(!commentsOpen)} style={{
          background:"none",border:"none",color:T.muted,fontFamily:"Nunito",
          fontSize:12,cursor:"pointer",fontWeight:600,padding:"4px 0"}}>
          💬 {entry.comments.length} Kommentar{entry.comments.length!==1?"e":""} {commentsOpen?"▲":"▼"}
        </button>
        {commentsOpen && (
          <div style={{marginTop:8}}>
            {entry.comments.map(c=>(
              <div key={c.id} style={{display:"flex",gap:8,marginBottom:8}}>
                <Avatar initial={c.initial} size={26}/>
                <div style={{background:"#F8F8F8",borderRadius:12,padding:"6px 10px",flex:1}}>
                  <div style={{fontFamily:"Nunito",fontSize:11,fontWeight:700,
                    color:"#555",marginBottom:2}}>{c.author} · {c.time}</div>
                  <div style={{fontFamily:"Nunito",fontSize:13,color:T.text}}>{c.text}</div>
                </div>
              </div>
            ))}
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <input value={commentText} onChange={e=>setCommentText(e.target.value)}
                placeholder="Kommentar…"
                style={{flex:1,border:`1.5px solid ${T.border}`,borderRadius:20,
                  padding:"6px 12px",fontFamily:"Nunito",fontSize:13,outline:"none"}}
                onKeyDown={e=>{if(e.key==="Enter"&&commentText.trim()){
                  onComment(entry.id,commentText);setCommentText("");}}}/>
              <button onClick={()=>{if(commentText.trim()){onComment(entry.id,commentText);setCommentText("");}}}
                style={{background:T.teal,border:"none",borderRadius:20,color:"#fff",
                  fontFamily:"Nunito",fontWeight:700,padding:"6px 14px",cursor:"pointer"}}>→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AddModal({onClose, onAdd, myName}) {
  const [subject, setSubject] = useState("mathe");
  const [text, setText]       = useState("");
  const [priority, setPriority] = useState("normal");

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",
      display:"flex",alignItems:"flex-end",justifyContent:"center",
      zIndex:1000,backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div style={{background:T.white,borderRadius:"24px 24px 0 0",padding:28,
        width:"100%",maxWidth:480,paddingBottom:48,animation:"slideUp 0.3s ease"}}
        onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
          <div style={{fontFamily:"Caveat",fontSize:26,color:T.text,fontWeight:700}}>
            📚 Hausaufgabe eintragen
          </div>
          <button onClick={onClose} style={{background:"#F0F0F0",border:"none",
            borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:16}}>×</button>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
          {SUBJECTS.map(s=>(
            <button key={s.id} onClick={()=>setSubject(s.id)} style={{
              background:subject===s.id?s.color:s.bg,
              border:`2px solid ${s.color}`,borderRadius:20,padding:"5px 12px",
              fontFamily:"Nunito",fontSize:12,fontWeight:700,cursor:"pointer",
              color:subject===s.id?"#fff":s.color}}>
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
        <textarea value={text} onChange={e=>setText(e.target.value)}
          placeholder="Was müssen die Kinder machen?"
          style={{width:"100%",minHeight:90,border:`2px solid ${T.border}`,
            borderRadius:14,padding:"10px 14px",fontFamily:"Nunito",fontSize:14,
            outline:"none",resize:"vertical",marginBottom:12}}/>
        <select value={priority} onChange={e=>setPriority(e.target.value)}
          style={{width:"100%",border:`2px solid ${T.border}`,borderRadius:12,
            padding:"10px 12px",fontFamily:"Nunito",fontSize:14,
            background:T.white,outline:"none",marginBottom:20}}>
          <option value="normal">Normal</option>
          <option value="wichtig">Wichtig</option>
          <option value="klassenarbeit">Klassenarbeit</option>
        </select>
        <button onClick={()=>{if(text.trim())onAdd({subject,text,priority});}}
          style={{width:"100%",background:grad,border:"none",borderRadius:16,
            padding:"14px",fontFamily:"Nunito",fontSize:16,fontWeight:800,
            color:"#fff",cursor:"pointer",boxShadow:"0 6px 20px rgba(69,183,209,0.4)"}}>
          ✓ Eintragen & Streak sichern 🔥
        </button>
      </div>
    </div>
  );
}

export default function Feed({ user, onLogout }) {
  const [entries, setEntries]   = useState(MOCK_ENTRIES);
  const [showAdd, setShowAdd]   = useState(false);
  const [tab, setTab]           = useState("feed");
  const displayName = user?.displayName || "Mama Lena";
  const initials = displayName.split(" ").map(w=>w[0]).join("").slice(0,2);

  const handleAdd = (data) => {
    setEntries(prev=>[{
      id:Date.now(),...data,author:displayName,
      authorInitial:initials,
      date:"heute",dueDate:"noch offen",
      confirms:[],comments:[],
      time:new Date().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})
    },...prev]);
    setShowAdd(false);
  };

  const handleConfirm = (id) => setEntries(prev=>prev.map(e=>{
    if(e.id!==id)return e;
    const has=e.confirms.includes(displayName);
    return{...e,confirms:has?e.confirms.filter(c=>c!==displayName):[...e.confirms,displayName]};
  }));

  const handleComment = (id, text) => setEntries(prev=>prev.map(e=>{
    if(e.id!==id)return e;
    return{...e,comments:[...e.comments,{
      id:Date.now(),author:displayName,
      initial:initials,text,
      time:new Date().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})
    }]};
  }));

  return (
    <div style={{minHeight:"100dvh",background:"#F5F7FA",
      maxWidth:480,margin:"0 auto",paddingBottom:80}}>
      {/* Header */}
      <div style={{background:grad,padding:"20px 20px 24px",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontFamily:"Caveat",fontSize:28,color:"#fff",fontWeight:700}}>
              Hausaufgaben 📚
            </div>
            <div style={{fontFamily:"Nunito",fontSize:12,color:"rgba(255,255,255,0.8)",marginTop:2}}>
              {user?.schule?.school?.name||"Klasse 4b"}
              {user?.schule?.klasse&&` · Klasse ${user.schule.klasse}`}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,
            background:"rgba(255,255,255,0.2)",borderRadius:20,padding:"6px 12px"}}>
            <span>🔥</span>
            <span style={{fontFamily:"Nunito",fontWeight:800,fontSize:13,color:"#fff"}}>
              7 Tage
            </span>
          </div>
        </div>
      </div>

      <div style={{padding:"16px 16px 0"}}>
        {tab==="feed" && entries.map(e=>(
          <EntryCard key={e.id} entry={e} myName={displayName}
            onConfirm={handleConfirm} onComment={handleComment}/>
        ))}
        {tab==="leaderboard" && (
          <div style={{textAlign:"center",padding:40,
            fontFamily:"Caveat",fontSize:20,color:T.muted}}>
            🏆 Rangliste kommt bald!
          </div>
        )}
        {tab==="settings" && (
          <div style={{background:T.white,borderRadius:20,padding:20,
            boxShadow:"0 2px 12px rgba(0,0,0,0.07)"}}>
            <div style={{fontFamily:"Nunito",fontWeight:800,fontSize:14,
              color:T.text,marginBottom:16}}>Eingeloggt als</div>
            <div style={{fontFamily:"Nunito",fontSize:14,color:T.mid,marginBottom:24}}>
              {displayName}
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

      {/* FAB */}
      {tab==="feed" && (
        <button onClick={()=>setShowAdd(true)} style={{
          position:"fixed",bottom:90,right:"calc(50% - 220px)",
          width:56,height:56,borderRadius:"50%",
          background:"linear-gradient(135deg,#FF6B6B,#FF4500)",
          border:"none",color:"#fff",fontSize:28,cursor:"pointer",
          boxShadow:"0 6px 24px rgba(255,107,107,0.5)",
          display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
          +
        </button>
      )}

      {/* Bottom Nav */}
      <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
        width:"100%",maxWidth:480,background:T.white,
        borderTop:"1px solid #F0F0F0",display:"flex",
        boxShadow:"0 -4px 20px rgba(0,0,0,0.08)",zIndex:300}}>
        {[
          {id:"feed",icon:"📋",label:"Feed"},
          {id:"leaderboard",icon:"🏆",label:"Rangliste"},
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

      {showAdd && <AddModal onClose={()=>setShowAdd(false)} onAdd={handleAdd} myName={displayName}/>}
    </div>
  );
}
