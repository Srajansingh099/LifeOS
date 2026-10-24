import { useState, useEffect, useCallback } from "react";
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Cell, PieChart, Pie,
} from "recharts";

// ─── Theme System ─────────────────────────────────────────────────────────────
const THEMES = {
  light: {
    bg: "linear-gradient(135deg,#EFF6FF 0%,#F0FDF4 50%,#F5F3FF 100%)",
    headerBg: "rgba(255,255,255,0.88)",
    headerBorder: "rgba(255,255,255,0.7)",
    cardBg: "rgba(255,255,255,0.75)",
    cardBorder: "rgba(255,255,255,0.65)",
    navInactive: "rgba(255,255,255,0.8)",
    navInactiveBorder: "rgba(200,210,230,0.6)",
    navInactiveText: "#374151",
    text: "#1E293B",
    textMuted: "#6B7280",
    textSub: "#334155",
    gridStroke: "#E5E7EB",
    trackBg: "#E5E7EB",
    inputBg: "#fff",
    inputBorder: "#E5E7EB",
    heatLow: "#DBEAFE",
    heatMid: "#BFDBFE",
    heatHigh: "#93C5FD",
    heatTop: "#3B82F6",
    insightBg: (c) => `${c}10`,
  },
  dark: {
    bg: "linear-gradient(135deg,#0F172A 0%,#0D1F17 50%,#130F23 100%)",
    headerBg: "rgba(15,23,42,0.92)",
    headerBorder: "rgba(255,255,255,0.08)",
    cardBg: "rgba(30,41,59,0.85)",
    cardBorder: "rgba(255,255,255,0.08)",
    navInactive: "rgba(30,41,59,0.7)",
    navInactiveBorder: "rgba(255,255,255,0.1)",
    navInactiveText: "#94A3B8",
    text: "#F1F5F9",
    textMuted: "#94A3B8",
    textSub: "#CBD5E1",
    gridStroke: "#1E293B",
    trackBg: "#1E293B",
    inputBg: "#1E293B",
    inputBorder: "#334155",
    heatLow: "#1E3A5F",
    heatMid: "#1E4D8C",
    heatHigh: "#2563EB",
    heatTop: "#3B82F6",
    insightBg: (c) => `${c}18`,
  },
};

// ─── Accent colors (same in both themes) ─────────────────────────────────────
const C = {
  blue: "#3B82F6", blueLight: "#93C5FD",
  green: "#10B981", greenLight: "#6EE7B7",
  teal: "#14B8A6", tealLight: "#5EEAD4",
  purple: "#8B5CF6", purpleLight: "#C4B5FD",
  amber: "#F59E0B", amberLight: "#FCD34D",
  red: "#EF4444", redLight: "#FCA5A5",
};

// ─── Seed Data ────────────────────────────────────────────────────────────────
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function genWeeklyData() {
  return DAYS.map(() => ({
    day: DAYS[Math.floor(Math.random()*7)],
    mood: 5 + Math.round(Math.random() * 4),
    sleep: +(5.5 + Math.round(Math.random() * 30) / 10).toFixed(1),
    energy: 5 + Math.round(Math.random() * 4),
    stress: 3 + Math.round(Math.random() * 5),
    productivity: 50 + Math.round(Math.random() * 40),
    steps: 4000 + Math.round(Math.random() * 8000),
    water: +(1.5 + Math.round(Math.random() * 20) / 10).toFixed(1),
    workout: Math.random() > 0.4,
  })).map((d, i) => ({ ...d, day: DAYS[i] }));
}

function genMonthlyMood() {
  return Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    mood: 4 + Math.round(Math.random() * 5),
    energy: 4 + Math.round(Math.random() * 5),
    stress: 2 + Math.round(Math.random() * 6),
  }));
}

const WEEKLY_SEED = genWeeklyData();
const MONTHLY_SEED = genMonthlyMood();

const HABITS_INIT = [
  { id: 1, name: "Reading",    icon: "📚", streak: 5, xp: 15, completedDays: [true,true,false,true,true,true,false] },
  { id: 2, name: "Gym",        icon: "🏋️", streak: 3, xp: 25, completedDays: [false,true,true,false,true,true,false] },
  { id: 3, name: "Meditation", icon: "🧘", streak: 7, xp: 20, completedDays: [true,true,true,true,true,true,true] },
  { id: 4, name: "Coding",     icon: "💻", streak: 4, xp: 20, completedDays: [true,false,true,true,false,true,true] },
  { id: 5, name: "Walking",    icon: "🚶", streak: 2, xp: 10, completedDays: [true,true,false,false,true,false,true] },
];

const JOURNAL_INIT = [
  { id: 1, date: "2025-01-14", title: "Productive day",    entry: "Had a great deep work session. Finished the main feature. Felt energetic and focused throughout the day.", sentiment: "positive" },
  { id: 2, date: "2025-01-13", title: "Tired but grateful", entry: "Woke up exhausted but managed to complete my tasks. Grateful for small wins. Need more sleep tonight.", sentiment: "mixed" },
  { id: 3, date: "2025-01-12", title: "Feeling anxious",   entry: "Lots of meetings and deadlines. Felt stressed and scattered. Meditation helped a little.", sentiment: "negative" },
];

// ─── Utils ────────────────────────────────────────────────────────────────────
function avg(arr, key) {
  if (!arr.length) return 0;
  return +(arr.reduce((s, x) => s + (key ? x[key] : x), 0) / arr.length).toFixed(1);
}
function pct(val, max) { return Math.min(100, Math.round((val / max) * 100)); }
function analyzeSentiment(text) {
  const pos = ["great","good","happy","excited","productive","energetic","grateful","fantastic","wonderful","love","enjoyed"];
  const neg = ["tired","anxious","stressed","exhausted","difficult","bad","sad","lonely","frustrated","overwhelmed"];
  const words = text.toLowerCase().split(/\s+/);
  const p = words.filter(w => pos.includes(w)).length;
  const n = words.filter(w => neg.includes(w)).length;
  return p > n ? "positive" : n > p ? "negative" : "mixed";
}

// ─── Shared UI Components ─────────────────────────────────────────────────────
function GlassCard({ children, style = {}, T }) {
  return (
    <div style={{
      background: T.cardBg,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderRadius: 16,
      border: `1px solid ${T.cardBorder}`,
      boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      padding: "1.25rem",
      ...style,
    }}>
      {children}
    </div>
  );
}

function ScoreRing({ value, max = 10, size = 80, color, label, T }) {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const dash = (value / max) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.trackBg} strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} />
        <text x={size/2} y={size/2+5} textAnchor="middle" fontSize={14} fontWeight={600} fill={color}>{value}</text>
      </svg>
      <span style={{ fontSize: 11, color: T.textMuted, textAlign: "center", fontWeight: 500 }}>{label}</span>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color = C.blue, T }) {
  return (
    <GlassCard T={T} style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:20 }}>{icon}</span>
        <span style={{ fontSize:12, color:T.textMuted, fontWeight:500 }}>{label}</span>
      </div>
      <div style={{ fontSize:26, fontWeight:700, color }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:T.textMuted }}>{sub}</div>}
    </GlassCard>
  );
}

