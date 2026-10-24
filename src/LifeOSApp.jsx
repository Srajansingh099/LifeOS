import { useState, useEffect } from "react";
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
  },
};

const C = {
  blue: "#3B82F6", blueLight: "#93C5FD",
  green: "#10B981", greenLight: "#6EE7B7",
  teal: "#14B8A6", tealLight: "#5EEAD4",
  purple: "#8B5CF6", purpleLight: "#C4B5FD",
  amber: "#F59E0B", amberLight: "#FCD34D",
  red: "#EF4444", redLight: "#FCA5A5",
};

// ─── Constants ────────────────────────────────────────────────────────────────
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// ─── Default structures (no random data) ─────────────────────────────────────
const DEFAULT_USER_PROFILE = {
  name: "",
  waterGoal: 3.5,
  stepGoal: 5000,
  sleepGoal: 8,
  notificationTime: "08:00",
  theme: "auto",
};

const DEFAULT_NOTIFICATION_SETTINGS = {
  enabled: false,
  notificationTime: "08:00",
  randomDailyReminder: false,
};

// Auth stubs — ready for Supabase wiring
const DEFAULT_AUTH = {
  isAuthenticated: false,
  user: null,
  loading: false,
};

const HABITS_INIT = [
  { id: 1, name: "Reading",    icon: "📚", streak: 0, xp: 15, completedDays: [false,false,false,false,false,false,false] },
  { id: 2, name: "Gym",        icon: "🏋️", streak: 0, xp: 25, completedDays: [false,false,false,false,false,false,false] },
  { id: 3, name: "Meditation", icon: "🧘", streak: 0, xp: 20, completedDays: [false,false,false,false,false,false,false] },
  { id: 4, name: "Coding",     icon: "💻", streak: 0, xp: 20, completedDays: [false,false,false,false,false,false,false] },
  { id: 5, name: "Walking",    icon: "🚶", streak: 0, xp: 10, completedDays: [false,false,false,false,false,false,false] },
];

const EMPTY_DAY_LOG = {
  mood: 5,
  stress: 5,
  energy: 5,
  sleep: 0,
  waterConsumed: 0,
  steps: 0,
  workout: false,
  workoutType: "",
  sleepHours: 0,
  studyHours: 0,
  workHours: 0,
  fitnessHours: 0,
  socialHours: 0,
  entertainmentHours: 0,
  otherHours: 0,
};

// ─── Utils ────────────────────────────────────────────────────────────────────
function safeAvg(arr, key) {
  const vals = arr.map(x => (key ? (x[key] ?? 0) : (x ?? 0))).filter(v => typeof v === "number" && !isNaN(v));
  if (!vals.length) return 0;
  return +(vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1);
}

function pct(val, max) {
  if (!max || isNaN(val) || isNaN(max)) return 0;
  return Math.min(100, Math.max(0, Math.round((val / max) * 100)));
}

function analyzeSentiment(text) {
  const pos = ["great","good","happy","excited","productive","energetic","grateful","fantastic","wonderful","love","enjoyed"];
  const neg = ["tired","anxious","stressed","exhausted","difficult","bad","sad","lonely","frustrated","overwhelmed"];
  const words = text.toLowerCase().split(/\s+/);
  const p = words.filter(w => pos.includes(w)).length;
  const n = words.filter(w => neg.includes(w)).length;
  return p > n ? "positive" : n > p ? "negative" : "mixed";
}

// Life Score: Sleep 25% + Fitness 20% + Habits 20% + Mood 15% + Productivity 20%
function calcLifeScore(todayLog, habits, allocationHours) {
  const { sleep, sleepGoal=8, mood=5, stress=5, energy=5 } = todayLog;
  const sleepScore = Math.min(100, Math.round((sleep / sleepGoal) * 100));
  const fitnessScore = todayLog.workout ? 100 : Math.min(100, Math.round((allocationHours.fitnessHours / 1) * 80));
  const habitsTotal = habits.reduce((s,h) => s + h.completedDays.filter(Boolean).length, 0);
  const habitsMax = habits.length * 7 || 1;
  const habitScore = Math.min(100, Math.round((habitsTotal / habitsMax) * 100));
  const moodScore = Math.min(100, Math.round(((mood - 1) / 9) * 100));
  const prodHours = allocationHours.studyHours + allocationHours.workHours;
  const productivityScore = Math.min(100, Math.round((prodHours / 8) * 100));
  return {
    total: Math.round(sleepScore * 0.25 + fitnessScore * 0.20 + habitScore * 0.20 + moodScore * 0.15 + productivityScore * 0.20),
    breakdown: { sleepScore, fitnessScore, habitScore, moodScore, productivityScore },
  };
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
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
  const safeVal = isNaN(value) ? 0 : value;
  const safeMax = isNaN(max) || max === 0 ? 1 : max;
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const dash = (safeVal / safeMax) * circ;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.trackBg} strokeWidth={6}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}/>
        <text x={size/2} y={size/2+5} textAnchor="middle" fontSize={13} fontWeight={600} fill={color}>{safeVal}</text>
      </svg>
      <span style={{ fontSize:11, color:T.textMuted, textAlign:"center", fontWeight:500 }}>{label}</span>
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
      <div style={{ width:`${pct(value,max)}%`, height:"100%", background:color, borderRadius:99, transition:"width .4s ease" }}/>
    </div>
  );
}

