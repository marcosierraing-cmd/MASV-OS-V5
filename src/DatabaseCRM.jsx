import React, { useState } from 'react';
import { Search, Upload, Edit3, Trash2, AlertTriangle, CheckCircle, Database, X, Check } from 'lucide-react';

// Base de Datos Simulada (Con errores a propósito)
const RAW_DATA = [
  { id: 1, company: 'Praxentia', name: 'Datxa S.A.', phone: '5551234567', product: 'Instalación Operativa', value: 95000, date: '2026-03-11' },
  { id: 2, company: 'Tunha', name: 'Familia Gómez', phone: '', product: 'Ósmosis 5 Etapas', value: 6500, date: '2026-03-10' },
  { id: 3, company: 'Praxentia', name: 'Carlos Ruiz', phone: '5550001111', product: 'Plantilla Notion OS', value: 0, date: '2026-03-09' },
  { id: 4, company: 'Tunha', name: 'Oficina WeWork', phone: '5554445555', product: 'Dispensador Piso', value: 8500, date: '2026-03-08' },
  { id: 5, company: 'Praxentia', name: 'Grupo Zeta', phone: 'abc-123', product: 'Advisory 6W', value: 45000, date: '2026-03-05' }
];

export default function DatabaseCRM() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('Todas'); 
  const [db, setDb] = useState(RAW_DATA);
  
  // ESTADOS PARA LA EDICIÓN EN LÍNEA
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  // 🛡️ MOTOR DE AUDITORÍA (POKA-YOKE)
  const validateRow = (row) => {
    const errors = [];
    if (!row.name || row.name.trim() === '') errors.push('Falta Nombre');
    if (!row.phone || row.phone.trim() === '') errors.push('Falta Teléfono');
    else if (/[a-zA-Z]/.test(row.phone)) errors.push('Teléfono con letras');
    if (!row.value || row.value <= 0) errors.push('Monto en $0');
    return errors;
  };

  // Filtrado de la tabla
  const filteredData = db.filter(row => {
    const matchesSearch = row.name.toLowerCase().includes(searchTerm.toLowerCase()) || row.product.toLowerCase().includes(searchTerm.toLowerCase());
    const rowErrors = validateRow(row);
    if (filter === 'Errores') return matchesSearch && rowErrors.length > 0;
    if (filter !== 'Todas') return matchesSearch && row.company === filter;
    return matchesSearch;
  });

  const totalErrors = db.filter(r => validateRow(r).length > 0).length;

  // FUNCIONES DE EDICIÓN
  const startEdit = (row) => {
    setEditingId(row.id);
    setEditForm({ ...row });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    // Actualiza la base de datos con los datos corregidos
    setDb(db.map(row => row.id === editingId ? editForm : row));
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (id) => {
    if(window.confirm("⚠️ ¿Estás seguro de borrar este prospecto de la base maestra?")) {
      setDb(db.filter(row => row.id !== id));
    }
  };

  return (
    <div className="p-4 md:p-6 mx-auto font-sans min-h-screen bg-[#08090c] text-slate-300">
      
      {/* HEADER DE LA BÓVEDA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Database className="text-blue-500" /> Bóveda de Datos (Master DB)
          </h1>
          <p className="text-slate-500 text-sm mt-1">Centro de importación y corrección de prospectos.</p>
        </div>
        
        {/* WIDGET DE SALUD */}
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg flex items-center gap-3">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Registros Totales</p>
              <p className="text-xl font-black text-slate-200">{db.length}</p>
            </div>
          </div>
          <div className={`border px-4 py-2 rounded-lg flex items-center gap-3 ${totalErrors > 0 ? 'bg-red-950/20 border-red-900/50' : 'bg-emerald-950/20 border-emerald-900/50'}`}>
            {totalErrors > 0 ? <AlertTriangle className="text-red-500" size={20}/> : <CheckCircle className="text-emerald-500" size={20}/>}
            <div>
              <p className={`text-[10px] font-bold uppercase ${totalErrors > 0 ? 'text-red-500' : 'text-emerald-500'}`}>Auditoría Poka-Yoke</p>
              <p className={`text-xl font-black ${totalErrors > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {totalErrors > 0 ? `${totalErrors} Errores` : '100% Limpia'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE ACCIONES Y FILTROS */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800 w-fit">
          {['Todas', 'Praxentia', 'Tunha', 'Errores'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${filter === f ? (f === 'Errores' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-white') : 'text-slate-500 hover:text-slate-300'}`}>
              {f === 'Errores' && totalErrors > 0 ? `⚠️ ${f} (${totalErrors})` : f}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input type="text" placeholder="Buscar cliente..." className="bg-slate-900 border border-slate-800 text-sm text-slate-200 rounded-lg pl-9 pr-4 py-2 outline-none focus:border-blue-500 w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
            <Upload size={16} /> Importar CSV
          </button>
        </div>
      </div>

      {/* TABLA DE AUDITORÍA CRUDA */}
      <div className="bg-[#0e1015] border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                <th className="p-4 font-bold w-24">Estado</th>
                <th className="p-4 font-bold">Empresa</th>
                <th className="p-4 font-bold">Cliente</th>
                <th className="p-4 font-bold">Teléfono</th>
                <th className="p-4 font-bold">Producto Asignado</th>
                <th className="p-4 font-bold">Monto ($)</th>
                <th className="p-4 font-bold text-center w-28">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredData.map((row) => {
                const isEditing = editingId === row.id;
                const rowErrors = validateRow(row);
                const hasError = rowErrors.length > 0;

                return (
                  <tr key={row.id} className={`border-b border-slate-800/50 transition-colors ${isEditing ? 'bg-blue-950/20' : hasError ? 'bg-red-950/10 hover:bg-slate-800/20' : 'hover:bg-slate-800/20'}`}>
                    
                    {/* ESTADO */}
                    <td className="p-4">
                      {isEditing ? (
                        <div className="text-blue-400 text-xs font-bold animate-pulse">Editando...</div>
                      ) : hasError ? (
                        <div className="flex items-center gap-2 text-red-400 text-xs font-bold" title={rowErrors.join(', ')}><AlertTriangle size={16} /> <span className="hidden md:inline">Revisar</span></div>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold"><CheckCircle size={16} /> <span className="hidden md:inline">Limpio</span></div>
                      )}
                    </td>

                    {/* DATOS (Renderiza Inputs si está editando) */}
                    <td className="p-4">
                      {isEditing ? (
                        <select className="bg-slate-900 border border-slate-700 text-xs p-1.5 rounded outline-none" value={editForm.company} onChange={e => setEditForm({...editForm, company: e.target.value})}>
                          <option value="Praxentia">Praxentia</option><option value="Tunha">Tunha</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${row.company === 'Praxentia' ? 'bg-slate-800 text-slate-300' : 'bg-cyan-950/50 text-cyan-400'}`}>{row.company}</span>
                      )}
                    </td>

                    <td className="p-4 font-bold text-slate-200">
                      {isEditing ? (
                        <input type="text" className="bg-slate-900 border border-slate-700 text-xs p-1.5 rounded w-full outline-none" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                      ) : (
                        <>{row.name} {hasError && <div className="text-[10px] text-red-400 mt-1 font-normal">{rowErrors.join(' • ')}</div>}</>
                      )}
                    </td>

                    <td className="p-4 font-mono text-xs">
                      {isEditing ? (
                        <input type="text" className="bg-slate-900 border border-slate-700 text-xs p-1.5 rounded w-28 outline-none text-blue-300" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} placeholder="Ej. 5551234567" />
                      ) : (
                        <span className={row.phone && !/[a-zA-Z]/.test(row.phone) ? 'text-slate-400' : 'text-red-400 font-bold'}>{row.phone || '— Vacío —'}</span>
                      )}
                    </td>

                    <td className="p-4 text-xs">
                      {isEditing ? (
                        <input type="text" className="bg-slate-900 border border-slate-700 text-xs p-1.5 rounded w-full outline-none" value={editForm.product} onChange={e => setEditForm({...editForm, product: e.target.value})} />
                      ) : (
                        <span className="text-slate-400">{row.product}</span>
                      )}
                    </td>

                    <td className="p-4 font-bold">
                      {isEditing ? (
                        <input type="number" className="bg-slate-900 border border-slate-700 text-xs p-1.5 rounded w-24 outline-none text-emerald-400" value={editForm.value} onChange={e => setEditForm({...editForm, value: Number(e.target.value)})} />
                      ) : (
                        <span className={row.value > 0 ? 'text-emerald-400' : 'text-red-400'}>${row.value.toLocaleString()}</span>
                      )}
                    </td>

                    {/* BOTONES DE ACCIÓN */}
                    <td className="p-4">
                      <div className="flex justify-center gap-3">
                        {isEditing ? (
                          <>
                            <button onClick={saveEdit} className="text-emerald-500 hover:text-emerald-400 transition-colors bg-emerald-500/10 p-1.5 rounded" title="Guardar"><Check size={16} /></button>
                            <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-300 transition-colors bg-slate-800 p-1.5 rounded" title="Cancelar"><X size={16} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(row)} className="text-slate-500 hover:text-blue-400 transition-colors" title="Editar registro"><Edit3 size={16} /></button>
                            <button onClick={() => handleDelete(row.id)} className="text-slate-500 hover:text-red-400 transition-colors" title="Eliminar basura"><Trash2 size={16} /></button>
                          </>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}