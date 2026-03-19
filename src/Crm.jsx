import logoPraxentia from './logo.svg';
import React, { useState, useEffect } from 'react';
import { Target, ChevronDown, ChevronUp, MessageCircle, Briefcase, Droplet, LayoutDashboard, Radar, Database, Loader2 } from 'lucide-react';
import RadarProspectos from './RadarProspectos';

// ==========================================
// 🔌 1. EL CABLE A LA BASE DE DATOS
// ==========================================
// Reemplace esto con la URL que le da Vercel o su Google Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxdsI3J6Ap7STzvJ33wqspYv4aCREpXjZgLOv8e_M9fuX_ViiJ2THakvD4g6F2tTCA/exec'; 

const PIPELINES = {
  praxentia: {
    high_ticket: [
      { id: 'nuevos', label: '📥 Nuevos', color: 'bg-slate-900/50 border-slate-800' },
      { id: 'contactado', label: '📞 Contactado', color: 'bg-blue-900/20 border-blue-900/50' },
      { id: 'diagnostico', label: '🔍 Diagnóstico', color: 'bg-purple-900/20 border-purple-900/50' },
      { id: 'propuesta', label: '📄 Propuesta', color: 'bg-amber-900/20 border-amber-900/50' },
      { id: 'standby', label: '⏳ Standby', color: 'bg-slate-800/50 border-slate-700' },
      { id: 'cerrado', label: '✅ Firmado', color: 'bg-emerald-900/20 border-emerald-900/50' }
    ],
    digital: [
      { id: 'leads', label: '📥 Leads (Descargas)', color: 'bg-slate-900/50 border-slate-800' },
      { id: 'carrito', label: '🛒 Carrito Abandonado', color: 'bg-amber-900/20 border-amber-900/50' },
      { id: 'comprador', label: '✅ Comprador (Upsell)', color: 'bg-emerald-900/20 border-emerald-900/50' }
    ]
  },
  tunha: {
    prospectando: [
      { id: 'nuevos_t', label: '📥 Nuevos / Leads', color: 'bg-cyan-950/30 border-cyan-900/50' },
      { id: 'pitch', label: '📊 Cotización Enviada', color: 'bg-blue-900/20 border-blue-900/50' },
      { id: 'negociacion', label: '📞 Negociación', color: 'bg-purple-900/20 border-purple-900/50' },
      { id: 'standby_t', label: '⏳ Standby', color: 'bg-slate-800/50 border-slate-700' },
      { id: 'agendada', label: '📅 Inst. Agendada', color: 'bg-amber-900/20 border-amber-900/50' },
      { id: 'instalado', label: '✅ Inst. y Cobrado', color: 'bg-emerald-900/20 border-emerald-900/50' }
    ],
    seguimiento: [
      { id: 'toca_hoy', label: '📥 Toca Servicio', color: 'bg-red-950/30 border-red-900/50' },
      { id: 'wa_enviado', label: '💬 WA Enviado', color: 'bg-blue-900/20 border-blue-900/50' },
      { id: 'visita_agendada', label: '📅 Visita Agendada', color: 'bg-amber-900/20 border-amber-900/50' },
      { id: 'standby_seg', label: '⏳ Standby', color: 'bg-slate-800/50 border-slate-700' },
      { id: 'manto_cobrado', label: '✅ Manto. Cobrado', color: 'bg-emerald-900/20 border-emerald-900/50' }
    ]
  }
};

const ICP_MAP = { A: '🅰️ Ideal', B: '🅱️ Bueno', C: '🅲 No fit', D: '🎯 Estratégico' };

