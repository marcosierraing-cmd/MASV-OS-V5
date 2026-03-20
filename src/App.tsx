import CRM from './Crm';
import DatabaseCRM from './DatabaseCRM';
import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ReferenceLine,
} from 'recharts';
import {
  Lock,
  Cloud,
  AlertCircle,
  Edit3,
  Youtube,
  Activity,
  Bell,
  Zap,
} from 'lucide-react';

// ═══════════════════════════════════════
// CONFIGURACIÓN Y CONSTANTES (v5.0 CEO Edition)
// ═══════════════════════════════════════
const CLOUD_URL =
  'https://script.google.com/macros/s/AKfycbwBy-F2TWOgfWw64Z9TXwbMGOn0J0-DRn7aDwR2iv1dfurceoMEcrTJqQOi34MagYMZJw/exec';
const SECRET_PIN = '1800';

const S = {
  bg: '#08090c',
  card: '#0e1015',
  border: '#1a1d25',
  text: '#e0e0e0',
  muted: '#6b7080',
  subtle: '#2a2e38',
  g: '#38b587',
  r: '#d4556b',
  y: '#d4a030',
  b: '#4a8ed4',
  p: '#a06cd4',
  pk: '#e88ca0',
  o: '#e06050',
  gr: '#7a9aaa',
  font: "'Outfit',sans-serif",
  mono: "'IBM Plex Mono',monospace",
};

