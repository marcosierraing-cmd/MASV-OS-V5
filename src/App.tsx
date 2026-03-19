import CRM from './Crm';
import DatabaseCRM from './DatabaseCRM';
import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ReferenceLine } from "recharts";
import { Lock, Cloud, AlertCircle, Edit3, Youtube, Activity, Bell, Zap } from "lucide-react";

// ═══════════════════════════════════════
// CONFIGURACIÓN Y CONSTANTES (v5.0 CEO Edition)
// ═══════════════════════════════════════
const CLOUD_URL = "https://script.google.com/macros/s/AKfycbwBy-F2TWOgfWw64Z9TXwbMGOn0J0-DRn7aDwR2iv1dfurceoMEcrTJqQOi34MagYMZJw/exec";
const SECRET_PIN = "1800";

const S = {
  bg: "#08090c", card: "#0e1015", border: "#1a1d25", text: "#e0e0e0", muted: "#6b7080", 
  subtle: "#2a2e38", g: "#38b587", r: "#d4556b", y: "#d4a030", b: "#4a8ed4", p: "#a06cd4", 
  pk: "#e88ca0", o: "#e06050", gr: "#7a9aaa", font: "'Outfit',sans-serif", mono: "'IBM Plex Mono',monospace"
};

const MASTER_HISTORY = [
  { week: -4, date: "2026-01-07", peso: 93, grasa: 38, visceral: 16, musculo: 28.1, bmi: 32.2, edadCorp: 64, metab: 1897, cashIn: 0 },
  { week: 0, date: "2026-02-28", peso: 82.8, grasa: 31.8, visceral: 13, musculo: 32.1, bmi: 29.0, edadCorp: 54, metab: 1791, cashIn: 0 },
  { week: 1, date: "2026-03-07", peso: 83.0, grasa: 30.7, visceral: 12, musculo: 32.8, bmi: 28.7, edadCorp: 53, metab: 1782, cashIn: 0 }
];

function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

const KEYS = { daily: "masv-d-v50", weeks: "masv-w-v50", goals: "masv-g-v50", sync: "masv-s-v50" };
async function load(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }
async function save(k, d) { try { localStorage.setItem(k, JSON.stringify(d)); } catch (e) { console.error(e); } }

// ═══════════════════════════════════════
// ACCESO DE SEGURIDAD
// ═══════════════════════════════════════
export default function App() {
  const [auth, setAuth] = useState(false);
  const [pin, setPin] = useState("");
  const handlePin = (e) => { setPin(e.target.value); if (e.target.value === SECRET_PIN) setAuth(true); };

  if (!auth) {
    return (
      <div style={{ background: S.bg, color: S.text, height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", fontFamily: S.font }}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;800&family=IBM+Plex+Mono:wght@500;700&display=swap" rel="stylesheet" />
        <Lock size={48} color={S.g} style={{ marginBottom: 20 }} />
        <div style={{ fontSize: 10, letterSpacing: 3, color: S.muted, marginBottom: 10, fontFamily: S.mono }}>PRAXENTIA SYSTEMS</div>
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 30 }}>Acceso Restringido v5.0</div>
        <input type="password" inputMode="numeric" value={pin} onChange={handlePin} placeholder="••••" style={{ background: S.card, border: `1px solid ${S.border}`, color: S.g, padding: "15px", borderRadius: 12, fontSize: 28, textAlign: "center", letterSpacing: 15, width: "60%", outline: "none", fontWeight: 800 }} />
      </div>
    );
  }
  return <MasvDashboard />;
}

