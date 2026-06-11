import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  Users, 
  CalendarCheck, 
  Download, 
  Filter, 
  Activity,
  Stethoscope
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import html2pdf from 'html2pdf.js';

const API_BASE = "https://localhost:7205/api";

const Reportes = () => {
  const [periodo, setPeriodo] = useState('Este Año');
  const [loading, setLoading] = useState(true);
  
  // Datos brutos
  const [pacientes, setPacientes] = useState([]);
  const [terapeutas, setTerapeutas] = useState([]);
  const [citas, setCitas] = useState([]);
  
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pacientesRes, terapeutasRes, citasRes] = await Promise.all([
          fetch(`${API_BASE}/Pacientes`),
          fetch(`${API_BASE}/Terapeutas`),
          fetch(`${API_BASE}/Citas`)
        ]);

        if (pacientesRes.ok) setPacientes(await pacientesRes.json());
        if (terapeutasRes.ok) setTerapeutas(await terapeutasRes.json());
        if (citasRes.ok) setCitas(await citasRes.json());

      } catch (err) {
        console.error("Error al cargar datos para reportes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Lógica de Filtrado por Fecha (Ventana de Tiempo Estricta)
  const getFilterWindow = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let start = new Date(now);
    let end = new Date(now);
    end.setHours(23, 59, 59, 999);

    switch (periodo) {
      case 'Hoy':
        // start y end ya están configurados para hoy
        break;
      case 'Esta Semana': {
        // Asumiendo que la semana empieza el Lunes
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      }
      case 'Este Mes':
        start.setDate(1); // Primer día del mes
        end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999); // Último día
        break;
      case 'Este Año':
        start = new Date(start.getFullYear(), 0, 1);
        end = new Date(start.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      default:
        start = new Date(0);
        end = new Date(3000, 0, 1);
    }
    return { start, end };
  };

  const { start, end } = getFilterWindow();

  // Función genérica para extraer la fecha de CREACIÓN real de cualquier registro
  const getFechaCreacion = (item) => {
     if (item.fechaCreacion) return new Date(item.fechaCreacion);
     if (item.fechaRegistro) return new Date(item.fechaRegistro);
     if (item.createdAt) return new Date(item.createdAt);
     // Fallback: Si la base de datos no expone la fecha en la que se creó el registro,
     // usamos la fecha actual para que los registros aparezcan contabilizados
     return new Date(); 
  };

  // Filtrar citas por su fecha de CREACIÓN (no por la fecha para la que están programadas)
  const citasFiltradas = citas.filter(c => {
    const d = getFechaCreacion(c);
    return d >= start && d <= end;
  });
  
  const pacientesFiltrados = pacientes.filter(p => {
    const d = getFechaCreacion(p);
    return d >= start && d <= end;
  });

  // Estadísticas Totales
  const stats = [
    { title: "Total Pacientes", value: pacientes.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Total Terapeutas", value: terapeutas.length, icon: Stethoscope, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: `Citas Programadas (${periodo})`, value: citasFiltradas.length, icon: CalendarCheck, color: "text-purple-600", bg: "bg-purple-50" },
    { title: `Pacientes Registrados (${periodo})`, value: pacientesFiltrados.length, icon: Activity, color: "text-orange-600", bg: "bg-orange-50" }
  ];

  // Preparación de datos para gráficas
  const procesarDatosGrafica = () => {
    const dict = {};
    
    // Citas
    citasFiltradas.forEach(c => {
      const dateObj = getFechaCreacion(c);
      const d = periodo === 'Este Año' ? dateObj.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }) : dateObj.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      if (!dict[d]) dict[d] = { name: d, Citas: 0, Pacientes: 0, order: dateObj.getTime() };
      dict[d].Citas += 1;
    });

    // Pacientes
    pacientesFiltrados.forEach(p => {
      const dateObj = getFechaCreacion(p);
      const d = periodo === 'Este Año' ? dateObj.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }) : dateObj.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      if (!dict[d]) dict[d] = { name: d, Citas: 0, Pacientes: 0, order: dateObj.getTime() };
      dict[d].Pacientes += 1;
    });

    return Object.values(dict).sort((a, b) => a.order - b.order);
  };

  const datosGrafica = procesarDatosGrafica();

  // Exportar a PDF
  const handleExportPDF = () => {
    const element = reportRef.current;
    
    // Configuración para el PDF
    const opt = {
      margin:       0.5,
      filename:     `Reporte_PhysioCare_${periodo.replace(' ', '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save();
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-10" ref={reportRef}>
      
      {/* Cabecera de Reportes */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Análisis y Reportes</h2>
          <p className="text-slate-500 text-sm">Monitoreo de indicadores de atención clínica.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto" data-html2canvas-ignore>
          <div className="relative flex-1 md:flex-none">
            <select 
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-10 py-2.5 font-bold text-slate-600 text-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer w-full"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
            >
              <option>Hoy</option>
              <option>Esta Semana</option>
              <option>Este Mes</option>
              <option>Este Año</option>
            </select>
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <button 
            onClick={handleExportPDF} 
            className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            <Download size={18} /> <span className="hidden sm:inline">Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas Totales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <div key={index} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-4 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                <item.icon size={28} />
              </div>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{item.title}</p>
            <h3 className="text-4xl font-black text-slate-800 mt-2">{item.value}</h3>
          </div>
        ))}
      </div>

      {/* Gráficos Recharts */}
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Gráfico de Evolución de Citas y Pacientes */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <BarChart3 className="text-blue-600" size={24} />
            <h3 className="font-bold text-xl text-slate-800">Evolución en el Tiempo</h3>
          </div>
          <div className="h-[300px] w-full">
            {datosGrafica.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={datosGrafica} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPacientes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Area type="monotone" dataKey="Citas" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorCitas)" />
                  <Area type="monotone" dataKey="Pacientes" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorPacientes)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 font-medium">
                No hay datos en este periodo.
              </div>
            )}
          </div>
        </div>

        {/* Gráfico de Barras - Nuevas Citas */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <CalendarCheck className="text-purple-600" size={24} />
            <h3 className="font-bold text-xl text-slate-800">Volumen de Citas</h3>
          </div>
          <div className="h-[300px] w-full">
            {datosGrafica.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosGrafica} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Citas" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 font-medium">
                No hay datos en este periodo.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reportes;