const MASTER_HISTORY = [
  {
    week: -4,
    date: '2026-01-07',
    peso: 93,
    grasa: 38,
    visceral: 16,
    musculo: 28.1,
    bmi: 32.2,
    edadCorp: 64,
    metab: 1897,
    cashIn: 0,
  },
  {
    week: 0,
    date: '2026-02-28',
    peso: 82.8,
    grasa: 31.8,
    visceral: 13,
    musculo: 32.1,
    bmi: 29.0,
    edadCorp: 54,
    metab: 1791,
    cashIn: 0,
  },
  {
    week: 1,
    date: '2026-03-07',
    peso: 83.0,
    grasa: 30.7,
    visceral: 12,
    musculo: 32.8,
    bmi: 28.7,
    edadCorp: 53,
    metab: 1782,
    cashIn: 0,
  },
];

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(d.getDate()).padStart(2, '0')}`;
}

const KEYS = {
  daily: 'masv-d-v50',
  weeks: 'masv-w-v50',
  goals: 'masv-g-v50',
  sync: 'masv-s-v50',
};
async function load(k) {
  try {
    return JSON.parse(localStorage.getItem(k));
  } catch {
    return null;
  }
}
async function save(k, d) {
  try {
    localStorage.setItem(k, JSON.stringify(d));
  } catch (e) {
    console.error(e);
  }
}

const STRENGTH_MASTER = [
  {
    d: 'LUN',
    f: 'Tren Inferior',
    c: S.r,
    ex: [
      { n: 'Sentadilla goblet 16lb', s: '4×15' },
      { n: 'RDL 1 pierna 16lb', s: '3×12' },
      { n: 'Sent. búlgara 10lb', s: '3×10' },
      { n: 'Puente glúteo 1 pierna', s: '3×15' },
      { n: 'Aro aductores', s: '3×30s' },
    ],
  },
  {
    d: 'MAR',
    f: 'Empuje (Ayuno)',
    c: S.y,
    ex: [
      { n: 'Flexiones tempo 3-1-2', s: '4×12' },
      { n: 'Press pecho piso 16lb', s: '3×15' },
      { n: 'Press militar 10lb', s: '3×12' },
      { n: 'Elev. laterales 6lb', s: '3×15' },
      { n: 'Fondos silla', s: '3×12' },
    ],
  },
  {
    d: 'MIÉ',
    f: 'Movilidad',
    c: S.p,
    ex: [
      { n: 'Caminata Z2 ligera', s: '40m' },
      { n: 'Movilidad completa', s: '20m' },
    ],
  },
  {
    d: 'JUE',
    f: 'Tirón',
    c: S.b,
    ex: [
      { n: 'Remo 1 brazo 16lb', s: '4×12' },
      { n: 'Remo banda puerta', s: '3×15' },
      { n: 'Face pull banda', s: '3×20' },
      { n: 'Curl bíceps 10lb', s: '3×12' },
    ],
  },
  {
    d: 'VIE',
    f: 'Caminata Z2',
    c: S.g,
    ex: [
      { n: 'Caminata Z2', s: '60m' },
      { n: 'Movilidad', s: '15m' },
    ],
  },
  {
    d: 'SÁB',
    f: 'Full Body Metabólico',
    c: S.o,
    ex: [
      { n: 'Sent. goblet tempo 16lb', s: '5×45s' },
      { n: 'Flexiones', s: '5×45s' },
      { n: 'Remo banda puerta', s: '5×45s' },
      { n: 'Mt. climbers', s: '5×45s' },
    ],
  },
  {
    d: 'DOM',
    f: 'Recuperación',
    c: S.gr,
    ex: [
      { n: 'Caminata ligera', s: '30m' },
      { n: 'Movilidad', s: '25m' },
    ],
  },
];

// ═══════════════════════════════════════
// ACCESO DE SEGURIDAD
// ═══════════════════════════════════════
export default function App() {
  const [auth, setAuth] = useState(false);
  const [pin, setPin] = useState('');
  const handlePin = (e) => {
    setPin(e.target.value);
    if (e.target.value === SECRET_PIN) setAuth(true);
  };

  if (!auth) {
    return (
      <div
        style={{
          background: S.bg,
          color: S.text,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: S.font,
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;800&family=IBM+Plex+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
        <Lock size={48} color={S.g} style={{ marginBottom: 20 }} />
        <div
          style={{
            fontSize: 10,
            letterSpacing: 3,
            color: S.muted,
            marginBottom: 10,
            fontFamily: S.mono,
          }}
        >
          PRAXENTIA SYSTEMS
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 30 }}>
          Acceso Restringido v5.0
        </div>
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={handlePin}
          placeholder="••••"
          style={{
            background: S.card,
            border: `1px solid ${S.border}`,
            color: S.g,
            padding: '15px',
            borderRadius: 12,
            fontSize: 28,
            textAlign: 'center',
            letterSpacing: 15,
            width: '60%',
            outline: 'none',
            fontWeight: 800,
          }}
        />
      </div>
    );
  }
  return <MasvDashboard />;
}

// ═══════════════════════════════════════
// DASHBOARD PRINCIPAL v5.0
// ═══════════════════════════════════════
function MasvDashboard() {
  const PILLARS = {
    OPERACIÓN: ['Diario', 'Mensual'],
    CRM: ['Pipeline', 'Base de Datos'],
    FINANZAS: ['RESICO Hub', 'Conciliador SAT'],
    AVANCE: ['Dashboard'],
    LEADERSHIP: ['Protocolos', 'Estrategia'],
  };

  const [pillar, setPillar] = useState('OPERACIÓN');
  const [subTab, setSubTab] = useState('Diario');

  const handlePillarChange = (newPillar) => {
    setPillar(newPillar);
    setSubTab(PILLARS[newPillar][0]);
  };

  const [daily, setDaily] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [goals, setGoals] = useState({
    peso: 77,
    grasa: 26,
    visceral: 10.5,
    musculo: 33.5,
    bmi: 26.5,
    edadCorp: 46,
  });
  const [syncData, setSyncData] = useState({ local: null, drive: null });
  const [loading, setLoading] = useState(true);
  const [unsaved, setUnsaved] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    (async () => {
      const [d, w, g, s] = await Promise.all([
        load(KEYS.daily),
        load(KEYS.weeks),
        load(KEYS.goals),
        load(KEYS.sync),
      ]);
      if (d) setDaily(d);
      let mergedWeeks = w || [];
      MASTER_HISTORY.forEach((h) => {
        if (!mergedWeeks.find((mw) => mw.week === h.week)) {
          mergedWeeks.push(h);
        }
      });
      mergedWeeks.sort((a, b) => a.week - b.week);
      setWeeks(mergedWeeks);
      await save(KEYS.weeks, mergedWeeks);
      if (g) setGoals(g);
      if (s) setSyncData(s);
      setLoading(false);
    })();
  }, []);

  const saveGlobal = async () => {
    setSyncing(true);
    const nowLocal = new Date().toISOString();
    setSyncData((prev) => ({ ...prev, local: nowLocal }));
    try {
      await fetch(CLOUD_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ daily, weeks, goals, ts: nowLocal, v: '5.0' }),
      });
      const nowDrive = new Date().toISOString();
      setSyncData({ local: nowLocal, drive: nowDrive });
      await save(KEYS.sync, { local: nowLocal, drive: nowDrive });
      setUnsaved(false);
    } catch (e) {
      alert('❌ Error de red');
    }
    setSyncing(false);
  };

  const updateDaily = async (newDaily) => {
    setDaily(newDaily);
    await save(KEYS.daily, newDaily);
    setUnsaved(true);
  };
  const updateWeeks = async (newWeeks) => {
    setWeeks(newWeeks);
    await save(KEYS.weeks, newWeeks);
    setUnsaved(true);
  };

  if (loading) return <div style={{ background: S.bg, height: '100vh' }} />;

  return (
    <div
      style={{
        background: S.bg,
        color: S.text,
        minHeight: '100vh',
        fontFamily: S.font,
        paddingBottom: 80,
      }}
    >
      {/* HEADER SUPERIOR */}
      <div
        style={{
          padding: '16px 16px 10px',
          borderBottom: `1px solid ${S.border}`,
          position: 'sticky',
          top: 0,
          background: S.bg,
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 9,
                color: S.muted,
                letterSpacing: 2,
                fontWeight: 700,
              }}
            >
              MASV OS v5.0
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: S.g }}>
              Central de Mando
            </div>
          </div>
          <button
            onClick={saveGlobal}
            disabled={!unsaved && !syncing}
            style={{
              background: unsaved ? S.o : '#1c2533',
              border: 'none',
              color: unsaved ? '#fff' : syncing ? S.muted : '#8eb6f0',
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: !unsaved && !syncing ? 0.6 : 1,
              transition: '0.3s',
            }}
          >
            {unsaved ? <AlertCircle size={14} /> : <Cloud size={14} />}{' '}
            {syncing
              ? 'Sincronizando...'
              : unsaved
              ? '⚠️ Cambios Locales'
              : '☁️ Bóveda Segura'}
          </button>
        </div>
      </div>

      {/* NAVEGACIÓN PRINCIPAL */}
      <div
        style={{
          display: 'flex',
          gap: 15,
          padding: '12px 16px',
          overflowX: 'auto',
          background: S.card,
          borderBottom: `1px solid ${S.border}`,
          scrollbarWidth: 'none',
        }}
      >
        {Object.keys(PILLARS).map((p) => (
          <div
            key={p}
            onClick={() => handlePillarChange(p)}
            style={{
              color: pillar === p ? S.b : S.muted,
              fontSize: 12,
              fontWeight: pillar === p ? 800 : 500,
              borderBottom: pillar === p ? `2px solid ${S.b}` : 'none',
              paddingBottom: 8,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              letterSpacing: 1,
            }}
          >
            {p}
          </div>
        ))}
      </div>

      {/* SUB-NAVEGACIÓN */}
      {PILLARS[pillar].length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: '10px 16px',
            background: S.bg,
          }}
        >
          {PILLARS[pillar].map((st) => (
            <button
              key={st}
              onClick={() => setSubTab(st)}
              style={{
                padding: '6px 12px',
                borderRadius: 20,
                background: subTab === st ? S.subtle : 'transparent',
                border: `1px solid ${subTab === st ? S.border : 'transparent'}`,
                color: subTab === st ? '#fff' : S.muted,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      )}

      {/* CONTENIDO */}
      <div
        style={{
          padding: pillar === 'CRM' || pillar === 'FINANZAS' ? '0' : '16px',
        }}
      >
        {pillar === 'OPERACIÓN' && subTab === 'Diario' && (
          <TabHoy daily={daily} updateDaily={updateDaily} />
        )}
        {pillar === 'OPERACIÓN' && subTab === 'Mensual' && (
          <TabSemanal weeks={weeks} updateWeeks={updateWeeks} goals={goals} />
        )}
        {pillar === 'CRM' && subTab === 'Pipeline' && (
          <div style={{ margin: '-1px 0' }}>
            <CRM />
          </div>
        )}
        {pillar === 'CRM' && subTab === 'Base de Datos' && (
          <div style={{ margin: '-1px 0' }}>
            <DatabaseCRM />
          </div>
        )}
        {pillar === 'FINANZAS' && <TabFinanzas subTab={subTab} />}
        {pillar === 'AVANCE' && (
          <TabAvance daily={daily} weeks={weeks} goals={goals} />
        )}
        {pillar === 'LEADERSHIP' && subTab === 'Protocolos' && (
          <TabProtocolos />
        )}
        {pillar === 'LEADERSHIP' && subTab === 'Estrategia' && (
          <TabEstrategia />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// MÓDULOS DE COMPONENTES SECUNDARIOS
// ═══════════════════════════════════════
function TabFinanzas({ subTab }) {
  const [timeFrame, setTimeFrame] = useState('Mensual');
  const [viewMode, setViewMode] = useState('Simple');

  if (subTab === 'RESICO Hub') {
    return (
      <div style={{ padding: 20, color: S.text }}>
        <h2
          style={{ fontSize: 18, fontWeight: 800, color: S.b, marginBottom: 5 }}
        >
          Corporativo Praxentia
        </h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 6,
              background: S.card,
              padding: 4,
              borderRadius: 8,
              width: 'fit-content',
              border: `1px solid ${S.border}`,
            }}
          >
            {['Mensual', 'Anual'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFrame(tf)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: timeFrame === tf ? S.subtle : 'transparent',
                  color: timeFrame === tf ? '#fff' : S.muted,
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        <Card color={S.g} title={`P&L ${timeFrame} (${viewMode})`}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <div>
              <div style={{ fontSize: 10, color: S.muted }}>Facturación</div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>
                {timeFrame === 'Anual' ? '$480,000' : '$120,000'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: S.muted }}>Gastos Op.</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: S.o }}>
                {timeFrame === 'Anual' ? '$85,000' : '$18,500'}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  return (
    <div style={{ padding: 20, color: S.text, textAlign: 'center' }}>
      <Activity size={48} color={S.p} style={{ margin: '0 auto 15px' }} />
    </div>
  );
}

function TabHoy({ daily, updateDaily }) {
  const [selectedDate, setSelectedDate] = useState(today());
  const existing = daily.find((d) => d.date === selectedDate);
  const [form, setForm] = useState(
    existing || {
      date: selectedDate,
      agua: false,
      sop: false,
      leer: false,
      entreno: false,
      medita: false,
      pasos: '',
      paS: '',
      paD: '',
      locked: false,
    }
  );

  useEffect(() => {
    const found = daily.find((d) => d.date === selectedDate);
    setForm(
      found || {
        date: selectedDate,
        agua: false,
        sop: false,
        leer: false,
        entreno: false,
        medita: false,
        pasos: '',
        paS: '',
        paD: '',
        locked: false,
      }
    );
  }, [selectedDate, daily]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const lockDay = () => {
    const n = { ...form, locked: true };
    setForm(n);
    updateDaily(
      [...daily.filter((d) => d.date !== selectedDate), n].sort((a, b) =>
        a.date.localeCompare(b.date)
      )
    );
  };
  const unlockDay = () => {
    const n = { ...form, locked: false };
    setForm(n);
    updateDaily(
      [...daily.filter((d) => d.date !== selectedDate), n].sort((a, b) =>
        a.date.localeCompare(b.date)
      )
    );
  };

  const hab = [
    { k: 'agua', l: 'Agua', c: S.b },
    { k: 'sop', l: 'SOP', c: S.r },
    { k: 'leer', l: 'Leer', c: S.p },
    { k: 'entreno', l: 'Entreno', c: S.y },
    { k: 'medita', l: 'Medita', c: S.g },
  ];

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 15,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          Auditoría{' '}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              background: S.subtle,
              color: S.text,
              border: `1px solid ${S.border}`,
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 11,
              outline: 'none',
            }}
          />
        </div>
        {form.locked && (
          <button
            onClick={unlockDay}
            style={{
              background: S.subtle,
              border: 'none',
              color: S.muted,
              padding: '6px 10px',
              borderRadius: 6,
              fontSize: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Edit3 size={12} /> Editar
          </button>
        )}
      </div>
      <Card title="⚡ Hábitos Clave" color={S.y}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 6,
            marginBottom: 15,
          }}
        >
          {hab.map((h) => (
            <button
              key={h.k}
              disabled={form.locked}
              onClick={() => set(h.k, !form[h.k])}
              style={{
                padding: '8px 0',
                borderRadius: 8,
                border:
                  form.locked && !form[h.k]
                    ? `1px dashed ${S.border}`
                    : `1px solid ${form[h.k] ? h.c : S.border}`,
                background: form[h.k]
                  ? form.locked
                    ? h.c + '50'
                    : h.c
                  : 'transparent',
                color: form[h.k] ? '#fff' : S.muted,
                fontSize: 9,
                fontWeight: 700,
                opacity: form.locked && !form[h.k] ? 0.3 : 1,
              }}
            >
              {h.l}
            </button>
          ))}
        </div>
      </Card>
      {!form.locked && (
        <button
          onClick={lockDay}
          style={{
            width: '100%',
            background: S.g,
            padding: 14,
            borderRadius: 10,
            color: '#fff',
            fontWeight: 800,
            border: 'none',
            marginTop: 10,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            textTransform: 'uppercase',
          }}
        >
          <Lock size={16} /> SELLAR DÍA
        </button>
      )}
    </>
  );
}

function TabSemanal({ weeks }) {
  return (
    <div style={{ color: S.text }}>Módulo Biometría Semanal Configurado.</div>
  );
}

function TabAvance() {
  return <div style={{ color: S.text }}>Dashboard de Avance Configurado.</div>;
}

// ═══════════════════════════════════════
// MÓDULO 5: PROTOCOLOS REPARADO 100%
// ═══════════════════════════════════════
function TabProtocolos() {
  const [protocol, setProtocol] = useState(() => {
    const saved = localStorage.getItem('masv-protocol-v5');
    const defaultP = {
      ayuno: {
        titulo: 'Ayuno Intermitente 16:8',
        rompe: 'Caldo de hueso + Grasas',
      },
      suplementos: [
        { n: 'Magnesio', h: 'Noche' },
        { n: 'Creatina', h: 'Mañana' },
      ],
      semaforo: {
        verde: ['Huevo', 'Carne', 'Vegetales'],
        rojo: ['Azúcar', 'Harinas', 'Ultraprocesados'],
      },
      rutinaAbdomen: ['Plancha', 'Deadbug', 'Bird-dog'],
      comidas: {
        semana: ['Proteína + Grasa + Vegetales'],
        finde: 'Flexibilidad controlada',
      },
    };
    return saved ? JSON.parse(saved) : defaultP;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activeDay, setActiveDay] = useState(() => {
    let d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  });

  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
  const isFastingDay = new Date().getDay() === 5;
  const sInput = {
    width: '100%',
    background: S.bg,
    border: `1px solid ${S.border}`,
    color: '#fff',
    padding: '8px',
    borderRadius: '6px',
    marginBottom: '8px',
    fontSize: '11px',
  };

  const currentWorkout = STRENGTH_MASTER[activeDay] || STRENGTH_MASTER[0];
  const updateP = (key, value) =>
    setProtocol((prev) => ({ ...prev, [key]: value }));

  return (
    <div style={{ fontFamily: S.font }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 15,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 800, color: S.g }}>
          {isEditing ? '🛠️ Modo Arquitecto' : '🥗 Protocolo Activo'}
        </h2>
        <button
          onClick={() => {
            if (isEditing)
              localStorage.setItem(
                'masv-protocol-v5',
                JSON.stringify(protocol)
              );
            setIsEditing(!isEditing);
          }}
          style={{
            background: isEditing ? S.g : S.subtle,
            color: '#fff',
            border: 'none',
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 10,
            fontWeight: 800,
          }}
        >
          {isEditing ? '✅ GUARDAR' : '⚙️ EDITAR'}
        </button>
      </div>

      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <Card title="⏰ Ayuno y Ruptura" color={S.y}>
            <input
              style={sInput}
              value={protocol.ayuno.titulo}
              onChange={(e) =>
                updateP('ayuno', { ...protocol.ayuno, titulo: e.target.value })
              }
            />
            <input
              style={sInput}
              value={protocol.ayuno.rompe}
              onChange={(e) =>
                updateP('ayuno', { ...protocol.ayuno, rompe: e.target.value })
              }
            />
          </Card>
          <Card title="🚦 Semáforo Nutricional" color={S.r}>
            <div style={{ fontSize: 9, color: S.g, marginBottom: 4 }}>
              VERDE (Separa por comas)
            </div>
            <textarea
              style={{ ...sInput, height: 60 }}
              value={protocol.semaforo.verde.join(', ')}
              onChange={(e) =>
                updateP('semaforo', {
                  ...protocol.semaforo,
                  verde: e.target.value.split(', '),
                })
              }
            />
          </Card>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              gap: 12,
              background: S.card,
              padding: 12,
              borderRadius: 12,
              marginBottom: 15,
              border: `1px solid ${isFastingDay ? S.o : S.y}50`,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  color: isFastingDay ? S.o : S.y,
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {isFastingDay ? '🔥 AYUNO PROLONGADO' : protocol.ayuno.titulo}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: S.b,
                  fontWeight: 700,
                  marginTop: 4,
                }}
              >
                👉 {protocol.ayuno.rompe}
              </div>
            </div>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <div style={{ color: S.p, fontSize: 12, fontWeight: 800 }}>
                💊 SUPLES
              </div>
              {protocol.suplementos.map((s, i) => (
                <div key={i} style={{ fontSize: 9, color: S.muted }}>
                  {s.n} ({s.h})
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 4,
              flexWrap: 'wrap',
              marginBottom: 10,
            }}
          >
            {STRENGTH_MASTER.map((d, i) => (
              <button
                key={i}
                onClick={() => setActiveDay(i)}
                style={{
                  flex: '1 1 auto',
                  padding: '8px 4px',
                  borderRadius: 6,
                  background: activeDay === i ? d.c : 'transparent',
                  color: activeDay === i ? '#fff' : S.muted,
                  border: `1px solid ${activeDay === i ? d.c : S.border}`,
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                {d.d}
              </button>
            ))}
          </div>

          <Card
            color={currentWorkout.c}
            title={`${currentWorkout.d} - ${currentWorkout.f}`}
          >
            {currentWorkout.ex.map((e, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 0',
                  borderBottom: `1px solid ${S.border}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{e.n}</div>
                  <div
                    style={{
                      fontSize: 12,
                      color: currentWorkout.c,
                      fontFamily: S.mono,
                    }}
                  >
                    {e.s}
                  </div>
                </div>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                    e.n + ' tecnica'
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: 9,
                    color: S.muted,
                    textDecoration: 'none',
                    background: S.subtle,
                    padding: '3px 6px',
                    borderRadius: 4,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Youtube size={10} color="#ff0000" /> Ver técnica
                </a>
              </div>
            ))}
          </Card>

          <Card title="🧱 Core & Abdomen" color={S.b}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
              }}
            >
              {protocol.rutinaAbdomen.map((ex, i) => (
                <div
                  key={i}
                  style={{
                    background: S.bg,
                    padding: 8,
                    borderRadius: 6,
                    border: `1px solid ${S.border}`,
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700 }}>• {ex}</div>
                </div>
              ))}
            </div>
          </Card>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr',
              gap: 10,
              marginTop: 15,
            }}
          >
            <Card
              title={isWeekend ? '🥂 Finde' : '🍱 Comidas'}
              color={isWeekend ? S.p : S.g}
            >
              <div style={{ fontSize: 10 }}>
                {isWeekend
                  ? protocol.comidas.finde
                  : protocol.comidas.semana[0]}
              </div>
            </Card>
            <Card title="🚦 Prohibidos" color={S.r}>
              {protocol.semaforo.rojo.slice(0, 3).map((s, i) => (
                <div key={i} style={{ fontSize: 9, color: S.r }}>
                  • {s}
                </div>
              ))}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// ESTRATEGIA Y COMPONENTE CARD (¡EL RESCATADO!)
