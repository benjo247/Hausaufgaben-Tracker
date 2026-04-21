import { useState, useEffect, useCallback } from "react";
import {
  getEntries, createEntry, toggleConfirmation,
  addComment, getComments, getEvents, createEvent,
  getFundCollections, createFundCollection,
  setupCourseSystem,
} from "../lib/db.js";

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
const KINDER_COLORS=[{color:"#FF6B6B",bg:"#FFF0F0"},{color:"#45B7D1",bg:"#F0F8FF"},{color:"#4ECDC4",bg:"#F0FFFE"},{color:"#DDA0DD",bg:"#FFF0FF"}];
const KINDER_EMOJIS=["🦋","⚽","🌟","🎸","🦊","🚀","🌈","🎨"];
const EVENT_TYPES={elternabend:{label:"Elternabend",emoji:"👨‍👩‍👧",color:"#45B7D1"},ausflug:{label:"Ausflug",emoji:"🚌",color:"#4ECDC4"},klassenarbeit:{label:"Klassenarbeit",emoji:"📝",color:"#FF6B6B"},sonstiges:{label:"Sonstiges",emoji:"📌",color:"#96CEB4"}};

function Avatar({initial,size=32}){const colors=[T.coral,T.teal,T.mint,"#DDA0DD","#FFB347","#96CEB4"];const bg=colors[(initial||"?").charCodeAt(0)%colors.length];return <div style={{width:size,height:size,borderRadius:"50%",background:bg,color:"#fff",fontFamily:"Nunito",fontWeight:800,fontSize:size*0.38,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 2px 8px rgba(0,0,0,0.12)"}}>{initial}</div>;}
function Spinner({size=20}){return <div style={{width:size,height:size,borderRadius:"50%",flexShrink:0,border:`2px solid ${T.border}`,borderTopColor:T.teal,animation:"spin 0.7s linear infinite"}}/>;}
function Btn({children,onClick,disabled,secondary,small}){return <button onClick={onClick} disabled={disabled} style={{width:small?"auto":"100%",padding:small?"8px 16px":"14px",borderRadius:14,border:"none",fontFamily:"Nunito",fontSize:small?13:15,fontWeight:800,cursor:disabled?"not-allowed":"pointer",background:disabled?"#E2E8F0":secondary?"#F0F4F8":grad,color:disabled?T.muted:secondary?T.mid:"#fff",boxShadow:disabled||secondary?"none":"0 5px 18px rgba(69,183,209,0.3)",transition:"all 0.18s ease"}}>{children}</button>;}

// ─── Kurssystem Setup ─────────────────────────────────────────
function CourseSetup({group,onDone}){
  const [system,setSystem]=useState(null);
  const [subjects,setSubjs]=useState([]);
  const [loading,setLoading]=useState(false);
  const SYSTEMS=[{id:"none",label:"Kein Kurssystem",desc:"Alle haben dieselben Aufgaben",emoji:"✅"},{id:"ABC",label:"A/B/C-Kurse",desc:"z.B. Gesamtschule Hessen",emoji:"📊"},{id:"EG",label:"E/G-Kurse",desc:"z.B. Gesamtschule NRW",emoji:"📈"}];
  const toggle=f=>setSubjs(p=>p.includes(f)?p.filter(x=>x!==f):[...p,f]);
  const save=async()=>{
    setLoading(true);
    try{await setupCourseSystem(group.id,{course_system:system,course_subjects:system==="none"?[]:subjects});onDone({...group,course_system:system,course_subjects:subjects});}
    finally{setLoading(false);}
  };
  return(
    <div style={{minHeight:"100dvh",background:T.light,display:"flex",justifyContent:"center",padding:"24px 20px"}}>
      <div style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:48,marginBottom:12}}>📊</div>
          <div style={{fontFamily:"Caveat",fontSize:28,fontWeight:700,color:T.text}}>Kurssystem einrichten</div>
          <div style={{fontFamily:"Nunito",fontSize:13,color:T.muted,marginTop:6,lineHeight:1.5}}>Du bist der erste in dieser Klasse!<br/>Richte das Kurssystem für alle ein.</div>
        </div>
        {SYSTEMS.map(s=>(
          <div key={s.id} onClick={()=>setSystem(s.id)} style={{display:"flex",gap:14,padding:"16px",marginBottom:10,background:system===s.id?"#F0FFFE":T.white,borderRadius:18,cursor:"pointer",border:`2px solid ${system===s.id?T.teal:T.border}`,transition:"all 0.2s"}}>
            <span style={{fontSize:24,flexShrink:0}}>{s.emoji}</span>
            <div style={{flex:1}}><div style={{fontFamily:"Nunito",fontWeight:800,fontSize:14,color:T.text}}>{s.label}</div><div style={{fontFamily:"Nunito",fontSize:12,color:T.muted,marginTop:2}}>{s.desc}</div></div>
            <div style={{width:24,height:24,borderRadius:"50%",flexShrink:0,background:system===s.id?T.teal:"#F0F4F8",border:`2px solid ${system===s.id?T.teal:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>
              {system===s.id&&<svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
            </div>
          </div>
        ))}
        {system&&system!=="none"&&(
          <div style={{background:T.white,borderRadius:20,padding:20,boxShadow:"0 3px 16px rgba(0,0,0,0.07)",marginBottom:20}}>
            <div style={{fontFamily:"Nunito",fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.07em",marginBottom:12}}>WELCHE FÄCHER HABEN KURSE?</div>
            <div style={{display:"flex",gap:8}}>
              {["mathe","englisch","deutsch"].map(f=>{const fach=FAECHER[f];const active=subjects.includes(f);return(
                <button key={f} onClick={()=>toggle(f)} style={{flex:1,padding:"12px 8px",borderRadius:14,border:"none",background:active?fach.color:fach.bg,cursor:"pointer",transition:"all 0.15s",boxShadow:active?`0 3px 10px ${fach.color}40`:"none"}}>
                  <div style={{fontSize:20,marginBottom:4}}>{fach.emoji}</div>
                  <div style={{fontFamily:"Nunito",fontWeight:800,fontSize:12,color:active?"#fff":fach.color}}>{fach.label}</div>
                </button>
              );})}
            </div>
          </div>
        )}
        <div style={{padding:"10px 14px",background:"#FFF8F0",borderRadius:12,border:"1.5px solid #FFB34730",fontFamily:"Nunito",fontSize:11,color:"#92400E",lineHeight:1.5,marginBottom:20}}>
          💡 Diese Einstellung gilt für alle Eltern dieser Klasse und kann später geändert werden.
        </div>
        <Btn onClick={save} disabled={!system||(system!=="none"&&subjects.length===0)||loading}>
          {loading?"Wird gespeichert…":"Einrichten & loslegen →"}
        </Btn>
      </div>
    </div>
  );
}

// ─── Entry Card ───────────────────────────────────────────────
function EntryCard({entry,kinder,myUserId,myName,courseSystem,onToggleConfirm}){
  const kindIdx=kinder.findIndex(k=>k.name===entry.for_child);
  const kindCol=kindIdx>=0?KINDER_COLORS[kindIdx%KINDER_COLORS.length]:null;
  const kindEmoji=kindIdx>=0?KINDER_EMOJIS[kindIdx%KINDER_EMOJIS.length]:null;
  const fach=FAECHER[entry.subject]||FAECHER.mathe;
  const COURSE_BG={A:"#1A1A2E",B:"#4A5568",C:"#94A3B8",E:"#1A1A2E",G:"#4A5568"};
  const iConfirmed=(entry.confirmed_by||[]).some(c=>c.user_id===myUserId);
  const isMyEntry=entry.author_id===myUserId;
  const [commentsOpen,setCommentsOpen]=useState(false);
  const [comments,setComments]=useState([]);
  const [commentText,setCommentText]=useState("");
  const [loaded,setLoaded]=useState(false);
  const [adding,setAdding]=useState(false);

  const loadComments=async()=>{if(loaded)return;const d=await getComments(entry.id);setComments(d);setLoaded(true);};
  const handleOpenComments=()=>{setCommentsOpen(!commentsOpen);if(!loaded)loadComments();};
  const handleComment=async()=>{if(!commentText.trim())return;setAdding(true);try{const c=await addComment(entry.id,commentText,myName);setComments(p=>[...p,c]);setCommentText("");}finally{setAdding(false);}};

  const dueText=entry.due_date?(()=>{const d=new Date(entry.due_date);const today=new Date();today.setHours(0,0,0,0);const diff=Math.ceil((d-today)/(1000*60*60*24));if(diff===0)return"⚡ Heute!";if(diff===1)return"⏰ Morgen";if(diff<0)return"❗ Überfällig";return`📅 in ${diff} Tagen`;})():null;

  return(
    <div style={{background:T.white,borderRadius:20,padding:18,marginBottom:12,boxShadow:"0 2px 16px rgba(0,0,0,0.07)",borderLeft:`4px solid ${kindCol?.color||fach.color}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,gap:8,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          {kindCol&&<span style={{display:"inline-flex",alignItems:"center",gap:4,background:kindCol.bg,color:kindCol.color,border:`1.5px solid ${kindCol.color}40`,borderRadius:20,padding:"2px 8px",fontFamily:"Nunito",fontSize:10,fontWeight:800,whiteSpace:"nowrap"}}>{kindEmoji} {entry.for_child}</span>}
          <span style={{display:"inline-flex",alignItems:"center",gap:4,background:fach.color+"15",color:fach.color,border:`1.5px solid ${fach.color}30`,borderRadius:20,padding:"3px 10px",fontFamily:"Nunito",fontSize:11,fontWeight:700}}>
            {fach.emoji} {fach.label}
            {entry.course&&<span style={{background:COURSE_BG[entry.course]||T.mid,color:"#fff",borderRadius:6,padding:"1px 6px",fontSize:9,fontWeight:900}}>{courseSystem==="EG"?entry.course+"-K.":"K."+entry.course}</span>}
          </span>
          {entry.priority==="wichtig"&&<span style={{background:"#FF8C0018",color:"#FF8C00",border:"1.5px solid #FF8C0030",borderRadius:20,padding:"2px 8px",fontFamily:"Nunito",fontSize:10,fontWeight:700}}>🔴 Wichtig</span>}
          {entry.priority==="klassenarbeit"&&<span style={{background:"#FF6B6B18",color:T.coral,border:`1.5px solid ${T.coral}30`,borderRadius:20,padding:"2px 8px",fontFamily:"Nunito",fontSize:10,fontWeight:700}}>📝 Klassenarbeit</span>}
        </div>
        {dueText&&<span style={{fontFamily:"Nunito",fontSize:11,fontWeight:700,flexShrink:0,color:["Morgen","Heute","Überfällig"].some(x=>dueText.includes(x))?"#FF8C00":T.muted,background:["Morgen","Heute","Überfällig"].some(x=>dueText.includes(x))?"#FFF8F0":T.light,borderRadius:10,padding:"2px 8px"}}>{dueText}</span>}
      </div>
      <p style={{fontFamily:"Nunito",fontSize:14,color:T.text,margin:"0 0 12px",lineHeight:1.6,fontWeight:600}}>{entry.text}</p>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Avatar initial={(entry.author_name||"?")[0]} size={26}/>
          <span style={{fontFamily:"Nunito",fontSize:11,color:T.muted,fontWeight:600}}>{entry.author_name}</span>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>!isMyEntry&&onToggleConfirm(entry.id)} disabled={isMyEntry} style={{background:iConfirmed?"#4ECDC420":"#F0F0F0",border:`1.5px solid ${iConfirmed?"#4ECDC4":"#E0E0E0"}`,borderRadius:20,padding:"4px 10px",cursor:isMyEntry?"default":"pointer",fontFamily:"Nunito",fontSize:11,fontWeight:700,color:iConfirmed?"#4ECDC4":"#888",opacity:isMyEntry?0.5:1,transition:"all 0.15s"}}>✓ {entry.confirm_count||0}</button>
          <button onClick={handleOpenComments} style={{background:"#F0F0F0",border:"none",borderRadius:20,padding:"4px 10px",cursor:"pointer",fontFamily:"Nunito",fontSize:11,fontWeight:700,color:T.muted}}>💬 {entry.comment_count||0}</button>
        </div>
      </div>
      {commentsOpen&&(
        <div style={{marginTop:12,borderTop:`1px solid ${T.border}`,paddingTop:12}}>
          {!loaded?<div style={{display:"flex",justifyContent:"center",padding:8}}><Spinner/></div>:comments.map(c=>(
            <div key={c.id} style={{display:"flex",gap:8,marginBottom:8}}>
              <Avatar initial={(c.author_name||"?")[0]} size={24}/>
              <div style={{background:"#F8F8F8",borderRadius:12,padding:"6px 10px",flex:1}}>
                <div style={{fontFamily:"Nunito",fontSize:11,fontWeight:700,color:"#555",marginBottom:2}}>{c.author_name} · {new Date(c.created_at).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}</div>
                <div style={{fontFamily:"Nunito",fontSize:12,color:T.text}}>{c.text}</div>
              </div>
            </div>
          ))}
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Kommentar…" onKeyDown={e=>e.key==="Enter"&&handleComment()} style={{flex:1,border:`1.5px solid ${T.border}`,borderRadius:20,padding:"6px 12px",fontFamily:"Nunito",fontSize:12,outline:"none"}}/>
            <button onClick={handleComment} disabled={adding||!commentText.trim()} style={{background:T.teal,border:"none",borderRadius:20,color:"#fff",fontFamily:"Nunito",fontWeight:700,padding:"6px 12px",cursor:"pointer"}}>{adding?<Spinner size={14}/>:"→"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add Entry Modal ──────────────────────────────────────────
function AddModal({group,kinder,myName,onClose,onAdded}){
  const [selKind,setSelKind]=useState(kinder.length===1?0:null);
  const [subject,setSubject]=useState("mathe");
  const [course,setCourse]=useState(null);
  const [text,setText]=useState("");
  const [dueDate,setDueDate]=useState("");
  const [priority,setPriority]=useState("normal");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const cs=group.course_system;
  const csubs=group.course_subjects||[];
  const showCourse=cs&&cs!=="none"&&csubs.includes(subject);
  const courseOpts=cs==="EG"?[{k:"E",l:"E-Kurs"},{k:"G",l:"G-Kurs"}]:[{k:"A",l:"Kurs A"},{k:"B",l:"Kurs B"},{k:"C",l:"Kurs C"}];

  const handleAdd=async()=>{
    if(!text.trim())return;
    setLoading(true);setError("");
    try{
      const e=await createEntry({group_id:group.id,subject,course:showCourse?course:null,text:text.trim(),due_date:dueDate||null,priority,author_name:myName,for_child:selKind!==null?kinder[selKind]?.name:null});
      onAdded(e);onClose();
    }catch(e){setError(e.message||"Fehler");setLoading(false);}
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000,backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div style={{background:T.white,borderRadius:"24px 24px 0 0",padding:"24px 20px 48px",width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",animation:"slideUp 0.3s ease"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
          <div style={{fontFamily:"Caveat",fontSize:24,fontWeight:700,color:T.text}}>📚 Hausaufgabe eintragen</div>
          <button onClick={onClose} style={{background:"#F0F0F0",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:16}}>×</button>
        </div>
        {error&&<div style={{padding:"10px 14px",background:"#FFF0F0",borderRadius:12,fontFamily:"Nunito",fontSize:13,color:T.coral,marginBottom:12}}>{error}</div>}
        {kinder.length>1&&(
          <div style={{marginBottom:16}}>
            <div style={{fontFamily:"Nunito",fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.07em",marginBottom:8}}>FÜR WELCHES KIND?</div>
            <div style={{display:"flex",gap:8}}>
              {kinder.map((k,i)=>{const col=KINDER_COLORS[i%KINDER_COLORS.length];const emoji=KINDER_EMOJIS[i%KINDER_EMOJIS.length];return(
                <button key={i} onClick={()=>setSelKind(selKind===i?null:i)} style={{flex:1,padding:"10px 6px",borderRadius:14,border:"none",background:selKind===i?col.color:col.bg,cursor:"pointer",transition:"all 0.15s",boxShadow:selKind===i?`0 3px 10px ${col.color}40`:"none"}}>
                  <div style={{fontSize:22,marginBottom:4}}>{emoji}</div>
                  <div style={{fontFamily:"Nunito",fontWeight:800,fontSize:12,color:selKind===i?"#fff":col.color}}>{k.name}</div>
                </button>
              );})}
            </div>
          </div>
        )}
        <div style={{marginBottom:14}}>
          <div style={{fontFamily:"Nunito",fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.07em",marginBottom:8}}>FACH</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {Object.entries(FAECHER).map(([id,f])=>(
              <button key={id} onClick={()=>{setSubject(id);setCourse(null);}} style={{background:subject===id?f.color:f.bg,border:`2px solid ${f.color}`,borderRadius:20,padding:"5px 12px",fontFamily:"Nunito",fontSize:12,fontWeight:700,color:subject===id?"#fff":f.color,cursor:"pointer"}}>{f.emoji} {f.label}</button>
            ))}
          </div>
        </div>
        {showCourse&&(
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:"Nunito",fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.07em",marginBottom:8}}>KURS</div>
            <div style={{display:"flex",gap:8}}>
              {courseOpts.map(o=>(
                <button key={o.k} onClick={()=>setCourse(course===o.k?null:o.k)} style={{flex:1,padding:"10px",borderRadius:12,border:"none",background:course===o.k?T.dark:"#F0F4F8",cursor:"pointer",transition:"all 0.15s",boxShadow:course===o.k?"0 3px 10px rgba(26,26,46,0.25)":"none"}}>
                  <div style={{fontFamily:"Nunito",fontWeight:900,fontSize:14,color:course===o.k?"#fff":T.muted}}>{o.l}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Was müssen die Kinder machen?" style={{width:"100%",minHeight:80,border:`2px solid ${T.border}`,borderRadius:14,padding:"10px 14px",fontFamily:"Nunito",fontSize:14,outline:"none",resize:"vertical",marginBottom:12}}/>
        <div style={{display:"flex",gap:10,marginBottom:20}}>
          <div style={{flex:1}}>
            <div style={{fontFamily:"Nunito",fontSize:11,fontWeight:700,color:T.muted,marginBottom:6}}>ABGABE</div>
            <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} style={{width:"100%",padding:"10px",borderRadius:10,border:`2px solid ${T.border}`,fontFamily:"Nunito",fontSize:13,outline:"none",background:T.white}}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"Nunito",fontSize:11,fontWeight:700,color:T.muted,marginBottom:6}}>PRIORITÄT</div>
            <select value={priority} onChange={e=>setPriority(e.target.value)} style={{width:"100%",padding:"10px",borderRadius:10,border:`2px solid ${T.border}`,fontFamily:"Nunito",fontSize:13,outline:"none",background:T.white}}>
              <option value="normal">Normal</option>
              <option value="wichtig">Wichtig</option>
              <option value="klassenarbeit">Klassenarbeit</option>
            </select>
          </div>
        </div>
        <Btn onClick={handleAdd} disabled={loading||!text.trim()||(showCourse&&!course)}>
          {loading?"Wird eingetragen…":"✓ Eintragen & Streak sichern 🔥"}
        </Btn>
      </div>
    </div>
  );
}

// ─── Events ───────────────────────────────────────────────────
function EventsTab({group,myName}){
  const [events,setEvents]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showAdd,setShowAdd]=useState(false);
  const [title,setTitle]=useState(""); const [date,setDate]=useState(""); const [type,setType]=useState("sonstiges"); const [saving,setSaving]=useState(false);
  useEffect(()=>{getEvents(group.id).then(e=>{setEvents(e);setLoading(false);}).catch(()=>setLoading(false));},[group.id]);
  const handleAdd=async()=>{if(!title.trim()||!date)return;setSaving(true);try{const e=await createEvent({group_id:group.id,title,event_date:date,type,author_name:myName});setEvents(p=>[...p,e].sort((a,b)=>new Date(a.event_date)-new Date(b.event_date)));setTitle("");setDate("");setShowAdd(false);}finally{setSaving(false);}};
  return(
    <div style={{padding:"0 16px"}}>
      {loading?<div style={{display:"flex",justifyContent:"center",padding:40}}><Spinner size={32}/></div>:events.length===0&&!showAdd?(
        <div style={{textAlign:"center",padding:40}}>
          <div style={{fontSize:40,marginBottom:12}}>📅</div>
          <div style={{fontFamily:"Caveat",fontSize:20,color:T.muted}}>Noch keine Termine</div>
          <button onClick={()=>setShowAdd(true)} style={{marginTop:16,padding:"10px 20px",borderRadius:14,border:"none",background:grad,color:"#fff",fontFamily:"Nunito",fontWeight:700,fontSize:14,cursor:"pointer"}}>+ Termin eintragen</button>
        </div>
      ):(
        <>
          {events.map(e=>{const et=EVENT_TYPES[e.type]||EVENT_TYPES.sonstiges;const d=new Date(e.event_date);return(
            <div key={e.id} style={{background:T.white,borderRadius:16,padding:"14px 16px",marginBottom:10,boxShadow:"0 2px 10px rgba(0,0,0,0.07)",borderLeft:`3px solid ${et.color}`}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <div style={{width:46,height:46,borderRadius:12,background:et.color+"18",flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                  <div style={{fontFamily:"Nunito",fontWeight:900,fontSize:16,color:et.color,lineHeight:1}}>{d.getDate()}</div>
                  <div style={{fontFamily:"Nunito",fontSize:9,fontWeight:700,color:et.color}}>{d.toLocaleString("de-DE",{month:"short"}).toUpperCase()}</div>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"Nunito",fontWeight:800,fontSize:14,color:T.text,marginBottom:4}}>{e.title}</div>
                  <span style={{background:et.color+"15",color:et.color,borderRadius:20,padding:"1px 8px",fontFamily:"Nunito",fontSize:10,fontWeight:700}}>{et.emoji} {et.label}</span>
                </div>
              </div>
            </div>
          );})}
          <button onClick={()=>setShowAdd(!showAdd)} style={{width:"100%",padding:"12px",borderRadius:14,marginTop:4,border:`2px dashed ${T.border}`,background:"transparent",fontFamily:"Nunito",fontSize:14,fontWeight:700,color:T.muted,cursor:"pointer"}}>+ Termin eintragen</button>
        </>
      )}
      {showAdd&&(
        <div style={{background:T.white,borderRadius:20,padding:20,boxShadow:"0 3px 16px rgba(0,0,0,0.07)",marginTop:12}}>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="z.B. Elternabend…" style={{width:"100%",padding:"11px 14px",borderRadius:12,border:`2px solid ${T.border}`,fontFamily:"Nunito",fontSize:14,fontWeight:600,outline:"none",marginBottom:10}}/>
          <div style={{display:"flex",gap:10,marginBottom:12}}>
            <input type="datetime-local" value={date} onChange={e=>setDate(e.target.value)} style={{flex:1,padding:"10px",borderRadius:10,border:`2px solid ${T.border}`,fontFamily:"Nunito",fontSize:13,outline:"none",background:T.white}}/>
            <select value={type} onChange={e=>setType(e.target.value)} style={{flex:1,padding:"10px",borderRadius:10,border:`2px solid ${T.border}`,fontFamily:"Nunito",fontSize:13,outline:"none",background:T.white}}>
              {Object.entries(EVENT_TYPES).map(([id,et])=><option key={id} value={id}>{et.emoji} {et.label}</option>)}
            </select>
          </div>
          <Btn onClick={handleAdd} disabled={saving||!title.trim()||!date}>{saving?"Wird gespeichert…":"Termin speichern"}</Btn>
        </div>
      )}
    </div>
  );
}

// ─── Klassenkasse ─────────────────────────────────────────────
function FundsTab({group,myName,userId}){
  const [colls,setColls]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showAdd,setShowAdd]=useState(false);
  const [title,setTitle]=useState(""); const [amount,setAmount]=useState(""); const [saving,setSaving]=useState(false);
  useEffect(()=>{getFundCollections(group.id).then(c=>{setColls(c);setLoading(false);}).catch(()=>setLoading(false));},[group.id]);
  const handleAdd=async()=>{if(!title.trim())return;setSaving(true);try{const c=await createFundCollection({group_id:group.id,title,amount_per_family:amount?parseFloat(amount):null,author_name:myName});setColls(p=>[c,...p]);setTitle("");setAmount("");setShowAdd(false);}finally{setSaving(false);}};
  return(
    <div style={{padding:"0 16px"}}>
      {loading?<div style={{display:"flex",justifyContent:"center",padding:40}}><Spinner size={32}/></div>:colls.length===0&&!showAdd?(
        <div style={{textAlign:"center",padding:40}}>
          <div style={{fontSize:40,marginBottom:12}}>💰</div>
          <div style={{fontFamily:"Caveat",fontSize:20,color:T.muted}}>Noch keine Sammlungen</div>
          <button onClick={()=>setShowAdd(true)} style={{marginTop:16,padding:"10px 20px",borderRadius:14,border:"none",background:grad,color:"#fff",fontFamily:"Nunito",fontWeight:700,fontSize:14,cursor:"pointer"}}>+ Sammlung anlegen</button>
        </div>
      ):(
        <>
          {colls.map(c=>{const paid=(c.pledges||[]).filter(p=>p.status==="paid").length;const pledged=(c.pledges||[]).length;const mine=(c.pledges||[]).find(p=>p.user_id===userId);return(
            <div key={c.id} style={{background:T.white,borderRadius:20,padding:18,marginBottom:12,boxShadow:"0 2px 14px rgba(0,0,0,0.07)"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <div style={{fontFamily:"Nunito",fontWeight:800,fontSize:14,color:T.text}}>{c.title}</div>
                {c.amount_per_family&&<span style={{fontFamily:"Nunito",fontWeight:800,fontSize:14,color:"#4ECDC4"}}>{c.amount_per_family}€</span>}
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:12}}>
                <div style={{flex:1,height:6,borderRadius:3,background:"#F0F0F0",overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:3,background:"#4ECDC4",width:pledged>0?`${(paid/pledged)*100}%`:"0%",transition:"width 0.5s"}}/>
                </div>
                <span style={{fontFamily:"Nunito",fontSize:11,color:T.muted,whiteSpace:"nowrap"}}>{paid}/{pledged} bezahlt</span>
              </div>
              {!mine?<button style={{padding:"8px 16px",borderRadius:12,border:"none",background:grad,color:"#fff",fontFamily:"Nunito",fontSize:12,fontWeight:700,cursor:"pointer"}}>Ich zahle ✓</button>:<span style={{fontFamily:"Nunito",fontSize:12,fontWeight:700,color:mine.status==="paid"?"#4ECDC4":"#FFB347",background:mine.status==="paid"?"#F0FFFE":"#FFF8F0",borderRadius:20,padding:"4px 12px",border:`1.5px solid ${mine.status==="paid"?"#4ECDC430":"#FFB34730"}`}}>{mine.status==="paid"?"✓ Bezahlt":"⏳ Zugesagt"}</span>}
            </div>
          );})}
          <button onClick={()=>setShowAdd(!showAdd)} style={{width:"100%",padding:"12px",borderRadius:14,marginTop:4,border:`2px dashed ${T.border}`,background:"transparent",fontFamily:"Nunito",fontSize:14,fontWeight:700,color:T.muted,cursor:"pointer"}}>+ Sammlung anlegen</button>
        </>
      )}
      {showAdd&&(
        <div style={{background:T.white,borderRadius:20,padding:20,boxShadow:"0 3px 16px rgba(0,0,0,0.07)",marginTop:12}}>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="z.B. Theaterbesuch…" style={{width:"100%",padding:"11px 14px",borderRadius:12,border:`2px solid ${T.border}`,fontFamily:"Nunito",fontSize:14,fontWeight:600,outline:"none",marginBottom:10}}/>
          <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:14}}>
            <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Betrag pro Familie (optional)" style={{flex:1,padding:"10px",borderRadius:10,border:`2px solid ${T.border}`,fontFamily:"Nunito",fontSize:13,outline:"none"}}/>
            <span style={{fontFamily:"Nunito",fontWeight:700,color:T.muted}}>€</span>
          </div>
          <Btn onClick={handleAdd} disabled={saving||!title.trim()}>{saving?"Wird gespeichert…":"Sammlung anlegen"}</Btn>
        </div>
      )}
    </div>
  );
}

// ─── Root Feed ────────────────────────────────────────────────
export default function Feed({user,membership,onLogout}){
  const {group:groupData,member}=membership;
  const [group,setGroup]=useState(groupData);
  const [entries,setEntries]=useState([]);
  const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState("feed");
  const [activeKind,setActiveKind]=useState(null);
  const [activeFach,setActiveFach]=useState(null);
  const [showAdd,setShowAdd]=useState(false);

  const kinder=member?.children||[];
  const myName=member?.display_name||user?.email||"Elternteil";
  const myUserId=user?.id;
  const streak=member?.streak_days||0;
  const needsCourseSetup=group&&!group.course_system&&member?.is_admin;

  const loadEntries=useCallback(async()=>{if(!group)return;setLoading(true);try{const d=await getEntries(group.id);setEntries(d);}finally{setLoading(false);};},[group?.id]);
  useEffect(()=>{loadEntries();},[loadEntries]);

  const handleToggle=async(entryId)=>{try{await toggleConfirmation(entryId,myName);setEntries(prev=>prev.map(e=>{if(e.id!==entryId)return e;const cb=e.confirmed_by||[];const already=cb.some(c=>c.user_id===myUserId);return{...e,confirm_count:already?e.confirm_count-1:e.confirm_count+1,confirmed_by:already?cb.filter(c=>c.user_id!==myUserId):[...cb,{user_id:myUserId,user_name:myName}]};}));}catch(e){console.error(e);}};

  const filtered=entries.filter(e=>{if(activeKind!==null&&e.for_child!==kinder[activeKind]?.name)return false;if(activeFach&&e.subject!==activeFach)return false;return true;}).sort((a,b)=>{if(a.priority==="wichtig"&&b.priority!=="wichtig")return -1;if(b.priority==="wichtig"&&a.priority!=="wichtig")return 1;return new Date(b.created_at)-new Date(a.created_at);});

  if(needsCourseSetup)return <CourseSetup group={group} onDone={g=>setGroup(g)}/>;

  return(
    <div style={{minHeight:"100dvh",background:"#F5F7FA",maxWidth:480,margin:"0 auto",paddingBottom:80}}>
      {/* Header */}
      <div style={{background:grad,padding:"20px 20px 24px",position:"sticky",top:0,zIndex:100,boxShadow:"0 4px 20px rgba(69,183,209,0.25)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontFamily:"Caveat",fontSize:26,color:"#fff",fontWeight:700}}>Hausaufgaben 📚</div>
            <div style={{fontFamily:"Nunito",fontSize:12,color:"rgba(255,255,255,0.8)",marginTop:2}}>{group?.school_name||""} · Kl. {group?.grade}{group?.section||""}</div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {kinder.map((k,i)=>{const col=KINDER_COLORS[i%KINDER_COLORS.length];const emoji=KINDER_EMOJIS[i%KINDER_EMOJIS.length];const active=activeKind===i;return(
              <button key={i} onClick={()=>setActiveKind(active?null:i)} style={{width:36,height:36,borderRadius:"50%",border:"none",background:active?col.color:"rgba(255,255,255,0.25)",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",boxShadow:active?`0 2px 10px ${col.color}60`:"none"}}>{emoji}</button>
            );})}
            <div style={{display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.2)",borderRadius:20,padding:"5px 10px"}}>
              <span>🔥</span><span style={{fontFamily:"Nunito",fontWeight:800,fontSize:12,color:"#fff"}}>{streak}</span>
            </div>
          </div>
        </div>
      </div>

      {member?.status==="pending"&&(
        <div style={{margin:"12px 16px 0",padding:"12px 14px",background:"#FFF8F0",borderRadius:14,border:"1.5px solid #FFB34730",fontFamily:"Nunito",fontSize:12,color:"#92400E",lineHeight:1.5}}>
          ⏳ <strong>Noch nicht bestätigt.</strong> Warte bis 2 andere Eltern dich bestätigen – dann kannst du selbst eintragen.
        </div>
      )}

      {/* Feed */}
      {tab==="feed"&&(
        <>
          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(kinder.length+1,4)},1fr)`,gap:10,padding:"12px 16px 0"}}>
            {kinder.map((k,i)=>{const col=KINDER_COLORS[i%KINDER_COLORS.length];const emoji=KINDER_EMOJIS[i%KINDER_EMOJIS.length];const count=entries.filter(e=>e.for_child===k.name).length;return(
              <div key={i} style={{background:T.white,borderRadius:16,padding:"12px 10px",textAlign:"center",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",borderTop:`3px solid ${col.color}`}}>
                <div style={{fontSize:18,marginBottom:2}}>{emoji}</div>
                <div style={{fontFamily:"Nunito",fontWeight:900,fontSize:20,color:col.color}}>{count}</div>
                <div style={{fontFamily:"Nunito",fontSize:10,color:T.muted,fontWeight:600}}>{k.name}</div>
              </div>
            );})}
            <div style={{background:T.white,borderRadius:16,padding:"12px 10px",textAlign:"center",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",borderTop:`3px solid ${T.teal}`}}>
              <div style={{fontSize:18,marginBottom:2}}>🔥</div>
              <div style={{fontFamily:"Nunito",fontWeight:900,fontSize:20,color:T.teal}}>{streak}</div>
              <div style={{fontFamily:"Nunito",fontSize:10,color:T.muted,fontWeight:600}}>Streak</div>
            </div>
          </div>
          {/* Filter */}
          <div style={{display:"flex",gap:6,overflowX:"auto",padding:"10px 16px 6px"}}>
            <button onClick={()=>setActiveFach(null)} style={{padding:"5px 12px",borderRadius:20,whiteSpace:"nowrap",border:`1.5px solid ${!activeFach?T.teal:T.border}`,background:!activeFach?T.teal:T.white,color:!activeFach?"#fff":T.muted,fontFamily:"Nunito",fontSize:11,fontWeight:700,cursor:"pointer"}}>Alle</button>
            {Object.entries(FAECHER).map(([id,f])=>(
              <button key={id} onClick={()=>setActiveFach(activeFach===id?null:id)} style={{padding:"5px 10px",borderRadius:20,whiteSpace:"nowrap",border:`1.5px solid ${f.color}`,background:activeFach===id?f.color:f.color+"15",color:activeFach===id?"#fff":f.color,fontFamily:"Nunito",fontSize:11,fontWeight:700,cursor:"pointer"}}>{f.emoji} {f.label}</button>
            ))}
          </div>
          {/* Entries */}
          <div style={{padding:"0 16px"}}>
            {loading?<div style={{display:"flex",justifyContent:"center",padding:40}}><Spinner size={32}/></div>:filtered.length===0?<div style={{textAlign:"center",padding:40}}><div style={{fontFamily:"Caveat",fontSize:20,color:T.muted}}>{entries.length===0?"📭 Noch keine Einträge – sei der Erste!":"📭 Keine Einträge für diese Auswahl"}</div></div>:filtered.map(e=>(
              <EntryCard key={e.id} entry={e} kinder={kinder} myUserId={myUserId} myName={myName} courseSystem={group?.course_system} onToggleConfirm={handleToggle}/>
            ))}
          </div>
        </>
      )}

      {tab==="events"&&<div style={{paddingTop:12}}><EventsTab group={group} myName={myName}/></div>}
      {tab==="funds"&&<div style={{paddingTop:12}}><FundsTab group={group} myName={myName} userId={myUserId}/></div>}
      {tab==="settings"&&(
        <div style={{padding:"12px 16px 0"}}>
          <div style={{background:T.white,borderRadius:20,padding:20,boxShadow:"0 2px 12px rgba(0,0,0,0.07)"}}>
            <div style={{fontFamily:"Nunito",fontWeight:800,fontSize:14,color:T.text,marginBottom:4}}>Eingeloggt als</div>
            <div style={{fontFamily:"Nunito",fontSize:14,color:T.mid,marginBottom:2}}>{myName}</div>
            <div style={{fontFamily:"Nunito",fontSize:12,color:T.muted,marginBottom:20}}>{user?.email}</div>
            <div style={{fontFamily:"Nunito",fontWeight:800,fontSize:13,color:T.text,marginBottom:8}}>Kinder</div>
            {kinder.map((k,i)=>{const col=KINDER_COLORS[i%KINDER_COLORS.length];const emoji=KINDER_EMOJIS[i%KINDER_EMOJIS.length];return(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:i<kinder.length-1?`1px solid ${T.border}`:"none"}}>
                <span style={{fontSize:18}}>{emoji}</span>
                <span style={{fontFamily:"Nunito",fontSize:13,fontWeight:700,color:col.color}}>{k.name}</span>
              </div>
            );})}
            <div style={{marginTop:20}}>
              <button onClick={onLogout} style={{width:"100%",padding:"12px",borderRadius:14,border:`2px solid ${T.coral}`,background:"#FFF0F0",fontFamily:"Nunito",fontWeight:700,fontSize:14,color:T.coral,cursor:"pointer"}}>Abmelden</button>
            </div>
          </div>
        </div>
      )}

      {tab==="feed"&&member?.status==="active"&&(
        <button onClick={()=>setShowAdd(true)} style={{position:"fixed",bottom:90,right:"calc(50% - 220px)",width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,#FF6B6B,#FF4500)",border:"none",color:"#fff",fontSize:28,cursor:"pointer",boxShadow:"0 6px 24px rgba(255,107,107,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>+</button>
      )}

      <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:T.white,borderTop:"1px solid #F0F0F0",display:"flex",boxShadow:"0 -4px 20px rgba(0,0,0,0.08)",zIndex:300}}>
        {[{id:"feed",icon:"📋",label:"Feed"},{id:"events",icon:"📅",label:"Termine"},{id:"funds",icon:"💰",label:"Kasse"},{id:"settings",icon:"⚙️",label:"Konto"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"12px 0 8px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,borderTop:`3px solid ${tab===t.id?T.teal:"transparent"}`,transition:"border-color 0.15s ease"}}>
            <span style={{fontSize:18}}>{t.icon}</span>
            <span style={{fontFamily:"Nunito",fontSize:10,fontWeight:700,color:tab===t.id?T.teal:"#AAA"}}>{t.label}</span>
          </button>
        ))}
      </nav>

      {showAdd&&<AddModal group={group} kinder={kinder} myName={myName} onClose={()=>setShowAdd(false)} onAdded={e=>setEntries(p=>[{...e,confirmed_by:[],...p}])}/>}
    </div>
  );
}
