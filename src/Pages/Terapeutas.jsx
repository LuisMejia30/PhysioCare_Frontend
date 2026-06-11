import React, { useState, useEffect } from 'react';
import { Search, UserPlus, ArrowLeft, Save, UserCog, BadgeCheck, Phone, Mail, GraduationCap, Clock, Calendar as CalendarIcon, RefreshCw, User, Award, ClipboardList, Eye, Edit, Trash2 } from 'lucide-react';

// --- COMPONENTES INTERNOS (CON SOPORTE DE ERRORES) ---

const CustomInput = ({ label, icon: Icon, required, type = "text", error, ...props }) => (
  <div className="space-y-2">
    <label className="block text-sm font-bold text-slate-700 ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
          <Icon size={18} />
        </div>
      )}
      <input
        type={type}
        className={`w-full ${Icon ? 'pl-11' : 'px-4'} pr-4 py-3 bg-slate-50 border ${error ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700`}
        {...props}
      />
    </div>
    {error && <p className="text-red-500 text-xs font-medium ml-1">{error}</p>}
  </div>
);

const CustomSelect = ({ label, options, required, error, ...props }) => (
  <div className="space-y-2">
    <label className="block text-sm font-bold text-slate-700 ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      className={`w-full px-4 py-3 bg-slate-50 border ${error ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700 appearance-none cursor-pointer`}
      {...props}
    >
      <option value="">Seleccione una opción</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>{opt.nombre}</option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs font-medium ml-1">{error}</p>}
  </div>
);