// ═══════════════════════════════════════
function TabEstrategia() {
  return (
    <>
      <div
        style={{
          textAlign: 'center',
          padding: '20px',
          marginBottom: 15,
          background: `linear-gradient(135deg, ${S.card}, #1a1d25)`,
          borderRadius: 12,
          border: `1px solid ${S.border}`,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: 2,
            color: S.p,
            marginBottom: 10,
          }}
        >
          IKIGAI — PROPÓSITO VITAL
        </div>
        <div
          style={{
            fontSize: 14,
            fontStyle: 'italic',
            fontWeight: 700,
            lineHeight: 1.5,
            color: '#fff',
          }}
        >
          "Transformo caos en orden consciente para liberar vida, empresa y
          legado."
        </div>
      </div>
      <Card title="💼 4 Áreas Operativas" color={S.p}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 15,
            fontSize: 11,
            color: '#ccc',
            lineHeight: 1.5,
          }}
        >
          <div>
            <div style={{ color: S.g, fontWeight: 800, marginBottom: 4 }}>
              🍏 Salud
            </div>
            ● 4 sesiones/sem
            <br />● Ventana 10:30-17:30
            <br />● Sueño 8h
          </div>
          <div>
            <div style={{ color: S.pk, fontWeight: 800, marginBottom: 4 }}>
              👨‍👩‍👧‍👦 Familia
            </div>
            ● Sin pantallas 60m/sem
            <br />● Check-in quincenal
          </div>
        </div>
      </Card>
    </>
  );
}

// ESTA ERA LA PIEZA PERDIDA
function Card({ children, color, title }) {
  return (
    <div
      style={{
        background: S.card,
        borderRadius: 15,
        border: `1px solid ${color ? color + '40' : S.border}`,
        marginBottom: 12,
        overflow: 'hidden',
      }}
    >
      {title && (
        <div
          style={{
            padding: '10px 14px',
            borderBottom: `1px solid ${S.border}`,
            fontSize: 11,
            fontWeight: 800,
            color: color || S.text,
          }}
        >
          {title}
        </div>
      )}
      <div style={{ padding: 14 }}>{children}</div>
    </div>
  );
}