// ═══════════════════════════════════════
// DASHBOARD PRINCIPAL v5.0 (THE BRAIN)
// ═══════════════════════════════════════
function MasvDashboard() {
  const PILLARS = {
    "OPERACIÓN": ["Diario", "Mensual"],
    "CRM": ["Pipeline", "Base de Datos"],
    "FINANZAS": ["RESICO Hub", "Conciliador SAT"],
    "AVANCE": ["Dashboard"],
    "LEADERSHIP": ["Protocolos", "Estrategia"]
  };

  const [pillar, setPillar] = useState("OPERACIÓN");
  const [subTab, setSubTab] = useState("Diario");

  const handlePillarChange = (newPillar) => {
    setPillar(newPillar);
    setSubTab(PILLARS[newPillar][0]); 
  };

  const [daily, setDaily] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [goals, setGoals] = useState({ peso: 77, grasa: 26, visceral: 10.5, musculo: 33.5, bmi: 26.5, edadCorp: 46 });
  const [syncData, setSyncData] = useState({ local: null, drive: null });
  const [loading, setLoading] = useState(true);
  const [unsaved, setUnsaved] = useState(false); 
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    (async () => {
      const [d, w, g, s] = await Promise.all([load(KEYS.daily), load(KEYS.weeks), load(KEYS.goals), load(KEYS.sync)]);
      if (d) setDaily(d); 
      let mergedWeeks = w || [];
      MASTER_HISTORY.forEach(h => { if (!mergedWeeks.find(mw => mw.week === h.week)) { mergedWeeks.push(h); } });
      mergedWeeks.sort((a, b) => a.week - b.week);
      setWeeks(mergedWeeks); await save(KEYS.weeks, mergedWeeks);
      if (g) setGoals(g); if (s) setSyncData(s);
      setLoading(false);
    })();
  }, []);

  const saveGlobal = async () => {
    setSyncing(true); const nowLocal = new Date().toISOString(); setSyncData(prev => ({ ...prev, local: nowLocal }));
    try {
      await fetch(CLOUD_URL, { method: "POST", mode: "no-cors", body: JSON.stringify({ daily, weeks, goals, ts: nowLocal, v: "5.0" }) });
      const nowDrive = new Date().toISOString(); setSyncData({ local: nowLocal, drive: nowDrive }); await save(KEYS.sync, { local: nowLocal, drive: nowDrive }); setUnsaved(false);
    } catch (e) { alert("❌ Error de red"); }
    setSyncing(false);
  };

  const updateDaily = async (newDaily) => { setDaily(newDaily); await save(KEYS.daily, newDaily); setUnsaved(true); };
  const updateWeeks = async (newWeeks) => { setWeeks(newWeeks); await save(KEYS.weeks, newWeeks); setUnsaved(true); };

  if (loading) return <div style={{ background: S.bg, height: "100vh" }}/>;

  return (
    <div style={{ background: S.bg, color: S.text, minHeight: "100vh", fontFamily: S.font, paddingBottom: 80 }}>
      {/* HEADER SUPERIOR */}
      <div style={{ padding: "16px 16px 10px", borderBottom: `1px solid ${S.border}`, position: "sticky", top: 0, background: S.bg, zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 9, color: S.muted, letterSpacing: 2, fontWeight: 700 }}>MASV OS v5.0</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: S.g }}>Central de Mando</div>
          </div>
          <button onClick={saveGlobal} disabled={!unsaved && !syncing} style={{ background: unsaved ? S.o : "#1c2533", border: "none", color: unsaved ? "#fff" : (syncing ? S.muted : "#8eb6f0"), padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, opacity: (!unsaved && !syncing) ? 0.6 : 1, transition: "0.3s" }}>
            {unsaved ? <AlertCircle size={14}/> : <Cloud size={14}/>} {syncing ? "Sincronizando..." : unsaved ? "⚠️ Cambios Locales" : "☁️ Bóveda Segura"}
          </button>
        </div>
        
        {/* WIDGET PUENTE FINANCESD (ALERTA DE PENDIENTES) */}
        <div style={{ marginTop: 12, background: S.r+"15", border: `1px solid ${S.r}50`, padding: "8px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <Bell size={14} color={S.r} />
          <div style={{ fontSize: 11, color: S.text, fontWeight: 600 }}>
            Pendientes <span style={{color: S.r, fontWeight: 800}}>(FinanceSD)</span>: 2 tickets sin factura, 1 depósito sin clasificar.
          </div>
        </div>
      </div>

      {/* NAVEGACIÓN PRINCIPAL (PILARES) */}
      <div style={{ display: "flex", gap: 15, padding: "12px 16px", overflowX: "auto", background: S.card, borderBottom: `1px solid ${S.border}`, scrollbarWidth: "none" }}>
        {Object.keys(PILLARS).map(p => (
          <div key={p} onClick={() => handlePillarChange(p)} style={{ color: pillar === p ? S.b : S.muted, fontSize: 12, fontWeight: pillar === p ? 800 : 500, borderBottom: pillar === p ? `2px solid ${S.b}` : "none", paddingBottom: 8, cursor: "pointer", whiteSpace:"nowrap", letterSpacing: 1 }}>
            {p}
          </div>
        ))}
      </div>

      {/* SUB-NAVEGACIÓN */}
      {PILLARS[pillar].length > 1 && (
        <div style={{ display: "flex", gap: 8, padding: "10px 16px", background: S.bg }}>
          {PILLARS[pillar].map(st => (
            <button key={st} onClick={() => setSubTab(st)} style={{ padding: "6px 12px", borderRadius: 20, background: subTab === st ? S.subtle : "transparent", border: `1px solid ${subTab === st ? S.border : "transparent"}`, color: subTab === st ? "#fff" : S.muted, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              {st}
            </button>
          ))}
        </div>
      )}

      {/* ÁREA DE CONTENIDO RENDERIZADO */}
      <div style={{ padding: (pillar === "CRM" || pillar === "FINANZAS") ? "0" : "16px" }}>
        {pillar === "OPERACIÓN" && subTab === "Diario" && <TabHoy daily={daily} updateDaily={updateDaily} />}
        {pillar === "OPERACIÓN" && subTab === "Mensual" && <TabSemanal weeks={weeks} updateWeeks={updateWeeks} goals={goals} />}

        {pillar === "CRM" && subTab === "Pipeline" && <div style={{margin: "-1px 0"}}><CRM /></div>}
        {pillar === "CRM" && subTab === "Base de Datos" && <div style={{margin: "-1px 0"}}><DatabaseCRM /></div>}

        {pillar === "FINANZAS" && <TabFinanzas subTab={subTab} />}

        {pillar === "AVANCE" && <TabAvance daily={daily} weeks={weeks} goals={goals} />}

        {pillar === "LEADERSHIP" && subTab === "Protocolos" && <TabProtocolos />}
        {pillar === "LEADERSHIP" && subTab === "Estrategia" && <TabEstrategia />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// MÓDULO 3: FINANZAS Y RESICO
// ═══════════════════════════════════════
function TabFinanzas({ subTab }) {
  const [timeFrame, setTimeFrame] = useState("Mensual");
  const [viewMode, setViewMode] = useState("Simple");

  if (subTab === "RESICO Hub") {
    return (
      <div style={{ padding: 20, color: S.text }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: S.b, marginBottom: 5 }}>Corporativo Praxentia</h2>
        <p style={{ fontSize: 11, color: S.muted, marginBottom: 15 }}>Estados Financieros (Modo RESICO)</p>
        
        {/* BOTONERAS DE FILTRO */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 6, background: S.card, padding: 4, borderRadius: 8, width: "fit-content", border: `1px solid ${S.border}` }}>
            {["Mensual", "Anual"].map(tf => (
              <button key={tf} onClick={() => setTimeFrame(tf)} style={{ padding: "6px 16px", borderRadius: 6, fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer", background: timeFrame === tf ? S.subtle : "transparent", color: timeFrame === tf ? "#fff" : S.muted }}>
                {tf}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, background: S.card, padding: 4, borderRadius: 8, width: "fit-content", border: `1px solid ${S.border}` }}>
            {["Simple", "Acumulado"].map(vm => (
              <button key={vm} onClick={() => setViewMode(vm)} style={{ padding: "6px 16px", borderRadius: 6, fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer", background: viewMode === vm ? S.b+"40" : "transparent", color: viewMode === vm ? S.b : S.muted }}>
                {vm}
              </button>
            ))}
          </div>
        </div>
        
        {/* TARJETAS DINÁMICAS */}
        <Card color={S.g} title={`P&L ${timeFrame} (${viewMode})`}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div><div style={{ fontSize: 10, color: S.muted }}>Facturación</div><div style={{ fontSize: 16, fontWeight: 800 }}>{timeFrame === "Anual" ? "$480,000" : "$120,000"}</div></div>
            <div><div style={{ fontSize: 10, color: S.muted }}>Gastos Op.</div><div style={{ fontSize: 16, fontWeight: 800, color: S.o }}>{timeFrame === "Anual" ? "$85,000" : "$18,500"}</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: S.p, fontWeight: 800 }}>Provisión SAT (1.5%)</div><div style={{ fontSize: 16, fontWeight: 800 }}>{timeFrame === "Anual" ? "$7,200" : "$1,800"}</div></div>
          </div>
          <div style={{ fontSize: 9, color: S.muted, borderTop: `1px solid ${S.border}`, paddingTop: 8, marginTop: 8 }}>
            * Mostrando datos en modo <b>{viewMode.toLowerCase()}</b>.
          </div>
        </Card>

        <Card color={S.y} title="Balance General (Saldos)">
          <div style={{ fontSize: 11, color: S.muted }}>
            Activos: $240,000 | Pasivos: $80,000 <br/>
            Capital Contable: $160,000
          </div>
        </Card>
      </div>
    );
  }

  if (subTab === "Conciliador SAT") {
    return (
      <div style={{ padding: 20, color: S.text, textAlign: "center" }}>
        <Activity size={48} color={S.p} style={{ margin: "0 auto 15px" }} />
        <h2 style={{ fontSize: 18, fontWeight: 800, color: S.p }}>Auditoría SAT vs Bancos</h2>
        <p style={{ fontSize: 12, color: S.muted, marginTop: 10, lineHeight: 1.6 }}>
          Aquí arrastraremos el XML/CSV del SAT para cruzarlo con el archivo del Banco. <br/>
          El sistema buscará facturas huérfanas y pagos sin comprobar.
        </p>
      </div>
    );
  }
}

// ═══════════════════════════════════════
// MÓDULO 1: HOY (CERO CAPTURA DOBLE)
// ═══════════════════════════════════════
function TabHoy({ daily, updateDaily }) {
  const [selectedDate, setSelectedDate] = useState(today());
  const existing = daily.find(d => d.date === selectedDate);
  // Eliminamos los campos del embudo del estado
  const [form, setForm] = useState(existing || { date: selectedDate, agua: false, sop: false, leer: false, entreno: false, medita: false, pasos: "", paS: "", paD: "", locked: false });

  useEffect(() => {
    const found = daily.find(d => d.date === selectedDate);
    setForm(found || { date: selectedDate, agua: false, sop: false, leer: false, entreno: false, medita: false, pasos: "", paS: "", paD: "", locked: false });
  }, [selectedDate, daily]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  
  const lockDay = () => { 
    if (form.pasos > 40000) { alert("⚠️ ¿40,000 pasos? Verifica el número, Inge."); return; }
    if (form.paS > 180 || form.paD > 120) { alert("⚠️ Presión en rango de riesgo o error de captura."); return; }
    const n = { ...form, locked: true }; 
    setForm(n); 
    updateDaily([...daily.filter(d => d.date !== selectedDate), n].sort((a,b)=>a.date.localeCompare(b.date))); 
  };
  
  const unlockDay = () => { const n = { ...form, locked: false }; setForm(n); updateDaily([...daily.filter(d => d.date !== selectedDate), n].sort((a,b)=>a.date.localeCompare(b.date))); };

  const hab = [ { k:"agua", l:"Agua", c:S.b }, { k:"sop", l:"SOP", c:S.r }, { k:"leer", l:"Leer", c:S.p }, { k:"entreno", l:"Entreno", c:S.y }, { k:"medita", l:"Medita", c:S.g } ];
  
  const missing = [];
  if (!form.pasos) missing.push("Pasos"); if (!form.paS || !form.paD) missing.push("Presión");
  const auditText = missing.length > 0 ? `⚠️ Faltan: ${missing.join(", ")}` : "🟢 Coherente y Capturado";

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
            Auditoría de Día
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ background: S.subtle, color: S.text, border: `1px solid ${S.border}`, borderRadius: 6, padding: "4px 8px", fontSize: 11, outline: "none", fontFamily: S.font }} />
          </div>
          <div style={{ fontSize: 10, color: missing.length > 0 ? S.y : S.g, fontWeight: 700, marginTop: 4 }}>{auditText}</div>
        </div>
        {form.locked && <button onClick={unlockDay} style={{ background: S.subtle, border: "none", color: S.muted, padding: "6px 10px", borderRadius: 6, fontSize: 10, display: "flex", alignItems: "center", gap: 4 }}><Edit3 size={12}/> Editar</button>}
      </div>

      <Card title="⚡ Hábitos Clave" color={S.y}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 15 }}>
          {hab.map(h => <button key={h.k} disabled={form.locked} onClick={() => set(h.k, !form[h.k])} style={{ padding: "8px 0", borderRadius: 8, border: form.locked && !form[h.k] ? `1px dashed ${S.border}` : `1px solid ${form[h.k] ? h.c : S.border}`, background: form[h.k] ? (form.locked ? h.c+"50" : h.c) : "transparent", color: form[h.k] ? "#fff" : S.muted, fontSize: 9, fontWeight: 700, opacity: form.locked && !form[h.k] ? 0.3 : 1 }}>{h.l}</button>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div><div style={{fontSize:9, color:S.muted, marginBottom:4}}>PASOS</div><input type="number" disabled={form.locked} value={form.pasos} onChange={e=>set("pasos",e.target.value)} placeholder="0" style={{width:"100%", background:S.bg, border:`1px solid ${S.border}`, color:S.text, padding:8, borderRadius:6, textAlign:"center", opacity: form.locked ? 0.5 : 1}}/></div>
          <div><div style={{fontSize:9, color:S.muted, marginBottom:4}}>SIS</div><input type="number" disabled={form.locked} value={form.paS} onChange={e=>set("paS",e.target.value)} placeholder="120" style={{width:"100%", background:S.bg, border:`1px solid ${S.border}`, color:S.r, padding:8, borderRadius:6, textAlign:"center", opacity: form.locked ? 0.5 : 1}}/></div>
          <div><div style={{fontSize:9, color:S.muted, marginBottom:4}}>DIA</div><input type="number" disabled={form.locked} value={form.paD} onChange={e=>set("paD",e.target.value)} placeholder="80" style={{width:"100%", background:S.bg, border:`1px solid ${S.border}`, color:S.r, padding:8, borderRadius:6, textAlign:"center", opacity: form.locked ? 0.5 : 1}}/></div>
        </div>
      </Card>

      {!form.locked && <button onClick={lockDay} style={{ width: "100%", background: S.g, padding: 14, borderRadius: 10, color: "#fff", fontWeight: 800, border: "none", marginTop: 10, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, textTransform: "uppercase" }}><Lock size={16}/> SELLAR DÍA</button>}
    </>
  );
}

// ═══════════════════════════════════════
// MÓDULO 1.2: SEMANAL (BIOMETRÍA PURA)
// ═══════════════════════════════════════
function TabSemanal({ weeks, updateWeeks }) {
  const nextWeek = weeks.length > 0 ? Math.max(...weeks.map(w => w.week)) + 1 : 0;
  const [registroDate, setRegistroDate] = useState(today());
  // Adiós al cashIn del estado
  const [form, setForm] = useState({ peso: "", grasa: "", visceral: "", musculo: "", bmi: "", edadCorp: "", metab: "" });
  
  const saveOmron = () => { 
    updateWeeks([...weeks, { ...form, week: nextWeek, date: registroDate }]); 
    setForm({ peso: "", grasa: "", visceral: "", musculo: "", bmi: "", edadCorp: "", metab: "" }); 
    setRegistroDate(today());
  };

  return (
    <>
      <div style={{ background: S.subtle, border: `1px solid ${S.b}`, padding: 15, borderRadius: 12, marginBottom: 15 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: S.b, marginBottom: 5 }}>🧹 Cierre de Mes (Sintetizador)</div>
        <div style={{ fontSize: 10, color: S.muted, marginBottom: 10 }}>El día 2 de cada mes se activará este botón para comprimir los registros diarios en un histórico y limpiar la base.</div>
        <button disabled style={{ background: S.card, color: S.muted, border: `1px solid ${S.border}`, padding: "8px", borderRadius: 6, fontSize: 10, width: "100%", fontWeight: 700 }}>Bloqueado (Se abre en Abril 2)</button>
      </div>

      <Card title={`📝 Registro Omron Corporal (Semana ${nextWeek})`} color={S.g}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 15 }}>
          <span style={{ fontSize: 10, color: S.muted, fontWeight: 700 }}>Fecha:</span>
          <input type="date" value={registroDate} onChange={(e) => setRegistroDate(e.target.value)} style={{ background: S.bg, color: S.text, border: `1px solid ${S.border}`, borderRadius: 6, padding: "6px 10px", fontSize: 12, outline: "none", fontFamily: S.font }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 15 }}>
          {[ {k:"peso", l:"Peso"}, {k:"grasa", l:"% Grasa"}, {k:"visceral", l:"Visceral"}, {k:"musculo", l:"% Músc."}, {k:"bmi", l:"BMI"}, {k:"edadCorp", l:"Edad Corp"}, {k:"metab", l:"Metab (kcal)"} ].map(f => (
            <div key={f.k}><div style={{fontSize:9, color:S.muted}}>{f.l}</div><input type="number" step="0.1" value={form[f.k]} onChange={e=>setForm({...form, [f.k]: e.target.value})} style={{width:"100%", background:S.bg, border:`1px solid ${S.border}`, color:"#fff", padding:8, borderRadius:6, marginTop:4}}/></div>
          ))}
        </div>
        
        {/* Aquí estaba el bloque de dinero, ya fue eliminado */}

        <button onClick={saveOmron} style={{ width: "100%", background: S.g, border: "none", color: "#fff", padding: 12, borderRadius: 8, fontWeight: 800, marginTop: 15 }}>Registrar Biometría</button>
      </Card>
      {[...weeks].reverse().map((w, i) => (
        <Card key={i}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div><span style={{fontWeight: 700, color: S.g}}>Sem {w.week}</span> <span style={{fontSize:10, color:S.muted, marginLeft:8}}>{w.date}</span></div>
            <div style={{fontFamily: S.mono, fontSize:12, fontWeight: 800, color: S.text}}>{w.peso} kg</div>
          </div>
        </Card>
      ))}
    </>
  );
}

// ═══════════════════════════════════════
// MÓDULO 4: AVANCE (CON RADAR CRM)
// ═══════════════════════════════════════
function BioProgressBar({ label, start, current, goal, unit, color }) {
  let pct = 0;
  if (start > goal) { 
    if (current <= goal) pct = 100; else if (current >= start) pct = 0; else pct = ((start - current) / (start - goal)) * 100;
  } else { 
    if (current >= goal) pct = 100; else if (current <= start) pct = 0; else pct = ((current - start) / (goal - start)) * 100;
  }
  return (
    <div style={{marginBottom: 12}}>
      <div style={{display:'flex', justifyContent:'space-between', fontSize:10, marginBottom:4}}><span style={{fontWeight:700, color:S.text}}>{label}</span><span style={{color:S.muted}}>Actual: <span style={{color: color, fontWeight:800}}>{current}{unit}</span> | Meta: {goal}{unit}</span></div>
      <div style={{height: 10, background: S.subtle, borderRadius: 5, position: 'relative', overflow: "hidden"}}><div style={{position:'absolute', height:'100%', width:`${pct}%`, background: color, borderRadius: 5, opacity: 0.9}}/></div>
    </div>
  );
}

function ProgressBar({ label, actual, expected, color }) {
  const capExpected = Math.min(100, Math.max(0, expected));
  const capActual = Math.min(capExpected, Math.max(0, actual)); 
  return (
    <div style={{marginBottom: 12}}>
      <div style={{display:'flex', justifyContent:'space-between', fontSize:10, marginBottom:4}}><span style={{fontWeight:700, color:S.text}}>{label}</span><span style={{color:S.muted}}>Real: <span style={{color: capActual >= (capExpected*0.9) ? S.g : S.y, fontWeight:800}}>{Math.round(capActual)}%</span> | Meta: {Math.round(capExpected)}%</span></div>
      <div style={{height: 10, background: S.subtle, borderRadius: 5, position: 'relative', overflow: "hidden"}}><div style={{position:'absolute', height:'100%', width:`${capExpected}%`, background: S.muted, opacity:0.3, borderRight:`2px solid ${S.muted}`}}/><div style={{position:'absolute', height:'100%', width:`${capActual}%`, background: color, borderRadius: 5, opacity: 0.9}}/></div>
    </div>
  );
}

function TabAvance({ daily, weeks, goals }) {
  const [view, setView] = useState("Praxentia"); 
  const [timeframe, setTimeframe] = useState("Mensual");

  const chartData = weeks.map(w => ({ sem: `S${w.week}`, peso: Number(w.peso || 0) }));
  const baseline = MASTER_HISTORY[0];
  const latest = weeks[weeks.length - 1] || baseline;
  const difPeso = (Number(latest.peso) - Number(goals.peso)).toFixed(1);
  const radarData = [ { subject: 'Grasa', A: Number(latest.grasa), fullMark: 50 }, { subject: 'Músculo', A: Number(latest.musculo), fullMark: 50 }, { subject: 'Visceral', A: Number(latest.visceral), fullMark: 25 }, { subject: 'BMI', A: Number(latest.bmi), fullMark: 40 } ];

  const dObj = new Date();
  let dayOfWeek = dObj.getDay(); if (dayOfWeek === 0) dayOfWeek = 7;
  const currentWeekPct = (dayOfWeek / 7) * 100;
  const currentDayOfMonth = dObj.getDate();
  const daysInMonth = new Date(dObj.getFullYear(), dObj.getMonth() + 1, 0).getDate();
  const currentMonthPct = (currentDayOfMonth / daysInMonth) * 100;

  const currentYear = dObj.getFullYear();
  const currentMonthNum = dObj.getMonth();
  const currentMonthName = ["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"][currentMonthNum];
  
  let currentMonthlyGoal = 63600;
  if (currentYear > 2030 || (currentYear === 2030 && currentMonthNum >= 2)) currentMonthlyGoal = 254600;
  else if (currentYear > 2029 || (currentYear === 2029 && currentMonthNum >= 2)) currentMonthlyGoal = 180000;
  else if (currentYear > 2028 || (currentYear === 2028 && currentMonthNum >= 2)) currentMonthlyGoal = 127300;
  else if (currentYear > 2027 || (currentYear === 2027 && currentMonthNum >= 2)) currentMonthlyGoal = 90000;

  const cashM = weeks.filter(w => new Date(w.date).getMonth() === currentMonthNum).reduce((acc, w) => acc + Number(w.cashIn || 0), 0);

  const vision5Y = [ {y: 2027, v: "63.6k", c: S.muted}, {y: 2028, v: "90k", c: S.muted}, {y: 2029, v: "127.3k", c: S.muted}, {y: 2030, v: "180k", c: S.b}, {y: 2031, v: "254.6k", c: S.g} ];

  return (
    <>
      <div style={{ display: "flex", gap: 6, marginBottom: 15 }}>
        <button onClick={() => setView("Praxentia")} style={{flex:1, padding: "8px 4px", borderRadius: 8, background: view === "Praxentia" ? S.b : S.card, color: view === "Praxentia" ? "#fff" : S.muted, border: `1px solid ${view === "Praxentia" ? S.b : S.border}`, fontSize:11, fontWeight: 700}}>💼 Negocio</button>
        <button onClick={() => setView("Biometria")} style={{flex:1, padding: "8px 4px", borderRadius: 8, background: view === "Biometria" ? S.g : S.card, color: view === "Biometria" ? "#fff" : S.muted, border: `1px solid ${view === "Biometria" ? S.g : S.border}`, fontSize:11, fontWeight: 700}}>📈 Biom.</button>
        <button onClick={() => setView("Habitos")} style={{flex:1, padding: "8px 4px", borderRadius: 8, background: view === "Habitos" ? S.p : S.card, color: view === "Habitos" ? "#fff" : S.muted, border: `1px solid ${view === "Habitos" ? S.p : S.border}`, fontSize:11, fontWeight: 700}}>✅ Hábitos</button>
      </div>

      {view === "Praxentia" && (
        <>
          <div style={{ background: `linear-gradient(135deg, ${S.card}, #1a1d25)`, padding: 20, borderRadius: 15, border: `1px solid ${S.border}`, textAlign: "center", marginBottom: 15 }}>
            <div style={{ fontSize: 10, color: S.muted, fontWeight: 800, letterSpacing: 2 }}>FACTURACIÓN — {currentMonthName}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: S.b, margin: "10px 0" }}>${cashM.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: S.muted, marginBottom: 12 }}>Meta Mensual: ${currentMonthlyGoal.toLocaleString()} MXN</div>
            <div style={{ width: "100%", height: 6, background: S.bg, borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${Math.min(100, (cashM/currentMonthlyGoal)*100)}%`, height: "100%", background: S.b }} /></div>
          </div>

          {/* NUEVO RADAR CRM AUTOMÁTICO */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginBottom: 15 }}>
            <Card color={S.b} title="🏢 SALUD PRAXENTIA (High Ticket)">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${S.border}`, paddingBottom: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: S.muted }}>Win Rate (Efectividad)</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: S.g }}>33%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${S.border}`, paddingBottom: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: S.muted }}>Humo (Propuestas Vivas)</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: S.y }}>$450,000</span>
              </div>
              <div style={{ background: S.r+"15", padding: "8px", borderRadius: 6, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <AlertCircle size={14} color={S.r} style={{marginTop: 2}} />
                <div style={{ fontSize: 10, color: S.text, lineHeight: 1.4 }}>
                  <span style={{color: S.r, fontWeight: 700}}>Cuello de Botella:</span> Tienes 2 prospectos estancados en Diagnóstico por más de 10 días.
                </div>
              </div>
            </Card>

            <Card color={S.g} title="💧 SALUD TUNHA (Filtros & Recurrencia)">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${S.border}`, paddingBottom: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: S.muted }}>Equipos a Instalar (Semana)</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: S.g }}>4 Equipos</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${S.border}`, paddingBottom: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: S.muted }}>Renovaciones Vencidas</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: S.o }}>5 Clientes</span>
              </div>
              <div style={{ background: S.g+"15", padding: "8px", borderRadius: 6, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <Zap size={14} color={S.g} style={{marginTop: 2}} />
                <div style={{ fontSize: 10, color: S.text, lineHeight: 1.4 }}>
                  <span style={{color: S.g, fontWeight: 700}}>Mina de Oro:</span> Tienes $8,500 MXN listos para cobrar en mantenimientos. ¡Manda WhatsApps desde el CRM!
                </div>
              </div>
            </Card>
          </div>

          <Card title="🎯 Visión Financiera 5 Años" color={S.y}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 10 }}>
              {vision5Y.map((v, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", flex: 1 }}>
                  {i < vision5Y.length - 1 && <div style={{ position: "absolute", top: 12, left: "50%", width: "100%", height: 2, background: S.border, zIndex: 0 }}/>}
                  <div style={{ fontSize: 11, fontWeight: 800, color: v.c, background: S.card, zIndex: 1, padding: "0 4px", marginBottom: 8 }}>${v.v}</div>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: v.c, zIndex: 1, marginBottom: 4 }}/>
                  <div style={{ fontSize: 9, color: S.muted }}>Feb '{v.y.toString().slice(-2)}</div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {view === "Biometria" && (
        <>
          <Card title="🕸️ Equilibrio Corporal (Radar)" color={S.g}><div style={{ height: 230, width: "100%", marginTop:-15 }}><ResponsiveContainer><RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}><PolarGrid stroke={S.border} /><PolarAngleAxis dataKey="subject" tick={{fill: S.muted, fontSize: 10}} /><PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} /><Radar name="Actual" dataKey="A" stroke={S.g} fill={S.g} fillOpacity={0.4} /></RadarChart></ResponsiveContainer></div></Card>
          <Card title="🎯 Avance hacia Metas" color={S.p}>
            <BioProgressBar label="Peso" start={baseline.peso} current={latest.peso} goal={goals.peso} unit="kg" color={S.g} />
            <BioProgressBar label="% Grasa" start={baseline.grasa} current={latest.grasa} goal={goals.grasa} unit="%" color={S.y} />
            <BioProgressBar label="% Músculo" start={baseline.musculo} current={latest.musculo} goal={goals.musculo} unit="%" color={S.b} />
            <BioProgressBar label="Visceral" start={baseline.visceral} current={latest.visceral} goal={goals.visceral} unit="" color={S.o} />
            <BioProgressBar label="BMI" start={baseline.bmi} current={latest.bmi} goal={goals.bmi} unit="" color={S.p} />
            <BioProgressBar label="Edad Corporal" start={baseline.edadCorp} current={latest.edadCorp} goal={goals.edadCorp} unit="a" color={S.muted} />
          </Card>
          <Card color={S.g}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}><div style={{ fontSize: 11, fontWeight: 800, color: S.g }}>📉 TENDENCIA DE PESO</div><div style={{ textAlign: "right" }}><div style={{ fontSize: 18, fontWeight: 800, color: S.text }}>{latest.peso} kg</div><div style={{ fontSize: 10, color: S.muted }}>Dif vs Meta: <span style={{color: difPeso <= 0 ? S.g : S.y}}>{difPeso > 0 ? `+${difPeso}` : difPeso} kg</span></div></div></div>
            <div style={{ height: 180, width: "100%" }}><ResponsiveContainer><AreaChart data={chartData}><XAxis dataKey="sem" stroke={S.muted} fontSize={10} tickLine={false} axisLine={false} /><YAxis domain={[goals.peso - 2, 'auto']} width={30} tick={{fontSize:10, fill:S.muted}} axisLine={false} tickLine={false} /><Tooltip contentStyle={{background: S.card, border: `1px solid ${S.border}`}} /><ReferenceLine y={goals.peso} stroke={S.g} strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Meta', fill: S.g, fontSize: 10 }} /><Area type="monotone" dataKey="peso" stroke={S.g} fill={S.g} fillOpacity={0.2} strokeWidth={3} /></AreaChart></ResponsiveContainer></div>
          </Card>
        </>
      )}

      {view === "Habitos" && (
        <div style={{ background: S.card, borderRadius: 15, padding: 15, border: `1px solid ${S.border}` }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>{["Mensual", "Anual"].map(tf => <button key={tf} onClick={()=>setTimeframe(tf)} style={{fontSize:11, padding:"6px 12px", borderRadius:6, background: timeframe===tf ? S.subtle : "transparent", color: timeframe===tf ? "#fff" : S.muted, border: "none", fontWeight:700}}>{tf}</button>)}</div>
          <div style={{fontSize:12, fontWeight:800, color:S.p, marginBottom:15}}>Análisis de GAP ({timeframe})</div>
          {timeframe === "Mensual" ? (
            <><ProgressBar label="Semana 1" actual={95} expected={100} color={S.g} /><ProgressBar label="Semana 2 (Actual)" actual={currentWeekPct * 0.85} expected={currentWeekPct} color={S.y} /><ProgressBar label="Semana 3" actual={0} expected={0} color={S.b} /><ProgressBar label="Semana 4" actual={0} expected={0} color={S.b} /></>
          ) : (
            <><ProgressBar label="Enero" actual={80} expected={100} color={S.g} /><ProgressBar label="Febrero" actual={92} expected={100} color={S.g} /><ProgressBar label="Marzo (Actual)" actual={currentMonthPct * 0.9} expected={currentMonthPct} color={S.y} /></>
          )}
          <div style={{fontSize:9, color:S.muted, marginTop:15, textAlign:"center"}}>*Métricas reales habilitadas en v5.0</div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════
// PROTOCOLO INTEGRAL: FUERZA + ABDOMEN + ARQUITECTURA
// ═══════════════════════════════════════

const STRENGTH_MASTER = [
  { d: "LUN", f: "Tren Inferior", c: S.r, ex: [ {n:"Sentadilla goblet 16lb", s:"4×15"}, {n:"RDL 1 pierna 16lb", s:"3×12"}, {n:"Sent. búlgara 10lb", s:"3×10"}, {n:"Puente glúteo 1 pierna", s:"3×15"}, {n:"Aro aductores", s:"3×30s"} ] },
  { d: "MAR", f: "Empuje (Ayuno)", c: S.y, ex: [ {n:"Flexiones tempo 3-1-2", s:"4×12"}, {n:"Press pecho piso 16lb", s:"3×15"}, {n:"Press militar 10lb", s:"3×12"}, {n:"Elev. laterales 6lb", s:"3×15"}, {n:"Fondos silla", s:"3×12"} ] },
  { d: "MIÉ", f: "Movilidad", c: S.p, ex: [ {n:"Caminata Z2 ligera", s:"40m"}, {n:"Movilidad completa", s:"20m"} ] },
  { d: "JUE", f: "Tirón", c: S.b, ex: [ {n:"Remo 1 brazo 16lb", s:"4×12"}, {n:"Remo banda puerta", s:"3×15"}, {n:"Face pull banda", s:"3×20"}, {n:"Curl bíceps 10lb", s:"3×12"} ] },
  { d: "VIE", f: "Caminata Z2", c: S.g, ex: [ {n:"Caminata Z2", s:"60m"}, {n:"Movilidad", s:"15m"} ] },
  { d: "SÁB", f: "Full Body Metabólico", c: S.o, ex: [ {n:"Sent. goblet tempo 16lb", s:"5×45s"}, {n:"Flexiones", s:"5×45s"}, {n:"Remo banda puerta", s:"5×45s"}, {n:"Mt. climbers", s:"5×45s"} ] },
  { d: "DOM", f: "Recuperación", c: S.gr, ex: [ {n:"Caminata ligera", s:"30m"}, {n:"Movilidad", s:"25m"} ] }
];

function TabProtocolos() {
  const [protocol, setProtocol] = useState(() => {
    const saved = localStorage.getItem("masv-protocol-v5");
    return saved ? JSON.parse(saved) : INITIAL_PROTOCOL;
  });
  const [isEditing, setIsEditing] = useState(false);
  
  const dObj = new Date();
  const todayNum = dObj.getDay();
  const [activeDay, setActiveDay] = useState(todayNum === 0 ? 6 : todayNum - 1);
  
  const isWeekend = todayNum === 0 || todayNum === 6;
  const isFastingDay = todayNum === 2;
  const currentWorkout = STRENGTH_MASTER[activeDay];

  const updateP = (key, value) => setProtocol(prev => ({ ...prev, [key]: value }));

  return (
    <div style={{ fontFamily: S.font }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: S.g }}>{isEditing ? "🛠️ Modo Arquitecto" : "🥗 Protocolo Activo"}</h2>
        <button onClick={() => { if(isEditing) localStorage.setItem("masv-protocol-v5", JSON.stringify(protocol)); setIsEditing(!isEditing); }} style={{ background: isEditing ? S.g : S.subtle, color: "#fff", border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 10, fontWeight: 800 }}>
          {isEditing ? "✅ GUARDAR" : "⚙️ EDITAR"}
        </button>
      </div>

      {isEditing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <Card title="⏰ Ayuno y Ruptura" color={S.y}>
            <input style={sInput} value={protocol.ayuno.titulo} onChange={e => updateP("ayuno", {...protocol.ayuno, titulo: e.target.value})} />
            <input style={sInput} value={protocol.ayuno.rompe} onChange={e => updateP("ayuno", {...protocol.ayuno, rompe: e.target.value})} />
          </Card>
          <Card title="🚦 Semáforo Nutricional" color={S.r}>
             <div style={{fontSize:9, color: S.g, marginBottom:4}}>VERDE</div>
             <textarea style={{...sInput, height: 60}} value={protocol.semaforo.verde.join(", ")} onChange={e => updateP("semaforo", {...protocol.semaforo, verde: e.target.value.split(", ")})} />
          </Card>
        </div>
      ) : (
        <>
          {/* AYUNO Y SUPLES */}
          <div style={{ display: "flex", gap: 12, background: S.card, padding: 12, borderRadius: 12, marginBottom: 15, border: `1px solid ${isFastingDay ? S.o : S.y}50` }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: isFastingDay ? S.o : S.y, fontSize: 12, fontWeight: 800 }}>{isFastingDay ? "🔥 AYUNO PROLONGADO" : protocol.ayuno.titulo}</div>
              <div style={{ fontSize: 9, color: S.b, fontWeight: 700, marginTop: 4 }}>👉 {protocol.ayuno.rompe}</div>
            </div>
            <div style={{ flex: 1, textAlign: "right" }}>
              <div style={{ color: S.p, fontSize: 12, fontWeight: 800 }}>💊 SUPLES</div>
              {protocol.suplementos.map((s, i) => <div key={i} style={{ fontSize: 9, color: S.muted }}>{s.n} ({s.h})</div>)}
            </div>
          </div>

          {/* FUERZA DIARIA (EL CORAZÓN) */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
            {STRENGTH_MASTER.map((d, i) => (
              <button key={i} onClick={()=>setActiveDay(i)} style={{flex:"1 1 auto", padding:"8px 4px", borderRadius:6, background:activeDay===i?d.c:"transparent", color:activeDay===i?"#fff":S.muted, border:`1px solid ${activeDay===i?d.c:S.border}`, fontSize:10, fontWeight:700}}>{d.d}</button>
            ))}
          </div>
          
          <Card color={currentWorkout.c} title={`${currentWorkout.d} - ${currentWorkout.f}`}>
            {currentWorkout.ex.map((e, i) => (
              <div key={i} style={{ padding: "10px 0", borderBottom: `1px solid ${S.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom:4 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{e.n}</div>
                  <div style={{ fontSize: 12, color: currentWorkout.c, fontFamily: S.mono }}>{e.s}</div>
                </div>
                <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(e.n + " tecnica")}`} target="_blank" rel="noreferrer" style={{ fontSize: 9, color: S.muted, textDecoration: "none", background: S.subtle, padding: "3px 6px", borderRadius: 4, display:"inline-flex", alignItems:"center", gap:4 }}><Youtube size={10} color="#ff0000" /> Ver técnica</a>
              </div>
            ))}
          </Card>

{/* ABDOMEN (EL AGREGADO CON VIDEOS) */}
<Card title="🧱 Core & Abdomen (Cierre de Sesión)" color={S.b}>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
    {protocol.rutinaAbdomen.map((ex, i) => (
      <div key={i} style={{ background: S.bg, padding: 8, borderRadius: 6, border: `1px solid ${S.border}`, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 45 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: S.text, marginBottom: 5 }}>• {ex}</div>
        <a 
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex + " tecnica")}`} 
          target="_blank" 
          rel="noreferrer" 
          style={{ 
            fontSize: 8, 
            color: S.muted, 
            textDecoration: "none", 
            background: S.subtle, 
            padding: "2px 5px", 
            borderRadius: 4, 
            display: "inline-flex", 
            alignItems: "center", 
            gap: 4,
            alignSelf: "flex-start"
          }}
        >
          <Youtube size={9} color="#ff0000" /> Ver técnica
        </a>
      </div>
    ))}
  </div>
