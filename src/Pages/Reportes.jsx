import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  Users, 
  CalendarCheck, 
  Download, 
  Filter, 
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

const API_BASE = "https://localhost:7205/api";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const Reportes = () => {
  const [loading, setLoading] = useState(true);
  
  // Rango de fechas
  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [fechaFin, setFechaFin] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  // Datos brutos
  const [pacientes, setPacientes] = useState([]);
  const [terapeutas, setTerapeutas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [terapias, setTerapias] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pacientesRes, terapeutasRes, citasRes, especialidadesRes, terapiasRes] = await Promise.all([
          fetch(`${API_BASE}/Pacientes`),
          fetch(`${API_BASE}/Terapeutas`),
          fetch(`${API_BASE}/Citas`),
          fetch(`${API_BASE}/Catalogos/Especialidades`),
          fetch(`${API_BASE}/ServicioTerapias`)
        ]);

        if (pacientesRes.ok) setPacientes(await pacientesRes.json());
        if (terapeutasRes.ok) setTerapeutas(await terapeutasRes.json());
        if (citasRes.ok) setCitas(await citasRes.json());
        if (especialidadesRes.ok) setEspecialidades(await especialidadesRes.json());
        if (terapiasRes.ok) setTerapias(await terapiasRes.json());

      } catch (err) {
        console.error("Error al cargar datos para reportes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getFecha = (item) => {
    if (item.fechaCreacion) return new Date(item.fechaCreacion);
    if (item.fechaRegistro) return new Date(item.fechaRegistro);
    if (item.createdAt) return new Date(item.createdAt);
    if (item.fechaHoraCita) return new Date(item.fechaHoraCita); // Para citas si no hay creacion
    if (item.fecha) return new Date(item.fecha); // Para las Citas que usan el campo 'fecha'
    return new Date(); 
  };

  const start = new Date(fechaInicio + 'T00:00:00');
  const end = new Date(fechaFin + 'T23:59:59');

  // Filtrados
  const citasFiltradas = citas.filter(c => {
    const d = getFecha(c);
    return d >= start && d <= end;
  });
  
  const pacientesFiltrados = pacientes.filter(p => {
    const d = getFecha(p);
    return d >= start && d <= end;
  });

  const terapeutasFiltrados = terapeutas.filter(t => {
    const d = getFecha(t);
    return d >= start && d <= end;
  });

  const totalCitas = citasFiltradas.length;
  const citasPorEstado = {
    'Completada': citasFiltradas.filter(c => c.estadoCita?.nombre === 'Completada').length,
    'Programada': citasFiltradas.filter(c => c.estadoCita?.nombre === 'Programada').length,
    'Confirmada': citasFiltradas.filter(c => c.estadoCita?.nombre === 'Confirmada').length,
    'Cancelada': citasFiltradas.filter(c => c.estadoCita?.nombre === 'Cancelada').length,
    'En Curso': citasFiltradas.filter(c => c.estadoCita?.nombre === 'En Curso').length,
  };

  const pctCompletadas = totalCitas > 0 ? ((citasPorEstado['Completada'] / totalCitas) * 100).toFixed(1) : 0;
  const pctCanceladas = totalCitas > 0 ? ((citasPorEstado['Cancelada'] / totalCitas) * 100).toFixed(1) : 0;
  
  const duracionPromedio = totalCitas > 0 
    ? Math.round(citasFiltradas.reduce((sum, c) => sum + (c.duracionEstimada || 0), 0) / totalCitas)
    : 0;

  // Gráfico 1: Demanda por especialidad
  const procesarDemandaEspecialidades = () => {
    const contadores = {};
    citasFiltradas.forEach(cita => {
      // Necesitamos encontrar la terapia de la cita, luego su especialidad
      const terapia = terapias.find(t => t.id === cita.servicioTerapiaId);
      let nombreEspecialidad = 'General';
      if (terapia && terapia.categoriaTerapia && terapia.categoriaTerapia.especialidadId) {
        const esp = especialidades.find(e => e.id === terapia.categoriaTerapia.especialidadId);
        if (esp) nombreEspecialidad = esp.nombre;
      } else if (terapia && terapia.categoriaTerapia?.especialidadTerapeutaId) { // Fallback old prop
         const esp = especialidades.find(e => e.id === terapia.categoriaTerapia.especialidadTerapeutaId);
         if (esp) nombreEspecialidad = esp.nombre;
      }

      contadores[nombreEspecialidad] = (contadores[nombreEspecialidad] || 0) + 1;
    });

    return Object.keys(contadores).map(key => ({
      name: key,
      value: contadores[key]
    })).sort((a,b) => b.value - a.value);
  };
  const dataEspecialidades = procesarDemandaEspecialidades();

  // Gráfico 2: Flujo de pacientes (Pacientes únicos atendidos por día en el periodo)
  // Como la base de datos no tiene fecha de registro de paciente, graficamos los pacientes en base a sus citas
  const procesarFlujoPacientes = () => {
    const dict = {};
    citasFiltradas.forEach(cita => {
      const dateObj = getFecha(cita);
      const d = dateObj.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      if (!dict[d]) dict[d] = { name: d, Pacientes: new Set(), order: dateObj.getTime() };
      dict[d].Pacientes.add(cita.pacienteId);
    });

    return Object.values(dict).map(item => ({
      name: item.name,
      Pacientes: item.Pacientes.size,
      order: item.order
    })).sort((a, b) => a.order - b.order);
  };
  const dataPacientes = procesarFlujoPacientes();

  // Gráfico 3: Pacientes registrados (Basado en su primera cita en el sistema - ACUMULATIVO)
  const procesarPacientesRegistrados = () => {
    const dict = {};
    
    // 1. Calculamos la fecha de registro inferida (la cita más antigua del paciente)
    const fechaPrimeraCita = {};
    citas.forEach(cita => {
      const d = getFecha(cita);
      if (!fechaPrimeraCita[cita.pacienteId] || d < fechaPrimeraCita[cita.pacienteId]) {
        fechaPrimeraCita[cita.pacienteId] = d;
      }
    });

    // 2. Ordenar cronológicamente
    const pacientesOrdenados = pacientes.map(p => {
      return {
        id: p.id,
        fechaReg: fechaPrimeraCita[p.id] || new Date()
      };
    }).sort((a, b) => a.fechaReg - b.fechaReg);

    // 3. Acumular y agregar al diccionario
    let acumulado = 0;
    pacientesOrdenados.forEach(p => {
      acumulado += 1;
      
      // Filtramos para que grafique solo los que caen en el rango de fechas actual
      if (p.fechaReg >= start && p.fechaReg <= end) {
        const d = p.fechaReg.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
        dict[d] = { name: d, Pacientes: acumulado, order: p.fechaReg.getTime() };
      }
    });
    
    return Object.values(dict).sort((a, b) => a.order - b.order);
  };
  const dataPacientesRegistrados = procesarPacientesRegistrados();

  // Gráfico 4: Demanda por Día de la Semana
  const procesarDemandaDias = () => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const contadores = { 'Lunes':0, 'Martes':0, 'Miércoles':0, 'Jueves':0, 'Viernes':0, 'Sábado':0, 'Domingo':0 };
    
    citasFiltradas.forEach(cita => {
      const d = getFecha(cita);
      const nombreDia = dias[d.getDay()];
      contadores[nombreDia] += 1;
    });

    // Reordenamos para que empiece en Lunes
    const orden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return orden.map(k => ({
      name: k.substring(0,3), // Lun, Mar, Mie...
      Citas: contadores[k]
    }));
  };
  const dataDemandaDias = procesarDemandaDias();

  // Tabla: Terapeutas y cantidad de citas asistidas
  const procesarTerapeutasCitas = () => {
    const asistidasPorTerapeuta = {};
    
    // Contamos citas 'Completadas' o 'Confirmadas' por terapeuta en el periodo
    citasFiltradas.forEach(cita => {
      if (cita.estadoCita?.nombre === 'Completada' || cita.estadoCita?.nombre === 'Confirmada') {
        asistidasPorTerapeuta[cita.terapeutaId] = (asistidasPorTerapeuta[cita.terapeutaId] || 0) + 1;
      }
    });

    return terapeutasFiltrados.map(t => {
      return {
        id: t.id,
        nombreCompleto: `${t.primerNombre} ${t.primerApellido}`,
        citasAsistidas: asistidasPorTerapeuta[t.id] || 0
      };
    }).sort((a,b) => b.citasAsistidas - a.citasAsistidas);
  };
  const terapeutasConCitas = procesarTerapeutasCitas();

  // Exportar a PDF usando jsPDF y autotable
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('Reporte Analítico - PhysioCare', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Periodo: ${fechaInicio} a ${fechaFin}`, 14, 30);

    // Resumen de Métricas
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
        ['Duración Promedio de Cita', `${duracionPromedio} min`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    // Citas por Estado
    doc.text('Citas por Estado', 14, doc.lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Estado', 'Cantidad']],
      body: [
        ['Completadas', citasPorEstado['Completada']],
        ['Programadas', citasPorEstado['Programada']],
        ['Confirmadas', citasPorEstado['Confirmada']],
        ['En Curso', citasPorEstado['En Curso']],
        ['Canceladas', citasPorEstado['Cancelada']],
      ],
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }
    });

    // Tabla de Terapeutas
    doc.text('Terapeutas y Citas Atendidas', 14, doc.lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Nombre del Terapeuta', 'Citas Atendidas']],
      body: terapeutasConCitas.map(t => [t.nombreCompleto, t.citasAsistidas]),
      theme: 'striped',
      headStyles: { fillColor: [139, 92, 246] }
    });

    doc.save(`Reporte_PhysioCare_${fechaInicio}_${fechaFin}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Generando Analíticas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Cabecera de Reportes con Filtros de Fecha */}
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
              onChange={(e) => setFechaInicio(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-medium text-sm outline-none px-2 cursor-pointer"
            />
            <span className="text-slate-300">-</span>
            <input 
              type="date" 
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-medium text-sm outline-none px-2 cursor-pointer"
            />
          </div>
          
          <button 
            onClick={handleExportPDF} 
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 w-full sm:w-auto whitespace-nowrap"
          >
            <Download size={18} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas Principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
          <CalendarCheck className="text-blue-500 mb-2" size={24} />
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Citas</p>
          <h3 className="text-2xl font-black text-slate-800">{totalCitas}</h3>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
          <CheckCircle className="text-emerald-500 mb-2" size={24} />
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">% Completadas</p>
          <h3 className="text-2xl font-black text-slate-800">{pctCompletadas}%</h3>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
          <XCircle className="text-red-500 mb-2" size={24} />
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">% Canceladas</p>
          <h3 className="text-2xl font-black text-slate-800">{pctCanceladas}%</h3>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
          <Clock className="text-indigo-500 mb-2" size={24} />
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Duración Media</p>
          <h3 className="text-2xl font-black text-slate-800">{duracionPromedio}m</h3>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
          <Users className="text-orange-500 mb-2" size={24} />
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Pacientes</p>
          <h3 className="text-2xl font-black text-slate-800">{pacientes.length}</h3>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
          <Stethoscope className="text-purple-500 mb-2" size={24} />
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Terapeutas</p>
          <h3 className="text-2xl font-black text-slate-800">{terapeutas.length}</h3>
        </div>
        
        {/* Desglose de Citas por Estado Mini */}
        <div className="bg-slate-900 p-4 rounded-3xl shadow-md flex flex-col justify-center col-span-2 md:col-span-4 lg:col-span-1">
          <h4 className="text-white text-xs font-bold mb-2 flex items-center gap-1">
            <Activity size={14} className="text-blue-400" /> Estados
          </h4>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-300"><span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Completadas</span> <span className="font-bold text-white">{citasPorEstado['Completada']}</span></div>
            <div className="flex justify-between text-[11px] text-slate-300"><span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Programadas</span> <span className="font-bold text-white">{citasPorEstado['Programada']}</span></div>
            <div className="flex justify-between text-[11px] text-slate-300"><span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Canceladas</span> <span className="font-bold text-white">{citasPorEstado['Cancelada']}</span></div>
          </div>
        </div>
      </div>

      {/* Gráficos Recharts */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Gráfico Lineal de Registro de Pacientes */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                <Users size={20} />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Flujo de Citas de Pacientes</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium">Pacientes únicos por día</p>
          </div>
          <div className="h-[300px] w-full mt-auto">
            {dataPacientes.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataPacientes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold', color: '#ea580c' }}
                  />
                  <Area type="monotone" dataKey="Pacientes" stroke="#ea580c" strokeWidth={4} fillOpacity={1} fill="url(#colorArea)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 font-medium">
                No hay registros en estas fechas.
              </div>
            )}
          </div>
        </div>

        {/* Gráfico Donut de Especialidades */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <PieChartIcon size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-800">Demanda por Especialidad</h3>
          </div>
          <div className="h-[300px] w-full flex justify-center items-center">
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
                  <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 font-medium">
                No hay datos de citas para analizar.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Gráficos Secundarios */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Gráfico Demanda por Días */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <BarChart2 size={20} />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Demanda por Día de la Semana</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium">Concentración de citas</p>
          </div>
          <div className="h-[250px] w-full mt-auto">
            {dataDemandaDias.some(d => d.Citas > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataDemandaDias} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="Citas" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 font-medium">
                No hay citas para analizar demanda.
              </div>
            )}
          </div>
        </div>

        {/* Gráfico Lineal de Pacientes Registrados Histórico */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <Users size={20} />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Pacientes Registrados</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium">Crecimiento histórico</p>
          </div>
          <div className="h-[250px] w-full mt-auto">
            {dataPacientesRegistrados.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataPacientesRegistrados} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold', color: '#10b981' }}
                  />
                  <Line type="monotone" dataKey="Pacientes" stroke="#10b981" strokeWidth={4} dot={{ strokeWidth: 2, r: 4, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 font-medium">
                No hay pacientes registrados.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Tabla de Terapeutas y Citas */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Activity className="text-blue-500" size={20}/> Resumen de Terapeutas Atendiendo
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
                terapeutasConCitas.slice(0, 10).map((t, i) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                        {t.nombreCompleto.charAt(0)}
                      </div>
                      {t.nombreCompleto}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${t.citasAsistidas > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {t.citasAsistidas} citas
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