function ProgressBar({ value, max=100, color=C.blue, height=8, T }) {
  return (
    <div style={{ background:T.trackBg, borderRadius:99, height, overflow:"hidden" }}>
      <div style={{ width:`${pct(value,max)}%`, height:"100%", background:color, borderRadius:99, transition:"width .4s ease" }} />
    </div>
  );
}

function SliderInput({ label, value, onChange, min=1, max=10, color=C.blue, unit="/10", T }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
        <span style={{ color:T.textMuted }}>{label}</span>
        <span style={{ fontWeight:600, color }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={1} value={value}
        onChange={e => onChange(+e.target.value)}
        style={{ width:"100%", accentColor:color, cursor:"pointer" }} />
    </div>
  );
}

function SectionHeader({ icon, title, sub, T }) {
  return (
    <div style={{ marginBottom:"1rem" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:20 }}>{icon}</span>
        <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:T.text }}>{title}</h2>
      </div>
      {sub && <p style={{ margin:"4px 0 0 28px", fontSize:13, color:T.textMuted }}>{sub}</p>}
    </div>
  );
}

function SaveToast({ msg }) {
  return msg ? (
    <div style={{ position:"fixed", bottom:24, right:24, background:C.green, color:"#fff",
      padding:"10px 18px", borderRadius:12, fontSize:13, fontWeight:600,
      boxShadow:"0 4px 20px rgba(16,185,129,0.4)", zIndex:9999, animation:"fadeIn .2s ease" }}>
      ✓ {msg}
    </div>
  ) : null;
}