function SliderInput({ label, value, onChange, min=0, max=10, color=C.blue, unit="/10", T }) {
  const safeVal = isNaN(value) ? min : Math.max(min, Math.min(max, value));
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
        <span style={{ color:T.textMuted }}>{label}</span>
        <span style={{ fontWeight:600, color }}>{safeVal}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={1} value={safeVal}
        onChange={e => onChange(+e.target.value)}
        style={{ width:"100%", accentColor:color, cursor:"pointer" }}/>
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
  if (!msg) return null;
  return (
    <div style={{ position:"fixed", bottom:24, right:24, background:C.green, color:"#fff",
      padding:"10px 18px", borderRadius:12, fontSize:13, fontWeight:600,
      boxShadow:"0 4px 20px rgba(16,185,129,0.4)", zIndex:9999, animation:"fadeIn .2s ease" }}>
      ✓ {msg}
    </div>
  );
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

function EmptyState({ icon, title, sub, T }) {
  return (
    <div style={{ textAlign:"center", padding:"3rem 1rem", color:T.textMuted }}>
      <div style={{ fontSize:40, marginBottom:12 }}>{icon}</div>
      <div style={{ fontWeight:600, fontSize:15, color:T.text, marginBottom:6 }}>{title}</div>
      <div style={{ fontSize:13 }}>{sub}</div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ todayLog, habits, userProfile, allocationHours, T }) {
  const { waterGoal=3.5, stepGoal=5000, sleepGoal=8 } = userProfile;
  const lifeScore = calcLifeScore({ ...todayLog, sleepGoal }, habits, allocationHours);
  const hasAnyData = todayLog.sleep > 0 || todayLog.waterConsumed > 0 || todayLog.steps > 0;

  const burnout = (() => {
    let r = 0;
    if (todayLog.sleep > 0 && todayLog.sleep < 6) r += 35;
    if (todayLog.stress > 7) r += 30;
    if (todayLog.mood < 4) r += 20;
    const prodH = allocationHours.studyHours + allocationHours.workHours;
    if (prodH > 10) r += 15;
    if (r < 25) return { level:"Healthy", color:C.green, emoji:"✅", tip:"You're in great shape. Keep up the habits!" };
    if (r < 55) return { level:"Moderate Risk", color:C.amber, emoji:"⚠️", tip:"Prioritize sleep and reduce stressors." };
    return { level:"Burnout Risk", color:C.red, emoji:"🔴", tip:"Take a break. Log off early and rest today." };
  })();

  const xpTotal = habits.reduce((s,h) => s + h.completedDays.filter(Boolean).length * h.xp, 0);
  const level = Math.floor(xpTotal / 200) + 1;
  const xpInLevel = xpTotal % 200;

  const insights = [
    { text:"Days with 7h+ sleep show 18% higher productivity", icon:"💡" },
    { text:"Exercise correlates with 23% lower stress scores", icon:"🏃" },
    { text:`You're ${pct(todayLog.waterConsumed, waterGoal)}% of your daily water goal`, icon:"💧" },
  ];

  const scoreBreakdown = [
    { label:"Sleep", score:lifeScore.breakdown.sleepScore, color:C.teal, weight:"25%" },
    { label:"Fitness", score:lifeScore.breakdown.fitnessScore, color:C.green, weight:"20%" },
    { label:"Habits", score:lifeScore.breakdown.habitScore, color:C.purple, weight:"20%" },
    { label:"Mood", score:lifeScore.breakdown.moodScore, color:C.blue, weight:"15%" },
    { label:"Productivity", score:lifeScore.breakdown.productivityScore, color:C.amber, weight:"20%" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
      {/* Top KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:"1rem" }}>
        <StatCard T={T} icon="🌟" label="Life Score" value={`${lifeScore.total}%`} color={C.green} sub="Derived from all metrics"/>
        <StatCard T={T} icon="😊" label="Mood" value={`${todayLog.mood}/10`} color={C.blue} sub="Logged today"/>
        <StatCard T={T} icon="⚡" label="Energy" value={`${todayLog.energy}/10`} color={C.amber} sub="Logged today"/>
        <StatCard T={T} icon="💧" label="Hydration" value={`${todayLog.waterConsumed}L / ${waterGoal}L`} color={C.teal} sub={`${pct(todayLog.waterConsumed,waterGoal)}% of goal`}/>
        <StatCard T={T} icon="😤" label="Stress" value={`${todayLog.stress}/10`} color={todayLog.stress>7?C.red:C.teal} sub="Lower is better"/>
      </div>

      {/* Life Score Breakdown */}
      <GlassCard T={T}>
        <SectionHeader T={T} icon="🎯" title="Life Score Breakdown" sub="Weighted from sleep, fitness, habits, mood & productivity"/>
        <div style={{ display:"flex", justifyContent:"space-around", flexWrap:"wrap", gap:"1rem", marginBottom:"1rem" }}>
          {scoreBreakdown.map(s => (
            <ScoreRing key={s.label} T={T} value={s.score} max={100} size={72} color={s.color} label={`${s.label} (${s.weight})`}/>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:`${C.green}10`, borderRadius:12 }}>
          <div style={{ fontSize:32, fontWeight:800, color:C.green }}>{lifeScore.total}</div>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:T.text }}>Overall Life Score</div>
            <div style={{ fontSize:12, color:T.textMuted }}>Sleep×0.25 + Fitness×0.20 + Habits×0.20 + Mood×0.15 + Productivity×0.20</div>
          </div>
        </div>
      </GlassCard>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:"1rem" }}>
        {/* Score Rings */}
        <GlassCard T={T}>
          <SectionHeader T={T} icon="📊" title="Today's Vitals"/>
          {!hasAnyData ? (
            <EmptyState T={T} icon="📝" title="No data yet today" sub="Log your mood, sleep and activity to see scores here"/>
          ) : (
            <div style={{ display:"flex", justifyContent:"space-around", flexWrap:"wrap", gap:"1rem" }}>
              <ScoreRing T={T} value={todayLog.mood} max={10} color={C.blue} label="Mood"/>
              <ScoreRing T={T} value={todayLog.energy} max={10} color={C.amber} label="Energy"/>
              <ScoreRing T={T} value={todayLog.sleep} max={sleepGoal} color={C.teal} label="Sleep (h)"/>
              <ScoreRing T={T} value={todayLog.stress} max={10} color={todayLog.stress>7?C.red:C.green} label="Stress"/>
              <ScoreRing T={T} value={pct(todayLog.steps,stepGoal)} max={100} color={C.purple} label="Steps %"/>
            </div>
          )}
        </GlassCard>
        {/* Burnout */}
        <GlassCard T={T} style={{ display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
          <SectionHeader T={T} icon="🔥" title="Burnout Risk"/>
          <div style={{ textAlign:"center", padding:"0.75rem 0" }}>
            <div style={{ fontSize:36 }}>{burnout.emoji}</div>
            <div style={{ fontWeight:700, color:burnout.color, fontSize:16, marginTop:8 }}>{burnout.level}</div>
          </div>
          <div style={{ fontSize:12, color:T.textMuted, lineHeight:1.6 }}>{burnout.tip}</div>
        </GlassCard>
      </div>

      {/* Step & Water Goals */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
        <GlassCard T={T}>
          <h3 style={{ margin:"0 0 1rem", fontSize:15, fontWeight:600, color:T.text }}>💧 Hydration</h3>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:8 }}>
            <span style={{ color:T.textMuted }}>Today</span>
            <span style={{ fontWeight:700, color:C.teal }}>{todayLog.waterConsumed}L / {waterGoal}L</span>
          </div>
          <ProgressBar T={T} value={todayLog.waterConsumed} max={waterGoal} color={C.teal} height={12}/>
          <div style={{ fontSize:11, color:T.textMuted, marginTop:6 }}>{pct(todayLog.waterConsumed,waterGoal)}% of daily goal</div>
        </GlassCard>
        <GlassCard T={T}>
          <h3 style={{ margin:"0 0 1rem", fontSize:15, fontWeight:600, color:T.text }}>👟 Steps</h3>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:8 }}>
            <span style={{ color:T.textMuted }}>Today</span>
            <span style={{ fontWeight:700, color:C.purple }}>{todayLog.steps.toLocaleString()} / {stepGoal.toLocaleString()}</span>
          </div>
          <ProgressBar T={T} value={todayLog.steps} max={stepGoal} color={C.purple} height={12}/>
          <div style={{ fontSize:11, color:T.textMuted, marginTop:6 }}>{pct(todayLog.steps,stepGoal)}% of daily goal</div>
        </GlassCard>
      </div>

      {/* XP + Insights */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
        <GlassCard T={T}>
          <SectionHeader T={T} icon="🎮" title={`Level ${level} — RPG Progress`}/>
          <div style={{ marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:6 }}>
              <span style={{ color:T.textMuted }}>XP this level</span>
              <span style={{ fontWeight:600, color:C.purple }}>{xpInLevel} / 200 XP</span>
            </div>
            <ProgressBar T={T} value={xpInLevel} max={200} color={C.purple} height={10}/>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {habits.filter(h=>h.completedDays.filter(Boolean).length>=5).map(h=>(
              <span key={h.id} style={{ background:`${C.purple}22`, color:C.purple, fontSize:11, padding:"3px 8px", borderRadius:99, fontWeight:500 }}>
                {h.icon} {h.name}
              </span>
            ))}
            {habits.filter(h=>h.completedDays.filter(Boolean).length>=5).length===0&&(
              <span style={{ fontSize:12, color:T.textMuted }}>Complete habits 5+ days to earn badges</span>
            )}
          </div>
        </GlassCard>
        <GlassCard T={T}>
          <SectionHeader T={T} icon="💡" title="Smart Insights"/>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {insights.map((c,i)=>(
              <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", padding:"8px 10px", background:`${C.blue}12`, borderRadius:10, fontSize:12, lineHeight:1.5 }}>
                <span>{c.icon}</span><span style={{ color:T.textSub }}>{c.text}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ─── MOOD TRACKER ─────────────────────────────────────────────────────────────
function MoodTracker({ todayLog, setTodayLog, moodHistory, setMoodHistory, T }) {
  const EMOTION_TAGS = ["Happy","Calm","Motivated","Anxious","Lonely","Angry","Tired","Excited"];
  const [tags, setTags] = useState([]);
  const [toast, setToast] = useState("");

  const PIE_COLORS = [C.green,C.teal,C.blue,C.red,C.purple,C.amber,C.redLight,C.purpleLight];

  const emotionCounts = EMOTION_TAGS.map(e => ({
    name: e,
    value: moodHistory.reduce((s,d) => s + ((d.tags||[]).includes(e)?1:0), 0),
  })).filter(e=>e.value>0);

  function saveMood() {
    const entry = {
      id: Date.now(),
      date: new Date().toISOString().slice(0,10),
      mood: todayLog.mood,
      energy: todayLog.energy,
      stress: todayLog.stress,
      tags,
    };
    setMoodHistory(prev => [entry, ...prev.slice(0,89)]);
    setToast("Mood logged!");
    setTimeout(()=>setToast(""),2500);
  }

  const trendData = moodHistory.slice(0,30).reverse().map((d,i) => ({
    day: i+1,
    mood: d.mood ?? 0,
    energy: d.energy ?? 0,
    stress: d.stress ?? 0,
  }));

  const calendarData = moodHistory.slice(0,28).reverse();

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
      <SaveToast msg={toast}/>
      <SectionHeader T={T} icon="😊" title="Mood Tracker" sub="Log how you're feeling and spot emotional patterns"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
        <GlassCard T={T}>
          <h3 style={{ margin:"0 0 1rem", fontSize:15, fontWeight:600, color:T.text }}>Log Today's Mood</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <SliderInput T={T} label="Mood" value={todayLog.mood} min={1} max={10} onChange={v=>setTodayLog(p=>({...p,mood:v}))} color={C.blue}/>
            <SliderInput T={T} label="Energy" value={todayLog.energy} min={1} max={10} onChange={v=>setTodayLog(p=>({...p,energy:v}))} color={C.amber}/>
            <SliderInput T={T} label="Stress" value={todayLog.stress} min={1} max={10} onChange={v=>setTodayLog(p=>({...p,stress:v}))} color={C.red}/>
          </div>
          <div style={{ marginTop:16 }}>
            <div style={{ fontSize:13, color:T.textMuted, marginBottom:8 }}>Emotion Tags</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {EMOTION_TAGS.map(e=>(
                <Chip key={e} label={e} active={tags.includes(e)} onClick={()=>setTags(t=>t.includes(e)?t.filter(x=>x!==e):[...t,e])} color={C.blue}/>
              ))}
            </div>
          </div>
          <button onClick={saveMood} style={{ marginTop:16, width:"100%", padding:"10px", background:C.blue, color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14 }}>
            Save Mood Entry
          </button>
        </GlassCard>
        <GlassCard T={T}>
          <h3 style={{ margin:"0 0 1rem", fontSize:15, fontWeight:600, color:T.text }}>Emotion Frequency</h3>
          {emotionCounts.length === 0 ? (
            <EmptyState T={T} icon="🏷️" title="No emotion data yet" sub="Log moods with emotion tags to see frequency"/>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={emotionCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name})=>name} labelLine={false}>
                  {emotionCounts.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                </Pie>
                <Tooltip contentStyle={{ background:T.cardBg, border:`1px solid ${T.cardBorder}`, color:T.text }}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </div>

      <GlassCard T={T}>
        <h3 style={{ margin:"0 0 1rem", fontSize:15, fontWeight:600, color:T.text }}>Mood Trend (Last 30 Entries)</h3>
        {trendData.length === 0 ? (
          <EmptyState T={T} icon="📈" title="No trend data yet" sub="Log your mood daily to see trends here"/>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData}>
              <XAxis dataKey="day" tick={{ fontSize:11, fill:T.textMuted }} axisLine={false} tickLine={false}/>
              <YAxis domain={[0,10]} tick={{ fontSize:11, fill:T.textMuted }} axisLine={false} tickLine={false} width={25}/>
              <CartesianGrid strokeDasharray="3 3" stroke={T.gridStroke}/>
              <Tooltip contentStyle={{ background:T.cardBg, border:`1px solid ${T.cardBorder}`, color:T.text }}/>
              <Line type="monotone" dataKey="mood" stroke={C.blue} strokeWidth={2} dot={false} name="Mood"/>
              <Line type="monotone" dataKey="energy" stroke={C.amber} strokeWidth={2} dot={false} name="Energy"/>
              <Line type="monotone" dataKey="stress" stroke={C.red} strokeWidth={2} dot={false} name="Stress" strokeDasharray="4 2"/>
              <Legend wrapperStyle={{ fontSize:11, color:T.textMuted }}/>
            </LineChart>
          </ResponsiveContainer>
        )}
      </GlassCard>

      <GlassCard T={T}>
        <h3 style={{ margin:"0 0 1rem", fontSize:15, fontWeight:600, color:T.text }}>Mood Calendar</h3>
        {calendarData.length === 0 ? (
          <EmptyState T={T} icon="📅" title="No calendar data yet" sub="Log your mood to populate the calendar"/>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:5 }}>
            {DAYS.map(d=><div key={d} style={{ textAlign:"center", fontSize:10, color:T.textMuted, fontWeight:600, padding:4 }}>{d}</div>)}
            {calendarData.map((m,i)=>{
              const bg = m.mood>=8?C.green:m.mood>=6?C.teal:m.mood>=4?C.amber:C.red;
              return (
                <div key={i} style={{ aspectRatio:1, borderRadius:8, background:`${bg}28`, border:`1.5px solid ${bg}44`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:10, color:T.text, fontWeight:500 }}>{i+1}</span>
                  <span style={{ fontSize:9, color:bg, fontWeight:700 }}>{m.mood}</span>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// ─── SLEEP TRACKER ────────────────────────────────────────────────────────────
function SleepTracker({ todayLog, setTodayLog, sleepHistory, setSleepHistory, userProfile, T }) {
  const [bedtime, setBedtime] = useState("23:00");
  const [waketime, setWaketime] = useState("07:00");
  const [quality, setQuality] = useState(7);
  const [toast, setToast] = useState("");
  const { sleepGoal=8 } = userProfile;

  function calcDuration(bed, wake) {
    const [bh,bm] = bed.split(":").map(Number);
    const [wh,wm] = wake.split(":").map(Number);
    let mins = (wh*60+wm)-(bh*60+bm);
    if (mins<0) mins+=1440;
    return +(mins/60).toFixed(1);
  }
  const duration = calcDuration(bedtime, waketime);

  function saveSleep() {
    setTodayLog(p=>({...p, sleep:duration, sleepHours:duration}));
    setSleepHistory(prev=>[{ id:Date.now(), date:new Date().toISOString().slice(0,10), duration, quality, bedtime, waketime }, ...prev.slice(0,89)]);
    setToast("Sleep logged!");
    setTimeout(()=>setToast(""),2500);
  }

  const insight = duration>=sleepGoal
    ? `Great! ${sleepGoal}h+ sleep correlates with 18% higher productivity tomorrow.`
    : duration>=6
    ? "Slightly below optimal. Aim for your sleep goal for best performance."
    : "Sleep debt detected. Stress and mood will be impacted.";

  const weeklyData = sleepHistory.slice(0,7).reverse().map((d,i)=>({ day:DAYS[i%7], sleep:d.duration??0, quality:d.quality??0 }));
  const avgSleep = safeAvg(sleepHistory.slice(0,7), "duration");
  const bestSleep = sleepHistory.length ? Math.max(...sleepHistory.slice(0,7).map(d=>d.duration??0)) : 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
      <SaveToast msg={toast}/>
      <SectionHeader T={T} icon="🌙" title="Sleep Tracker" sub="Understand how sleep shapes your entire day"/>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem" }}>
        <StatCard T={T} icon="⏱" label="Tonight" value={`${duration}h`} color={duration>=sleepGoal?C.green:C.amber}/>
        <StatCard T={T} icon="📊" label="Avg (7 days)" value={avgSleep>0?`${avgSleep}h`:"—"} color={C.blue}/>
        <StatCard T={T} icon="🏆" label="Best Night" value={bestSleep>0?`${bestSleep}h`:"—"} color={C.purple}/>
      </div>
      <GlassCard T={T}>
        <h3 style={{ margin:"0 0 1rem", fontSize:15, fontWeight:600, color:T.text }}>Log Tonight's Sleep</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {[["Bedtime",bedtime,setBedtime],["Wake Time",waketime,setWaketime]].map(([lbl,val,setter])=>(
            <div key={lbl}>
              <label style={{ fontSize:12, color:T.textMuted, display:"block", marginBottom:4 }}>{lbl}</label>
              <input type="time" value={val} onChange={e=>setter(e.target.value)}
                style={{ width:"100%", padding:"8px 12px", borderRadius:10, border:`1px solid ${T.inputBorder}`, fontSize:14, background:T.inputBg, color:T.text, outline:"none" }}/>
            </div>
          ))}
        </div>
        <div style={{ marginTop:16 }}>
          <SliderInput T={T} label="Sleep Quality" value={quality} min={1} max={10} onChange={setQuality} color={C.teal}/>
        </div>
        <div style={{ marginTop:12, padding:"10px 14px", background:`${C.teal}14`, borderRadius:10, fontSize:12, color:C.teal, lineHeight:1.6 }}>
          💡 {insight}
        </div>
        <button onClick={saveSleep} style={{ marginTop:14, width:"100%", padding:"10px", background:C.teal, color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14 }}>
          Save Sleep Log
        </button>
      </GlassCard>
      <GlassCard T={T}>
        <h3 style={{ margin:"0 0 1rem", fontSize:15, fontWeight:600, color:T.text }}>Weekly Sleep Duration</h3>
        {weeklyData.length === 0 ? (
          <EmptyState T={T} icon="🌙" title="No sleep history yet" sub="Log your sleep to see weekly trends"/>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" tick={{ fontSize:11, fill:T.textMuted }} axisLine={false} tickLine={false}/>
              <YAxis domain={[0,12]} tick={{ fontSize:11, fill:T.textMuted }} axisLine={false} tickLine={false} width={25}/>
              <CartesianGrid strokeDasharray="3 3" stroke={T.gridStroke}/>
              <Tooltip contentStyle={{ background:T.cardBg, border:`1px solid ${T.cardBorder}`, color:T.text }} formatter={v=>[`${v}h`,"Sleep"]}/>
              <Bar dataKey="sleep" radius={[6,6,0,0]}>
                {weeklyData.map((d,i)=><Cell key={i} fill={d.sleep>=sleepGoal?C.teal:d.sleep>=6?C.blue:C.amber}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </GlassCard>
    </div>
  );
}

// ─── FITNESS TRACKER ──────────────────────────────────────────────────────────
function FitnessTracker({ todayLog, setTodayLog, fitnessHistory, setFitnessHistory, userProfile, T }) {
  const [workoutType, setWorkoutType] = useState("Strength");
  const [weightInput, setWeightInput] = useState("");
  const [toast, setToast] = useState("");
  const WORKOUT_TYPES = ["Strength","Cardio","Yoga","HIIT","Running","Cycling"];
  const { stepGoal=5000, waterGoal=3.5 } = userProfile;

  function saveWorkout() {
    const entry = {
      id: Date.now(),
      date: new Date().toISOString().slice(0,10),
      workoutType,
      steps: todayLog.steps,
      waterConsumed: todayLog.waterConsumed,
      weight: weightInput ? parseFloat(weightInput) : null,
    };
    setFitnessHistory(prev=>[entry,...prev.slice(0,89)]);
    setTodayLog(p=>({...p, workout:true, workoutType}));
    setToast("Workout logged!");
    setTimeout(()=>setToast(""),2500);
  }

  const weeklyWorkouts = fitnessHistory.slice(0,7).reverse().map((d,i)=>({
    day: DAYS[i%7],
    steps: d.steps ?? 0,
    water: d.waterConsumed ?? 0,
    workout: !!d.workoutType,
  }));

  const workoutsThisWeek = fitnessHistory.slice(0,7).filter(d=>!!d.workoutType).length;
  const avgSteps = safeAvg(fitnessHistory.slice(0,7),"steps");
  const avgWater = safeAvg(fitnessHistory.slice(0,7),"waterConsumed");
  const activeDays = fitnessHistory.slice(0,7).filter(d=>(d.steps??0)>5000).length;

  const weightHistory = fitnessHistory.filter(d=>d.weight!=null).slice(0,8).reverse().map((d,i)=>({ week:`W${i+1}`, weight:d.weight }));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
      <SaveToast msg={toast}/>
      <SectionHeader T={T} icon="🏃" title="Fitness Tracker" sub="Track workouts, hydration, and body metrics"/>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:"1rem" }}>
        <StatCard T={T} icon="🏋️" label="Workouts/Week" value={workoutsThisWeek} color={C.green}/>
        <StatCard T={T} icon="👟" label="Avg Daily Steps" value={avgSteps>0?`${(avgSteps/1000).toFixed(1)}k`:"—"} color={C.blue}/>
        <StatCard T={T} icon="💧" label="Avg Water" value={avgWater>0?`${avgWater}L`:"—"} color={C.teal}/>
        <StatCard T={T} icon="🔥" label="Active Days" value={`${activeDays}/7`} color={C.amber}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
        <GlassCard T={T}>
          <h3 style={{ margin:"0 0 1rem", fontSize:15, fontWeight:600, color:T.text }}>Log Today's Activity</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <div style={{ fontSize:12, color:T.textMuted, marginBottom:6 }}>Workout Type</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {WORKOUT_TYPES.map(t=>(
                  <Chip key={t} label={t} active={workoutType===t} onClick={()=>setWorkoutType(t)} color={C.green}/>
                ))}
              </div>
            </div>
            {/* Water: decimal input in 0.1L increments */}
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}>
                <span style={{ color:T.textMuted }}>Water Consumed</span>
                <span style={{ fontWeight:600, color:C.teal }}>{todayLog.waterConsumed}L / {waterGoal}L</span>
              </div>
              <input type="range" min={0} max={waterGoal * 10} step={1} value={Math.round(todayLog.waterConsumed*10)}
                onChange={e=>setTodayLog(p=>({...p,waterConsumed:+(e.target.value/10).toFixed(1)}))}
                style={{ width:"100%", accentColor:C.teal, cursor:"pointer" }}/>
              <ProgressBar T={T} value={todayLog.waterConsumed} max={waterGoal} color={C.teal} height={6}/>
            </div>
            {/* Steps */}
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}>
                <span style={{ color:T.textMuted }}>Daily Steps</span>
                <span style={{ fontWeight:600, color:C.blue }}>{todayLog.steps.toLocaleString()} / {stepGoal.toLocaleString()}</span>
              </div>
              <input type="range" min={0} max={Math.max(stepGoal*2,20000)} step={100} value={todayLog.steps}
                onChange={e=>setTodayLog(p=>({...p,steps:+e.target.value}))}
                style={{ width:"100%", accentColor:C.blue, cursor:"pointer" }}/>
              <ProgressBar T={T} value={todayLog.steps} max={stepGoal} color={C.blue} height={6}/>
            </div>
            {/* Weight */}
            <div>
              <label style={{ fontSize:12, color:T.textMuted, display:"block", marginBottom:4 }}>Weight (kg) — optional</label>
              <input type="number" min={30} max={250} step={0.1} value={weightInput} onChange={e=>setWeightInput(e.target.value)}
                placeholder="e.g. 72.5"
                style={{ width:"100%", padding:"8px 12px", borderRadius:10, border:`1px solid ${T.inputBorder}`, fontSize:14, background:T.inputBg, color:T.text, outline:"none" }}/>
            </div>
          </div>
          <button onClick={saveWorkout} style={{ marginTop:14, width:"100%", padding:"10px", background:C.green, color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14 }}>
            Log Workout
          </button>
        </GlassCard>

        <GlassCard T={T}>
          <h3 style={{ margin:"0 0 0.75rem", fontSize:15, fontWeight:600, color:T.text }}>Weekly Consistency</h3>
          <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:16 }}>
            {(weeklyWorkouts.length > 0 ? weeklyWorkouts : DAYS.map(d=>({day:d,workout:false}))).map((d,i)=>(
              <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:d.workout?C.green:T.trackBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:"#fff" }}>
                  {d.workout?"✓":""}
                </div>
                <span style={{ fontSize:10, color:T.textMuted }}>{d.day}</span>
              </div>
            ))}
          </div>
          <h3 style={{ margin:"0 0 0.5rem", fontSize:14, fontWeight:600, color:T.text }}>Hydration Goal ({waterGoal}L)</h3>
          {weeklyWorkouts.length === 0 ? (
            <div style={{ fontSize:12, color:T.textMuted, padding:"0.5rem 0" }}>Log workouts to see weekly hydration</div>
          ) : weeklyWorkouts.map((d,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
              <span style={{ width:28, fontSize:11, color:T.textMuted }}>{d.day}</span>
              <div style={{ flex:1 }}><ProgressBar T={T} value={d.water} max={waterGoal} color={C.teal} height={6}/></div>
              <span style={{ fontSize:11, width:32, textAlign:"right", color:C.teal }}>{d.water}L</span>
            </div>
          ))}
        </GlassCard>
      </div>

      <GlassCard T={T}>
        <h3 style={{ margin:"0 0 1rem", fontSize:15, fontWeight:600, color:T.text }}>Weight Trend</h3>
        {weightHistory.length < 2 ? (
          <EmptyState T={T} icon="⚖️" title="Not enough weight data" sub="Log your weight during workouts to see the trend"/>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weightHistory}>
              <XAxis dataKey="week" tick={{ fontSize:11, fill:T.textMuted }} axisLine={false} tickLine={false}/>
              <YAxis domain={["dataMin - 2","dataMax + 2"]} tick={{ fontSize:11, fill:T.textMuted }} axisLine={false} tickLine={false} width={35}/>
              <CartesianGrid strokeDasharray="3 3" stroke={T.gridStroke}/>
              <Tooltip contentStyle={{ background:T.cardBg, border:`1px solid ${T.cardBorder}`, color:T.text }} formatter={v=>[`${v} kg`,"Weight"]}/>
              <Line type="monotone" dataKey="weight" stroke={C.purple} strokeWidth={2.5} dot={{ r:4, fill:C.purple }}/>
            </LineChart>
          </ResponsiveContainer>
        )}
      </GlassCard>
    </div>
  );
}