const Terapeutas = () => {
  const [view, setView] = useState('list');
  const [terapeutas, setTerapeutas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [catalogos, setCatalogos] = useState({ especialidades: [], documentos: [] });
  const [selectedTerapeuta, setSelectedTerapeuta] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  const initialFormState = {
    especialidadTerapeutaId: "",
    tarjetaProfesional: "",
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    tipoDocumentoId: "",
    numeroDocumento: "",
    fechaNacimiento: "",
    correoLaboral: "",
    telefonoContacto: "",
    horaInicio: "08:00",
    horaFin: "17:00",
    diasSeleccionados: []
  };

  const [formData, setFormData] = useState(initialFormState);

  const diasSemana = [
    { id: 1, nombre: "Lun", full: "Lunes" },
    { id: 2, nombre: "Mar", full: "Martes" },
    { id: 3, nombre: "Mié", full: "Miércoles" },
    { id: 4, nombre: "Jue", full: "Jueves" },
    { id: 5, nombre: "Vie", full: "Viernes" },
    { id: 6, nombre: "Sáb", full: "Sábado" }
  ];

  // --- VALIDACIONES ---
  const validateForm = () => {
    const errors = {};
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    const soloDigitos = /^\d+$/;

    // Especialidad (obligatorio)
    if (!formData.especialidadTerapeutaId) {
      errors.especialidadTerapeutaId = "La especialidad es obligatoria.";
    }

    // Tarjeta Profesional: obligatorio, exactamente 9 caracteres
    if (!formData.tarjetaProfesional.trim()) {
      errors.tarjetaProfesional = "La tarjeta profesional es obligatoria.";
    } else if (formData.tarjetaProfesional.trim().length !== 9) {
      errors.tarjetaProfesional = "Debe tener exactamente 9 caracteres.";
    }

    // Primer Nombre: obligatorio, solo letras, entre 3 y 25 caracteres
    if (!formData.primerNombre.trim()) {
      errors.primerNombre = "El primer nombre es obligatorio.";
    } else if (!soloLetras.test(formData.primerNombre.trim())) {
      errors.primerNombre = "Solo se permiten letras (sin números ni caracteres especiales).";
    } else if (formData.primerNombre.trim().length < 3 || formData.primerNombre.trim().length > 25) {
      errors.primerNombre = "Debe tener entre 3 y 25 caracteres.";
    }

    // Segundo Nombre: no obligatorio, pero si se llena → solo letras, entre 3 y 25
    if (formData.segundoNombre.trim()) {
      if (!soloLetras.test(formData.segundoNombre.trim())) {
        errors.segundoNombre = "Solo se permiten letras (sin números ni caracteres especiales).";
      } else if (formData.segundoNombre.trim().length < 3 || formData.segundoNombre.trim().length > 25) {
        errors.segundoNombre = "Debe tener entre 3 y 25 caracteres.";
      }
    }

    // Primer Apellido: obligatorio, solo letras, entre 3 y 25 caracteres
    if (!formData.primerApellido.trim()) {
      errors.primerApellido = "El primer apellido es obligatorio.";
    } else if (!soloLetras.test(formData.primerApellido.trim())) {
      errors.primerApellido = "Solo se permiten letras (sin números ni caracteres especiales).";
    } else if (formData.primerApellido.trim().length < 3 || formData.primerApellido.trim().length > 25) {
      errors.primerApellido = "Debe tener entre 3 y 25 caracteres.";
    }

    // Segundo Apellido: no obligatorio, pero si se llena → solo letras, entre 3 y 25
    if (formData.segundoApellido.trim()) {
      if (!soloLetras.test(formData.segundoApellido.trim())) {
        errors.segundoApellido = "Solo se permiten letras (sin números ni caracteres especiales).";
      } else if (formData.segundoApellido.trim().length < 3 || formData.segundoApellido.trim().length > 25) {
        errors.segundoApellido = "Debe tener entre 3 y 25 caracteres.";
      }
    }

    // Tipo de Documento (obligatorio)
    if (!formData.tipoDocumentoId) {
      errors.tipoDocumentoId = "El tipo de documento es obligatorio.";
    }

    // Número de Documento: obligatorio, solo dígitos, entre 7 y 10 dígitos
    if (!formData.numeroDocumento.trim()) {
      errors.numeroDocumento = "El número de documento es obligatorio.";
    } else if (!soloDigitos.test(formData.numeroDocumento.trim())) {
      errors.numeroDocumento = "Solo se permiten dígitos enteros (sin letras ni caracteres especiales).";
    } else if (formData.numeroDocumento.trim().length < 7 || formData.numeroDocumento.trim().length > 10) {
      errors.numeroDocumento = "Debe tener entre 7 y 10 dígitos.";
    }

    // Fecha de Nacimiento (obligatorio)
    if (!formData.fechaNacimiento) {
      errors.fechaNacimiento = "La fecha de nacimiento es obligatoria.";
    }

    // Correo Laboral: obligatorio, hasta 50 caracteres, formato válido
    if (!formData.correoLaboral.trim()) {
      errors.correoLaboral = "El correo laboral es obligatorio.";
    } else if (formData.correoLaboral.trim().length > 50) {
      errors.correoLaboral = "Máximo 50 caracteres permitidos.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correoLaboral.trim())) {
      errors.correoLaboral = "Ingrese un correo electrónico válido.";
    }

    // Teléfono de Contacto: obligatorio, solo dígitos, exactamente 10 dígitos
    if (!formData.telefonoContacto.trim()) {
      errors.telefonoContacto = "El teléfono de contacto es obligatorio.";
    } else if (!soloDigitos.test(formData.telefonoContacto.trim())) {
      errors.telefonoContacto = "Solo se permiten números (sin letras ni caracteres especiales).";
    } else if (formData.telefonoContacto.trim().length !== 10) {
      errors.telefonoContacto = "Debe tener exactamente 10 dígitos.";
    }

    // Hora de Inicio (obligatorio)
    if (!formData.horaInicio) {
      errors.horaInicio = "La hora de inicio es obligatoria.";
    }

    // Hora de Fin (obligatorio)
    if (!formData.horaFin) {
      errors.horaFin = "La hora de fin es obligatoria.";
    }

    // Validar que hora fin sea mayor que hora inicio
    if (formData.horaInicio && formData.horaFin && formData.horaInicio >= formData.horaFin) {
      errors.horaFin = "La hora de fin debe ser posterior a la hora de inicio.";
    }

    // Días de semana (obligatorio, al menos uno)
    if (formData.diasSeleccionados.length === 0) {
      errors.diasSeleccionados = "Debe seleccionar al menos un día de atención.";
    }

    return errors;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const resT = await fetch('https://localhost:7205/api/Terapeutas');
      if (resT.ok) setTerapeutas(await resT.json());
      
      const baseUrl = 'https://localhost:7205/api/Catalogos';
      const [esp, docs] = await Promise.all([
        fetch(`${baseUrl}/Especialidades`).then(r => r.json()),
        fetch(`${baseUrl}/TiposDocumento`).then(r => r.json())
      ]);
      setCatalogos({ especialidades: esp, documentos: docs });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    setTimeout(() => {
      fetchData();
    }, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;

    // Campos que solo aceptan dígitos
    if (['numeroDocumento', 'telefonoContacto'].includes(name)) {
      filteredValue = value.replace(/\D/g, '');
    }

    // Campos que solo aceptan letras y espacios
    if (['primerNombre', 'segundoNombre', 'primerApellido', 'segundoApellido'].includes(name)) {
      filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
    }

    // Aplicar límites de longitud máxima
    const maxLengths = {
      tarjetaProfesional: 9,
      primerNombre: 25,
      segundoNombre: 25,
      primerApellido: 25,
      segundoApellido: 25,
      numeroDocumento: 10,
      telefonoContacto: 10,
      correoLaboral: 50
    };

    if (maxLengths[name] && filteredValue.length > maxLengths[name]) {
      filteredValue = filteredValue.slice(0, maxLengths[name]);
    }

    setFormData(prev => ({ ...prev, [name]: filteredValue }));

    // Limpiar el error del campo cuando el usuario empieza a corregir
    if (formErrors[name]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const toggleDia = (id) => {
    setFormData(prev => ({
      ...prev,
      diasSeleccionados: prev.diasSeleccionados.includes(id)
        ? prev.diasSeleccionados.filter(d => d !== id)
        : [...prev.diasSeleccionados, id]
    }));

    // Limpiar error de días al seleccionar uno
    if (formErrors.diasSeleccionados) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated.diasSeleccionados;
        return updated;
      });
    }
  };

  const handleEdit = (terapeuta) => {
    setSelectedTerapeuta(terapeuta);
    setFormErrors({});
    setFormData({
      especialidadTerapeutaId: terapeuta.especialidadTerapeutaId || "",
      tarjetaProfesional: terapeuta.tarjetaProfesional || "",
      primerNombre: terapeuta.primerNombre || "",
      segundoNombre: terapeuta.segundoNombre || "",
      primerApellido: terapeuta.primerApellido || "",
      segundoApellido: terapeuta.segundoApellido || "",
      tipoDocumentoId: terapeuta.tipoDocumentoId || "",
      numeroDocumento: terapeuta.numeroDocumento ? String(terapeuta.numeroDocumento) : "",
      fechaNacimiento: terapeuta.fechaNacimiento ? terapeuta.fechaNacimiento.split('T')[0] : "",
      correoLaboral: terapeuta.correoLaboral || "",
      telefonoContacto: terapeuta.telefonoContacto ? String(terapeuta.telefonoContacto) : "",
      horaInicio: terapeuta.horaInicio ? terapeuta.horaInicio.substring(0, 5) : "08:00",
      horaFin: terapeuta.horaFin ? terapeuta.horaFin.substring(0, 5) : "17:00",
      diasSeleccionados: terapeuta.diasLaborales ? terapeuta.diasLaborales.split(',').map(Number) : []
    });
    setView('edit');
  };

  const handleView = (terapeuta) => {
    setSelectedTerapeuta(terapeuta);
    setView('detail');
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este terapeuta?")) {
      try {
        const response = await fetch(`https://localhost:7205/api/Terapeutas/${id}`, { method: 'DELETE' });
        if (response.ok) {
          alert("Terapeuta eliminado con éxito.");
          fetchData();
          setView('list');
        } else {
          alert("Error al eliminar el terapeuta.");
        }
      } catch (err) {
        console.error("Error de conexión:", err);
      }
    }
  };

  // --- LÓGICA DE ENVÍO CON VALIDACIÓN ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ejecutar validaciones
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Hacer scroll al primer error
      const firstErrorField = document.querySelector('.text-red-500.text-xs');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Mapeo de datos para cumplir con el modelo C#
    const payload = {
      id: selectedTerapeuta ? selectedTerapeuta.id : 0,
      especialidadTerapeutaId: parseInt(formData.especialidadTerapeutaId),
      tarjetaProfesional: formData.tarjetaProfesional,
      primerNombre: formData.primerNombre,
      segundoNombre: formData.segundoNombre || null,
      primerApellido: formData.primerApellido,
      segundoApellido: formData.segundoApellido || null,
      tipoDocumentoId: parseInt(formData.tipoDocumentoId),
      numeroDocumento: parseInt(formData.numeroDocumento),
      fechaNacimiento: new Date(formData.fechaNacimiento).toISOString(),
      correoLaboral: formData.correoLaboral,
      telefonoContacto: parseInt(formData.telefonoContacto),
      // Agregamos :00 internamente para que C# reciba el TimeSpan correcto
      horaInicio: formData.horaInicio.length === 5 ? `${formData.horaInicio}:00` : formData.horaInicio,
      horaFin: formData.horaFin.length === 5 ? `${formData.horaFin}:00` : formData.horaFin,
      diasLaborales: formData.diasSeleccionados.sort().join(",")
    };

    try {
      const url = view === 'edit' ? `https://localhost:7205/api/Terapeutas/${selectedTerapeuta.id}` : 'https://localhost:7205/api/Terapeutas';
      const response = await fetch(url, {
        method: view === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("Terapeuta registrado correctamente");
        setFormData(initialFormState);
        setFormErrors({});
        setView('list');
        fetchData();
      } else {
        const err = await response.json();
        console.error("Detalle del error:", err.errors);
        alert("Error al guardar. Revisa la consola para detalles.");
      }
    } catch (e) { console.error(e); }
  };

  // --- RENDERIZADO ---
  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
                <UserCog size={24} />
              </div>
              Gestión de Terapeutas
            </h1>
            <p className="text-slate-400 text-sm font-medium ml-12">Panel de administración de personal médico</p>
          </div>
          <button 
            onClick={() => {
              setSelectedTerapeuta(null);
              setFormData(initialFormState);
              setFormErrors({});
              setView(view === 'list' ? 'form' : 'list');
            }}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
              view === 'list' 
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {view === 'list' ? <><UserPlus size={20}/> Nuevo Terapeuta</> : <><ArrowLeft size={20}/> Volver al Listado</>}
          </button>
        </div>

        {view === 'list' ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Información Personal</th>
                    <th className="py-5 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Especialidad</th>
                    <th className="py-5 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contacto</th>
                    <th className="py-5 px-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {terapeutas.length > 0 ? (
                    terapeutas.map(t => (
                      <tr key={t.id} className="group hover:bg-blue-50/30 transition-all">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                              <User size={20} />
                            </div>
                            <div>
                              <div className="font-bold text-slate-700 uppercase text-xs">{t.primerNombre} {t.primerApellido}</div>
                              <div className="text-[10px] text-slate-400 font-medium">TP: {t.tarjetaProfesional}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                             {t.especialidadTerapeuta?.nombre || "General"}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <div className="text-xs text-slate-600 font-medium">{t.correoLaboral}</div>
                          <div className="text-[10px] text-slate-400">{t.telefonoContacto}</div>
                        </td>
                        <td className="py-4 px-6 text-right flex justify-end gap-2">
                          <button onClick={() => handleView(t)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors" title="Ver Detalle"><Eye size={18} /></button>
                          <button onClick={() => handleEdit(t)} className="p-2 text-slate-400 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 rounded-lg transition-colors" title="Editar"><Edit size={18} /></button>
                          <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar"><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-20 text-center text-slate-300 font-bold uppercase text-xs tracking-widest">
                        {loading ? "Sincronizando..." : "No hay terapeutas registrados"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : view === 'detail' && selectedTerapeuta ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mb-20">
             <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
               <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Detalles del Terapeuta</h3>
               <div className="flex gap-3">
                 <button onClick={() => handleEdit(selectedTerapeuta)} className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-100 transition-all"><Edit size={18}/> Editar</button>
                 <button onClick={() => handleDelete(selectedTerapeuta.id)} className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-all"><Trash2 size={18}/> Eliminar</button>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Completo</p>
                <p className="font-bold text-slate-800">{selectedTerapeuta.primerNombre} {selectedTerapeuta.segundoNombre} {selectedTerapeuta.primerApellido} {selectedTerapeuta.segundoApellido}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Documento</p>
                <p className="font-bold text-slate-800">{catalogos.documentos.find(c => c.id === selectedTerapeuta.tipoDocumentoId)?.nombre || selectedTerapeuta.tipoDocumentoId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Número Documento</p>
                <p className="font-bold text-slate-800">{selectedTerapeuta.numeroDocumento}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Especialidad</p>
                <p className="font-bold text-slate-800">{catalogos.especialidades.find(e => e.id === selectedTerapeuta.especialidadTerapeutaId)?.nombre || selectedTerapeuta.especialidadTerapeuta?.nombre || 'General'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tarjeta Profesional</p>
                <p className="font-bold text-slate-800">{selectedTerapeuta.tarjetaProfesional}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha de Nacimiento</p>
                <p className="font-bold text-slate-800">{selectedTerapeuta.fechaNacimiento ? new Date(selectedTerapeuta.fechaNacimiento).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teléfono</p>
                <p className="font-bold text-slate-800">{selectedTerapeuta.telefonoContacto || 'N/A'}</p>
              </div>
              <div className="space-y-1 lg:col-span-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Correo Laboral</p>
                <p className="font-bold text-slate-800">{selectedTerapeuta.correoLaboral || 'N/A'}</p>
              </div>
              <div className="space-y-1 lg:col-span-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Días y Horarios Laborales</p>
                <div className="flex gap-2 mb-2">
                  {selectedTerapeuta.diasLaborales?.split(',').map(Number).map(d => (
                    <span key={d} className="px-3 py-1 bg-orange-100 text-orange-700 font-bold text-xs rounded-lg">
                      {diasSemana.find(day => day.id === d)?.nombre}
                    </span>
                  ))}
                </div>
                <p className="font-bold text-slate-800">{selectedTerapeuta.horaInicio?.substring(0,5)} - {selectedTerapeuta.horaFin?.substring(0,5)}</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Award size={20} /></div>
                    <h3 className="font-bold text-slate-800">Perfil Profesional</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomSelect label="Especialidad Principal" name="especialidadTerapeutaId" required error={formErrors.especialidadTerapeutaId} options={catalogos.especialidades} value={formData.especialidadTerapeutaId} onChange={handleChange} />
                    <CustomInput label="Tarjeta Profesional" name="tarjetaProfesional" required icon={BadgeCheck} placeholder="Ej: TP-123456" error={formErrors.tarjetaProfesional} value={formData.tarjetaProfesional} onChange={handleChange} />
                  </div>
                </section>

                <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User size={20} /></div>
                    <h3 className="font-bold text-slate-800">Datos Personales</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomInput label="Primer Nombre" name="primerNombre" required error={formErrors.primerNombre} value={formData.primerNombre} onChange={handleChange} />
                    <CustomInput label="Segundo Nombre" name="segundoNombre" error={formErrors.segundoNombre} value={formData.segundoNombre} onChange={handleChange} />
                    <CustomInput label="Primer Apellido" name="primerApellido" required error={formErrors.primerApellido} value={formData.primerApellido} onChange={handleChange} />
                    <CustomInput label="Segundo Apellido" name="segundoApellido" error={formErrors.segundoApellido} value={formData.segundoApellido} onChange={handleChange} />
                    <CustomSelect label="Tipo Documento" name="tipoDocumentoId" required error={formErrors.tipoDocumentoId} options={catalogos.documentos} value={formData.tipoDocumentoId} onChange={handleChange} />
                    <CustomInput label="Número Documento" name="numeroDocumento" required type="text" placeholder="Ej: 1234567890" error={formErrors.numeroDocumento} value={formData.numeroDocumento} onChange={handleChange} />
                    <CustomInput label="Fecha Nacimiento" name="fechaNacimiento" required type="date" error={formErrors.fechaNacimiento} value={formData.fechaNacimiento} onChange={handleChange} />
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-lg shadow-orange-200 overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-5 flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Clock size={18} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-white text-sm uppercase tracking-widest">Jornada y Horarios</h3>
                      <p className="text-orange-200 text-[10px] font-medium">Configura disponibilidad semanal</p>
                    </div>
                  </div>

                  {/* Días */}
                  <div className="px-6 pb-4 space-y-3">
                    <label className="block text-[10px] font-black uppercase text-orange-100 tracking-widest">Días de Atención <span className="text-white">*</span></label>
                    <div className="grid grid-cols-3 gap-2">
                      {diasSemana.map(d => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => toggleDia(d.id)}
                          className={`py-3 rounded-xl text-xs font-black transition-all duration-200 ${
                            formData.diasSeleccionados.includes(d.id)
                            ? 'bg-white text-orange-600 shadow-lg scale-[1.04]'
                            : 'bg-white/15 text-white hover:bg-white/30 border border-white/10'
                          }`}
                        >
                          {d.nombre}
                        </button>
                      ))}
                    </div>
                    {formErrors.diasSeleccionados && <p className="text-white text-xs font-medium bg-red-500/80 px-3 py-1.5 rounded-lg">{formErrors.diasSeleccionados}</p>}
                  </div>

                  {/* Horario */}
                  <div className="mx-4 mb-5 bg-white rounded-2xl p-5 space-y-4 shadow-inner">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <CalendarIcon size={12} /> Rango Horario
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Hora de Inicio <span className="text-red-500">*</span></label>
                        <input
                          type="time"
                          name="horaInicio"
                          className={`w-full bg-slate-50 border-2 ${formErrors.horaInicio ? 'border-red-400' : 'border-slate-200'} rounded-xl px-3 py-3 text-sm font-bold text-slate-800 outline-none focus:border-orange-400 focus:bg-orange-50 focus:text-orange-700 transition-all cursor-pointer`}
                          value={formData.horaInicio}
                          onChange={handleChange}
                        />
                        {formErrors.horaInicio && <p className="text-red-500 text-xs font-medium">{formErrors.horaInicio}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Hora de Fin <span className="text-red-500">*</span></label>
                        <input
                          type="time"
                          name="horaFin"
                          className={`w-full bg-slate-50 border-2 ${formErrors.horaFin ? 'border-red-400' : 'border-slate-200'} rounded-xl px-3 py-3 text-sm font-bold text-slate-800 outline-none focus:border-orange-400 focus:bg-orange-50 focus:text-orange-700 transition-all cursor-pointer`}
                          value={formData.horaFin}
                          onChange={handleChange}
                        />
                        {formErrors.horaFin && <p className="text-red-500 text-xs font-medium">{formErrors.horaFin}</p>}
                      </div>
                    </div>
                    {/* Preview visual del horario */}
                    <div className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-xl px-4 py-2.5">
                      <span className="text-orange-500 font-black text-sm">{formData.horaInicio}</span>
                      <div className="flex-1 mx-3 h-1 bg-orange-200 rounded-full relative">
                        <div className="absolute inset-y-0 left-0 right-0 bg-orange-400 rounded-full" />
                      </div>
                      <span className="text-orange-500 font-black text-sm">{formData.horaFin}</span>
                    </div>
                  </div>
                </section>

                <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                   <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Phone size={20} /></div>
                    <h3 className="font-bold text-slate-800">Contacto</h3>
                  </div>
                  <CustomInput label="Correo Laboral" name="correoLaboral" required icon={Mail} type="email" placeholder="Ej: correo@clinica.com" error={formErrors.correoLaboral} value={formData.correoLaboral} onChange={handleChange} />
                  <CustomInput label="Teléfono" name="telefonoContacto" required icon={Phone} type="text" placeholder="Ej: 3001234567" error={formErrors.telefonoContacto} value={formData.telefonoContacto} onChange={handleChange} />
                </section>

                <button type="submit" className="w-full bg-slate-800 text-white py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-900 transition-all flex items-center justify-center gap-3">
                  <Save size={20} /> {view === 'edit' ? 'Actualizar Terapeuta' : 'Guardar Terapeuta'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Terapeutas;