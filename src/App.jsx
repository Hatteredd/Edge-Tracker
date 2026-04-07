import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://dqleytoljihbunqvhhje.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KUMKKujkvVe2f_KO4YIo2w_mozj-gBR";
const VALID_PASSCODE = "Rickjustine*123";       // ← change this
const OWNER_KEY = "Rickjustine*123";        // ← change this (or make it == passcode)

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── HELPERS ───────────────────────────────────────────────────────────────────
const calcR = (dir, entry, sl, exit) => {
  entry = parseFloat(entry); sl = parseFloat(sl); exit = parseFloat(exit);
  if (!entry || !sl || !exit || entry === sl) return 0;
  return dir === "Long"
    ? +((exit - entry) / (entry - sl)).toFixed(2)
    : +((entry - exit) / (sl - entry)).toFixed(2);
};
const calcOutcome = (r, hasExit) => {
  if (!hasExit) return "Open";
  return r > 0 ? "Win" : r < 0 ? "Loss" : "BE";
};
const fmt = (n, d = 2) => isNaN(n) || n === null ? "—" : Number(n).toFixed(d);

const SETUPS = ["CRT", "511 (CISD)"];
const TFS   = ["1m","3m","5m","15m","30m","1h","4h","D","W"];
const HTFS  = ["1h","4h","D","W","M"];
const DIRS  = ["Long","Short"];
const SESSIONS = ["Asia", "London", "New York"];
const DAYS     = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ─── STYLES ────────────────────────────────────────────────────────────────────
const G = {
  bg:       "#0a0b0d",
  surface:  "#111318",
  card:     "#161920",
  border:   "#1e2330",
  accent:   "#f0b429",
  green:    "#00d97e",
  red:      "#ff4d6d",
  blue:     "#4da6ff",
  muted:    "#4a5168",
  text:     "#c9d0e0",
  textDim:  "#6b7591",
  font:     "'IBM Plex Mono', 'Fira Code', monospace",
  fontSans: "'DM Sans', 'Segoe UI', sans-serif",
};

