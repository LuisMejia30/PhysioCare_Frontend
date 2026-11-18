import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  Stethoscope, 
  TrendingUp, 
  ShieldCheck, 
  Info,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { apiFetch } from '../services/api';

const MiTratamiento = () => {
  const [sesiones, setSesiones] = useState([]);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      console.error('Error al cargar datos del tratamiento:', err);
      setError(err.message || 'No fue posible cargar tu expediente de tratamiento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sesiones completadas
  const sesionesCompletadas = sesiones.filter(s => s.estado === 'Completada');

  // Terapeuta principal y servicio asignado (tomado de la cita más reciente o de la sesión)
  const citaReferencia = citas[0] || (sesiones[0]?.cita);
  const terapeutaAsignado = citaReferencia?.terapeuta 
    ? `${citaReferencia.terapeuta.primerNombre} ${citaReferencia.terapeuta.primerApellido}` 
    : (sesiones[0]?.terapeuta ? `${sesiones[0].terapeuta.primerNombre} ${sesiones[0].terapeuta.primerApellido}` : 'Por asignar');
  
  const especialidadTerapeuta = citaReferencia?.terapeuta?.especialidadTerapeuta?.nombre || 'Fisioterapia y Rehabilitación';

  const servicioAsignado = citaReferencia?.servicioTerapia?.nombreServicio 
    || sesiones[0]?.cita?.servicioTerapia?.nombreServicio 
    || 'Plan de Rehabilitación Integral';

  // Separación de citas: Próxima cita y citas siguientes
  const hoyStr = new Date().toISOString().split('T')[0];
  
  // Citas futuras ordenadas ascendentemente (la más cercana primero)
  const citasFuturas = citas
    .filter(c => {
      const fechaCita = (c.fecha || '').split('T')[0];
      const noCancelada = c.estadoCita?.nombre !== 'Cancelada';
      return fechaCita >= hoyStr && noCancelada;
    })
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const proximaCita = citasFuturas[0] || null;
  const citasSiguientes = citasFuturas.slice(1);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
            <Activity size={14} /> Expediente Clínico Personal
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mi Plan de Tratamiento</h1>
          <p className="text-slate-500 text-sm mt-1">
            Consulte el progreso de sus terapias, sus próximas citas y las pautas recomendadas por su fisioterapeuta.
          </p>
        </div>

        <button
          onClick={loadData}
          className="self-start md:self-auto p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all"
          title="Actualizar información"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Tarjetas de Resumen General */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Terapeuta Asignado */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <Stethoscope size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Terapeuta a Cargo</span>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">{terapeutaAsignado}</h3>
            <p className="text-xs text-blue-600 font-semibold mt-1">{especialidadTerapeuta}</p>
          </div>
        </div>

        {/* Servicio Asignado */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Servicio Terapéutico</span>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">{servicioAsignado}</h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">Plan personalizado</p>
          </div>
        </div>

        {/* Sesiones Completadas */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4 sm:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Sesiones Realizadas</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900">{sesionesCompletadas.length}</span>
              <span className="text-xs text-emerald-600 font-bold">sesiones completadas</span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">Evolución en registro continuo</p>
          </div>
        </div>
      </div>

      {/* Sección: Próxima Cita y Agenda Futura */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tarjeta Destacada: Próxima Cita */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 md:p-8 rounded-3xl shadow-xl shadow-blue-600/20 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-white/10 rounded-full blur-2xl" />

          <div className="relative space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white uppercase tracking-wider">
              <Clock size={14} /> Próxima Cita Confirmada
            </span>

            {proximaCita ? (
              <div className="space-y-4 mt-2">
                <h2 className="text-3xl font-black tracking-tight">
                  {proximaCita.servicioTerapia?.nombreServicio || 'Consulta de Fisioterapia'}
                </h2>

                <div className="grid sm:grid-cols-2 gap-4 text-sm bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                  <div className="flex items-center gap-3">
                    <CalendarIcon size={20} className="text-blue-200 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-200 block">Fecha Programada</span>
                      <span className="font-bold">{proximaCita.fecha?.split('T')[0]}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock size={20} className="text-blue-200 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-200 block">Hora y Duración</span>
                      <span className="font-bold">{proximaCita.horaInicio} ({proximaCita.duracionEstimada} min)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:col-span-2">
                    <User size={20} className="text-blue-200 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-200 block">Fisioterapeuta</span>
                      <span className="font-bold">
                        {proximaCita.terapeuta ? `${proximaCita.terapeuta.primerNombre} ${proximaCita.terapeuta.primerApellido}` : 'Por asignar'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-white/80 space-y-2">
                <p className="text-lg font-bold">No tienes citas próximas agendadas.</p>
                <p className="text-xs text-blue-100">Contacta a recepción o programa una nueva cita desde el módulo de citas.</p>
              </div>
            )}
          </div>

          <div className="relative mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-xs text-blue-100">
            <span>Recuerda asistir 10 minutos antes con ropa cómoda y calzado deportivo.</span>
          </div>
        </div>

        {/* Lista de Siguientes Citas */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
              <CalendarIcon size={20} className="text-blue-600" /> Siguientes Citas
            </h3>
            <p className="text-xs text-slate-400 mt-1">Fechas programadas en tu agenda</p>

            <div className="mt-4 space-y-3">
              {citasSiguientes.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No hay más citas programadas por el momento.
                </div>
              ) : (
                citasSiguientes.map((c) => (
                  <div key={c.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{c.fecha?.split('T')[0]}</span>
                      <span className="font-semibold text-blue-600">{c.horaInicio}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {c.servicioTerapia?.nombreServicio || 'Sesión de Terapia'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-start gap-2.5 text-xs text-blue-800">
            <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <span>Si requieres reprogramar una fecha, por favor notifícalo con 24 horas de antelación.</span>
          </div>
        </div>
      </div>

      {/* Sección: Historial de Sesiones (Solo lectura, sin observaciones privadas) */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Bitácora Médica</span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Historial de Mis Sesiones Terapéuticas</h2>
          <p className="text-xs text-slate-500 mt-1">
            Detalle cronológico de los tratamientos realizados, evolución clínica y recomendaciones domiciliarias.
          </p>
        </div>

        {sesiones.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3 bg-slate-50 rounded-3xl border border-slate-200">
            <ClipboardList size={36} className="mx-auto text-slate-300" />
            <p className="font-semibold text-sm">Aún no se han registrado sesiones completadas en tu expediente.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sesiones.map((sesion, idx) => (
              <div 
                key={sesion.id}
                className="bg-slate-50/70 hover:bg-slate-50 p-6 rounded-3xl border border-slate-200 transition-all space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                      #{sesiones.length - idx}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">
                        Sesión Terapéutica ({sesion.fechaSesion?.split('T')[0]})
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Hora: {sesion.fechaSesion?.split('T')[1]?.slice(0, 5) || 'Registrada'} • Terapeuta: {sesion.terapeuta ? `${sesion.terapeuta.primerNombre} ${sesion.terapeuta.primerApellido}` : 'Asignado'}
                      </span>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    sesion.estado === 'Completada' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    sesion.estado === 'Cancelada' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {sesion.estado}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-xs">
                  {/* Tratamiento Realizado */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                      Tratamiento Aplicado en Clínica
                    </span>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {sesion.tratamientoRealizado || 'Sesión terapéutica protocolaria realizada.'}
                    </p>
                  </div>

                  {/* Evolución Médica */}
                  <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-1">
                    <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <TrendingUp size={12} className="text-emerald-600" /> Evolución y Respuesta
                    </span>
                    <p className="text-emerald-900 leading-relaxed font-medium">
                      {sesion.evolucion || 'Evolución favorable acorde a la planificación.'}
                    </p>
                  </div>
                </div>

                {/* Recomendaciones (Ejercicios, Cuidados) */}
                {sesion.recomendaciones && (
                  <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 text-xs space-y-1">
                    <span className="font-bold text-blue-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <ShieldCheck size={14} className="text-blue-600" /> Pautas y Ejercicios Recomendados en Casa
                    </span>
                    <p className="text-blue-900 leading-relaxed font-medium">
                      {sesion.recomendaciones}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MiTratamiento;