export default function CrmMaster() {
  const [activeCompany, setActiveCompany] = useState('praxentia'); 
  const [activeFunnelP, setActiveFunnelP] = useState('high_ticket');
  const [activeFunnelT, setActiveFunnelT] = useState('prospectando');
  const [activeView, setActiveView] = useState('radar'); 
  const [expandedLead, setExpandedLead] = useState(null);
  
  // 🚨 AHORA ARRANCA VACÍO Y CON ESTADO DE CARGA
  const [leads, setLeads] = useState([]);
  const [cargando, setCargando] = useState(true);

  // ==========================================
  // 🔌 2. DESCARGAR DATOS AL ABRIR LA APP
  // ==========================================
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        if (SCRIPT_URL === 'AQUI_VA_TU_URL_DE_GOOGLE_SCRIPT') {
          console.warn("Falta poner la URL real. Cargando datos vacíos.");
          setCargando(false);
          return;
        }
        
        const respuesta = await fetch(SCRIPT_URL);
        const datosReales = await respuesta.json();
        // Asumiendo que su script devuelve un array de objetos
        setLeads(datosReales);
      } catch (error) {
        console.error("Error al conectar con la base de datos:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchDatos();
  }, []);

  // ==========================================
  // 🔌 3. FUNCIÓN PARA MANDAR CAMBIOS AL SERVIDOR
  // ==========================================
  const guardarEnBD = async (accion, datos) => {
    if (SCRIPT_URL === 'AQUI_VA_TU_URL_DE_GOOGLE_SCRIPT') return;
    
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        // El body depende de cómo programó su Google Script, esto es el estándar:
        body: JSON.stringify({ action: accion, payload: datos })
      });
    } catch (error) {
      console.error("Error al guardar en BD:", error);
    }
  };

  const currentFunnelId = activeCompany === 'praxentia' ? activeFunnelP : activeFunnelT;
  const currentStages = PIPELINES[activeCompany][currentFunnelId];
  const activeLeads = leads.filter(l => l.company === activeCompany && l.funnel === currentFunnelId);

  const toggleLead = (id) => setExpandedLead(expandedLead === id ? null : id);

  const sendWhatsApp = (lead) => window.open(`https://wa.me/52${lead.phone}`, '_blank');

  const themeColors = activeCompany === 'praxentia' 
    ? { border: 'border-slate-800', bg: 'bg-slate-950', text: 'text-slate-100', accent: 'text-emerald-400', tab: 'bg-emerald-600' }
    : { border: 'border-cyan-900', bg: 'bg-slate-900', text: 'text-cyan-50', accent: 'text-cyan-400', tab: 'bg-cyan-600' };

  // PANTALLA DE CARGA INICIAL
  if (cargando) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mb-4" size={48} />
        <h2 className="text-xl font-bold">Conectando a la Base de Datos...</h2>
        <p className="text-sm mt-2">Sincronizando Cuarto de Guerra</p>
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-6 mx-auto font-sans min-h-screen flex flex-col ${themeColors.bg} transition-colors duration-300 overflow-hidden`}>

     {/* 🚀 LOGO Y TÍTULO OFICIAL 🚀 */}
      <div className="flex items-center gap-4 mb-4 border-b border-slate-800 pb-4">
        <img src={logoPraxentia} alt="Praxentia Logo" className="h-10 drop-shadow-lg" />
        <div>
          <h1 className="text-xl font-black text-slate-200 uppercase tracking-widest">MASV OS <span className="text-emerald-500">v5.0</span></h1>
          <p className="text-xs text-slate-500 font-bold tracking-wider">CENTRAL DE MANDO B2B</p>
        </div>
      </div> 
      {/* HEADER: SWITCH DE EMPRESA Y PESTAÑAS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex gap-2 mb-3">
            <button onClick={() => setActiveCompany('praxentia')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeCompany === 'praxentia' ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}>
              <Briefcase size={16}/> PRAXENTIA
            </button>
            <button onClick={() => setActiveCompany('tunha')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeCompany === 'tunha' ? 'bg-cyan-500 text-slate-900' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}>
              <Droplet size={16}/> TUNHA
            </button>
          </div>
        </div>

        <div className="flex bg-[#06080a] p-1 rounded-lg border border-slate-800">
          <button onClick={() => setActiveView('radar')} className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${activeView === 'radar' ? themeColors.tab + ' text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
            <Radar size={16}/> Radar Top 10
          </button>
          <button onClick={() => setActiveView('pipeline')} className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${activeView === 'pipeline' ? themeColors.tab + ' text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
            <LayoutDashboard size={16}/> Pipeline
          </button>
          <button onClick={() => setActiveView('database')} className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${activeView === 'database' ? themeColors.tab + ' text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
            <Database size={16}/> Base de Datos
          </button>
        </div>
      </div>

      {/* VISTA 1: EL RADAR */}
      {activeView === 'radar' && (
        <div className="flex-1 overflow-y-auto animate-fade-in">
          <RadarProspectos 
            prospectos={activeLeads.map(l => ({
              id: l.id, nombre: l.name, contacto: l.phone, icp_fit: l.icp,
              estatus: ['nuevos', 'nuevos_t', 'leads', 'toca_hoy'].includes(l.stage) ? 'Nuevo' : l.stage
            }))}
            actualizarProspecto={(id, nuevosDatos) => {
              // 1. Actualiza pantalla
              let leadActualizado = null;
              setLeads(leads.map(l => {
                if (l.id === id) {
                  let nuevaEtapa = l.stage;
                  if (nuevosDatos.estatus === 'Prospección') {
                    nuevaEtapa = activeCompany === 'praxentia' ? 'contactado' : 'pitch';
                  }
                  leadActualizado = { ...l, icp: nuevosDatos.icp_fit || l.icp, stage: nuevaEtapa };
                  return leadActualizado;
                }
                return l;
              }));
              // 2. Manda a BD
              if(leadActualizado) guardarEnBD('actualizar', leadActualizado);
            }}
            agregarProspecto={(nuevo) => {
              const etapaInicial = currentStages[0].id; 
              const nuevoLead = {
                id: Date.now().toString(),
                company: activeCompany,
                funnel: currentFunnelId,
                name: nuevo.nombre,
                phone: nuevo.contacto,
                icp: nuevo.icp_fit,
                product: 'Por definir',
                value: 0,
                stage: etapaInicial 
              };
              // 1. Actualiza pantalla
              setLeads([...leads, nuevoLead]);
              // 2. Manda a BD
              guardarEnBD('crear', nuevoLead);
            }}
          />
        </div>
      )}

      {/* VISTA 2: EL PIPELINE */}
      {activeView === 'pipeline' && (
        <div className="flex-1 overflow-x-auto pb-6 scrollbar-hide flex gap-4 items-start animate-fade-in">
          {currentStages.map(stage => {
            const leadsEnColumna = activeLeads.filter(l => l.stage === stage.id && !['nuevos', 'nuevos_t', 'leads', 'toca_hoy'].includes(l.stage));
            
            return (
              <div key={stage.id} className={`flex-1 min-w-[280px] rounded-xl border-t-4 p-3 flex flex-col max-h-full ${stage.color}`}>
                <h3 className={`font-bold text-sm mb-3 ${themeColors.text}`}>{stage.label}</h3>
                <div className="space-y-3 overflow-y-auto pr-1">
                  {leadsEnColumna.map(lead => {
                    const isExpanded = expandedLead === lead.id;
                    return (
                      <div key={lead.id} className={`bg-[#0a0d14] rounded-lg shadow-sm border ${themeColors.border} hover:border-slate-600 transition-colors overflow-hidden`}>
                        <div onClick={() => toggleLead(lead.id)} className="p-3 cursor-pointer flex justify-between items-center hover:bg-white/5">
                          <div>
                            <h4 className={`font-bold text-sm flex items-center gap-2 ${themeColors.text}`}>
                              {lead.name} <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase">{ICP_MAP[lead.icp] || 'LEAD'}</span>
                            </h4>
                            <div className={`font-black text-xs mt-1 ${themeColors.accent}`}>${Number(lead.value).toLocaleString()} MXN</div>
                          </div>
                          <div className="text-slate-500">{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
                        </div>
                        {isExpanded && (
                          <div className="p-3 border-t border-slate-800/50 bg-[#06080a]">
                            <select 
                              className="text-xs border border-slate-700 rounded p-1.5 w-full bg-slate-900 font-semibold text-slate-300 outline-none mb-3"
                              value={lead.stage}
                              onChange={(e) => {
                                const nuevaEtapa = e.target.value;
                                // 1. Actualiza pantalla
                                setLeads(leads.map(l => l.id === lead.id ? { ...l, stage: nuevaEtapa } : l));
                                setExpandedLead(null);
                                // 2. Manda a BD
                                const leadActualizado = { ...lead, stage: nuevaEtapa };
                                guardarEnBD('actualizar', leadActualizado);
                              }}
                            >
                              {currentStages.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
                            <button onClick={() => sendWhatsApp(lead)} className="w-full flex items-center justify-center gap-2 bg-[#128C7E]/20 hover:bg-[#128C7E]/40 border border-[#128C7E]/50 text-[#25D366] text-xs font-bold py-2 rounded transition-colors">
                              <MessageCircle size={14}/> Enviar WhatsApp
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VISTA 3: BASE DE DATOS */}
      {activeView === 'database' && (
        <div className="flex-1 overflow-y-auto bg-[#0a0d14] rounded-xl border border-slate-800 p-4 animate-fade-in">
          <h2 className="text-xl font-bold text-slate-200 mb-4">🗄️ Base de Datos Maestra</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-900 text-xs uppercase font-bold text-slate-500">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Cliente</th>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3">ICP Fit</th>
                  <th className="px-4 py-3">Etapa Actual</th>
                  <th className="px-4 py-3 rounded-tr-lg">Valor</th>
                </tr>
              </thead>
              <tbody>
                {activeLeads.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8">No hay prospectos. Inyecte en el Radar.</td></tr>
                ) : (
                  activeLeads.map(lead => (
                    <tr key={lead.id} className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-200">{lead.name}</td>
                      <td className="px-4 py-3">{lead.phone}</td>
                      <td className="px-4 py-3">{ICP_MAP[lead.icp]}</td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-800 px-2 py-1 rounded text-xs">{currentStages.find(s => s.id === lead.stage)?.label || 'Crudo'}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-emerald-400">${lead.value.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}