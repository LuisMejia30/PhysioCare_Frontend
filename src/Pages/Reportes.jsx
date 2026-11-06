/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Users,
  CalendarCheck,
  Download,
  Activity,
  Stethoscope,
  CheckCircle,
  Clock,
  XCircle,
  CalendarDays,
  PieChart as PieChartIcon,
  BarChart2
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5298/api';
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const getFecha = (item) => {
  if (item?.fechaCreacion) return new Date(item.fechaCreacion);
  if (item?.fechaRegistro) return new Date(item.fechaRegistro);
  if (item?.createdAt) return new Date(item.createdAt);
  if (item?.fechaHoraCita) return new Date(item.fechaHoraCita);
  if (item?.fecha) return new Date(item.fecha);
  return new Date();
};

const StatCard = ({ icon: Icon, label, value, colorClass }) => (
  <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
    <Icon className={`${colorClass} mb-2`} size={24} />
    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
    <h3 className="text-2xl font-black text-slate-800">{value}</h3>
  </div>
);

const ChartPanel = ({ title, subtitle, icon: Icon, iconClass, children, height = 300 }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${iconClass}`}>
          <Icon size={20} />
        </div>
        <h3 className="font-bold text-lg text-slate-800">{title}</h3>
      </div>
      {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
    </div>
    <div className="w-full mt-auto" style={{ height: `${height}px` }}>
      {children}
    </div>
  </div>
);

const Reportes = () => {
  const [loading, setLoading] = useState(true);
  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [fechaFin, setFechaFin] = useState(() => new Date().toISOString().split('T')[0]);
  const [pacientes, setPacientes] = useState([]);
  const [terapeutas, setTerapeutas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [terapias, setTerapias] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');

        const requestOptions = {
          headers: {
            'Authorization': `Bearer ${token || ''}`,
            'Content-Type': 'application/json'
          }
        };

        const [pacientesRes, terapeutasRes, citasRes, especialidadesRes, terapiasRes] = await Promise.all([
          fetch(`${API_BASE}/Pacientes`, requestOptions),
          fetch(`${API_BASE}/Terapeutas`, requestOptions),
          fetch(`${API_BASE}/Citas`, requestOptions),
          fetch(`${API_BASE}/Catalogos/Especialidades`, requestOptions),
          fetch(`${API_BASE}/ServicioTerapias`, requestOptions)
        ]);

        if (pacientesRes.ok) setPacientes(await pacientesRes.json());
        if (terapeutasRes.ok) setTerapeutas(await terapeutasRes.json());
        if (citasRes.ok) setCitas(await citasRes.json());
        if (especialidadesRes.ok) setEspecialidades(await especialidadesRes.json());
        if (terapiasRes.ok) setTerapias(await terapiasRes.json());

        if (!pacientesRes.ok || !terapeutasRes.ok || !citasRes.ok || !especialidadesRes.ok || !terapiasRes.ok) {
          console.warn('Algunas peticiones de reportes no fueron autorizadas o fallaron.');
        }
      } catch (error) {
        console.error('Error al cargar datos para reportes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const start = new Date(`${fechaInicio}T00:00:00`);
  const end = new Date(`${fechaFin}T23:59:59`);

  const citasFiltradas = citas.filter((cita) => {
    const date = getFecha(cita);
    return date >= start && date <= end;
  });

  const terapeutasFiltrados = terapeutas.filter((terapeuta) => {
    const date = getFecha(terapeuta);
    return date >= start && date <= end;
  });

  const totalCitas = citasFiltradas.length;
  const citasPorEstado = {
    Completada: citasFiltradas.filter((cita) => cita.estadoCita?.nombre === 'Completada').length,
    Programada: citasFiltradas.filter((cita) => cita.estadoCita?.nombre === 'Programada').length,
    Confirmada: citasFiltradas.filter((cita) => cita.estadoCita?.nombre === 'Confirmada').length,
    Cancelada: citasFiltradas.filter((cita) => cita.estadoCita?.nombre === 'Cancelada').length,
    'En Curso': citasFiltradas.filter((cita) => cita.estadoCita?.nombre === 'En Curso').length,
  };

  const pctCompletadas = totalCitas > 0 ? ((citasPorEstado.Completada / totalCitas) * 100).toFixed(1) : 0;
  const pctCanceladas = totalCitas > 0 ? ((citasPorEstado.Cancelada / totalCitas) * 100).toFixed(1) : 0;
  const duracionPromedio = totalCitas > 0
    ? Math.round(citasFiltradas.reduce((sum, cita) => sum + (cita.duracionEstimada || 0), 0) / totalCitas)
    : 0;

  const dataEspecialidades = Object.entries(
    citasFiltradas.reduce((acc, cita) => {
      const terapia = terapias.find((item) => item.id === cita.servicioTerapiaId);
      const categoria = terapia?.categoriaTerapia;
      const especialidadId = categoria?.especialidadId ?? categoria?.especialidadTerapeutaId;
      const nombre = especialidades.find((item) => item.id === especialidadId)?.nombre ?? 'General';

      acc[nombre] = (acc[nombre] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const dataPacientes = Object.values(
    citasFiltradas.reduce((acc, cita) => {
      const dateObj = getFecha(cita);
      const key = dateObj.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });

      if (!acc[key]) {
        acc[key] = { name: key, Pacientes: new Set(), order: dateObj.getTime() };
      }

      acc[key].Pacientes.add(cita.pacienteId);
      return acc;
    }, {})
  )
    .map((item) => ({
      name: item.name,
      Pacientes: item.Pacientes.size,
      order: item.order
    }))
    .sort((a, b) => a.order - b.order);

  const dataPacientesRegistrados = (() => {
    const fechaPrimeraCita = {};

    citas.forEach((cita) => {
      const date = getFecha(cita);
      const pacienteId = cita.pacienteId;

      if (!fechaPrimeraCita[pacienteId] || date < fechaPrimeraCita[pacienteId]) {
        fechaPrimeraCita[pacienteId] = date;
      }
    });

    const pacientesOrdenados = pacientes
      .map((paciente) => ({
        id: paciente.id,
        fechaReg: fechaPrimeraCita[paciente.id] || new Date()
      }))
      .sort((a, b) => a.fechaReg - b.fechaReg);

    const dict = {};
    let acumulado = 0;

    pacientesOrdenados.forEach((paciente) => {
      acumulado += 1;

      if (paciente.fechaReg >= start && paciente.fechaReg <= end) {
        const key = paciente.fechaReg.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
        dict[key] = { name: key, Pacientes: acumulado, order: paciente.fechaReg.getTime() };
      }
    });

    return Object.values(dict).sort((a, b) => a.order - b.order);
  })();

  const dataDemandaDias = (() => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const contadores = { Lunes: 0, Martes: 0, 'Miércoles': 0, Jueves: 0, Viernes: 0, Sábado: 0, Domingo: 0 };

    citasFiltradas.forEach((cita) => {
      const day = dias[getFecha(cita).getDay()];
      contadores[day] += 1;
    });

    return ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((dia) => ({
      name: dia.substring(0, 3),
      Citas: contadores[dia]
    }));
  })();

  const terapeutasConCitas = (() => {
    const asistidasPorTerapeuta = {};

    citasFiltradas.forEach((cita) => {
      if (['Completada', 'Confirmada'].includes(cita.estadoCita?.nombre)) {
        asistidasPorTerapeuta[cita.terapeutaId] = (asistidasPorTerapeuta[cita.terapeutaId] || 0) + 1;
      }
    });

    return terapeutasFiltrados
      .map((terapeuta) => ({
        id: terapeuta.id,
        nombreCompleto: `${terapeuta.primerNombre} ${terapeuta.primerApellido}`,
        citasAsistidas: asistidasPorTerapeuta[terapeuta.id] || 0
      }))
      .sort((a, b) => b.citasAsistidas - a.citasAsistidas);
  })();

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text('Reporte Analítico - PhysioCare', 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(`Periodo: ${fechaInicio} a ${fechaFin}`, 14, 30);

    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('Métricas Clave', 14, 45);

    autoTable(doc, {
      startY: 50,
      head: [['Métrica', 'Valor']],
      body: [
        ['Total Pacientes Histórico', pacientes.length],
        ['Total Terapeutas Histórico', terapeutas.length],
        ['Total Citas Programadas en Periodo', totalCitas],
        ['Porcentaje Citas Completadas', `${pctCompletadas}%`],
        ['Porcentaje Citas Canceladas', `${pctCanceladas}%`],
        ['Duración Promedio de Cita', `${duracionPromedio} min`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.text('Citas por Estado', 14, doc.lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Estado', 'Cantidad']],
      body: [
        ['Completadas', citasPorEstado.Completada],
        ['Programadas', citasPorEstado.Programada],
        ['Confirmadas', citasPorEstado.Confirmada],
        ['En Curso', citasPorEstado['En Curso']],
        ['Canceladas', citasPorEstado.Cancelada]
      ],
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }
    });

    doc.text('Terapeutas y Citas Atendidas', 14, doc.lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Nombre del Terapeuta', 'Citas Atendidas']],
      body: terapeutasConCitas.map((terapeuta) => [terapeuta.nombreCompleto, terapeuta.citasAsistidas]),
      theme: 'striped',
      headStyles: { fillColor: [139, 92, 246] }
    });

    doc.save(`Reporte_PhysioCare_${fechaInicio}_${fechaFin}.pdf`);
  };

  const metricCards = [
    { icon: CalendarCheck, label: 'Total Citas', value: totalCitas, colorClass: 'text-blue-500' },
    { icon: CheckCircle, label: '% Completadas', value: `${pctCompletadas}%`, colorClass: 'text-emerald-500' },
    { icon: XCircle, label: '% Canceladas', value: `${pctCanceladas}%`, colorClass: 'text-red-500' },
    { icon: Clock, label: 'Duración Media', value: `${duracionPromedio}m`, colorClass: 'text-indigo-500' },
    { icon: Users, label: 'Total Pacientes', value: pacientes.length, colorClass: 'text-orange-500' },
    { icon: Stethoscope, label: 'Total Terapeutas', value: terapeutas.length, colorClass: 'text-purple-500' }
  ];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <div className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Generando Analíticas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Análisis y Reportes</h2>
          <p className="text-slate-500 text-sm">Métricas avanzadas con filtros de fechas precisos.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-end sm:items-center">
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 w-full sm:w-auto">
            <CalendarDays size={18} className="text-slate-400 ml-2" />
            <input
              type="date"
              value={fechaInicio}
              onChange={(event) => setFechaInicio(event.target.value)}
              className="bg-transparent border-none text-slate-700 font-medium text-sm outline-none px-2 cursor-pointer"
            />
            <span className="text-slate-300">-</span>
            <input
              type="date"
              value={fechaFin}
              onChange={(event) => setFechaFin(event.target.value)}
              className="bg-transparent border-none text-slate-700 font-medium text-sm outline-none px-2 cursor-pointer"
            />
          </div>

          <button
            onClick={handleExportPDF}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <Download size={18} /> Exportar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {metricCards.map(({ icon: Icon, label, value, colorClass }) => (
          <StatCard key={label} icon={Icon} label={label} value={value} colorClass={colorClass} />
        ))}

        <div className="bg-slate-900 p-4 rounded-3xl shadow-md flex flex-col justify-center col-span-2 md:col-span-4 lg:col-span-1">
          <h4 className="text-white text-xs font-bold mb-2 flex items-center gap-1">
            <Activity size={14} className="text-blue-400" /> Estados
          </h4>
          <div className="space-y-1.5">
            {[
              { label: 'Completadas', value: citasPorEstado.Completada, color: 'bg-emerald-500' },
              { label: 'Programadas', value: citasPorEstado.Programada, color: 'bg-blue-500' },
              { label: 'Canceladas', value: citasPorEstado.Cancelada, color: 'bg-red-500' }
            ].map((state) => (
              <div key={state.label} className="flex justify-between text-[11px] text-slate-300">
                <span className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${state.color}`} />
                  {state.label}
                </span>
                <span className="font-bold text-white">{state.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartPanel title="Flujo de Citas de Pacientes" subtitle="Pacientes únicos por día" icon={Users} iconClass="bg-orange-50 text-orange-600">
          {dataPacientes.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataPacientes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold', color: '#ea580c' }}
                />
                <Area type="monotone" dataKey="Pacientes" stroke="#ea580c" strokeWidth={4} fillOpacity={1} fill="url(#colorArea)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 font-medium">No hay registros en estas fechas.</div>
          )}
        </ChartPanel>

        <ChartPanel title="Demanda por Especialidad" icon={PieChartIcon} iconClass="bg-purple-50 text-purple-600" height={300}>
          {dataEspecialidades.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataEspecialidades}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataEspecialidades.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 font-medium">No hay datos de citas para analizar.</div>
          )}
        </ChartPanel>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartPanel title="Demanda por Día de la Semana" subtitle="Concentración de citas" icon={BarChart2} iconClass="bg-blue-50 text-blue-600" height={250}>
          {dataDemandaDias.some((dia) => dia.Citas > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataDemandaDias} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="Citas" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 font-medium">No hay citas para analizar demanda.</div>
          )}
        </ChartPanel>

        <ChartPanel title="Pacientes Registrados" subtitle="Crecimiento histórico" icon={Users} iconClass="bg-emerald-50 text-emerald-600" height={250}>
          {dataPacientesRegistrados.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataPacientesRegistrados} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold', color: '#10b981' }}
                />
                <Line type="monotone" dataKey="Pacientes" stroke="#10b981" strokeWidth={4} dot={{ strokeWidth: 2, r: 4, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 font-medium">No hay pacientes registrados.</div>
          )}
        </ChartPanel>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Activity className="text-blue-500" size={20} /> Resumen de Terapeutas Atendiendo
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold rounded-tl-2xl">Terapeuta</th>
                <th className="p-4 font-bold rounded-tr-2xl text-center">Citas Atendidas (Completadas/Confirmadas)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {terapeutasConCitas.length > 0 ? (
                terapeutasConCitas.slice(0, 10).map((terapeuta) => (
                  <tr key={terapeuta.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                        {terapeuta.nombreCompleto.charAt(0)}
                      </div>
                      {terapeuta.nombreCompleto}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${terapeuta.citasAsistidas > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {terapeuta.citasAsistidas} citas
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="p-8 text-center text-slate-400 font-medium">
                    No hay terapeutas para mostrar en este rango.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {terapeutasConCitas.length > 10 && (
          <div className="p-4 text-center border-t border-slate-100 bg-slate-50">
            <span className="text-xs text-slate-500 font-medium">Mostrando el Top 10 de terapeutas. Exporte el PDF para el reporte completo.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reportes;