// ─── HABIT TRACKER ────────────────────────────────────────────────────────────
function HabitTracker({ habits, setHabits, T }) {
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
      <SectionHeader T={T} icon="✅" title="Habit Tracker" sub="Build streaks. Earn XP. Become consistent."/>
      <GlassCard T={T}>
        <div style={{ display:"flex", gap:8 }}>
          <input value={newHabit} onChange={e=>setNewHabit(e.target.value)}
            placeholder="Add a new habit (press Enter)..."
            onKeyDown={e=>e.key==="Enter"&&addHabit()}
            style={{ flex:1, padding:"8px 12px", borderRadius:10, border:`1px solid ${T.inputBorder}`, fontSize:14, background:T.inputBg, color:T.text, outline:"none" }}/>
          <button onClick={addHabit}
            style={{ padding:"8px 18px", background:C.blue, color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14 }}>
            + Add
          </button>
        </div>
      </GlassCard>
      <GlassCard T={T} style={{ overflowX:"auto" }}>
        <div style={{ minWidth:520 }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr repeat(7,1fr) 60px 36px", gap:4, alignItems:"center", marginBottom:8, paddingBottom:8, borderBottom:`1px solid ${T.gridStroke}` }}>
            <span style={{ fontSize:12, color:T.textMuted, fontWeight:600 }}>Habit</span>
            {DAYS.map(d=><span key={d} style={{ fontSize:11, color:T.textMuted, textAlign:"center", fontWeight:500 }}>{d}</span>)}
            <span style={{ fontSize:11, color:T.textMuted, textAlign:"center" }}>Streak</span>
            <span/>
          </div>
          {habits.length === 0 && (
            <div style={{ textAlign:"center", padding:"2rem 0", color:T.textMuted, fontSize:13 }}>No habits yet. Add one above!</div>
          )}
          {habits.map(h=>{
            const pctDone = Math.round(h.completedDays.filter(Boolean).length/7*100);
            return (
              <div key={h.id} style={{ display:"grid", gridTemplateColumns:"2fr repeat(7,1fr) 60px 36px", gap:4, alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${T.gridStroke}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:16 }}>{h.icon}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{h.name}</div>
                    <div style={{ fontSize:10, color:T.textMuted }}>{pctDone}% this week</div>
                  </div>
                </div>
                {h.completedDays.map((done,i)=>(
                  <button key={i} onClick={()=>toggleDay(h.id,i)}
                    style={{ width:28, height:28, borderRadius:6, border:`1.5px solid ${done?C.green:T.inputBorder}`, background:done?C.green:T.inputBg, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"#fff", margin:"0 auto", transition:"all .15s" }}>
                    {done?"✓":""}
                  </button>
                ))}
                <div style={{ textAlign:"center" }}>
                  <span style={{ background:`${C.amber}22`, color:C.amber, fontSize:11, padding:"2px 7px", borderRadius:99, fontWeight:600 }}>
                    🔥{h.streak}
                  </span>
                </div>
                <button onClick={()=>deleteHabit(h.id)}
                  style={{ width:28, height:28, borderRadius:6, border:`1px solid ${T.inputBorder}`, background:"transparent", cursor:"pointer", color:C.red, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>
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
  const [entries, setEntries] = useState([]);
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

  function deleteEntry(id) { setEntries(prev=>prev.filter(e=>e.id!==id)); }

  const sColor = s=>s==="positive"?C.green:s==="negative"?C.red:C.amber;
  const sEmoji = s=>s==="positive"?"😊":s==="negative"?"😔":"😐";

  const KEYWORDS = ["sleep","mood","energy","stress","productive","focus","anxious","happy","tired","workout","meditation","grateful"];
  const wordFreq = KEYWORDS.map(k=>({
    word:k, count:entries.reduce((s,e)=>s+(e.entry.toLowerCase().split(k).length-1),0),
  })).filter(k=>k.count>0).sort((a,b)=>b.count-a.count);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
      <SaveToast msg={toast}/>
      <SectionHeader T={T} icon="📓" title="Journal" sub="Daily reflections with sentiment analysis"/>
      <GlassCard T={T}>
        <div style={{ display:"flex", gap:8, marginBottom:"1rem" }}>
          {["list","write"].map(v=>(
            <Chip key={v} label={v==="list"?"📋 Entries":"✍️ Write"} active={view===v} onClick={()=>setView(v)} color={C.blue}/>
          ))}
        </div>
        {view==="write" ? (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Entry title..."
              style={{ padding:"10px 14px", borderRadius:10, border:`1px solid ${T.inputBorder}`, fontSize:14, background:T.inputBg, color:T.text, outline:"none" }}/>
            <textarea value={entry} onChange={e=>setEntry(e.target.value)} placeholder="Write your reflection here..." rows={6}
              style={{ padding:"10px 14px", borderRadius:10, border:`1px solid ${T.inputBorder}`, fontSize:14, background:T.inputBg, color:T.text, outline:"none", resize:"vertical", fontFamily:"inherit" }}/>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={saveEntry}
                style={{ flex:1, padding:"10px", background:C.blue, color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14 }}>
                Save Entry
              </button>
              <button onClick={()=>setView("list")}
                style={{ padding:"10px 16px", background:"transparent", color:T.textMuted, border:`1px solid ${T.inputBorder}`, borderRadius:10, cursor:"pointer", fontSize:14 }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {entries.length===0 && <EmptyState T={T} icon="✍️" title="No entries yet" sub="Click 'Write' to start your first journal entry"/>}
            {entries.map(e=>(
              <div key={e.id} style={{ padding:"12px 14px", background:`${sColor(e.sentiment)}0c`, borderRadius:12, border:`1px solid ${sColor(e.sentiment)}25` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span>{sEmoji(e.sentiment)}</span>
                    <span style={{ fontWeight:600, fontSize:14, color:T.text }}>{e.title}</span>
                    <span style={{ fontSize:10, padding:"2px 8px", borderRadius:99, background:`${sColor(e.sentiment)}22`, color:sColor(e.sentiment), fontWeight:500, textTransform:"capitalize" }}>{e.sentiment}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:11, color:T.textMuted }}>{e.date}</span>
                    <button onClick={()=>deleteEntry(e.id)}
                      style={{ background:"transparent", border:"none", cursor:"pointer", color:C.red, fontSize:16, lineHeight:1, padding:"0 2px" }}>×</button>
                  </div>
                </div>
                <p style={{ margin:0, fontSize:13, color:T.textSub, lineHeight:1.6 }}>{e.entry}</p>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
      {wordFreq.length>0&&(
        <GlassCard T={T}>
          <h3 style={{ margin:"0 0 1rem", fontSize:15, fontWeight:600, color:T.text }}>Keyword Cloud</h3>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, padding:"0.5rem 0" }}>
            {wordFreq.map((k,i)=>{
              const colors=[C.blue,C.teal,C.green,C.purple,C.amber];
              return <span key={k.word} style={{ fontSize:Math.min(12+k.count*4,26), color:colors[i%colors.length], fontWeight:700, cursor:"default" }}>{k.word}</span>;
            })}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

// ─── PRODUCTIVITY ─────────────────────────────────────────────────────────────
function Productivity({ todayLog, setTodayLog, allocationHours, setAllocationHours, T }) {
  const [toast, setToast] = useState("");

  const {
    sleepHours=0, studyHours=0, workHours=0,
    fitnessHours=0, socialHours=0, entertainmentHours=0, otherHours=0,
  } = allocationHours;

  const totalAllocated = sleepHours + studyHours + workHours + fitnessHours + socialHours + entertainmentHours + otherHours;
  const remainingHours = Math.max(0, +(24 - totalAllocated).toFixed(1));
  const isOverLimit = totalAllocated > 24;

  function setHour(key, val) {
    setAllocationHours(prev => {
      const next = {...prev, [key]: val};
      const total = Object.values(next).reduce((s,v)=>s+v,0);
      if (total > 24) return prev; // prevent exceeding 24h
      return next;
    });
  }

  const heatmapData = Array.from({length:35},(_,i)=>({ day:i+1, value:0 }));

  const prodScore = Math.min(100, Math.round(
    Math.min(studyHours,6)/6*40 + Math.min(workHours,8)/8*40 + (todayLog.workout?20:0)
  ));

  function saveProductivity() {
    setTodayLog(p=>({...p, studyHours, workHours, fitnessHours, socialHours, entertainmentHours, otherHours, sleepHours}));
    setToast("Productivity saved!");
    setTimeout(()=>setToast(""),2500);
  }

  const ALLOCATION_CATS = [
    { key:"sleepHours",    label:"Sleep",          color:C.teal,   icon:"🌙", val:sleepHours },
    { key:"studyHours",    label:"Study",          color:C.blue,   icon:"📚", val:studyHours },
    { key:"workHours",     label:"Work",           color:C.purple, icon:"💼", val:workHours },
    { key:"fitnessHours",  label:"Fitness",        color:C.green,  icon:"🏃", val:fitnessHours },
    { key:"socialHours",   label:"Social",         color:C.amber,  icon:"🤝", val:socialHours },
    { key:"entertainmentHours", label:"Entertainment", color:C.red,    icon:"🎮", val:entertainmentHours },
    { key:"otherHours",    label:"Other",          color:"#94A3B8", icon:"📦", val:otherHours },
  ];

  const pieData = ALLOCATION_CATS.filter(c=>c.val>0).map(c=>({name:c.label, value:c.val, color:c.color}));
  if(remainingHours>0) pieData.push({name:"Free", value:remainingHours, color:"#E2E8F0"});

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
      <SaveToast msg={toast}/>
      <SectionHeader T={T} icon="💼" title="Productivity Tracker" sub="Allocate your 24 hours and track focus"/>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
        <GlassCard T={T}>
          <h3 style={{ margin:"0 0 0.5rem", fontSize:15, fontWeight:600, color:T.text }}>Daily Time Allocation</h3>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
            <span style={{ fontSize:12, color:T.textMuted }}>Total: {totalAllocated.toFixed(1)}h / 24h</span>
            <span style={{ fontSize:13, fontWeight:700, color:isOverLimit?C.red:remainingHours===0?C.green:C.amber }}>
              {isOverLimit ? "Over by "+((totalAllocated-24).toFixed(1))+"h" : remainingHours+"h remaining"}
            </span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {ALLOCATION_CATS.map(c=>(
              <SliderInput key={c.key} T={T} label={`${c.icon} ${c.label}`} value={c.val} min={0} max={16} unit="h"
                onChange={v=>setHour(c.key,v)} color={c.color}/>
            ))}
          </div>
          {isOverLimit && (
            <div style={{ marginTop:10, padding:"8px 12px", background:`${C.red}14`, borderRadius:8, fontSize:12, color:C.red }}>
              ⚠️ Total exceeds 24 hours. Reduce some categories.
            </div>
          )}
          <button onClick={saveProductivity}
            style={{ marginTop:14, width:"100%", padding:"10px", background:C.purple, color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14 }}>
            Save Allocation
          </button>
        </GlassCard>

        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          <GlassCard T={T} style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
            <div style={{ fontSize:13, color:T.textMuted, marginBottom:8 }}>Productivity Score</div>
            <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <ResponsiveContainer width={140} height={140}>
                <RadialBarChart cx="50%" cy="50%" innerRadius={45} outerRadius={68} data={[{value:prodScore}]} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={8} fill={prodScore>=70?C.green:prodScore>=40?C.amber:C.red} background={{fill:T.trackBg}}/>
                </RadialBarChart>
              </ResponsiveContainer>
              <div style={{ position:"absolute", textAlign:"center" }}>
                <div style={{ fontSize:26, fontWeight:800, color:prodScore>=70?C.green:prodScore>=40?C.amber:C.red }}>{prodScore}</div>
                <div style={{ fontSize:10, color:T.textMuted }}>Score</div>
              </div>
            </div>
            <div style={{ fontSize:11, color:T.textMuted, textAlign:"center", marginTop:4 }}>
              {prodScore>=70?"🌟 Outstanding!":prodScore>=40?"📈 Good progress":"💤 Keep pushing"}
            </div>
          </GlassCard>
          <GlassCard T={T}>
            <h3 style={{ margin:"0 0 0.75rem", fontSize:14, fontWeight:600, color:T.text }}>Time Budget</h3>
            {ALLOCATION_CATS.map(c=>c.val>0&&(
              <div key={c.key} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <span style={{ fontSize:14 }}>{c.icon}</span>
                <div style={{ flex:1 }}><ProgressBar T={T} value={c.val} max={24} color={c.color} height={6}/></div>
                <span style={{ fontSize:11, width:40, textAlign:"right", color:c.color, fontWeight:600 }}>{c.val}h</span>
              </div>
            ))}
            {totalAllocated===0 && <div style={{ fontSize:12, color:T.textMuted }}>Log your hours to see breakdown</div>}
          </GlassCard>
        </div>
      </div>

      {/* Life Allocation Pie */}
      <GlassCard T={T}>
        <h3 style={{ margin:"0 0 1rem", fontSize:15, fontWeight:600, color:T.text }}>Life Allocation Visualization</h3>
        {pieData.length === 0 ? (
          <EmptyState T={T} icon="🥧" title="No allocation data yet" sub="Use the sliders above to allocate your hours"/>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", alignItems:"center" }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({name,value})=>`${name} ${value}h`} labelLine={false}>
                  {pieData.map((d,i)=><Cell key={i} fill={d.color}/>)}
                </Pie>
                <Tooltip contentStyle={{ background:T.cardBg, border:`1px solid ${T.cardBorder}`, color:T.text }} formatter={v=>[`${v}h`]}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {pieData.map((d,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12 }}>
                  <div style={{ width:10, height:10, borderRadius:2, background:d.color, flexShrink:0 }}/>
                  <span style={{ color:T.textSub }}>{d.name}</span>
                  <span style={{ marginLeft:"auto", fontWeight:600, color:d.color }}>{d.value}h</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      {/* Heatmap */}
      <GlassCard T={T}>
        <h3 style={{ margin:"0 0 1rem", fontSize:15, fontWeight:600, color:T.text }}>Consistency Heatmap (Last 5 Weeks)</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
          {DAYS.map(d=><div key={d} style={{ textAlign:"center", fontSize:10, color:T.textMuted, padding:"0 0 4px", fontWeight:500 }}>{d}</div>)}
          {heatmapData.map((d,i)=>(
            <div key={i} title={`Day ${d.day}`} style={{ aspectRatio:1, borderRadius:4, background:T.trackBg, cursor:"default" }}/>
          ))}
        </div>
        <div style={{ fontSize:11, color:T.textMuted, marginTop:8 }}>Heatmap will populate as you log daily data</div>
      </GlassCard>
    </div>
  );
}

// ─── CORRELATION ENGINE ───────────────────────────────────────────────────────
function CorrelationEngine({ moodHistory, sleepHistory, T }) {
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
  const corrText = v => v===1?T.textMuted:v>0?"#065F46":"#7F1D1D";

  // Build scatter from real data if available, else empty
  const scatterSleepMood = sleepHistory.slice(0,20).map((s,i) => {
    const m = moodHistory[i];
    return m ? {x:s.duration??0, y:m.mood??0} : null;
  }).filter(Boolean);

  const scatterSleepProd = sleepHistory.slice(0,20).map((s,i) => {
    return {x:s.duration??0, y:Math.round((s.quality??5)/10*100)};
  }).filter(d=>d.x>0);

  const insights = [
    {icon:"💤",text:"Higher sleep strongly correlates with better mood (r=0.72)",impact:"high"},
    {icon:"🏃",text:"Exercise days show 31% lower average stress levels",impact:"high"},
    {icon:"⚡",text:"Energy is your strongest productivity predictor (r=0.75)",impact:"high"},
    {icon:"🧘",text:"Meditation days follow with 18% higher focus scores",impact:"medium"},
    {icon:"💧",text:"Hydration above 2.5L correlates with better mood by 12%",impact:"medium"},
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
      <SectionHeader T={T} icon="🔗" title="Correlation Engine" sub="Discover how different life areas affect each other"/>
      <GlassCard T={T}>
        <h3 style={{ margin:"0 0 1rem", fontSize:15, fontWeight:600, color:T.text }}>Correlation Heatmap</h3>
        <div style={{ overflowX:"auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:`80px repeat(${metrics.length},1fr)`, gap:3, minWidth:380 }}>
            <div/>
            {metrics.map(m=><div key={m} style={{ fontSize:10, color:T.textMuted, textAlign:"center", padding:"4px 0", fontWeight:600, textTransform:"capitalize" }}>{m}</div>)}
            {corrMatrix.map(row=>[
              <div key={row.metric} style={{ fontSize:12, fontWeight:600, color:T.text, display:"flex", alignItems:"center" }}>{row.metric}</div>,
              ...metrics.map(m=>{
                const v=row[m];
                return (
                  <div key={m} style={{ background:corrColor(v), borderRadius:6, padding:"7px 0", textAlign:"center", fontSize:11, fontWeight:700, color:corrText(v) }}>
                    {v===1?"—":v.toFixed(2)}
                  </div>
                );
              })
            ])}
          </div>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:10, fontSize:11, color:T.textMuted, flexWrap:"wrap" }}>
          {[[C.green,"Strong +"],[C.teal,"Moderate +"],[C.amberLight,"Weak −"],[C.redLight,"Strong −"]].map(([clr,lbl])=>(
            <span key={lbl} style={{ display:"flex", alignItems:"center", gap:4 }}>
              <span style={{ width:12, height:12, background:clr, borderRadius:2, display:"inline-block" }}/>{lbl}
            </span>
          ))}
        </div>
      </GlassCard>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
        <GlassCard T={T}>
          <h3 style={{ margin:"0 0 1rem", fontSize:15, fontWeight:600, color:T.text }}>Sleep vs Mood</h3>
          {scatterSleepMood.length < 2 ? (
            <EmptyState T={T} icon="📉" title="Not enough data" sub="Log sleep & mood entries to see correlation"/>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke={T.gridStroke}/>
                <XAxis dataKey="x" name="Sleep (h)" tick={{ fontSize:11, fill:T.textMuted }} axisLine={false}/>
                <YAxis dataKey="y" name="Mood" domain={[0,10]} tick={{ fontSize:11, fill:T.textMuted }} axisLine={false}/>
                <Tooltip contentStyle={{ background:T.cardBg, border:`1px solid ${T.cardBorder}`, color:T.text }} cursor={{ strokeDasharray:"3 3" }}/>
                <Scatter data={scatterSleepMood} fill={C.blue} fillOpacity={0.7}/>
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
        <GlassCard T={T}>
          <h3 style={{ margin:"0 0 1rem", fontSize:15, fontWeight:600, color:T.text }}>Sleep vs Quality Score</h3>
          {scatterSleepProd.length < 2 ? (
            <EmptyState T={T} icon="📉" title="Not enough data" sub="Log more sleep entries to see correlation"/>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke={T.gridStroke}/>
                <XAxis dataKey="x" name="Sleep (h)" tick={{ fontSize:11, fill:T.textMuted }} axisLine={false}/>
                <YAxis dataKey="y" name="Quality %" domain={[0,100]} tick={{ fontSize:11, fill:T.textMuted }} axisLine={false}/>
                <Tooltip contentStyle={{ background:T.cardBg, border:`1px solid ${T.cardBorder}`, color:T.text }} cursor={{ strokeDasharray:"3 3" }}/>
                <Scatter data={scatterSleepProd} fill={C.purple} fillOpacity={0.7}/>
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </div>

      <GlassCard T={T}>
        <h3 style={{ margin:"0 0 1rem", fontSize:15, fontWeight:600, color:T.text }}>AI-Generated Insight Cards</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {insights.map((ins,i)=>(
            <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"12px 14px", background:ins.impact==="high"?`${C.blue}10`:`${C.teal}10`, borderRadius:12, border:`1px solid ${ins.impact==="high"?C.blue:C.teal}25` }}>
              <span style={{ fontSize:20, flexShrink:0 }}>{ins.icon}</span>
              <div style={{ flex:1, fontSize:13, color:T.textSub, lineHeight:1.5 }}>{ins.text}</div>
              <span style={{ fontSize:10, padding:"2px 8px", borderRadius:99, fontWeight:600, background:`${ins.impact==="high"?C.blue:C.teal}22`, color:ins.impact==="high"?C.blue:C.teal }}>{ins.impact}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
function Analytics({ todayLog, moodHistory, sleepHistory, habits, allocationHours, T }) {
  const avgMood = safeAvg(moodHistory.slice(0,30),"mood");
  const avgSleep = safeAvg(sleepHistory.slice(0,7),"duration");
  const avgStress = safeAvg(moodHistory.slice(0,30),"stress");

  const predictions = [
    { label:"Tomorrow's Mood", val:avgMood>0?`${Math.min(10,+(avgMood*1.05).toFixed(1))}/10`:"—", conf:avgMood>0?78:0, color:C.blue },
    { label:"Productivity",    val:allocationHours.studyHours+allocationHours.workHours>0?`${Math.min(100,Math.round((allocationHours.studyHours+allocationHours.workHours)/8*100))}%`:"—", conf:allocationHours.workHours>0?71:0, color:C.purple },
    { label:"Burnout Risk",    val:todayLog.stress<6&&todayLog.sleep>6?"Low":"Moderate", conf:sleepHistory.length>0?82:0, color:C.green },
  ];

  const trendData = moodHistory.slice(0,30).reverse().map((d,i)=>({
    day:i+1, mood:d.mood??0, energy:d.energy??0, stress:d.stress??0,
  }));

  const bestHabit = habits.length ? habits.reduce((a,b)=>a.streak>=b.streak?a:b) : null;
  const weakestHabit = habits.length ? habits.reduce((a,b)=>a.streak<=b.streak?a:b) : null;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
      <SectionHeader T={T} icon="📊" title="Analytics & Reports" sub="Monthly performance overview and predictions"/>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:"1rem" }}>
        <StatCard T={T} icon="😊" label="Avg Mood" value={avgMood>0?`${avgMood}/10`:"—"} color={C.blue}/>
        <StatCard T={T} icon="🌙" label="Avg Sleep" value={avgSleep>0?`${avgSleep}h`:"—"} color={C.teal}/>
        <StatCard T={T} icon="😤" label="Avg Stress" value={avgStress>0?`${avgStress}/10`:"—"} color={C.red}/>
        <StatCard T={T} icon="📈" label="Entries Logged" value={moodHistory.length+sleepHistory.length} color={C.green} sub="total logs"/>
      </div>

      <GlassCard T={T}>
        <h3 style={{ margin:"0 0 1rem", fontSize:15, fontWeight:600, color:T.text }}>Weekly Summary</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
          {[
            { label:"Best Habit",     value:bestHabit?`${bestHabit.icon} ${bestHabit.name}`:"—",                 color:C.green },
            { label:"Weakest Habit",  value:weakestHabit?`${weakestHabit.icon} ${weakestHabit.name}`:"—",        color:C.amber },
            { label:"Burnout Risk",   value:todayLog.stress<6&&(todayLog.sleep>6||sleepHistory.length===0)?"✅ Low":"⚠️ Moderate", color:C.green },
            { label:"Mood Trend",     value:moodHistory.length>=2?((moodHistory[0].mood??5)>=(moodHistory[1].mood??5)?"📈 Improving":"📉 Watch this"):"—", color:C.blue },
          ].map((item,i)=>(
            <div key={i} style={{ padding:"12px 14px", background:`${item.color}0c`, borderRadius:12, border:`1px solid ${item.color}25` }}>
              <div style={{ fontSize:11, color:T.textMuted, marginBottom:4 }}>{item.label}</div>
              <div style={{ fontSize:14, fontWeight:700, color:item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard T={T}>
        <h3 style={{ margin:"0 0 1rem", fontSize:15, fontWeight:600, color:T.text }}>🔮 Tomorrow's Predictions</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem" }}>
          {predictions.map((p,i)=>(
            <div key={i} style={{ textAlign:"center", padding:"1rem", background:`${p.color}0c`, borderRadius:12, border:`1px solid ${p.color}22` }}>
              <div style={{ fontSize:11, color:T.textMuted, marginBottom:4 }}>{p.label}</div>
              <div style={{ fontSize:22, fontWeight:800, color:p.color }}>{p.val}</div>
              <div style={{ fontSize:10, color:T.textMuted, marginTop:6, marginBottom:4 }}>Confidence</div>
              <ProgressBar T={T} value={p.conf} color={p.color} height={4}/>
              <div style={{ fontSize:10, color:p.color, marginTop:3 }}>{p.conf>0?`${p.conf}%`:"No data yet"}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard T={T}>
        <h3 style={{ margin:"0 0 1rem", fontSize:15, fontWeight:600, color:T.text }}>30-Day Multi-Metric Overview</h3>
        {trendData.length === 0 ? (
          <EmptyState T={T} icon="📊" title="No analytics data yet" sub="Log your mood daily to see trends here"/>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <XAxis dataKey="day" tick={{ fontSize:10, fill:T.textMuted }} axisLine={false} tickLine={false} interval={4}/>
              <YAxis domain={[0,10]} tick={{ fontSize:10, fill:T.textMuted }} axisLine={false} tickLine={false} width={20}/>
              <CartesianGrid strokeDasharray="3 3" stroke={T.gridStroke}/>
              <Tooltip contentStyle={{ background:T.cardBg, border:`1px solid ${T.cardBorder}`, color:T.text }}/>
              <Line type="monotone" dataKey="mood" stroke={C.blue} strokeWidth={2} dot={false} name="Mood"/>
              <Line type="monotone" dataKey="energy" stroke={C.green} strokeWidth={2} dot={false} name="Energy"/>
              <Line type="monotone" dataKey="stress" stroke={C.red} strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Stress"/>
              <Legend wrapperStyle={{ fontSize:11, color:T.textMuted }}/>
            </LineChart>
          </ResponsiveContainer>
        )}
      </GlassCard>
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {id:"dashboard",    label:"Dashboard", icon:"🏠"},
  {id:"mood",         label:"Mood",      icon:"😊"},
  {id:"sleep",        label:"Sleep",     icon:"🌙"},
  {id:"fitness",      label:"Fitness",   icon:"🏃"},
  {id:"productivity", label:"Work",      icon:"💼"},
  {id:"habits",       label:"Habits",    icon:"✅"},
  {id:"journal",      label:"Journal",   icon:"📓"},
  {id:"correlations", label:"Insights",  icon:"🔗"},
  {id:"analytics",    label:"Analytics", icon:"📊"},
];

// ─── THEME TOGGLE ─────────────────────────────────────────────────────────────
function ThemeToggle({ themeMode, setThemeMode, T }) {
  const opts = [{val:"light",icon:"☀️"},{val:"auto",icon:"🌓"},{val:"dark",icon:"🌙"}];
  return (
    <div style={{ display:"flex", gap:2, background:T.trackBg, borderRadius:99, padding:3 }}>
      {opts.map(o=>(
        <button key={o.val} onClick={()=>setThemeMode(o.val)} title={o.val}
          style={{ width:30, height:30, borderRadius:99, border:"none", cursor:"pointer", fontSize:14, transition:"all .2s",
            background:themeMode===o.val?T.cardBg:"transparent",
            boxShadow:themeMode===o.val?"0 1px 4px rgba(0,0,0,0.15)":"none" }}>
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

  // ── Auth state (Supabase-ready) ──────────────────────────────────────────
  const [auth, setAuth] = useState(DEFAULT_AUTH);
  // Future: supabase.auth.onAuthStateChange((event, session) => setAuth({ isAuthenticated:!!session, user:session?.user ?? null, loading:false }))

  // ── User profile ─────────────────────────────────────────────────────────
  const [userProfile, setUserProfile] = useState(DEFAULT_USER_PROFILE);

  // ── Notification settings ────────────────────────────────────────────────
  const [notificationSettings, setNotificationSettings] = useState(DEFAULT_NOTIFICATION_SETTINGS);

  // ── Today's log (no random data) ─────────────────────────────────────────
  const [todayLog, setTodayLog] = useState({ ...EMPTY_DAY_LOG });

  // ── Life allocation hours ─────────────────────────────────────────────────
  const [allocationHours, setAllocationHours] = useState({
    sleepHours:0, studyHours:0, workHours:0,
    fitnessHours:0, socialHours:0, entertainmentHours:0, otherHours:0,
  });

  // ── Habits ────────────────────────────────────────────────────────────────
  const [habits, setHabits] = useState(HABITS_INIT);

  // ── History arrays (empty by default, populated by logging) ───────────────
  const [moodHistory, setMoodHistory] = useState([]);
  const [sleepHistory, setSleepHistory] = useState([]);
  const [fitnessHistory, setFitnessHistory] = useState([]);

  // ── System dark mode detection ────────────────────────────────────────────
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
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"system-ui,-apple-system,sans-serif", transition:"background .3s" }}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{height:4px;width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(100,100,100,.25);border-radius:99px}
        input[type=range]{height:4px;border-radius:99px}
      `}</style>

      {/* Header */}
      <div style={{ background:T.headerBg, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderBottom:`1px solid ${T.headerBorder}`, padding:"0 1.5rem", position:"sticky", top:0, zIndex:100, transition:"background .3s" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:56 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:10, background:`linear-gradient(135deg,${C.blue},${C.purple})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>
              🌿
            </div>
            <span style={{ fontSize:18, fontWeight:800, background:`linear-gradient(90deg,${C.blue},${C.purple})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              LifeOS
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:12, color:T.textMuted }}>
              {new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}
            </span>
            <ThemeToggle themeMode={themeMode} setThemeMode={setThemeMode} T={T}/>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"1rem 1rem 2rem" }}>
        {/* Nav */}
        <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:6, marginBottom:"1.25rem", scrollbarWidth:"none", WebkitOverflowScrolling:"touch" }}>
          {NAV_ITEMS.map(n=>(
            <button key={n.id} onClick={()=>setActiveTab(n.id)}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 14px", borderRadius:99, fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", border:"1.5px solid", transition:"all .2s",
                background:activeTab===n.id?C.blue:T.navInactive,
                borderColor:activeTab===n.id?C.blue:T.navInactiveBorder,
                color:activeTab===n.id?"#fff":T.navInactiveText,
                backdropFilter:"blur(8px)" }}>
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
        </div>

        {/* Pages */}
        {activeTab==="dashboard"    && <Dashboard todayLog={todayLog} habits={habits} userProfile={userProfile} allocationHours={allocationHours} T={T}/>}
        {activeTab==="mood"         && <MoodTracker todayLog={todayLog} setTodayLog={setTodayLog} moodHistory={moodHistory} setMoodHistory={setMoodHistory} T={T}/>}
        {activeTab==="sleep"        && <SleepTracker todayLog={todayLog} setTodayLog={setTodayLog} sleepHistory={sleepHistory} setSleepHistory={setSleepHistory} userProfile={userProfile} T={T}/>}
        {activeTab==="fitness"      && <FitnessTracker todayLog={todayLog} setTodayLog={setTodayLog} fitnessHistory={fitnessHistory} setFitnessHistory={setFitnessHistory} userProfile={userProfile} T={T}/>}
        {activeTab==="productivity" && <Productivity todayLog={todayLog} setTodayLog={setTodayLog} allocationHours={allocationHours} setAllocationHours={setAllocationHours} T={T}/>}
        {activeTab==="habits"       && <HabitTracker habits={habits} setHabits={setHabits} T={T}/>}
        {activeTab==="journal"      && <Journal T={T}/>}
        {activeTab==="correlations" && <CorrelationEngine moodHistory={moodHistory} sleepHistory={sleepHistory} T={T}/>}
        {activeTab==="analytics"    && <Analytics todayLog={todayLog} moodHistory={moodHistory} sleepHistory={sleepHistory} habits={habits} allocationHours={allocationHours} T={T}/>}
      </div>
    </div>
  );
}