const injectStyles = () => {
  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${G.bg}; color: ${G.text}; font-family: ${G.font}; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: ${G.surface}; }
    ::-webkit-scrollbar-thumb { background: ${G.border}; border-radius: 2px; }
    input, select, textarea {
      background: ${G.bg}; color: ${G.text}; border: 1px solid ${G.border};
      font-family: ${G.font}; font-size: 13px; padding: 8px 10px;
      border-radius: 4px; outline: none; width: 100%;
      transition: border-color .15s;
    }
    input:focus, select:focus, textarea:focus { border-color: ${G.accent}; }
    input::placeholder { color: ${G.muted}; }
    select option { background: ${G.surface}; }
    button { cursor: pointer; font-family: ${G.font}; }
    .tab-active { color: ${G.accent} !important; border-bottom: 2px solid ${G.accent} !important; }
    .row-win  td:last-child { color: ${G.green}; }
    .row-loss td:last-child { color: ${G.red}; }
    .row-be   td:last-child { color: ${G.muted}; }
    .row-open td:last-child { color: ${G.blue}; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
    .fade-in { animation: fadeIn .25s ease forwards; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
    .pulse { animation: pulse 1.4s infinite; }
    tr:hover td { background: #1a1e2a !important; }
    .image-preview { 
      max-height: 120px; max-width: 200px; width: 100%; 
      object-fit: cover; border-radius: 4px; 
      margin-top: 4px; border: 1px solid ${G.border};
      cursor: zoom-in;
    }
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.8); 
      display: flex; align-items: center; justifyContent: center; 
      z-index: 1000; padding: 20px;
    }
    .modal-content {
      max-width: 90%; max-height: 90%; position: relative;
    }
    .modal-close {
      position: absolute; top: -30px; right: 0; color: #fff; 
      cursor: pointer; background: none; border: none; font-size: 16px;
    }
  `;
  document.head.appendChild(style);
};

// ─── PASSCODE SCREEN ──────────────────────────────────────────────────────────
function PasscodeScreen({ onUnlock }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);
  const [shake, setShake] = useState(false);

  const tryUnlock = () => {
    if (val === VALID_PASSCODE) { onUnlock(val); }
    else {
      setErr(true); setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setErr(false), 2000);
    }
  };

  return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:`radial-gradient(ellipse at 50% 40%, #0f1520 0%, ${G.bg} 70%)`,
      flexDirection:"column", gap:32,
    }}>
      {/* Grid overlay */}
      <div style={{
        position:"fixed", inset:0, pointerEvents:"none",
        backgroundImage:`linear-gradient(${G.border}33 1px, transparent 1px), linear-gradient(90deg, ${G.border}33 1px, transparent 1px)`,
        backgroundSize:"40px 40px", opacity:.4,
      }}/>

      <div style={{ textAlign:"center", position:"relative" }}>
        <div style={{ fontSize:11, letterSpacing:6, color:G.muted, marginBottom:8, textTransform:"uppercase" }}>
          ▸ SYSTEM ACCESS
        </div>
        <div style={{ fontSize:28, fontWeight:600, color:G.text, letterSpacing:2 }}>
          TRADING EDGE
        </div>
        <div style={{ fontSize:28, fontWeight:300, color:G.accent, letterSpacing:8 }}>
          TRACKER
        </div>
      </div>

      <div style={{
        background:G.surface, border:`1px solid ${err ? G.red : G.border}`,
        borderRadius:8, padding:"28px 32px", width:320, position:"relative",
        transform: shake ? "translateX(0)" : undefined,
        transition:"border-color .2s",
        boxShadow:`0 0 40px ${err ? G.red + "22" : G.accent + "08"}`,
      }}>
        <div style={{ fontSize:11, color:G.muted, marginBottom:12, letterSpacing:2, textTransform:"uppercase" }}>
          Enter Passcode
        </div>
        <input
          type="password" value={val} placeholder="••••••••"
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && tryUnlock()}
          style={{ fontSize:18, letterSpacing:4, textAlign:"center", marginBottom:14 }}
          autoFocus
        />
        {err && (
          <div style={{ color:G.red, fontSize:11, textAlign:"center", marginBottom:10 }}>
            ACCESS DENIED
          </div>
        )}
        <button onClick={tryUnlock} style={{
          width:"100%", padding:"10px", background:G.accent, color:"#000",
          border:"none", borderRadius:4, fontWeight:600, fontSize:13, letterSpacing:2,
          textTransform:"uppercase",
        }}>
          UNLOCK →
        </button>
      </div>
      <div style={{ color:G.muted, fontSize:10, letterSpacing:2 }}>
        NO ACCOUNT REQUIRED · PRIVATE BY DESIGN
      </div>
    </div>
  );
}

// ─── STAT CARD ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, sub }) {
  return (
    <div style={{
      background:G.card, border:`1px solid ${G.border}`, borderRadius:6,
      padding:"14px 18px", minWidth:120,
    }}>
      <div style={{ fontSize:9, color:G.muted, letterSpacing:3, textTransform:"uppercase", marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:600, color: color || G.text, letterSpacing:1 }}>{value}</div>
      {sub && <div style={{ fontSize:10, color:G.muted, marginTop:3 }}>{sub}</div>}
    </div>
  );
}

// ─── TRADE FORM ────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  pair:"", date: new Date().toISOString().slice(0,16),
  direction:"Long", setup:"CRT", htf:"D", entry_tf:"1h",
  entry_price:"", stop_loss:"", take_profit:"", exit_price:"", notes:"",
  before_image: "", after_image: "",
  session: "New York",
  day: new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()),
};

