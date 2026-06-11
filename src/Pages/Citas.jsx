import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Search, 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  User,
  Stethoscope,
  ChevronRight,
  ClipboardList,
  UserCheck,
  Activity,
  Eye, Edit, Trash2
} from 'lucide-react';

const Citas = () => {
  const [view, setView] = useState('list');
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);

  const API_BASE = "https://localhost:7205/api";

  const [searchDocs, setSearchDocs] = useState({ pacienteDoc: '', terapeutaDoc: '' });
  const [searching, setSearching] = useState({ paciente: false, terapeuta: false });
  const [foundData, setFoundData] = useState({ paciente: null, terapeuta: null });
  const [searchErrors, setSearchErrors] = useState({ paciente: null, terapeuta: null });

  const [servicios, setServicios] = useState([]);
  const [estadosCita, setEstadosCita] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    pacienteId: '',
    terapeutaId: '',
    servicioTerapiaId: '',
    fecha: '',
    horaInicio: '',
    duracionEstimada: 30,
    EstadoCitaId: ''
  });

  useEffect(() => {
    fetchCitas();
    fetchEstadosCita();
  }, []);

  const fetchCitas = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/Citas`);
      if (resp.ok) {
        const data = await resp.json();
        setCitas(data);
      }
    } catch (err) { 
      console.error("Error al cargar citas:", err);
    } finally { setLoading(false); }
  };

  const fetchEstadosCita = async () => {
    try {
      const resp = await fetch(`${API_BASE}/Catalogos/EstadosCitas`);
      if (resp.ok) {
        const data = await resp.json();
        setEstadosCita(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, EstadoCitaId: data[0].id }));
        }
      }
    } catch (err) {
      console.error("Error al cargar estados:", err);
    }
  };

  const getFullName = (person) => {
    if (!person) return "No asignado";
    const nombre = person.primerNombre || "";
    const apellido = person.primerApellido || "";
    return `${nombre} ${apellido}`.trim() || "Sin nombre";
  };

  const buscarPorDocumento = async (tipo) => {
    const doc = tipo === 'paciente' ? searchDocs.pacienteDoc : searchDocs.terapeutaDoc;
    if (!doc) {
      setSearchErrors(prev => ({ ...prev, [tipo]: "Ingrese un número de documento." }));
      return;
    }

    setSearching(prev => ({ ...prev, [tipo]: true }));
    setSearchErrors(prev => ({ ...prev, [tipo]: null }));
    
    try {
      const controller = tipo === 'paciente' ? 'Pacientes' : 'Terapeutas';
      const endpoint = `${API_BASE}/${controller}/buscar/${doc}`;
      
      const resp = await fetch(endpoint);
      
      if (resp.ok) {
        const data = await resp.json();
        setFoundData(prev => ({ ...prev, [tipo]: data }));
        setFormData(prev => ({ ...prev, [tipo === 'paciente' ? 'pacienteId' : 'terapeutaId']: data.id }));
        
        if (tipo === 'terapeuta') {
          const sResp = await fetch(`${API_BASE}/Catalogos/ServiciosPorTerapeuta/${data.id}`);
          if (sResp.ok) setServicios(await sResp.json());
        }

        // Limpiar error de validación del formulario
        const fieldName = tipo === 'paciente' ? 'pacienteId' : 'terapeutaId';
        if (formErrors[fieldName]) {
          setFormErrors(prev => {
            const updated = { ...prev };
            delete updated[fieldName];
            return updated;
          });
        }
      } else {
        setSearchErrors(prev => ({ ...prev, [tipo]: `Documento no encontrado.` }));
        setFoundData(prev => ({ ...prev, [tipo]: null }));
        setFormData(prev => ({ ...prev, [tipo === 'paciente' ? 'pacienteId' : 'terapeutaId']: '' }));
      }
    } catch (err) {
      console.error(err);
      setSearchErrors(prev => ({ ...prev, [tipo]: "Error de conexión." }));
    } finally {
      setSearching(prev => ({ ...prev, [tipo]: false }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Paciente
    if (!formData.pacienteId) {
      errors.pacienteId = "Debe buscar y seleccionar un paciente por su documento.";
    }

    // Terapeuta
    if (!formData.terapeutaId) {
      errors.terapeutaId = "Debe buscar y seleccionar un terapeuta por su documento.";
    }

    // Servicio
    if (!formData.servicioTerapiaId) {
      errors.servicioTerapiaId = "El servicio de terapia es obligatorio.";
    }

    // Fecha
    if (!formData.fecha) {
      errors.fecha = "La fecha de la cita es obligatoria.";
    } else {
      const selectedDate = new Date(formData.fecha + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.fecha = "La fecha no puede ser anterior al día de hoy.";
      }
    }

    // Hora
    if (!formData.horaInicio) {
      errors.horaInicio = "La hora de inicio es obligatoria.";
    } else if (formData.fecha) {
      const selectedDateStr = formData.fecha;
      const todayStr = new Date().toISOString().split('T')[0];
      if (selectedDateStr === todayStr) {
        const now = new Date();
        const [hours, minutes] = formData.horaInicio.split(':');
        const selectedTime = new Date();
        selectedTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        if (selectedTime < now) {
          errors.horaInicio = "La hora de inicio no puede ser en el pasado.";
        }
      }
    }

    // Duración
    if (!formData.duracionEstimada) {
      errors.duracionEstimada = "La duración es obligatoria.";
    } else {
      const dur = parseInt(formData.duracionEstimada);
      if (isNaN(dur) || dur <= 0) {
        errors.duracionEstimada = "Debe ser un número mayor a 0.";
      } else if (dur < 15 || dur > 240) {
        errors.duracionEstimada = "Debe estar entre 15 y 240 minutos.";
      }
    }

    // Estado Cita
    if (!formData.EstadoCitaId) {
      errors.EstadoCitaId = "El estado de la cita es obligatorio.";
    }

    return errors;
  };

  const handleEdit = async (cita) => {
    setSelectedCita(cita);
    setFormErrors({});
    
    if (cita.terapeutaId) {
      try {
        const sResp = await fetch(`${API_BASE}/Catalogos/ServiciosPorTerapeuta/${cita.terapeutaId}`);
        if (sResp.ok) setServicios(await sResp.json());
      } catch (err) {
        console.error(err);
      }
    }
    
    setFoundData({ paciente: cita.paciente, terapeuta: cita.terapeuta });
    setSearchDocs({ 
      pacienteDoc: cita.paciente?.numeroDocumento || '', 
      terapeutaDoc: cita.terapeuta?.numeroDocumento || '' 
    });

    setFormData({
      pacienteId: cita.pacienteId || '',
      terapeutaId: cita.terapeutaId || '',
      servicioTerapiaId: cita.servicioTerapiaId || '',
      fecha: cita.fecha ? cita.fecha.split('T')[0] : '',
      horaInicio: cita.horaInicio ? cita.horaInicio.substring(0, 5) : '',
      duracionEstimada: cita.duracionEstimada || 30,
      EstadoCitaId: cita.estadoCitaId || ''
    });
    
    setView('edit');
  };

  const handleView = (cita) => {
    setSelectedCita(cita);
    setView('detail');
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta cita?")) {
      try {
        const response = await fetch(`${API_BASE}/Citas/${id}`, { method: 'DELETE' });
        if (response.ok) {
          alert("Cita eliminada con éxito.");
          fetchCitas();
          setView('list');
        } else {
          alert("Error al eliminar la cita.");
        }
      } catch (err) {
        console.error("Error de conexión:", err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      setSaving(false);
      setTimeout(() => {
        const firstErrorField = document.querySelector('.text-red-500');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    const payload = {
      id: selectedCita ? selectedCita.id : 0,
      PacienteId: parseInt(formData.pacienteId),
      TerapeutaId: parseInt(formData.terapeutaId),
      ServicioTerapiaId: parseInt(formData.servicioTerapiaId),
      fecha: formData.fecha,
      horaInicio: formData.horaInicio.length === 5 ? `${formData.horaInicio}:00` : formData.horaInicio,
      duracionEstimada: parseInt(formData.duracionEstimada),
      EstadoCitaId: parseInt(formData.EstadoCitaId)
    };

    try {
      const url = view === 'edit' ? `${API_BASE}/Citas/${selectedCita.id}` : `${API_BASE}/Citas`;
      const resp = await fetch(url, {
        method: view === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        setView('list');
        fetchCitas();
        resetForm();
      } else {
        try {
          const errorData = await resp.json();
          alert("Error: " + (errorData.title || "Verifique los datos obligatorios"));
        } catch {
          alert("Error al guardar la cita.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error de comunicación.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({ 
      pacienteId: '', 
      terapeutaId: '', 
      servicioTerapiaId: '', 
      fecha: '', 
      horaInicio: '', 
      duracionEstimada: 30, 
      EstadoCitaId: estadosCita[0]?.id || ''
    });
    setSearchDocs({ pacienteDoc: '', terapeutaDoc: '' });
    setFoundData({ paciente: null, terapeuta: null });
    setSearchErrors({ paciente: null, terapeuta: null });
    setFormErrors({});
    setServicios([]);
  };

  const handleSearchDocChange = (tipo, val) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 10);
    setSearchDocs(prev => ({ ...prev, [`${tipo}Doc`]: digitsOnly }));
    setSearchErrors(prev => ({ ...prev, [tipo]: null }));
    
    // Si cambia el documento, desvincular el ID previamente buscado
    if (foundData[tipo]) {
      setFoundData(prev => ({ ...prev, [tipo]: null }));
      setFormData(prev => ({ ...prev, [tipo === 'paciente' ? 'pacienteId' : 'terapeutaId']: '' }));
      if (tipo === 'terapeuta') {
        setServicios([]);
      }
    }

    const fieldName = tipo === 'paciente' ? 'pacienteId' : 'terapeutaId';
    if (formErrors[fieldName]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };

  const handleFieldChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleDurationChange = (val) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 3);
    setFormData(prev => ({ ...prev, duracionEstimada: digitsOnly }));
    if (formErrors.duracionEstimada) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated.duracionEstimada;
        return updated;
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Agenda Médica</h1>
            <p className="text-slate-500 font-bold flex items-center gap-2 uppercase text-xs tracking-widest">
              <Activity size={16} className="text-blue-600"/> PhysioCare Sistema
            </p>
          </div>
          
          <button 
            onClick={() => { 
              if(view === 'list') {
                setView('form'); 
                resetForm();
                setSelectedCita(null);
              } else {
                setView('list');
              }
            }}
            className={`px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
              view === 'list' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-slate-600 border-2 border-slate-100'
            }`}
          >
            {view === 'list' ? <><ChevronRight size={20} /> NUEVA CITA</> : <><ArrowLeft size={20} /> VOLVER</>}
          </button>
        </div>

        {view === 'list' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full py-20 text-center font-black text-slate-300 animate-pulse text-2xl uppercase tracking-widest">
                Cargando Agenda...
              </div>
            ) : (
              citas.map(cita => (
                <div key={cita.id} className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group overflow-hidden">
                  <div className="flex justify-between items-start mb-5">
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                      {cita.estadoCita?.nombre || "Cargando..."}
                    </span>
                    <CalendarIcon size={20} className="text-slate-200" />
                  </div>
                  
                  <div className="space-y-1 mb-6">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Paciente</p>
                    <h3 className="font-black text-slate-800 text-xl tracking-tight leading-tight">
                      {getFullName(cita.paciente)}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl mb-6">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
                      <Stethoscope size={18}/>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Terapeuta</p>
                      <p className="font-bold text-slate-700 text-sm truncate">{getFullName(cita.terapeuta)}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-[11px] font-black text-slate-400 pt-5 border-t border-slate-50 mb-4">
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={14}/>
                      {new Date(cita.fecha).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14}/>
                      {cita.horaInicio.substring(0, 5)}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                    <button onClick={() => handleView(cita)} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"><Eye size={14}/> Ver</button>
                    <button onClick={() => handleEdit(cita)} className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"><Edit size={14}/> Editar</button>
                    <button onClick={() => handleDelete(cita.id)} className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors"><Trash2 size={14}/> Eliminar</button>
                  </div>
                </div>
              ))
            )}
            
            {citas.length === 0 && !loading && (
              <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">No hay citas registradas en la agenda todavía.</p>
              </div>
            )}
          </div>
        ) : view === 'detail' && selectedCita ? (
          <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-100 max-w-4xl mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-start mb-8 border-b border-slate-100 pb-6">
                <div>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight">Detalles de la Cita</h3>
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest mt-2">
                    {selectedCita.estadoCita?.nombre || "Cargando..."}
                  </span>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                  <button onClick={() => handleEdit(selectedCita)} className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-100 transition-all"><Edit size={18}/> Editar</button>
                  <button onClick={() => handleDelete(selectedCita.id)} className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-all"><Trash2 size={18}/> Eliminar</button>
                </div>
             </div>
             
             <div className="grid md:grid-cols-2 gap-8">
               <div className="space-y-6">
                 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><User size={14}/> Paciente</p>
                   <p className="font-bold text-slate-800 text-lg">{getFullName(selectedCita.paciente)}</p>
                   <p className="text-sm font-bold text-slate-500">{selectedCita.paciente?.numeroDocumento}</p>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Stethoscope size={14}/> Terapeuta</p>
                   <p className="font-bold text-slate-800 text-lg">{getFullName(selectedCita.terapeuta)}</p>
                   <p className="text-sm font-bold text-slate-500">{selectedCita.terapeuta?.numeroDocumento}</p>
                 </div>
               </div>
               <div className="space-y-6">
                 <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2"><CalendarIcon size={14}/> Fecha y Hora</p>
                   <p className="font-black text-blue-900 text-xl">{new Date(selectedCita.fecha).toLocaleDateString()}</p>
                   <p className="font-bold text-blue-700 text-lg flex items-center gap-2 mt-1"><Clock size={16}/> {selectedCita.horaInicio?.substring(0, 5)} <span className="text-sm text-blue-500 font-medium">({selectedCita.duracionEstimada} min)</span></p>
                 </div>
                 <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                   <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Activity size={14}/> Servicio Médico</p>
                   <p className="font-bold text-purple-900 text-lg">{selectedCita.servicioTerapia?.nombreServicio || 'General'}</p>
                 </div>
               </div>
             </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4">
            
            <div className="lg:col-span-5 space-y-6">
              {/* BÚSQUEDA PACIENTE */}
              <div className={`bg-white p-7 rounded-[2.5rem] shadow-sm border ${formErrors.pacienteId ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-100'} transition-all`}>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 block">1. Localizar Paciente <span className="text-red-500">*</span></label>
                <div className="flex gap-3 mb-4">
                  <div className="relative flex-1">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Documento paciente..."
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      value={searchDocs.pacienteDoc}
                      onChange={(e) => handleSearchDocChange('paciente', e.target.value)}
                    />
                  </div>
                  <button onClick={() => buscarPorDocumento('paciente')} className="w-14 h-14 flex items-center justify-center bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg">
                    {searching.paciente ? <RefreshCw className="animate-spin" size={20} /> : <Search size={22} />}
                  </button>
                </div>
                {foundData.paciente && (
                  <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4">
                    <UserCheck className="text-emerald-500" size={24} />
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Confirmado</p>
                      <p className="font-black text-emerald-900 text-lg truncate">{getFullName(foundData.paciente)}</p>
                    </div>
                  </div>
                )}
                {searchErrors.paciente && <p className="text-red-500 text-[11px] font-bold mt-2 flex items-center gap-1"><AlertCircle size={14}/> {searchErrors.paciente}</p>}
                {formErrors.pacienteId && <p className="text-red-500 text-[11px] font-bold mt-2 flex items-center gap-1"><AlertCircle size={14}/> {formErrors.pacienteId}</p>}
              </div>

              {/* BÚSQUEDA TERAPEUTA */}
              <div className={`bg-white p-7 rounded-[2.5rem] shadow-sm border ${formErrors.terapeutaId ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-100'} transition-all`}>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 block">2. Asignar Terapeuta <span className="text-red-500">*</span></label>
                <div className="flex gap-3 mb-4">
                  <div className="relative flex-1">
                    <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Documento terapeuta..."
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      value={searchDocs.terapeutaDoc}
                      onChange={(e) => handleSearchDocChange('terapeuta', e.target.value)}
                    />
                  </div>
                  <button onClick={() => buscarPorDocumento('terapeuta')} className="w-14 h-14 flex items-center justify-center bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg">
                    {searching.terapeuta ? <RefreshCw className="animate-spin" size={20} /> : <Search size={22} />}
                  </button>
                </div>
                {foundData.terapeuta && (
                  <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-4">
                    <Stethoscope className="text-blue-600" size={24} />
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Asignado</p>
                      <p className="font-black text-blue-900 text-lg truncate">{getFullName(foundData.terapeuta)}</p>
                    </div>
                  </div>
                )}
                {searchErrors.terapeuta && <p className="text-red-500 text-[11px] font-bold mt-2 flex items-center gap-1"><AlertCircle size={14}/> {searchErrors.terapeuta}</p>}
                {formErrors.terapeutaId && <p className="text-red-500 text-[11px] font-bold mt-2 flex items-center gap-1"><AlertCircle size={14}/> {formErrors.terapeutaId}</p>}
              </div>
            </div>

            <div className="lg:col-span-7 bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <ClipboardList size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Datos de Programación</h3>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Complete los campos obligatorios</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    className={`w-full p-4 bg-slate-50 border-2 ${formErrors.fecha ? 'border-red-400' : 'border-transparent'} rounded-2xl font-bold text-slate-700 focus:border-blue-500 focus:bg-white outline-none transition-all`} 
                    value={formData.fecha} 
                    onChange={(e) => handleFieldChange('fecha', e.target.value)} 
                  />
                  {formErrors.fecha && <p className="text-red-500 text-[11px] font-bold flex items-center gap-1 ml-1"><AlertCircle size={14}/> {formErrors.fecha}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Hora de Inicio <span className="text-red-500">*</span></label>
                  <input 
                    type="time" 
                    className={`w-full p-4 bg-slate-50 border-2 ${formErrors.horaInicio ? 'border-red-400' : 'border-transparent'} rounded-2xl font-bold text-slate-700 focus:border-blue-500 focus:bg-white outline-none transition-all`} 
                    value={formData.horaInicio} 
                    onChange={(e) => handleFieldChange('horaInicio', e.target.value)} 
                  />
                  {formErrors.horaInicio && <p className="text-red-500 text-[11px] font-bold flex items-center gap-1 ml-1"><AlertCircle size={14}/> {formErrors.horaInicio}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado de Cita <span className="text-red-500">*</span></label>
                  <select 
                    className={`w-full p-4 bg-slate-50 border-2 ${formErrors.EstadoCitaId ? 'border-red-400' : 'border-transparent'} rounded-2xl font-bold text-slate-700 focus:border-blue-500 focus:bg-white outline-none appearance-none`}
                    value={formData.EstadoCitaId}
                    onChange={(e) => handleFieldChange('EstadoCitaId', e.target.value)}
                  >
                    {estadosCita.length > 0 ? (
                      estadosCita.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)
                    ) : (
                      <option value="">Cargando estados...</option>
                    )}
                  </select>
                  {formErrors.EstadoCitaId && <p className="text-red-500 text-[11px] font-bold flex items-center gap-1 ml-1"><AlertCircle size={14}/> {formErrors.EstadoCitaId}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Duración (min) <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className={`w-full p-4 bg-slate-50 border-2 ${formErrors.duracionEstimada ? 'border-red-400' : 'border-transparent'} rounded-2xl font-bold text-slate-700 focus:border-blue-500 focus:bg-white outline-none transition-all`} 
                    value={formData.duracionEstimada} 
                    onChange={(e) => handleDurationChange(e.target.value)} 
                  />
                  {formErrors.duracionEstimada && <p className="text-red-500 text-[11px] font-bold flex items-center gap-1 ml-1"><AlertCircle size={14}/> {formErrors.duracionEstimada}</p>}
                </div>
              </div>

              <div className="space-y-2 mb-10">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Servicio de Terapia <span className="text-red-500">*</span></label>
                <select 
                  className={`w-full p-4 bg-slate-50 border-2 ${formErrors.servicioTerapiaId ? 'border-red-400' : 'border-transparent'} rounded-2xl font-bold text-slate-700 focus:border-blue-500 focus:bg-white disabled:opacity-50 outline-none appearance-none`}
                  value={formData.servicioTerapiaId}
                  onChange={(e) => handleFieldChange('servicioTerapiaId', e.target.value)}
                  disabled={!foundData.terapeuta}
                >
                  <option value="">— Seleccionar Servicio —</option>
                  {servicios.map(s => <option key={s.id} value={s.id}>{s.nombreServicio}</option>)}
                </select>
                {formErrors.servicioTerapiaId && <p className="text-red-500 text-[11px] font-bold flex items-center gap-1 ml-1"><AlertCircle size={14}/> {formErrors.servicioTerapiaId}</p>}
              </div>

              <button 
                onClick={handleSubmit}
                disabled={saving}
                className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all flex items-center justify-center gap-3"
              >
                {saving ? <RefreshCw className="animate-spin" size={24}/> : <Save size={24}/>}
                {saving ? "GUARDANDO..." : (view === 'edit' ? "ACTUALIZAR CITA" : "AGENDAR CITA")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Citas;