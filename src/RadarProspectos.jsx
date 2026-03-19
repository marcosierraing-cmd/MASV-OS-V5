import React, { useState, useMemo } from 'react';

export default function RadarProspectos({ prospectos, actualizarProspecto, agregarProspecto }) {
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoProspecto, setNuevoProspecto] = useState({ nombre: '', contacto: '', icp_fit: 'A' });

  // 1. Filtrar, Ordenar y RECORTAR AL TOP 10
  const prospectosFiltrados = useMemo(() => {
    return prospectos
      .filter(p => p.estatus === 'Nuevo') // Solo materia prima
      .filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
      // Ordenar por prioridad: A primero, luego B, luego D, al final C
      .sort((a, b) => a.icp_fit.localeCompare(b.icp_fit))
      .slice(0, 10); // <--- AQUÍ ESTÁ LA MAGIA: Solo deja pasar a los 10 mejores
  }, [prospectos, busqueda]);

  const handleCambioICP = (id, nuevoICP) => {
    actualizarProspecto(id, { icp_fit: nuevoICP });
  };

  const handleGuardarNuevo = () => {
    if(!nuevoProspecto.nombre) return;
    agregarProspecto({ ...nuevoProspecto, estatus: 'Nuevo', id: Date.now().toString() });
    setMostrarModal(false);
    setNuevoProspecto({ nombre: '', contacto: '', icp_fit: 'A' });
  };

  return (
    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-black text-blue-400 flex items-center gap-2">
            🎯 Cacería: Top 10 del Día
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase mt-1">Ataque a diestra y siniestra</p>
        </div>
        <button 
          onClick={() => setMostrarModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg"
        >
          + Inyectar
        </button>
      </div>

      <input 
        type="text" 
        placeholder="Buscar en el radar..." 
        className="w-full p-2.5 mb-4 bg-[#0a0d14] rounded-lg text-slate-200 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {/* Lista del Radar (Máximo 10) */}
      <div className="space-y-3">
        {prospectosFiltrados.length === 0 ? (
          <div className="text-center p-4 border border-dashed border-slate-700 rounded-lg text-slate-500 text-sm">
            Radar limpio. Inyecte prospectos para comenzar la cacería.
          </div>
        ) : (
          prospectosFiltrados.map(prospecto => (
            <div key={prospecto.id} className="bg-[#0a0d14] p-3 rounded-lg border-l-4 border-blue-500 border border-slate-800 flex flex-col md:flex-row justify-between md:items-center gap-3 hover:border-slate-600 transition-colors">
              <div>
                <h3 className="text-sm font-bold text-slate-200">{prospecto.nombre}</h3>
                <p className="text-slate-500 text-xs mt-0.5 font-medium">{prospecto.contacto}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <select 
                  value={prospecto.icp_fit} 
                  onChange={(e) => handleCambioICP(prospecto.id, e.target.value)}
                  className="bg-slate-800 text-slate-300 text-xs p-1.5 rounded outline-none border border-slate-700 font-bold"
                >
                  <option value="A">Fit A (Top)</option>
                  <option value="B">Fit B (Alto)</option>
                  <option value="D">Fit D (Estratégico)</option>
                  <option value="C">Fit C (Bajo)</option>
                </select>

                <button 
                  onClick={() => actualizarProspecto(prospecto.id, { estatus: 'Prospección' })}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors shadow-lg flex items-center gap-1"
                >
                  Al Pipeline 🚀
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Minimalista de Alta */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-black text-slate-200 mb-4">Inyectar Prospecto Crudo</h3>
            <input 
              type="text" placeholder="Nombre de la empresa o cliente" 
              className="w-full p-2.5 mb-3 bg-[#0a0d14] rounded-lg text-slate-200 border border-slate-700 outline-none text-sm"
              value={nuevoProspecto.nombre}
              onChange={e => setNuevoProspecto({...nuevoProspecto, nombre: e.target.value})}
            />
            <input 
              type="text" placeholder="Teléfono o WhatsApp" 
              className="w-full p-2.5 mb-3 bg-[#0a0d14] rounded-lg text-slate-200 border border-slate-700 outline-none text-sm"
              value={nuevoProspecto.contacto}
              onChange={e => setNuevoProspecto({...nuevoProspecto, contacto: e.target.value})}
            />
            <select 
              className="w-full p-2.5 mb-6 bg-[#0a0d14] rounded-lg text-slate-200 border border-slate-700 outline-none text-sm font-bold"
              value={nuevoProspecto.icp_fit}
              onChange={e => setNuevoProspecto({...nuevoProspecto, icp_fit: e.target.value})}
            >
              <option value="A">🅰️ Fit A (Ideal)</option>
              <option value="B">🅱️ Fit B (Bueno)</option>
              <option value="D">🎯 Fit D (Estratégico)</option>
              <option value="C">🅲 Fit C (No fit)</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setMostrarModal(false)} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-200 transition-colors">Cancelar</button>
              <button onClick={handleGuardarNuevo} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors shadow-lg">Inyectar 💉</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}