function Chip({ label, active, onClick, color = C.blue }) {
  return (
    <button onClick={onClick}
      style={{ padding:"4px 12px", borderRadius:99, fontSize:12, cursor:"pointer", fontWeight:500,
        border:"1.5px solid", transition:"all .15s",
        background: active ? color : "transparent",
        borderColor: active ? color : "#94A3B8",
        color: active ? "#fff" : "#64748B" }}>
      {label}
    </button>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ todayLog, habits, T }) {
  const wellnessScore = Math.round(
    (todayLog.mood * 10 + (todayLog.sleep / 9) * 100 + todayLog.energy * 10 + (10 - todayLog.stress) * 10) / 4
  );

  const burnout = (() => {
    let r = 0;
    if (todayLog.sleep < 6) r += 35;
    if (todayLog.stress > 7) r += 35;
    if (todayLog.mood < 4) r += 20;
    if (todayLog.productivity < 40) r += 10;
    if (r < 30) return { level:"Healthy", color:C.green, emoji:"✅", tip:"You're in great shape. Keep up the habits!" };
    if (r < 60) return { level:"Moderate Risk", color:C.amber, emoji:"⚠️", tip:"Prioritize sleep and reduce stressors this week." };
    return { level:"Burnout Risk", color:C.red, emoji:"🔴", tip:"Take a break. Log off early and rest today." };
  })();

  const xpTotal = habits.reduce((s, h) => s + h.completedDays.filter(Boolean).length * h.xp, 0);
  const level = Math.floor(xpTotal / 200) + 1;
  const xpInLevel = xpTotal % 200;

  const weeklyWellness = WEEKLY_SEED.map(d => ({
    day: d.day,
    score: Math.round((d.mood*10 + (d.sleep/9)*100 + d.energy*10 + (10-d.stress)*10) / 4),
  }));

  const insights = [
    { text:"Days with 7h+ sleep show 18% higher productivity", icon:"💡" },
    { text:"Exercise correlates with 23% lower stress scores", icon:"🏃" },
    { text:"Your best mood days follow 2+ L water intake", icon:"💧" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:"1rem" }}>
        <StatCard T={T} icon="💚" label="Wellness Score" value={`${wellnessScore}%`} color={C.green} sub="Today's overall" />
        <StatCard T={T} icon="😊" label="Mood" value={`${todayLog.mood}/10`} color={C.blue} sub="Logged today" />
        <StatCard T={T} icon="⚡" label="Energy" value={`${todayLog.energy}/10`} color={C.amber} sub="Logged today" />
        <StatCard T={T} icon="🧠" label="Focus Score" value={`${todayLog.productivity}%`} color={C.purple} sub="Productivity" />
        <StatCard T={T} icon="😤" label="Stress" value={`${todayLog.stress}/10`} color={todayLog.stress > 7 ? C.red : C.teal} sub="Lower is better" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:"1rem" }}>
        <GlassCard T={T}>
          <SectionHeader T={T} icon="🎯" title="Today's Scores" />
          <div style={{ display:"flex", justifyContent:"space-around", flexWrap:"wrap", gap:"1rem" }}>
            <ScoreRing T={T} value={todayLog.mood} color={C.blue} label="Mood" />
            <ScoreRing T={T} value={todayLog.energy} color={C.amber} label="Energy" />
            <ScoreRing T={T} value={Math.round(todayLog.sleep)} max={9} color={C.teal} label="Sleep (h)" />
            <ScoreRing T={T} value={todayLog.stress} color={todayLog.stress > 7 ? C.red : C.green} label="Stress" />
            <ScoreRing T={T} value={Math.round(todayLog.productivity/10)} color={C.purple} label="Productivity" />
          </div>
        </GlassCard>
        <GlassCard T={T} style={{ display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
          <SectionHeader T={T} icon="🔥" title="Burnout Risk" />
          <div style={{ textAlign:"center", padding:"0.75rem 0" }}>
            <div style={{ fontSize:36 }}>{burnout.emoji}</div>
            <div style={{ fontWeight:700, color:burnout.color, fontSize:16, marginTop:8 }}>{burnout.level}</div>
          </div>
          <div style={{ fontSize:12, color:T.textMuted, lineHeight:1.6 }}>{burnout.tip}</div>
        </GlassCard>
      </div>

      <GlassCard T={T}>
        <SectionHeader T={T} icon="📈" title="Weekly Wellness Trend" sub="Composite score across all tracked metrics" />
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={weeklyWellness}>
            <defs>
              <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.blue} stopOpacity={0.25}/>
                <stop offset="95%" stopColor={C.blue} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{fontSize:11,fill:T.textMuted}} axisLine={false} tickLine={false}/>
            <YAxis domain={[0,100]} tick={{fontSize:11,fill:T.textMuted}} axisLine={false} tickLine={false} width={30}/>
            <Tooltip contentStyle={{background:T.cardBg,border:`1px solid ${T.cardBorder}`,color:T.text}} formatter={v=>[`${v}%`,"Wellness"]}/>
            <Area type="monotone" dataKey="score" stroke={C.blue} fill="url(#wg)" strokeWidth={2} dot={{r:3,fill:C.blue}}/>
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
        <GlassCard T={T}>
          <SectionHeader T={T} icon="🎮" title={`Level ${level} — RPG Progress`} />
          <div style={{ marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:6 }}>
              <span style={{color:T.textMuted}}>XP this level</span>
              <span style={{fontWeight:600,color:C.purple}}>{xpInLevel} / 200 XP</span>
            </div>
            <ProgressBar T={T} value={xpInLevel} max={200} color={C.purple} height={10}/>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {habits.filter(h=>h.completedDays.filter(Boolean).length>=5).map(h=>(
              <span key={h.id} style={{background:`${C.purple}22`,color:C.purple,fontSize:11,padding:"3px 8px",borderRadius:99,fontWeight:500}}>
                {h.icon} {h.name}
              </span>
            ))}
          </div>
        </GlassCard>
        <GlassCard T={T}>
          <SectionHeader T={T} icon="💡" title="Smart Insights" />
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {insights.map((c,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"8px 10px",background:`${C.blue}12`,borderRadius:10,fontSize:12,lineHeight:1.5}}>
                <span>{c.icon}</span><span style={{color:T.textSub}}>{c.text}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ─── MOOD TRACKER ─────────────────────────────────────────────────────────────
function MoodTracker({ todayLog, setTodayLog, T }) {
  const EMOTION_TAGS = ["Happy","Calm","Motivated","Anxious","Lonely","Angry","Tired","Excited"];
  const [tags, setTags] = useState(["Happy","Motivated"]);
  const [toast, setToast] = useState("");

  function toggleTag(e) {
    setTags(t => t.includes(e) ? t.filter(x=>x!==e) : [...t,e]);
  }
  function saveMood() {
    setToast("Mood logged!");
    setTimeout(()=>setToast(""),2500);
  }

  const emotionData = EMOTION_TAGS.map((e,i) => ({ name:e, value: Math.floor(Math.random()*18)+3 }));
  const PIE_COLORS = [C.green,C.teal,C.blue,C.red,C.purple,C.red,C.amber,C.purpleLight];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
      <SaveToast msg={toast}/>
      <SectionHeader T={T} icon="😊" title="Mood Tracker" sub="Log how you're feeling and spot emotional patterns" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
        <GlassCard T={T}>
          <h3 style={{margin:"0 0 1rem",fontSize:15,fontWeight:600,color:T.text}}>Log Today's Mood</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <SliderInput T={T} label="Mood" value={todayLog.mood} onChange={v=>setTodayLog(p=>({...p,mood:v}))} color={C.blue}/>
            <SliderInput T={T} label="Energy" value={todayLog.energy} onChange={v=>setTodayLog(p=>({...p,energy:v}))} color={C.amber}/>
            <SliderInput T={T} label="Stress" value={todayLog.stress} onChange={v=>setTodayLog(p=>({...p,stress:v}))} color={C.red}/>
          </div>
          <div style={{ marginTop:16 }}>
            <div style={{fontSize:13,color:T.textMuted,marginBottom:8}}>Emotion Tags</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {EMOTION_TAGS.map(e=>(
                <Chip key={e} label={e} active={tags.includes(e)} onClick={()=>toggleTag(e)} color={C.blue}/>
              ))}
            </div>
          </div>
          <button onClick={saveMood} style={{marginTop:16,width:"100%",padding:"10px",background:C.blue,color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontWeight:600,fontSize:14}}>
            Save Mood Entry
          </button>
        </GlassCard>
        <GlassCard T={T}>
          <h3 style={{margin:"0 0 1rem",fontSize:15,fontWeight:600,color:T.text}}>Emotion Frequency</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={emotionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name})=>name} labelLine={false}>
                {emotionData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
              </Pie>
              <Tooltip contentStyle={{background:T.cardBg,border:`1px solid ${T.cardBorder}`,color:T.text}}/>
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
      <GlassCard T={T}>
        <h3 style={{margin:"0 0 1rem",fontSize:15,fontWeight:600,color:T.text}}>30-Day Mood Trend</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={MONTHLY_SEED}>
            <XAxis dataKey="day" tick={{fontSize:11,fill:T.textMuted}} axisLine={false} tickLine={false}/>
            <YAxis domain={[0,10]} tick={{fontSize:11,fill:T.textMuted}} axisLine={false} tickLine={false} width={25}/>
            <CartesianGrid strokeDasharray="3 3" stroke={T.gridStroke}/>
            <Tooltip contentStyle={{background:T.cardBg,border:`1px solid ${T.cardBorder}`,color:T.text}}/>
            <Line type="monotone" dataKey="mood" stroke={C.blue} strokeWidth={2} dot={false} name="Mood"/>
            <Line type="monotone" dataKey="energy" stroke={C.amber} strokeWidth={2} dot={false} name="Energy"/>
            <Line type="monotone" dataKey="stress" stroke={C.red} strokeWidth={2} dot={false} name="Stress" strokeDasharray="4 2"/>
            <Legend wrapperStyle={{fontSize:11,color:T.textMuted}}/>
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>
      <GlassCard T={T}>
        <h3 style={{margin:"0 0 1rem",fontSize:15,fontWeight:600,color:T.text}}>Mood Calendar — January</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:5 }}>
          {DAYS.map(d=><div key={d} style={{textAlign:"center",fontSize:10,color:T.textMuted,fontWeight:600,padding:4}}>{d}</div>)}
          {MONTHLY_SEED.slice(0,28).map((m,i)=>{
            const bg = m.mood>=8?C.green:m.mood>=6?C.teal:m.mood>=4?C.amber:C.red;
            return (
              <div key={i} style={{aspectRatio:1,borderRadius:8,background:`${bg}28`,border:`1.5px solid ${bg}44`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:10,color:T.text,fontWeight:500}}>{i+1}</span>
                <span style={{fontSize:9,color:bg,fontWeight:700}}>{m.mood}</span>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}

// ─── SLEEP TRACKER ────────────────────────────────────────────────────────────
function SleepTracker({ todayLog, setTodayLog, T }) {
  const [bedtime, setBedtime] = useState("23:00");
  const [waketime, setWaketime] = useState("07:00");
  const [quality, setQuality] = useState(7);
  const [toast, setToast] = useState("");

  function calcDuration(bed, wake) {
    const [bh,bm] = bed.split(":").map(Number);
    const [wh,wm] = wake.split(":").map(Number);
    let mins = (wh*60+wm)-(bh*60+bm);
    if (mins<0) mins+=1440;
    return +(mins/60).toFixed(1);
  }
  const duration = calcDuration(bedtime, waketime);

  useEffect(()=>{ setTodayLog(p=>({...p,sleep:duration})); },[duration]);

  function saveSleep() {
    setToast("Sleep logged!");
    setTimeout(()=>setToast(""),2500);
  }

  const insight = duration>=7
    ? "Great! 7h+ sleep correlates with 18% higher productivity tomorrow."
    : duration>=6
    ? "Slightly below optimal. Aim for 7–9 hours for best performance."
    : "Sleep debt detected. Stress and mood will be impacted.";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
      <SaveToast msg={toast}/>
      <SectionHeader T={T} icon="🌙" title="Sleep Tracker" sub="Understand how sleep shapes your entire day" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem" }}>
        <StatCard T={T} icon="⏱" label="Duration Tonight" value={`${duration}h`} color={duration>=7?C.green:C.amber}/>
        <StatCard T={T} icon="📊" label="Avg This Week" value={`${avg(WEEKLY_SEED,"sleep")}h`} color={C.blue}/>
        <StatCard T={T} icon="🏆" label="Best Night" value={`${Math.max(...WEEKLY_SEED.map(d=>d.sleep))}h`} color={C.purple}/>
      </div>
      <GlassCard T={T}>
        <h3 style={{margin:"0 0 1rem",fontSize:15,fontWeight:600,color:T.text}}>Log Tonight's Sleep</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {[["Bedtime",bedtime,setBedtime],["Wake Time",waketime,setWaketime]].map(([lbl,val,setter])=>(
            <div key={lbl}>
              <label style={{fontSize:12,color:T.textMuted,display:"block",marginBottom:4}}>{lbl}</label>
              <input type="time" value={val} onChange={e=>setter(e.target.value)}
                style={{width:"100%",padding:"8px 12px",borderRadius:10,border:`1px solid ${T.inputBorder}`,fontSize:14,background:T.inputBg,color:T.text,outline:"none"}}/>
            </div>
          ))}
        </div>
        <div style={{marginTop:16}}>
          <SliderInput T={T} label="Sleep Quality" value={quality} onChange={setQuality} color={C.teal}/>
        </div>
        <div style={{marginTop:12,padding:"10px 14px",background:`${C.teal}14`,borderRadius:10,fontSize:12,color:C.teal,lineHeight:1.6}}>
          💡 {insight}
        </div>
        <button onClick={saveSleep} style={{marginTop:14,width:"100%",padding:"10px",background:C.teal,color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontWeight:600,fontSize:14}}>
          Save Sleep Log
        </button>
      </GlassCard>
      <GlassCard T={T}>
        <h3 style={{margin:"0 0 1rem",fontSize:15,fontWeight:600,color:T.text}}>Weekly Sleep Duration</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={WEEKLY_SEED}>
            <XAxis dataKey="day" tick={{fontSize:11,fill:T.textMuted}} axisLine={false} tickLine={false}/>
            <YAxis domain={[0,10]} tick={{fontSize:11,fill:T.textMuted}} axisLine={false} tickLine={false} width={25}/>
            <CartesianGrid strokeDasharray="3 3" stroke={T.gridStroke}/>
            <Tooltip contentStyle={{background:T.cardBg,border:`1px solid ${T.cardBorder}`,color:T.text}} formatter={v=>[`${v}h`,"Sleep"]}/>
            <Bar dataKey="sleep" radius={[6,6,0,0]}>
              {WEEKLY_SEED.map((d,i)=><Cell key={i} fill={d.sleep>=7?C.teal:d.sleep>=6?C.blue:C.amber}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}

// ─── FITNESS TRACKER ──────────────────────────────────────────────────────────
function FitnessTracker({ todayLog, setTodayLog, T }) {
  const [workoutType, setWorkoutType] = useState("Strength");
  const [toast, setToast] = useState("");
  const WORKOUT_TYPES = ["Strength","Cardio","Yoga","HIIT","Running","Cycling"];

  const weightData = Array.from({length:8},(_,i)=>({ week:`W${i+1}`, weight:+(72+Math.round((Math.random()-.5)*3*10)/10).toFixed(1) }));

  function saveWorkout() {
    setToast("Workout logged!");
    setTimeout(()=>setToast(""),2500);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
      <SaveToast msg={toast}/>
      <SectionHeader T={T} icon="🏃" title="Fitness Tracker" sub="Track workouts, hydration, and body metrics" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:"1rem" }}>
        <StatCard T={T} icon="🏋️" label="Workouts/Week" value={WEEKLY_SEED.filter(d=>d.workout).length} color={C.green}/>
        <StatCard T={T} icon="👟" label="Avg Daily Steps" value={`${(avg(WEEKLY_SEED,"steps")/1000).toFixed(1)}k`} color={C.blue}/>
        <StatCard T={T} icon="💧" label="Avg Water" value={`${avg(WEEKLY_SEED,"water")}L`} color={C.teal}/>
        <StatCard T={T} icon="🔥" label="Active Days" value={`${WEEKLY_SEED.filter(d=>d.steps>7500).length}/7`} color={C.amber}/>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
        <GlassCard T={T}>
          <h3 style={{margin:"0 0 1rem",fontSize:15,fontWeight:600,color:T.text}}>Log Today's Activity</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <div style={{fontSize:12,color:T.textMuted,marginBottom:6}}>Workout Type</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {WORKOUT_TYPES.map(t=>(
                  <Chip key={t} label={t} active={workoutType===t} onClick={()=>setWorkoutType(t)} color={C.green}/>
                ))}
              </div>
            </div>
            <SliderInput T={T} label="Water Intake" value={todayLog.water??2} min={0} max={5} unit="L"
              onChange={v=>setTodayLog(p=>({...p,water:v}))} color={C.teal}/>
            <div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                <span style={{color:T.textMuted}}>Daily Steps</span>
                <span style={{fontWeight:600,color:C.blue}}>{(todayLog.steps??6000).toLocaleString()}</span>
              </div>
              <input type="range" min={0} max={20000} step={500} value={todayLog.steps??6000}
                onChange={e=>setTodayLog(p=>({...p,steps:+e.target.value}))}
                style={{width:"100%",accentColor:C.blue,cursor:"pointer"}}/>
            </div>
          </div>
          <button onClick={saveWorkout} style={{marginTop:14,width:"100%",padding:"10px",background:C.green,color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontWeight:600,fontSize:14}}>
            Log Workout
          </button>
        </GlassCard>
        <GlassCard T={T}>
          <h3 style={{margin:"0 0 0.75rem",fontSize:15,fontWeight:600,color:T.text}}>Weekly Consistency</h3>
          <div style={{ display:"flex", gap:6, justifyContent:"center" }}>
            {WEEKLY_SEED.map((d,i)=>(
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{width:32,height:32,borderRadius:8,background:d.workout?C.green:T.trackBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#fff"}}>
                  {d.workout?"✓":""}
                </div>
                <span style={{fontSize:10,color:T.textMuted}}>{d.day}</span>
              </div>
            ))}
          </div>
          <h3 style={{margin:"1rem 0 0.5rem",fontSize:14,fontWeight:600,color:T.text}}>Hydration Goal (3L)</h3>
          {WEEKLY_SEED.map((d,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
              <span style={{width:28,fontSize:11,color:T.textMuted}}>{d.day}</span>
              <div style={{flex:1}}><ProgressBar T={T} value={d.water} max={3} color={C.teal} height={6}/></div>
              <span style={{fontSize:11,width:28,textAlign:"right",color:C.teal}}>{d.water}L</span>
            </div>
          ))}
        </GlassCard>
      </div>
      <GlassCard T={T}>
        <h3 style={{margin:"0 0 1rem",fontSize:15,fontWeight:600,color:T.text}}>Weight Trend (8 Weeks)</h3>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={weightData}>
            <XAxis dataKey="week" tick={{fontSize:11,fill:T.textMuted}} axisLine={false} tickLine={false}/>
            <YAxis domain={[68,76]} tick={{fontSize:11,fill:T.textMuted}} axisLine={false} tickLine={false} width={35}/>
            <CartesianGrid strokeDasharray="3 3" stroke={T.gridStroke}/>
            <Tooltip contentStyle={{background:T.cardBg,border:`1px solid ${T.cardBorder}`,color:T.text}} formatter={v=>[`${v} kg`,"Weight"]}/>
            <Line type="monotone" dataKey="weight" stroke={C.purple} strokeWidth={2.5} dot={{r:4,fill:C.purple}}/>
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}