</Card>

          {/* COMIDAS Y SEMÁFORO */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 10, marginTop: 15 }}>
            <Card title={isWeekend ? "🥂 Finde" : "🍱 Comidas"} color={isWeekend ? S.p : S.g}>
              <div style={{ fontSize: 10 }}>{isWeekend ? protocol.comidas.finde : protocol.comidas.semana[0]}</div>
            </Card>
            <Card title="🚦 Prohibidos" color={S.r}>
              {protocol.semaforo.rojo.slice(0, 3).map((s, i) => <div key={i} style={{ fontSize: 9, color: S.r }}>• {s}</div>)}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// MÓDULO 5.2: LEADERSHIP (ESTRATEGIA)
// ═══════════════════════════════════════
function TabEstrategia() {
  return (
    <>
      <div style={{ textAlign: "center", padding: "20px", marginBottom: 15, background: `linear-gradient(135deg, ${S.card}, #1a1d25)`, borderRadius: 12, border: `1px solid ${S.border}` }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: S.p, marginBottom: 10 }}>IKIGAI — PROPÓSITO VITAL</div>
        <div style={{ fontSize: 14, fontStyle: "italic", fontWeight: 700, lineHeight: 1.5, color: "#fff" }}>"Transformo caos en orden consciente para liberar vida, empresa y legado."</div>
      </div>

      <Card title="💼 4 Áreas Operativas" color={S.p}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, fontSize: 11, color: "#ccc", lineHeight: 1.5 }}>
          <div><div style={{color:S.g, fontWeight:800, marginBottom:4}}>🍏 Salud</div>● 4 sesiones/sem<br/>● Ventana 10:30-17:30<br/>● Sueño 8h</div>
          <div><div style={{color:S.pk, fontWeight:800, marginBottom:4}}>👨‍👩‍👧‍👦 Familia</div>● Sin pantallas 60m/sem<br/>● Check-in quincenal</div>
          <div style={{marginTop:8}}><div style={{color:S.b, fontWeight:800, marginBottom:4}}>💼 Negocio</div>● 15 contactos/sem<br/>● Pipeline 10min/día</div>
          <div style={{marginTop:8}}><div style={{color:S.y, fontWeight:800, marginBottom:4}}>⚙️ Sistema</div>● Cierre 19:00<br/>● 3 MITs/día<br/>● Finanzas viernes</div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 15 }}>
        <div style={{ padding: 15, background: S.r+"08", borderRadius: 12, border: `1px solid ${S.r}30` }}><div style={{ fontSize: 12, fontWeight: 800, color: S.r, marginBottom: 6 }}>❤️ Lo que amo</div><div style={{ fontSize: 10, color: "#ccc" }}>Caos en claridad<br/>Presencia familiar<br/>Expansión del alma</div></div>
        <div style={{ padding: 15, background: S.g+"08", borderRadius: 12, border: `1px solid ${S.g}30` }}><div style={{ fontSize: 12, fontWeight: 800, color: S.g, marginBottom: 6 }}>💪 Soy bueno en</div><div style={{ fontSize: 10, color: "#ccc" }}>Diagnóstico raíz<br/>Arquitectura operativa<br/>Liderazgo claro</div></div>
        <div style={{ padding: 15, background: S.b+"08", borderRadius: 12, border: `1px solid ${S.b}30` }}><div style={{ fontSize: 12, fontWeight: 800, color: S.b, marginBottom: 6 }}>🌍 Necesidad</div><div style={{ fontSize: 10, color: "#ccc" }}>Escalar sin destruir<br/>Ética y respeto<br/>Sostenibilidad</div></div>
        <div style={{ padding: 15, background: S.y+"08", borderRadius: 12, border: `1px solid ${S.y}30` }}><div style={{ fontSize: 12, fontWeight: 800, color: S.y, marginBottom: 6 }}>💰 Me pagan por</div><div style={{ fontSize: 10, color: "#ccc" }}>Quitar dependencia<br/>Cultura y métricas<br/>Escalar MiPyMEs</div></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Card color={S.r}><div style={{fontSize:11, color:S.r, fontWeight:800, marginBottom:6}}>🚫 NO NEGOCIABLES</div><div style={{fontSize:11, color:"#ccc", lineHeight:1.6}}>● Claridad<br/>● Respeto<br/>● Ética</div></Card>
        <Card color={S.g}><div style={{fontSize:11, color:S.g, fontWeight:800, marginBottom:6}}>🧭 BRÚJULA VITAL</div><div style={{fontSize:11, color:"#ccc", lineHeight:1.6}}>● Presencia Familiar<br/>● Salud<br/>● Impacto Económico</div></Card>
      </div>
    </>
  );
}

function Card({ children, color, title }) { return <div style={{ background: S.card, borderRadius: 15, border: `1px solid ${color ? color + "40" : S.border}`, marginBottom: 12, overflow: "hidden" }}>{title && <div style={{ padding: "10px 14px", borderBottom: `1px solid ${S.border}`, fontSize: 11, fontWeight: 800, color: color || S.text }}>{title}</div>}<div style={{ padding: 14 }}>{children}</div></div>; }