function TradeForm({ onSaved, editTrade, onCancelEdit }) {
  const [form, setForm] = useState(editTrade || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [modalImg, setModalImg] = useState(null);

  useEffect(() => { if (editTrade) setForm(editTrade); }, [editTrade]);

  const F = (k, v) => {
    setForm(p => {
      const next = { ...p, [k]: v };
      if (k === "date") {
        try {
          const d = new Date(v);
          if (!isNaN(d.getTime())) {
            next.day = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(d);
          }
        } catch (e) {}
      }
      return next;
    });
  };

  const preview = useMemo(() => {
    if (!form.entry_price || !form.stop_loss) return null;
    const hasExit = form.exit_price && !isNaN(parseFloat(form.exit_price));
    const r = hasExit ? calcR(form.direction, form.entry_price, form.stop_loss, form.exit_price) : 0;
    return { r, outcome: calcOutcome(r, hasExit) };
  }, [form.direction, form.entry_price, form.stop_loss, form.exit_price]);

  const submit = async () => {
    if (!form.pair || !form.entry_price || !form.stop_loss) {
      setMsg({ type:"err", text:"Fill in Pair, Entry, and SL." }); return;
    }
    setSaving(true);
    const hasExit = form.exit_price && !isNaN(parseFloat(form.exit_price));
    const r = hasExit ? calcR(form.direction, form.entry_price, form.stop_loss, form.exit_price) : null;
    const payload = {
      owner_key: OWNER_KEY,
      pair: form.pair.toUpperCase(),
      date: form.date,
      direction: form.direction,
      setup: form.setup,
      htf: form.htf,
      entry_tf: form.entry_tf,
      entry_price: parseFloat(form.entry_price),
      stop_loss: parseFloat(form.stop_loss),
      take_profit: form.take_profit ? parseFloat(form.take_profit) : null,
      exit_price: hasExit ? parseFloat(form.exit_price) : null,
      r_multiple: r,
      outcome: calcOutcome(r, hasExit),
      notes: form.notes,
      before_image: form.before_image,
      after_image: form.after_image,
      session: form.session,
      day: form.day,
    };
    let error;
    if (editTrade) {
      ({ error } = await supabase.from("trades").update(payload).eq("id", editTrade.id));
    } else {
      ({ error } = await supabase.from("trades").insert(payload));
    }
    setSaving(false);
    if (error) { setMsg({ type:"err", text: error.message }); return; }
    setMsg({ type:"ok", text: editTrade ? "Trade updated!" : "Trade logged ✓" });
    setTimeout(() => setMsg(null), 2500);
    if (!editTrade) setForm(EMPTY_FORM);
    onSaved();
  };

  const field = (label, key, type="text", opts=null) => (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <label style={{ fontSize:9, color:G.muted, letterSpacing:2, textTransform:"uppercase" }}>{label}</label>
      {opts ? (
        <select value={form[key]} onChange={e => F(key, e.target.value)}>
          {opts.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={form[key]} onChange={e => F(key, e.target.value)} placeholder={label} />
      )}
    </div>
  );

  return (
    <div style={{ background:G.card, border:`1px solid ${G.border}`, borderRadius:8, padding:20 }}>
      {modalImg && (
        <div className="modal-overlay" onClick={() => setModalImg(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalImg(null)}>✕ CLOSE</button>
            <img src={modalImg} style={{ width:"100%", height:"100%", objectFit:"contain", borderRadius:4 }} alt="Enlarged" />
          </div>
        </div>
      )}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <div style={{ fontSize:11, color:G.accent, letterSpacing:3, textTransform:"uppercase" }}>
          {editTrade ? "✎ Edit Trade" : "＋ Log Trade"}
        </div>
        {preview && (
          <div style={{
            background: preview.outcome==="Win" ? G.green+"18" : preview.outcome==="Loss" ? G.red+"18" : G.muted+"18",
            border:`1px solid ${preview.outcome==="Win" ? G.green : preview.outcome==="Loss" ? G.red : G.muted}44`,
            borderRadius:4, padding:"4px 12px", fontSize:12,
            color: preview.outcome==="Win" ? G.green : preview.outcome==="Loss" ? G.red : G.muted,
          }}>
            R: {fmt(preview.r)} · {preview.outcome}
          </div>
        )}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(140px, 1fr))", gap:12 }}>
        {field("Pair", "pair")}
        {field("Date / Time", "date", "datetime-local")}
        {field("Direction", "direction", "text", DIRS)}
        {field("Setup", "setup", "text", SETUPS)}
        {field("Session", "session", "text", SESSIONS)}
        {field("Day", "day", "text", DAYS)}
        {field("HTF", "htf", "text", HTFS)}
        {field("Entry TF", "entry_tf", "text", TFS)}
        {field("Entry Price", "entry_price", "number")}
        {field("Stop Loss", "stop_loss", "number")}
        {field("Take Profit", "take_profit", "number")}
        {field("Exit Price", "exit_price", "number")}
        {field("Before Image URL", "before_image")}
        {field("After Image URL", "after_image")}
      </div>
      {(form.before_image || form.after_image) && (
        <div style={{ display:"flex", gap:16, marginTop:12, flexWrap:"wrap" }}>
          {form.before_image && (
            <div style={{ flex:"0 0 auto" }}>
              <div style={{ fontSize:9, color:G.muted, marginBottom:4, letterSpacing:1 }}>BEFORE</div>
              <img 
                src={form.before_image} 
                className="image-preview" 
                alt="Before" 
                onClick={() => setModalImg(form.before_image)}
                onError={e => e.target.style.display='none'} 
              />
            </div>
          )}
          {form.after_image && (
            <div style={{ flex:"0 0 auto" }}>
              <div style={{ fontSize:9, color:G.muted, marginBottom:4, letterSpacing:1 }}>AFTER</div>
              <img 
                src={form.after_image} 
                className="image-preview" 
                alt="After" 
                onClick={() => setModalImg(form.after_image)}
                onError={e => e.target.style.display='none'} 
              />
            </div>
          )}
        </div>
      )}
      <div style={{ marginTop:12 }}>
        <label style={{ fontSize:9, color:G.muted, letterSpacing:2, textTransform:"uppercase", display:"block", marginBottom:4 }}>Notes</label>
        <textarea value={form.notes} onChange={e => F("notes", e.target.value)}
          rows={2} placeholder="Context, mistakes, confluences..." style={{ resize:"vertical" }} />
      </div>
      {msg && (
        <div style={{ marginTop:10, fontSize:11, color: msg.type==="ok" ? G.green : G.red, letterSpacing:1 }}>
          {msg.text}
        </div>
      )}
      <div style={{ display:"flex", gap:10, marginTop:14 }}>
        <button onClick={submit} disabled={saving} style={{
          padding:"9px 24px", background: saving ? G.muted : G.accent,
          color:"#000", border:"none", borderRadius:4, fontWeight:600,
          fontSize:12, letterSpacing:2, textTransform:"uppercase",
          flex:1, transition:"background .15s",
        }}>
          {saving ? <span className="pulse">SAVING…</span> : (editTrade ? "UPDATE TRADE" : "LOG TRADE")}
        </button>
        {editTrade && (
          <button onClick={onCancelEdit} style={{
            padding:"9px 18px", background:"transparent", color:G.muted,
            border:`1px solid ${G.border}`, borderRadius:4, fontSize:12,
          }}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

// ─── STATS DASHBOARD ──────────────────────────────────────────────────────────
function StatsDash({ trades }) {
  const stats = useMemo(() => {
    if (!trades.length) return null;
    const closedTrades = trades.filter(t => t.outcome !== "Open");
    const wins   = closedTrades.filter(t => t.outcome === "Win");
    const losses = closedTrades.filter(t => t.outcome === "Loss");
    const wr     = closedTrades.length ? wins.length / closedTrades.length : 0;
    const lr     = closedTrades.length ? losses.length / closedTrades.length : 0;
    const avgW   = wins.length   ? wins.reduce((s,t)   => s + t.r_multiple, 0) / wins.length   : 0;
    const avgL   = losses.length ? losses.reduce((s,t) => s + Math.abs(t.r_multiple), 0) / losses.length : 0;
    const edge   = (wr * avgW) - (lr * avgL);
    const totalR = closedTrades.reduce((s, t) => s + t.r_multiple, 0);

    // By setup (all trades included in total count, but only closed trades in R)
    const bySetup = {};
    const bySession = {};
    const byDay = {};

    trades.forEach(t => {
      // Setup
      if (!bySetup[t.setup]) bySetup[t.setup] = { wins:0, total:0, r:0, closed:0 };
      bySetup[t.setup].total++;
      if (t.outcome !== "Open") {
        bySetup[t.setup].closed++;
        bySetup[t.setup].r += t.r_multiple || 0;
        if (t.outcome === "Win") bySetup[t.setup].wins++;
      }

      // Session
      const sess = t.session || "Other";
      if (!bySession[sess]) bySession[sess] = { wins:0, total:0, r:0, closed:0 };
      bySession[sess].total++;
      if (t.outcome !== "Open") {
        bySession[sess].closed++;
        bySession[sess].r += t.r_multiple || 0;
        if (t.outcome === "Win") bySession[sess].wins++;
      }

      // Day
      const dname = t.day || "Other";
      if (!byDay[dname]) byDay[dname] = { wins:0, total:0, r:0, closed:0 };
      byDay[dname].total++;
      if (t.outcome !== "Open") {
        byDay[dname].closed++;
        byDay[dname].r += t.r_multiple || 0;
        if (t.outcome === "Win") byDay[dname].wins++;
      }
    });

    return { 
      wr, lr, avgW, avgL, edge, totalR, bySetup, bySession, byDay,
      total: trades.length, 
      closedCount: closedTrades.length,
      wins: wins.length, 
      losses: losses.length,
      openCount: trades.length - closedTrades.length
    };
  }, [trades]);

  if (!stats) return (
    <div style={{ background:G.card, border:`1px solid ${G.border}`, borderRadius:8, padding:24, textAlign:"center", color:G.muted, fontSize:12 }}>
      No trades yet — log your first trade above.
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ fontSize:11, color:G.accent, letterSpacing:3, textTransform:"uppercase" }}>◈ Stats Dashboard</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
        <StatCard label="Total Trades" value={stats.total} sub={`${stats.openCount} open`} />
        <StatCard label="Win Rate" value={`${(stats.wr*100).toFixed(1)}%`} color={G.green} sub={`${stats.wins} wins / ${stats.closedCount} closed`} />
        <StatCard label="Loss Rate" value={`${(stats.lr*100).toFixed(1)}%`} color={G.red} sub={`${stats.losses} losses`} />
        <StatCard label="Avg Win (R)" value={`+${fmt(stats.avgW)}`} color={G.green} />
        <StatCard label="Avg Loss (R)" value={`-${fmt(stats.avgL)}`} color={G.red} />
        <StatCard label="Edge" value={fmt(stats.edge)}
          color={stats.edge > 0 ? G.green : stats.edge < 0 ? G.red : G.muted}
          sub="(WR×AvgW) − (LR×AvgL)" />
        <StatCard label="Total R" value={`${stats.totalR >= 0 ? "+" : ""}${fmt(stats.totalR)}`}
          color={stats.totalR >= 0 ? G.green : G.red} />
      </div>

      {/* By Setup */}
      <div style={{ background:G.card, border:`1px solid ${G.border}`, borderRadius:6, overflow:"hidden" }}>
        <div style={{ padding:"10px 14px", fontSize:9, color:G.muted, letterSpacing:3, borderBottom:`1px solid ${G.border}`, textTransform:"uppercase" }}>
          Performance by Setup (Closed Trades)
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead>
            <tr style={{ background:G.surface }}>
              {["Setup","Trades","Win%","Total R"].map(h => (
                <th key={h} style={{ padding:"8px 14px", textAlign:"left", fontSize:9, color:G.muted, letterSpacing:2, fontWeight:400, borderBottom:`1px solid ${G.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(stats.bySetup).map(([s, d]) => (
              <tr key={s}>
                <td style={{ padding:"8px 14px", color:G.accent }}>{s}</td>
                <td style={{ padding:"8px 14px" }}>{d.total} <span style={{ color:G.muted, fontSize:10 }}>({d.closed} closed)</span></td>
                <td style={{ padding:"8px 14px", color: d.closed > 0 && d.wins/d.closed >= .5 ? G.green : G.red }}>
                  {d.closed > 0 ? (d.wins/d.closed*100).toFixed(0) : 0}%
                </td>
                <td style={{ padding:"8px 14px", color: d.r >= 0 ? G.green : G.red }}>
                  {d.r >= 0 ? "+" : ""}{fmt(d.r)}R
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:14 }}>
        {/* By Session */}
        <div style={{ background:G.card, border:`1px solid ${G.border}`, borderRadius:6, overflow:"hidden" }}>
          <div style={{ padding:"10px 14px", fontSize:9, color:G.muted, letterSpacing:3, borderBottom:`1px solid ${G.border}`, textTransform:"uppercase" }}>
            Performance by Session
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:G.surface }}>
                {["Session","Trades","Win%","Total R"].map(h => (
                  <th key={h} style={{ padding:"8px 14px", textAlign:"left", fontSize:9, color:G.muted, letterSpacing:2, fontWeight:400, borderBottom:`1px solid ${G.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.bySession).map(([s, d]) => (
                <tr key={s}>
                  <td style={{ padding:"8px 14px", color:G.accent }}>{s}</td>
                  <td style={{ padding:"8px 14px" }}>{d.total} <span style={{ color:G.muted, fontSize:10 }}>({d.closed} closed)</span></td>
                  <td style={{ padding:"8px 14px", color: d.closed > 0 && d.wins/d.closed >= .5 ? G.green : G.red }}>
                    {d.closed > 0 ? (d.wins/d.closed*100).toFixed(0) : 0}%
                  </td>
                  <td style={{ padding:"8px 14px", color: d.r >= 0 ? G.green : G.red }}>
                    {d.r >= 0 ? "+" : ""}{fmt(d.r)}R
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* By Day */}
        <div style={{ background:G.card, border:`1px solid ${G.border}`, borderRadius:6, overflow:"hidden" }}>
          <div style={{ padding:"10px 14px", fontSize:9, color:G.muted, letterSpacing:3, borderBottom:`1px solid ${G.border}`, textTransform:"uppercase" }}>
            Performance by Day
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:G.surface }}>
                {["Day","Trades","Win%","Total R"].map(h => (
                  <th key={h} style={{ padding:"8px 14px", textAlign:"left", fontSize:9, color:G.muted, letterSpacing:2, fontWeight:400, borderBottom:`1px solid ${G.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.byDay).map(([s, d]) => (
                <tr key={s}>
                  <td style={{ padding:"8px 14px", color:G.accent }}>{s}</td>
                  <td style={{ padding:"8px 14px" }}>{d.total} <span style={{ color:G.muted, fontSize:10 }}>({d.closed} closed)</span></td>
                  <td style={{ padding:"8px 14px", color: d.closed > 0 && d.wins/d.closed >= .5 ? G.green : G.red }}>
                    {d.closed > 0 ? (d.wins/d.closed*100).toFixed(0) : 0}%
                  </td>
                  <td style={{ padding:"8px 14px", color: d.r >= 0 ? G.green : G.red }}>
                    {d.r >= 0 ? "+" : ""}{fmt(d.r)}R
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── TRADE TABLE ──────────────────────────────────────────────────────────────
function TradeTable({ trades, onEdit, onDelete, filterSetup, setFilterSetup }) {
  const filtered = filterSetup === "All" ? trades : trades.filter(t => t.setup === filterSetup);
  const setups = ["All", ...Array.from(new Set(trades.map(t => t.setup)))];
  const [modalImg, setModalImg] = useState(null);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {modalImg && (
        <div className="modal-overlay" onClick={() => setModalImg(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalImg(null)}>✕ CLOSE</button>
            <img src={modalImg} style={{ width:"100%", height:"100%", objectFit:"contain", borderRadius:4 }} alt="Enlarged" />
          </div>
        </div>
      )}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
        <div style={{ fontSize:11, color:G.accent, letterSpacing:3, textTransform:"uppercase" }}>≡ Trade Log</div>
        <div style={{ display:"flex", gap:6 }}>
          {setups.map(s => (
            <button key={s} onClick={() => setFilterSetup(s)} style={{
              padding:"4px 12px", fontSize:10, letterSpacing:1,
              background: filterSetup===s ? G.accent : "transparent",
              color: filterSetup===s ? "#000" : G.muted,
              border:`1px solid ${filterSetup===s ? G.accent : G.border}`,
              borderRadius:20, textTransform:"uppercase",
            }}>{s}</button>
          ))}
        </div>
      </div>
      <div style={{ background:G.card, border:`1px solid ${G.border}`, borderRadius:8, overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:G.surface }}>
                {["Date","Day","Pair","Dir","Setup","Session","HTF","ETF","Entry","SL","TP","Exit","R","Outcome","Images",""].map(h => (
                  <th key={h} style={{
                    padding:"9px 12px", textAlign:"left", fontSize:9, color:G.muted,
                    letterSpacing:2, fontWeight:400, borderBottom:`1px solid ${G.border}`,
                    whiteSpace:"nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={16} style={{ textAlign:"center", padding:24, color:G.muted, fontSize:11 }}>
                  No trades found.
                </td></tr>
              )}
              {filtered.map(t => {
                const cls = t.outcome==="Win" ? "row-win" : t.outcome==="Loss" ? "row-loss" : t.outcome==="Open" ? "row-open" : "row-be";
                return (
                  <tr key={t.id} className={`${cls} fade-in`}>
                    <td style={{ padding:"8px 12px", color:G.textDim, whiteSpace:"nowrap" }}>
                      {new Date(t.date).toLocaleDateString()}<br/>
                      <span style={{ fontSize:10, color:G.muted }}>{new Date(t.date).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</span>
                    </td>
                    <td style={{ padding:"8px 12px", color:G.muted, textTransform:"capitalize" }}>{t.day || "—"}</td>
                    <td style={{ padding:"8px 12px", color:G.accent, fontWeight:600 }}>{t.pair}</td>
                    <td style={{ padding:"8px 12px", color: t.direction==="Long" ? G.green : G.red }}>{t.direction}</td>
                    <td style={{ padding:"8px 12px" }}>{t.setup}</td>
                    <td style={{ padding:"8px 12px", color:G.muted }}>{t.session || "—"}</td>
                    <td style={{ padding:"8px 12px", color:G.muted }}>{t.htf}</td>
                    <td style={{ padding:"8px 12px", color:G.muted }}>{t.entry_tf}</td>
                    <td style={{ padding:"8px 12px" }}>{t.entry_price}</td>
                    <td style={{ padding:"8px 12px", color:G.red+"aa" }}>{t.stop_loss}</td>
                    <td style={{ padding:"8px 12px", color:G.green+"aa" }}>{t.take_profit || "—"}</td>
                    <td style={{ padding:"8px 12px" }}>{t.exit_price}</td>
                    <td style={{ padding:"8px 12px", fontWeight:600 }}>
                      {t.r_multiple >= 0 ? "+" : ""}{fmt(t.r_multiple)}R
                    </td>
                    <td style={{ padding:"8px 12px", fontWeight:600 }}>{t.outcome}</td>
                    <td style={{ padding:"8px 12px" }}>
                      <div style={{ display:"flex", gap:4 }}>
                        {t.before_image && (
                          <div onClick={() => setModalImg(t.before_image)} style={{ 
                            width:24, height:24, background:G.surface, borderRadius:3, cursor:"pointer",
                            backgroundImage:`url(${t.before_image})`, backgroundSize:"cover", backgroundPosition:"center",
                            border:`1px solid ${G.border}`
                          }} title="Before" />
                        )}
                        {t.after_image && (
                          <div onClick={() => setModalImg(t.after_image)} style={{ 
                            width:24, height:24, background:G.surface, borderRadius:3, cursor:"pointer",
                            backgroundImage:`url(${t.after_image})`, backgroundSize:"cover", backgroundPosition:"center",
                            border:`1px solid ${G.border}`
                          }} title="After" />
                        )}
                        {!t.before_image && !t.after_image && <span style={{ color:G.muted }}>—</span>}
                      </div>
                    </td>
                    <td style={{ padding:"8px 12px" }}>
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={() => onEdit(t)} style={{
                          padding:"3px 8px", fontSize:10, background:"transparent",
                          color:G.blue, border:`1px solid ${G.blue}44`, borderRadius:3,
                        }}>edit</button>
                        <button onClick={() => onDelete(t.id)} style={{
                          padding:"3px 8px", fontSize:10, background:"transparent",
                          color:G.red, border:`1px solid ${G.red}44`, borderRadius:3,
                        }}>del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ fontSize:10, color:G.muted, textAlign:"right" }}>
        {filtered.length} trade{filtered.length!==1?"s":""}
        {filterSetup !== "All" ? ` · filtered by ${filterSetup}` : ""}
      </div>
    </div>
  );
}

// ─── IMPORT / EXPORT ──────────────────────────────────────────────────────────
function ImportExport({ trades, onImported }) {
  const [status, setStatus] = useState(null);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(trades, null, 2)], { type:"application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `trades_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  const importJSON = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    let data;
    try { data = JSON.parse(text); } catch { setStatus("Invalid JSON"); return; }
    if (!Array.isArray(data)) { setStatus("Expected an array"); return; }
    const rows = data.map(t => ({ ...t, owner_key: OWNER_KEY, id: undefined, created_at: undefined }));
    const { error } = await supabase.from("trades").insert(rows);
    if (error) { setStatus(error.message); return; }
    setStatus(`Imported ${rows.length} trades ✓`);
    onImported();
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
      <button onClick={exportJSON} style={{
        padding:"7px 16px", fontSize:11, background:"transparent",
        color:G.text, border:`1px solid ${G.border}`, borderRadius:4,
        letterSpacing:1, textTransform:"uppercase",
      }}>↓ Export JSON</button>
      <label style={{
        padding:"7px 16px", fontSize:11, background:"transparent",
        color:G.text, border:`1px solid ${G.border}`, borderRadius:4,
        letterSpacing:1, textTransform:"uppercase", cursor:"pointer",
      }}>
        ↑ Import JSON
        <input type="file" accept=".json" onChange={importJSON} style={{ display:"none" }} />
      </label>
      {status && <span style={{ fontSize:11, color:G.green }}>{status}</span>}
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editTrade, setEditTrade] = useState(null);
  const [filterSetup, setFilterSetup] = useState("All");
  const [tab, setTab] = useState("log"); // "log" | "stats"

  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    const stored = localStorage.getItem("edge_passcode");
    if (stored === VALID_PASSCODE) setUnlocked(true);
  }, []);

  const handleUnlock = (code) => {
    localStorage.setItem("edge_passcode", code);
    setUnlocked(true);
  };

  const fetchTrades = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("owner_key", OWNER_KEY)
      .order("date", { ascending: false });
    if (!error) setTrades(data || []);
    setLoading(false);
  };

  useEffect(() => { if (unlocked) fetchTrades(); }, [unlocked]);

  const deleteTrade = async (id) => {
    if (!confirm("Delete this trade?")) return;
    await supabase.from("trades").delete().eq("id", id);
    fetchTrades();
  };

  if (!unlocked) return <PasscodeScreen onUnlock={handleUnlock} />;

  return (
    <div style={{
      minHeight:"100vh",
      background:`radial-gradient(ellipse at 20% 0%, #0f1823 0%, ${G.bg} 50%)`,
    }}>
      {/* Subtle grid */}
      <div style={{
        position:"fixed", inset:0, pointerEvents:"none",
        backgroundImage:`linear-gradient(${G.border}28 1px, transparent 1px), linear-gradient(90deg, ${G.border}28 1px, transparent 1px)`,
        backgroundSize:"60px 60px",
      }}/>

      {/* Header */}
      <div style={{
        borderBottom:`1px solid ${G.border}`, padding:"14px 24px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background:G.surface + "cc", backdropFilter:"blur(8px)",
        position:"sticky", top:0, zIndex:100,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div>
            <span style={{ color:G.accent, fontWeight:600, letterSpacing:2, fontSize:14 }}>EDGE</span>
            <span style={{ color:G.textDim, letterSpacing:2, fontSize:14 }}> TRACKER</span>
          </div>
          <div style={{ width:1, height:16, background:G.border }} />
          <div style={{ display:"flex", gap:0 }}>
            {[["log","≡ Log"],["stats","◈ Stats"]].map(([k,l]) => (
              <button key={k} onClick={() => setTab(k)} className={tab===k ? "tab-active" : ""} style={{
                padding:"6px 16px", background:"transparent", border:"none",
                borderBottom:`2px solid transparent`, fontSize:11, color:G.muted,
                letterSpacing:2, textTransform:"uppercase", transition:"color .15s",
              }}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <ImportExport trades={trades} onImported={fetchTrades} />
          <button onClick={() => { localStorage.removeItem("edge_passcode"); setUnlocked(false); }} style={{
            padding:"5px 12px", fontSize:10, background:"transparent",
            color:G.muted, border:`1px solid ${G.border}`, borderRadius:3, letterSpacing:1,
          }}>LOCK</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 20px", display:"flex", flexDirection:"column", gap:24 }}>

        {/* Trade Form always visible */}
        <TradeForm
          onSaved={fetchTrades}
          editTrade={editTrade}
          onCancelEdit={() => setEditTrade(null)}
        />

        {tab === "stats" ? (
          <StatsDash trades={trades} />
        ) : (
          <>
            <StatsDash trades={trades} />
            {loading ? (
              <div style={{ textAlign:"center", color:G.muted, fontSize:12, padding:24 }} className="pulse">
                Loading trades…
              </div>
            ) : (
              <TradeTable
                trades={trades}
                onEdit={t => { setEditTrade(t); window.scrollTo({ top:0, behavior:"smooth" }); }}
                onDelete={deleteTrade}
                filterSetup={filterSetup}
                setFilterSetup={setFilterSetup}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