// ─── HABIT TRACKER ────────────────────────────────────────────────────────────
function HabitTracker({ T }) {
  const [habits, setHabits] = useState(HABITS_INIT);
  const [newHabit, setNewHabit] = useState("");
  const [toast, setToast] = useState("");

  function toggleDay(id, dayIndex) {
    setHabits(prev=>prev.map(h=>{
      if (h.id!==id) return h;
      const d = [...h.completedDays];
      d[dayIndex] = !d[dayIndex];
      const newStreak = d[6] ? h.streak+1 : Math.max(0,h.streak-1);
      return {...h, completedDays:d, streak:newStreak};
    }));
  }

  function addHabit() {
    if (!newHabit.trim()) return;
    setHabits(prev=>[...prev, {
      id:Date.now(), name:newHabit.trim(), icon:"⭐", streak:0, xp:10,
      completedDays:[false,false,false,false,false,false,false],
    }]);
    setNewHabit("");
    setToast("Habit added!");
    setTimeout(()=>setToast(""),2500);
  }

  function deleteHabit(id) {
    setHabits(prev=>prev.filter(h=>h.id!==id));
    setToast("Habit removed");
    setTimeout(()=>setToast(""),2500);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
      <SaveToast msg={toast}/>
      <SectionHeader T={T} icon="✅" title="Habit Tracker" sub="Build streaks. Earn XP. Become consistent." />
      <GlassCard T={T}>
        <div style={{ display:"flex", gap:8 }}>
          <input value={newHabit} onChange={e=>setNewHabit(e.target.value)}
            placeholder="Add a new habit (press Enter)..."
            onKeyDown={e=>e.key==="Enter"&&addHabit()}
            style={{flex:1,padding:"8px 12px",borderRadius:10,border:`1px solid ${T.inputBorder}`,fontSize:14,background:T.inputBg,color:T.text,outline:"none"}}/>
          <button onClick={addHabit}
            style={{padding:"8px 18px",background:C.blue,color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontWeight:600,fontSize:14}}>
            + Add
          </button>
        </div>
      </GlassCard>
      <GlassCard T={T} style={{overflowX:"auto"}}>
        <div style={{ minWidth:520 }}>
          <div style={{display:"grid",gridTemplateColumns:"2fr repeat(7,1fr) 60px 36px",gap:4,alignItems:"center",marginBottom:8,paddingBottom:8,borderBottom:`1px solid ${T.gridStroke}`}}>
            <span style={{fontSize:12,color:T.textMuted,fontWeight:600}}>Habit</span>
            {DAYS.map(d=><span key={d} style={{fontSize:11,color:T.textMuted,textAlign:"center",fontWeight:500}}>{d}</span>)}
            <span style={{fontSize:11,color:T.textMuted,textAlign:"center"}}>Streak</span>
            <span/>
          </div>
          {habits.map(h=>{
            const pctDone = Math.round(h.completedDays.filter(Boolean).length/7*100);
            return (
              <div key={h.id} style={{display:"grid",gridTemplateColumns:"2fr repeat(7,1fr) 60px 36px",gap:4,alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.gridStroke}`}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:16}}>{h.icon}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:T.text}}>{h.name}</div>
                    <div style={{fontSize:10,color:T.textMuted}}>{pctDone}% this week</div>
                  </div>
                </div>
                {h.completedDays.map((done,i)=>(
                  <button key={i} onClick={()=>toggleDay(h.id,i)}
                    style={{width:28,height:28,borderRadius:6,border:`1.5px solid ${done?C.green:T.inputBorder}`,background:done?C.green:T.inputBg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#fff",margin:"0 auto",transition:"all .15s"}}>
                    {done?"✓":""}
                  </button>
                ))}
                <div style={{textAlign:"center"}}>
                  <span style={{background:`${C.amber}22`,color:C.amber,fontSize:11,padding:"2px 7px",borderRadius:99,fontWeight:600}}>
                    🔥{h.streak}
                  </span>
                </div>
                <button onClick={()=>deleteHabit(h.id)}
                  style={{width:28,height:28,borderRadius:6,border:`1px solid ${T.inputBorder}`,background:"transparent",cursor:"pointer",color:C.red,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}

// ─── JOURNAL ─────────────────────────────────────────────────────────────────
function Journal({ T }) {
  const [entries, setEntries] = useState(JOURNAL_INIT);
  const [title, setTitle] = useState("");
  const [entry, setEntry] = useState("");
  const [view, setView] = useState("list");
  const [toast, setToast] = useState("");

  function saveEntry() {
    if (!title.trim()||!entry.trim()) return;
    setEntries(prev=>[{
      id:Date.now(),
      date:new Date().toISOString().slice(0,10),
      title:title.trim(), entry:entry.trim(),
      sentiment:analyzeSentiment(entry),
    },...prev]);
    setTitle(""); setEntry("");
    setView("list");
    setToast("Entry saved!");
    setTimeout(()=>setToast(""),2500);
  }

  function deleteEntry(id) {
    setEntries(prev=>prev.filter(e=>e.id!==id));
  }

  const sColor = s=>s==="positive"?C.green:s==="negative"?C.red:C.amber;
  const sEmoji = s=>s==="positive"?"😊":s==="negative"?"😔":"😐";

  const KEYWORDS = ["sleep","mood","energy","stress","productive","focus","anxious","happy","tired","workout","meditation","grateful"];
  const wordFreq = KEYWORDS.map(k=>({
    word:k, count:entries.reduce((s,e)=>s+(e.entry.toLowerCase().split(k).length-1),0),
  })).filter(k=>k.count>0).sort((a,b)=>b.count-a.count);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
      <SaveToast msg={toast}/>
      <SectionHeader T={T} icon="📓" title="Journal" sub="Daily reflections with sentiment analysis" />
      <GlassCard T={T}>
        <div style={{display:"flex",gap:8,marginBottom:"1rem"}}>
          {["list","write"].map(v=>(
            <Chip key={v} label={v==="list"?"📋 Entries":"✍️ Write"} active={view===v} onClick={()=>setView(v)} color={C.blue}/>
          ))}
        </div>
        {view==="write"?(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Entry title..."
              style={{padding:"10px 14px",borderRadius:10,border:`1px solid ${T.inputBorder}`,fontSize:14,background:T.inputBg,color:T.text,outline:"none"}}/>
            <textarea value={entry} onChange={e=>setEntry(e.target.value)} placeholder="Write your reflection here..." rows={6}
              style={{padding:"10px 14px",borderRadius:10,border:`1px solid ${T.inputBorder}`,fontSize:14,background:T.inputBg,color:T.text,outline:"none",resize:"vertical",fontFamily:"inherit"}}/>
            <div style={{display:"flex",gap:8}}>
              <button onClick={saveEntry}
                style={{flex:1,padding:"10px",background:C.blue,color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontWeight:600,fontSize:14}}>
                Save Entry
              </button>
              <button onClick={()=>setView("list")}
                style={{padding:"10px 16px",background:"transparent",color:T.textMuted,border:`1px solid ${T.inputBorder}`,borderRadius:10,cursor:"pointer",fontSize:14}}>
                Cancel
              </button>
            </div>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {entries.length===0&&<p style={{color:T.textMuted,textAlign:"center",padding:"2rem 0"}}>No entries yet. Start writing!</p>}
            {entries.map(e=>(
              <div key={e.id} style={{padding:"12px 14px",background:`${sColor(e.sentiment)}0c`,borderRadius:12,border:`1px solid ${sColor(e.sentiment)}25`,position:"relative"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span>{sEmoji(e.sentiment)}</span>
                    <span style={{fontWeight:600,fontSize:14,color:T.text}}>{e.title}</span>
                    <span style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:`${sColor(e.sentiment)}22`,color:sColor(e.sentiment),fontWeight:500,textTransform:"capitalize"}}>{e.sentiment}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:11,color:T.textMuted}}>{e.date}</span>
                    <button onClick={()=>deleteEntry(e.id)}
                      style={{background:"transparent",border:"none",cursor:"pointer",color:C.red,fontSize:16,lineHeight:1,padding:"0 2px"}}>×</button>
                  </div>
                </div>
                <p style={{margin:0,fontSize:13,color:T.textSub,lineHeight:1.6}}>{e.entry}</p>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
      {wordFreq.length>0&&(
        <GlassCard T={T}>
          <h3 style={{margin:"0 0 1rem",fontSize:15,fontWeight:600,color:T.text}}>Keyword Cloud</h3>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,padding:"0.5rem 0"}}>
            {wordFreq.map((k,i)=>{
              const colors=[C.blue,C.teal,C.green,C.purple,C.amber];
              return <span key={k.word} style={{fontSize:Math.min(12+k.count*4,26),color:colors[i%colors.length],fontWeight:700,cursor:"default"}}>{k.word}</span>;
            })}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

// ─── PRODUCTIVITY ─────────────────────────────────────────────────────────────
function Productivity({ todayLog, setTodayLog, T }) {
  const [studyH, setStudyH] = useState(3);
  const [workH, setWorkH] = useState(6);
  const [deepWork, setDeepWork] = useState(2);
  const [tasks, setTasks] = useState(5);
  const [toast, setToast] = useState("");

  const prodScore = Math.min(100, Math.round(studyH/4*25 + workH/8*30 + deepWork/4*25 + tasks/8*20));

  useEffect(()=>{ setTodayLog(p=>({...p,productivity:prodScore})); },[prodScore]);

  function saveProductivity() {
    setToast("Productivity saved!");
    setTimeout(()=>setToast(""),2500);
  }

  const heatmapData = Array.from({length:35},(_,i)=>({ day:i+1, value:Math.floor(Math.random()*100) }));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
      <SaveToast msg={toast}/>
      <SectionHeader T={T} icon="💼" title="Productivity Tracker" sub="Track focus, deep work sessions, and output" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
        <GlassCard T={T}>
          <h3 style={{margin:"0 0 1rem",fontSize:15,fontWeight:600,color:T.text}}>Log Today's Work</h3>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <SliderInput T={T} label="Study Hours" value={studyH} min={0} max={8} unit="h" onChange={setStudyH} color={C.teal}/>
            <SliderInput T={T} label="Work Hours" value={workH} min={0} max={12} unit="h" onChange={setWorkH} color={C.blue}/>
            <SliderInput T={T} label="Deep Work Sessions" value={deepWork} min={0} max={6} unit="" onChange={setDeepWork} color={C.purple}/>
            <SliderInput T={T} label="Tasks Completed" value={tasks} min={0} max={15} unit="" onChange={setTasks} color={C.green}/>
          </div>
          <button onClick={saveProductivity}
            style={{marginTop:14,width:"100%",padding:"10px",background:C.purple,color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontWeight:600,fontSize:14}}>
            Save Progress
          </button>
        </GlassCard>
        <GlassCard T={T} style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontSize:13,color:T.textMuted,marginBottom:12}}>Today's Productivity Score</div>
          <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <ResponsiveContainer width={160} height={160}>
              <RadialBarChart cx="50%" cy="50%" innerRadius={50} outerRadius={75} data={[{value:prodScore}]} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={8} fill={prodScore>=70?C.green:prodScore>=40?C.amber:C.red} background={{fill:T.trackBg}}/>
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{position:"absolute",textAlign:"center"}}>
              <div style={{fontSize:28,fontWeight:800,color:prodScore>=70?C.green:prodScore>=40?C.amber:C.red}}>{prodScore}</div>
              <div style={{fontSize:10,color:T.textMuted}}>Score</div>
            </div>
          </div>
          <div style={{marginTop:12,fontSize:12,color:T.textMuted,textAlign:"center"}}>
            {prodScore>=70?"🌟 Outstanding focus today!":prodScore>=40?"📈 Good progress — keep going.":"💤 Low energy day — that's okay."}
          </div>
        </GlassCard>
      </div>
      <GlassCard T={T}>
        <h3 style={{margin:"0 0 1rem",fontSize:15,fontWeight:600,color:T.text}}>Consistency Heatmap (Last 5 Weeks)</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
          {DAYS.map(d=><div key={d} style={{textAlign:"center",fontSize:10,color:T.textMuted,padding:"0 0 4px",fontWeight:500}}>{d}</div>)}
          {heatmapData.map((d,i)=>{
            const v=d.value;
            const bg=v>=80?T.heatTop:v>=60?T.heatHigh:v>=40?T.heatMid:v>=20?T.heatLow:T.trackBg;
            return <div key={i} title={`${d.value}%`} style={{aspectRatio:1,borderRadius:4,background:bg,cursor:"default"}}/>;
          })}
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center",marginTop:10,fontSize:11,color:T.textMuted}}>
          <span>Less</span>
          {[T.trackBg,T.heatLow,T.heatMid,T.heatHigh,T.heatTop].map((c,i)=>(
            <div key={i} style={{width:12,height:12,background:c,borderRadius:2}}/>
          ))}
          <span>More</span>
        </div>
      </GlassCard>
      <GlassCard T={T}>
        <h3 style={{margin:"0 0 1rem",fontSize:15,fontWeight:600,color:T.text}}>Weekly Focus Trends</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={WEEKLY_SEED}>
            <XAxis dataKey="day" tick={{fontSize:11,fill:T.textMuted}} axisLine={false} tickLine={false}/>
            <YAxis domain={[0,100]} tick={{fontSize:11,fill:T.textMuted}} axisLine={false} tickLine={false} width={30}/>
            <CartesianGrid strokeDasharray="3 3" stroke={T.gridStroke}/>
            <Tooltip contentStyle={{background:T.cardBg,border:`1px solid ${T.cardBorder}`,color:T.text}}/>
            <Bar dataKey="productivity" name="Productivity %" fill={C.purple} radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}

// ─── CORRELATION ENGINE ───────────────────────────────────────────────────────
function CorrelationEngine({ T }) {
  const corrMatrix = [
    {metric:"Sleep",    sleep:1,    mood:0.72,  productivity:0.68, stress:-0.55, energy:0.61},
    {metric:"Mood",     sleep:0.72, mood:1,     productivity:0.58, stress:-0.71, energy:0.69},
    {metric:"Prodt.",   sleep:0.68, mood:0.58,  productivity:1,    stress:-0.44, energy:0.75},
    {metric:"Stress",   sleep:-0.55,mood:-0.71, productivity:-0.44,stress:1,     energy:-0.52},
    {metric:"Energy",   sleep:0.61, mood:0.69,  productivity:0.75, stress:-0.52, energy:1},
  ];
  const metrics = ["sleep","mood","productivity","stress","energy"];

  const corrColor = v => {
    if (v===1) return T.trackBg;
    if (v>=0.6) return C.green; if (v>=0.3) return C.teal;
    if (v>=0) return C.blueLight; if (v>=-0.3) return C.amberLight;
    return C.redLight;
  };
  const corrText = v => v===1 ? T.textMuted : v>0 ? "#065F46" : "#7F1D1D";

  const scatterSleepMood   = WEEKLY_SEED.map(d=>({x:d.sleep,y:d.mood}));
  const scatterSleepProd   = WEEKLY_SEED.map(d=>({x:d.sleep,y:d.productivity}));

  const insights = [
    {icon:"💤",text:"Higher sleep strongly correlates with better mood (r=0.72)",impact:"high"},
    {icon:"🏃",text:"Exercise days show 31% lower average stress levels",impact:"high"},
    {icon:"⚡",text:"Energy is your strongest productivity predictor (r=0.75)",impact:"high"},
    {icon:"🧘",text:"Meditation days follow with 18% higher focus scores",impact:"medium"},
    {icon:"💧",text:"Hydration above 2.5L correlates with better mood by 12%",impact:"medium"},
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"1.25rem"}}>
      <SectionHeader T={T} icon="🔗" title="Correlation Engine" sub="Discover how different life areas affect each other"/>
      <GlassCard T={T}>
        <h3 style={{margin:"0 0 1rem",fontSize:15,fontWeight:600,color:T.text}}>Correlation Heatmap</h3>
        <div style={{overflowX:"auto"}}>
          <div style={{display:"grid",gridTemplateColumns:`80px repeat(${metrics.length},1fr)`,gap:3,minWidth:380}}>
            <div/>
            {metrics.map(m=><div key={m} style={{fontSize:10,color:T.textMuted,textAlign:"center",padding:"4px 0",fontWeight:600,textTransform:"capitalize"}}>{m}</div>)}
            {corrMatrix.map(row=>[
              <div key={row.metric} style={{fontSize:12,fontWeight:600,color:T.text,display:"flex",alignItems:"center"}}>{row.metric}</div>,
              ...metrics.map(m=>{
                const v=row[m];
                return (
                  <div key={m} style={{background:corrColor(v),borderRadius:6,padding:"7px 0",textAlign:"center",fontSize:11,fontWeight:700,color:corrText(v)}}>
                    {v===1?"—":v.toFixed(2)}
                  </div>
                );
              })
            ])}
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:10,fontSize:11,color:T.textMuted,flexWrap:"wrap"}}>
          {[[C.green,"Strong +"],[C.teal,"Moderate +"],[C.amberLight,"Weak −"],[C.redLight,"Strong −"]].map(([clr,lbl])=>(
            <span key={lbl} style={{display:"flex",alignItems:"center",gap:4}}>
              <span style={{width:12,height:12,background:clr,borderRadius:2,display:"inline-block"}}/>{lbl}
            </span>
          ))}
        </div>
      </GlassCard>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
        {[
          {title:"Sleep vs Mood",data:scatterSleepMood,color:C.blue,xLabel:"Sleep (h)",yLabel:"Mood"},
          {title:"Sleep vs Productivity",data:scatterSleepProd,color:C.purple,xLabel:"Sleep (h)",yLabel:"Productivity"},
        ].map(({title,data,color,xLabel,yLabel})=>(
          <GlassCard key={title} T={T}>
            <h3 style={{margin:"0 0 1rem",fontSize:15,fontWeight:600,color:T.text}}>{title}</h3>
            <ResponsiveContainer width="100%" height={180}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke={T.gridStroke}/>
                <XAxis dataKey="x" name={xLabel} tick={{fontSize:11,fill:T.textMuted}} axisLine={false}/>
                <YAxis dataKey="y" name={yLabel} tick={{fontSize:11,fill:T.textMuted}} axisLine={false}/>
                <Tooltip contentStyle={{background:T.cardBg,border:`1px solid ${T.cardBorder}`,color:T.text}} cursor={{strokeDasharray:"3 3"}}/>
                <Scatter data={data} fill={color} fillOpacity={0.7}/>
              </ScatterChart>
            </ResponsiveContainer>
          </GlassCard>
        ))}
      </div>
      <GlassCard T={T}>
        <h3 style={{margin:"0 0 1rem",fontSize:15,fontWeight:600,color:T.text}}>AI-Generated Insight Cards</h3>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {insights.map((ins,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"center",padding:"12px 14px",background:ins.impact==="high"?`${C.blue}10`:`${C.teal}10`,borderRadius:12,border:`1px solid ${ins.impact==="high"?C.blue:C.teal}25`}}>
              <span style={{fontSize:20,flexShrink:0}}>{ins.icon}</span>
              <div style={{flex:1,fontSize:13,color:T.textSub,lineHeight:1.5}}>{ins.text}</div>
              <span style={{fontSize:10,padding:"2px 8px",borderRadius:99,fontWeight:600,background:`${ins.impact==="high"?C.blue:C.teal}22`,color:ins.impact==="high"?C.blue:C.teal}}>{ins.impact}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
function Analytics({ T }) {
  const report = {
    avgMood: avg(MONTHLY_SEED,"mood"),
    avgSleep: avg(WEEKLY_SEED,"sleep"),
    avgStress: avg(MONTHLY_SEED,"stress"),
  };
  const predictions = [
    {label:"Mood",val:"7.2/10",conf:78,color:C.blue},
    {label:"Productivity",val:"73%",conf:71,color:C.purple},
    {label:"Burnout Risk",val:"Low",conf:85,color:C.green},
  ];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"1.25rem"}}>
      <SectionHeader T={T} icon="📊" title="Analytics & Reports" sub="Monthly performance overview and predictions"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:"1rem"}}>
        <StatCard T={T} icon="😊" label="Avg Mood" value={`${report.avgMood}/10`} color={C.blue}/>
        <StatCard T={T} icon="🌙" label="Avg Sleep" value={`${report.avgSleep}h`} color={C.teal}/>
        <StatCard T={T} icon="😤" label="Avg Stress" value={`${report.avgStress}/10`} color={C.red}/>
        <StatCard T={T} icon="📈" label="Productivity" value="+8%" color={C.green} sub="vs last month"/>
      </div>
      <GlassCard T={T}>
        <h3 style={{margin:"0 0 1rem",fontSize:15,fontWeight:600,color:T.text}}>Weekly Summary</h3>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
          {[
            {label:"Best Habit",value:"🧘 Meditation",color:C.green},
            {label:"Weakest Habit",value:"📚 Reading",color:C.amber},
            {label:"Burnout Risk",value:"✅ Low",color:C.green},
            {label:"Mood improved",value:"+14% vs last week",color:C.blue},
          ].map((item,i)=>(
            <div key={i} style={{padding:"12px 14px",background:`${item.color}0c`,borderRadius:12,border:`1px solid ${item.color}25`}}>
              <div style={{fontSize:11,color:T.textMuted,marginBottom:4}}>{item.label}</div>
              <div style={{fontSize:14,fontWeight:700,color:item.color}}>{item.value}</div>
            </div>
          ))}
        </div>
      </GlassCard>
      <GlassCard T={T}>
        <h3 style={{margin:"0 0 1rem",fontSize:15,fontWeight:600,color:T.text}}>🔮 Tomorrow's Predictions</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1rem"}}>
          {predictions.map((p,i)=>(
            <div key={i} style={{textAlign:"center",padding:"1rem",background:`${p.color}0c`,borderRadius:12,border:`1px solid ${p.color}22`}}>
              <div style={{fontSize:11,color:T.textMuted,marginBottom:4}}>{p.label}</div>
              <div style={{fontSize:22,fontWeight:800,color:p.color}}>{p.val}</div>
              <div style={{fontSize:10,color:T.textMuted,marginTop:6,marginBottom:4}}>Confidence</div>
              <ProgressBar T={T} value={p.conf} color={p.color} height={4}/>
              <div style={{fontSize:10,color:p.color,marginTop:3}}>{p.conf}%</div>
            </div>
          ))}
        </div>
      </GlassCard>
      <GlassCard T={T}>
        <h3 style={{margin:"0 0 1rem",fontSize:15,fontWeight:600,color:T.text}}>30-Day Multi-Metric Overview</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={MONTHLY_SEED}>
            <XAxis dataKey="day" tick={{fontSize:10,fill:T.textMuted}} axisLine={false} tickLine={false} interval={4}/>
            <YAxis domain={[0,10]} tick={{fontSize:10,fill:T.textMuted}} axisLine={false} tickLine={false} width={20}/>
            <CartesianGrid strokeDasharray="3 3" stroke={T.gridStroke}/>
            <Tooltip contentStyle={{background:T.cardBg,border:`1px solid ${T.cardBorder}`,color:T.text}}/>
            <Line type="monotone" dataKey="mood" stroke={C.blue} strokeWidth={2} dot={false} name="Mood"/>
            <Line type="monotone" dataKey="energy" stroke={C.green} strokeWidth={2} dot={false} name="Energy"/>
            <Line type="monotone" dataKey="stress" stroke={C.red} strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Stress"/>
            <Legend wrapperStyle={{fontSize:11,color:T.textMuted}}/>
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {id:"dashboard",label:"Dashboard",icon:"🏠"},
  {id:"mood",     label:"Mood",     icon:"😊"},
  {id:"sleep",    label:"Sleep",    icon:"🌙"},
  {id:"fitness",  label:"Fitness",  icon:"🏃"},
  {id:"productivity",label:"Work",  icon:"💼"},
  {id:"habits",   label:"Habits",   icon:"✅"},
  {id:"journal",  label:"Journal",  icon:"📓"},
  {id:"correlations",label:"Insights",icon:"🔗"},
  {id:"analytics",label:"Analytics",icon:"📊"},
];

// ─── THEME TOGGLE ─────────────────────────────────────────────────────────────
function ThemeToggle({ themeMode, setThemeMode, T }) {
  const opts = [{val:"light",icon:"☀️"},{val:"auto",icon:"🌓"},{val:"dark",icon:"🌙"}];
  return (
    <div style={{display:"flex",gap:2,background:T.trackBg,borderRadius:99,padding:3}}>
      {opts.map(o=>(
        <button key={o.val} onClick={()=>setThemeMode(o.val)} title={o.val}
          style={{width:30,height:30,borderRadius:99,border:"none",cursor:"pointer",fontSize:14,transition:"all .2s",
            background:themeMode===o.val?T.cardBg:"transparent",
            boxShadow:themeMode===o.val?"0 1px 4px rgba(0,0,0,0.15)":"none"}}>
          {o.icon}
        </button>
      ))}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function LifeOS() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [themeMode, setThemeMode] = useState("auto");
  const [systemDark, setSystemDark] = useState(false);
  const [todayLog, setTodayLog] = useState({
    mood:7, stress:4, energy:6, sleep:7.5, productivity:65, water:2, steps:7200, workout:true,
  });
  const [habits] = useState(HABITS_INIT);

  // detect system dark mode for auto
  useEffect(()=>{
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const handler = e => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return ()=>mq.removeEventListener("change", handler);
  },[]);

  const isDark = themeMode==="dark"||(themeMode==="auto"&&systemDark);
  const T = isDark ? THEMES.dark : THEMES.light;

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"system-ui,-apple-system,sans-serif",transition:"background .3s"}}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{height:4px;width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(100,100,100,.25);border-radius:99px}
        input[type=range]{height:4px;border-radius:99px}
      `}</style>

      {/* Header */}
      <div style={{background:T.headerBg,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:`1px solid ${T.headerBorder}`,padding:"0 1.5rem",position:"sticky",top:0,zIndex:100,transition:"background .3s"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:56}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:10,background:`linear-gradient(135deg,${C.blue},${C.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
              🌿
            </div>
            <span style={{fontSize:18,fontWeight:800,background:`linear-gradient(90deg,${C.blue},${C.purple})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              LifeOS
            </span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:12,color:T.textMuted}}>
              {new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}
            </span>
            <ThemeToggle themeMode={themeMode} setThemeMode={setThemeMode} T={T}/>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"1rem 1rem 2rem"}}>
        {/* Nav Pills */}
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:6,marginBottom:"1.25rem",scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
          {NAV_ITEMS.map(n=>(
            <button key={n.id} onClick={()=>setActiveTab(n.id)}
              style={{display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:99,fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",border:"1.5px solid",transition:"all .2s",
                background:activeTab===n.id?C.blue:T.navInactive,
                borderColor:activeTab===n.id?C.blue:T.navInactiveBorder,
                color:activeTab===n.id?"#fff":T.navInactiveText,
                backdropFilter:"blur(8px)"}}>
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
        </div>

        {/* Pages */}
        {activeTab==="dashboard"    && <Dashboard      todayLog={todayLog} habits={habits} T={T}/>}
        {activeTab==="mood"         && <MoodTracker    todayLog={todayLog} setTodayLog={setTodayLog} T={T}/>}
        {activeTab==="sleep"        && <SleepTracker   todayLog={todayLog} setTodayLog={setTodayLog} T={T}/>}
        {activeTab==="fitness"      && <FitnessTracker todayLog={todayLog} setTodayLog={setTodayLog} T={T}/>}
        {activeTab==="productivity" && <Productivity   todayLog={todayLog} setTodayLog={setTodayLog} T={T}/>}
        {activeTab==="habits"       && <HabitTracker   T={T}/>}
        {activeTab==="journal"      && <Journal        T={T}/>}
        {activeTab==="correlations" && <CorrelationEngine T={T}/>}
        {activeTab==="analytics"    && <Analytics      T={T}/>}
      </div>
    </div>
  );
}
