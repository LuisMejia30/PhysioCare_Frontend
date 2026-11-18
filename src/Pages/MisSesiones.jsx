import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Plus, 
  Search, 
  FileText, 
  History, 
  RefreshCw, 
  ArrowLeft, 
  Save, 
  Sparkles,
  ClipboardList,
  ChevronRight,
  TrendingUp,
  Stethoscope
} from 'lucide-react';
import { apiFetch } from '../services/api';

const getEstadoBadge = (estado) => {
  switch (estado?.toLowerCase()) {
    case 'completada':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <CheckCircle2 size={14} className="text-emerald-600" />
      };
    case 'cancelada':
      return {
        bg: 'bg-red-50 text-red-700 border-red-200',
        icon: <XCircle size={14} className="text-red-600" />
      };
    case 'programada':
    default:
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: <Clock size={14} className="text-blue-600" />
      };
  }
};

const MisSesiones = () => {
  const [activeTab, setActiveTab] = useState('hoy'); // 'hoy' | 'proximas' | 'completadas' | 'historial'
  const [sesiones, setSesiones] = useState([]);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Registro de sesión modal/vista
  const [showRegistro, setShowRegistro] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPacienteId, setSelectedPacienteId] = useState('');
  const [searchHistoryTerm, setSearchHistoryTerm] = useState('');

  const [formData, setFormData] = useState({
    citaId: '',
    fechaSesion: new Date().toISOString().slice(0, 16),
    tratamientoRealizado: '',
    observaciones: '',
    evolucion: '',
    recomendaciones: '',
    estado: 'Completada'
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sesionesData, citasData] = await Promise.all([
        apiFetch('/SesionesTerapia'),
        apiFetch('/Citas')
      ]);
      setSesiones(Array.isArray(sesionesData) ? sesionesData : []);
      setCitas(Array.isArray(citasData) ? citasData : []);
    } catch (err) {
      console.error('Error cargando sesiones o citas:', err);
      setError(err.message || 'No se pudieron cargar los datos de sesiones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenRegistro = (cita = null) => {
    if (cita) {
      setFormData({
        citaId: cita.id,
        fechaSesion: new Date().toISOString().slice(0, 16),
        tratamientoRealizado: '',
        observaciones: '',
        evolucion: '',
        recomendaciones: '',
        estado: 'Completada'
      });
    } else {
      setFormData({
        citaId: citas.length > 0 ? citas[0].id : '',
        fechaSesion: new Date().toISOString().slice(0, 16),
        tratamientoRealizado: '',
        observaciones: '',
        evolucion: '',
        recomendaciones: '',
        estado: 'Completada'
      });
    }
    setShowRegistro(true);
  };

  const handleSubmitRegistro = async (e) => {
    e.preventDefault();
    if (!formData.citaId) {
      alert('Debe vincular la sesión a una cita médica.');
      return;
    }
    if (!formData.tratamientoRealizado.trim()) {
      alert('Ingrese una descripción del tratamiento realizado.');
      return;
    }

    setSaving(true);
    try {
      await apiFetch('/SesionesTerapia', {
        method: 'POST',
        body: JSON.stringify({
          citaId: parseInt(formData.citaId),
          fechaSesion: new Date(formData.fechaSesion).toISOString(),
          tratamientoRealizado: formData.tratamientoRealizado,
          observaciones: formData.observaciones,
          evolucion: formData.evolucion,
          recomendaciones: formData.recomendaciones,
          estado: formData.estado
        })
      });

      alert('¡Sesión clínica registrada con éxito!');
      setShowRegistro(false);
      await loadData();
    } catch (err) {
      console.error('Error al guardar sesión:', err);
      alert(err.message || 'Error al guardar la sesión clínica');
    } finally {
      setSaving(false);
    }
  };

  // Filtrado de sesiones por pestañas
  const hoyStr = new Date().toISOString().split('T')[0];

  const sesionesHoy = sesiones.filter(s => {
    const fecha = (s.fechaSesion || '').split('T')[0];
    return fecha === hoyStr;
  });

  const sesionesProximas = sesiones.filter(s => {
    const fecha = (s.fechaSesion || '').split('T')[0];
    return fecha > hoyStr || (s.estado === 'Programada' && fecha !== hoyStr);
  });

  const sesionesCompletadas = sesiones.filter(s => s.estado === 'Completada');

  // Pacientes únicos para el historial clínico
  const pacientesUnicosMap = new Map();
  sesiones.forEach(s => {
    if (s.paciente && !pacientesUnicosMap.has(s.paciente.id)) {
      pacientesUnicosMap.set(s.paciente.id, s.paciente);
    }
  });
  citas.forEach(c => {
    if (c.paciente && !pacientesUnicosMap.has(c.paciente.id)) {
      pacientesUnicosMap.set(c.paciente.id, c.paciente);
    }
  });
  const pacientesUnicos = Array.from(pacientesUnicosMap.values());

  const filteredPacientes = pacientesUnicos.filter(p => {
    const nombreCompleto = `${p.primerNombre} ${p.primerApellido} ${p.numeroDocumento}`.toLowerCase();
    return nombreCompleto.includes(searchHistoryTerm.toLowerCase());
  });

  const selectedPaciente = pacientesUnicos.find(p => p.id === parseInt(selectedPacienteId));
  const timelineSesiones = sesiones
    .filter(s => s.pacienteId === parseInt(selectedPacienteId))
    .sort((a, b) => new Date(b.fechaSesion) - new Date(a.fechaSesion));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
            <Activity size={14} /> Espacio de Trabajo del Terapeuta
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mis Sesiones Clínicas</h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestione la evolución, registre notas de tratamiento y revise el historial clínico de sus pacientes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all"
            title="Recargar datos"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => handleOpenRegistro()}
            className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus size={20} /> Registrar Sesión
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Pestañas de Navegación */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('hoy')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'hoy'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock size={16} /> Hoy ({sesionesHoy.length})
        </button>

        <button
          onClick={() => setActiveTab('proximas')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'proximas'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CalendarIcon size={16} /> Próximas ({sesionesProximas.length})
        </button>

        <button
          onClick={() => setActiveTab('completadas')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'completadas'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckCircle2 size={16} /> Completadas ({sesionesCompletadas.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('historial');
            if (!selectedPacienteId && pacientesUnicos.length > 0) {
              setSelectedPacienteId(pacientesUnicos[0].id.toString());
            }
          }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'historial'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <History size={16} /> Historial por Paciente
        </button>
      </div>

      {/* Vista de Registro Rápido / Modal Inline */}
      {showRegistro && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-blue-500 shadow-xl space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Registrar Evolución de Sesión</h2>
                <p className="text-xs text-slate-500">Documente el tratamiento y recomendaciones para el paciente</p>
              </div>
            </div>
            <button
              onClick={() => setShowRegistro(false)}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100"
            >
              <XCircle size={22} />
            </button>
          </div>

          <form onSubmit={handleSubmitRegistro} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Cita Médica Asignada *
                </label>
                <select
                  value={formData.citaId}
                  onChange={(e) => setFormData({ ...formData, citaId: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                >
                  <option value="">Seleccione la cita correspondiente...</option>
                  {citas.map((c) => (
                    <option key={c.id} value={c.id}>
                      #{c.id} - {c.paciente ? `${c.paciente.primerNombre} ${c.paciente.primerApellido}` : 'Paciente'} | {c.fecha?.split('T')[0]} ({c.horaInicio}) - {c.servicioTerapia?.nombreServicio || 'Servicio'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Fecha y Hora de la Sesión *
                </label>
                <input
                  type="datetime-local"
                  value={formData.fechaSesion}
                  onChange={(e) => setFormData({ ...formData, fechaSesion: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Tratamiento Realizado * (Técnicas, aparatología, ejercicios aplicados)
              </label>
              <textarea
                rows={3}
                value={formData.tratamientoRealizado}
                onChange={(e) => setFormData({ ...formData, tratamientoRealizado: e.target.value })}
                required
                placeholder="Ej. Terapia manual descontracturante, electroestimulación 15 min y ejercicios de fortalecimiento lumbar..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Evolución Clínica (Respuesta y tolerancia del paciente)
                </label>
                <textarea
                  rows={2}
                  value={formData.evolucion}
                  onChange={(e) => setFormData({ ...formData, evolucion: e.target.value })}
                  placeholder="Ej. Disminución del dolor de 7/10 a 3/10. Mayor rango de flexión..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Recomendaciones para el Paciente (Visible para él)
                </label>
                <textarea
                  rows={2}
                  value={formData.recomendaciones}
                  onChange={(e) => setFormData({ ...formData, recomendaciones: e.target.value })}
                  placeholder="Ej. Aplicar hielo local por 15 min, realizar estiramientos 2 veces al día..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Observaciones Internas (Confidencial del Terapeuta - NO visible para el paciente)
                </label>
                <input
                  type="text"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  placeholder="Notas internas privadas de seguimiento..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Estado de la Sesión *
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                >
                  <option value="Programada">Programada</option>
                  <option value="Completada">Completada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRegistro(false)}
                className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 text-sm disabled:opacity-50"
              >
                <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Sesión'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contenido de Pestañas: Hoy, Próximas, Completadas */}
      {activeTab !== 'historial' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center text-slate-400 font-medium">Cargando sesiones...</div>
          ) : (
            (() => {
              const currentList = 
                activeTab === 'hoy' ? sesionesHoy :
                activeTab === 'proximas' ? sesionesProximas : sesionesCompletadas;

              if (currentList.length === 0) {
                return (
                  <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                    <Activity size={40} className="mx-auto text-slate-300" />
                    <p className="text-slate-500 font-semibold">No hay sesiones en esta sección.</p>
                    <button
                      onClick={() => handleOpenRegistro()}
                      className="px-5 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold text-sm"
                    >
                      Registrar una sesión ahora
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentList.map((sesion) => {
                    const badge = getEstadoBadge(sesion.estado);
                    const pacienteNombre = sesion.paciente
                      ? `${sesion.paciente.primerNombre} ${sesion.paciente.primerApellido}`
                      : 'Paciente';
                    const servicioNombre = sesion.cita?.servicioTerapia?.nombreServicio || 'Fisioterapia General';

                    return (
                      <div
                        key={sesion.id}
                        className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                              {badge.icon} {sesion.estado}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              Cita #{sesion.citaId}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                              <User size={18} className="text-blue-500" /> {pacienteNombre}
                            </h3>
                            <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                              <Stethoscope size={14} className="text-slate-400" /> {servicioNombre}
                            </p>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-2xl space-y-1.5 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                              <CalendarIcon size={14} className="text-blue-600" />
                              <span className="font-semibold">{sesion.fechaSesion?.split('T')[0]}</span>
                              <Clock size={14} className="text-blue-600 ml-2" />
                              <span>{sesion.fechaSesion?.split('T')[1]?.slice(0, 5) || 'Horario'}</span>
                            </div>
                          </div>

                          {sesion.tratamientoRealizado && (
                            <div className="text-xs text-slate-600">
                              <span className="font-bold text-slate-700 block mb-1">Tratamiento:</span>
                              <p className="line-clamp-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                                {sesion.tratamientoRealizado}
                              </p>
                            </div>
                          )}

                          {sesion.evolucion && (
                            <div className="text-xs text-slate-600">
                              <span className="font-bold text-slate-700 block mb-1">Evolución:</span>
                              <p className="line-clamp-2 bg-emerald-50/50 p-2 rounded-xl text-emerald-800 border border-emerald-100">
                                {sesion.evolucion}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <button
                            onClick={() => {
                              setSelectedPacienteId(sesion.pacienteId.toString());
                              setActiveTab('historial');
                            }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                          >
                            Ver Historial <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* Pestaña: Historial por Paciente (Timeline de evolución) */}
      {activeTab === 'historial' && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Selector de Pacientes */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
              <User size={20} className="text-blue-600" /> Mis Pacientes
            </h3>

            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o documento..."
                value={searchHistoryTerm}
                onChange={(e) => setSearchHistoryTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredPacientes.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No se encontraron pacientes asignados.</p>
              ) : (
                filteredPacientes.map((p) => {
                  const isSelected = selectedPacienteId === p.id.toString();
                  const sesionesCount = sesiones.filter(s => s.pacienteId === p.id).length;

                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPacienteId(p.id.toString())}
                      className={`w-full text-left p-3.5 rounded-2xl transition-all border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm block">
                          {p.primerNombre} {p.primerApellido}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {sesionesCount} sesiones
                        </span>
                      </div>
                      <span className={`text-xs block mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        Doc: {p.numeroDocumento}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Línea de Tiempo de Evolución */}
          <div className="lg:col-span-2 space-y-6">
            {selectedPaciente ? (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Historial Clínico de Evolución</span>
                    <h2 className="text-2xl font-black text-slate-900">
                      {selectedPaciente.primerNombre} {selectedPaciente.primerApellido}
                    </h2>
                    <p className="text-xs text-slate-400">Documento: {selectedPaciente.numeroDocumento} • Tel: {selectedPaciente.telefono || 'Sin teléfono'}</p>
                  </div>

                  <button
                    onClick={() => {
                      const citaDelPaciente = citas.find(c => c.pacienteId === selectedPaciente.id);
                      handleOpenRegistro(citaDelPaciente || null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-bold text-xs"
                  >
                    <Plus size={16} /> Nueva Sesión
                  </button>
                </div>

                {timelineSesiones.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <FileText size={32} className="mx-auto text-slate-300" />
                    <p className="font-semibold text-sm">Este paciente aún no tiene sesiones registradas.</p>
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                    {timelineSesiones.map((sesion, index) => {
                      const badge = getEstadoBadge(sesion.estado);
                      return (
                        <div key={sesion.id} className="relative group">
                          {/* Nodo de la línea de tiempo */}
                          <div className="absolute -left-6 top-1 w-5 h-5 rounded-full border-4 border-white bg-blue-600 shadow-sm group-hover:scale-125 transition-transform" />

                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-sm text-slate-900">
                                  Sesión #{timelineSesiones.length - index}
                                </span>
                                <span className="text-xs text-slate-400">
                                  • {sesion.fechaSesion?.split('T')[0]} ({sesion.fechaSesion?.split('T')[1]?.slice(0, 5)})
                                </span>
                              </div>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg}`}>
                                {badge.icon} {sesion.estado}
                              </span>
                            </div>

                            {sesion.tratamientoRealizado && (
                              <div className="text-xs text-slate-700">
                                <span className="font-bold block text-slate-800 mb-0.5">Tratamiento Realizado:</span>
                                <p className="bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                                  {sesion.tratamientoRealizado}
                                </p>
                              </div>
                            )}

                            {sesion.evolucion && (
                              <div className="text-xs text-emerald-900">
                                <span className="font-bold flex items-center gap-1 mb-0.5">
                                  <TrendingUp size={14} className="text-emerald-600" /> Evolución del Paciente:
                                </span>
                                <p className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 leading-relaxed">
                                  {sesion.evolucion}
                                </p>
                              </div>
                            )}

                            {sesion.recomendaciones && (
                              <div className="text-xs text-blue-900">
                                <span className="font-bold block mb-0.5">Recomendaciones:</span>
                                <p className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 leading-relaxed">
                                  {sesion.recomendaciones}
                                </p>
                              </div>
                            )}

                            {sesion.observaciones && (
                              <div className="text-xs text-slate-500 italic bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/70">
                                <span className="font-bold not-italic text-amber-800">Nota Confidencial Terapeuta: </span>
                                {sesion.observaciones}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
                Seleccione un paciente de la lista para ver su línea de tiempo y evolución médica.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MisSesiones;
