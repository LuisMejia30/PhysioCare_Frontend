import React, { useState, useEffect } from 'react';
import { Search, UserPlus, ArrowLeft, Save, User, Phone, Heart, Clipboard, RefreshCw, Eye, Edit, Trash2 } from 'lucide-react';

// --- COMPONENTES DE UI ---
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
    <div className="relative">
      <select
        className={`w-full px-4 py-3 bg-slate-50 border ${error ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700 appearance-none cursor-pointer`}
        {...props}
      >
        <option value="">Seleccione...</option>
        {options.map((opt, index) => (
          <option key={index} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
    {error && <p className="text-red-500 text-xs font-medium ml-1">{error}</p>}
  </div>
);

const Pacientes = () => {
  const [view, setView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Estados para catálogos (Dropdowns)
  const [catalogos, setCatalogos] = useState({
    tiposDoc: [],
    generos: [],
    sangre: [],
    civil: []
  });

  const initialState = {
    tipoDocumentoId: "",
    numeroDocumento: "",
    generoId: "",
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    tipoSangreId: "",
    fechaNacimiento: "",
    estadoCivilId: "",
    telefono: "",
    correoElectronico: "",
    direccionResidencia: "",
    telefonoEmergencia: "",
    resumenClinico: ""
  };

  const [formData, setFormData] = useState(initialState);

  // --- VALIDACIONES ---
  const validateForm = () => {
    const errors = {};
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    const soloDigitos = /^\d+$/;

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

    // Género (obligatorio)
    if (!formData.generoId) {
      errors.generoId = "El género es obligatorio.";
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

    // Tipo de Sangre (obligatorio)
    if (!formData.tipoSangreId) {
      errors.tipoSangreId = "El tipo de sangre es obligatorio.";
    }

    // Fecha de Nacimiento (obligatorio)
    if (!formData.fechaNacimiento) {
      errors.fechaNacimiento = "La fecha de nacimiento es obligatoria.";
    }

    // Estado Civil (obligatorio)
    if (!formData.estadoCivilId) {
      errors.estadoCivilId = "El estado civil es obligatorio.";
    }

    // Teléfono Personal: obligatorio, solo dígitos, exactamente 10 dígitos
    if (!formData.telefono.trim()) {
      errors.telefono = "El teléfono es obligatorio.";
    } else if (!soloDigitos.test(formData.telefono.trim())) {
      errors.telefono = "Solo se permiten números (sin letras ni caracteres especiales).";
    } else if (formData.telefono.trim().length !== 10) {
      errors.telefono = "Debe tener exactamente 10 dígitos.";
    }

    // Correo Electrónico: obligatorio, hasta 50 caracteres, formato válido
    if (!formData.correoElectronico.trim()) {
      errors.correoElectronico = "El correo electrónico es obligatorio.";
    } else if (formData.correoElectronico.trim().length > 50) {
      errors.correoElectronico = "Máximo 50 caracteres permitidos.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correoElectronico.trim())) {
      errors.correoElectronico = "Ingrese un correo electrónico válido.";
    }

    // Dirección de Residencia: obligatorio, entre 5 y 200 caracteres
    if (!formData.direccionResidencia.trim()) {
      errors.direccionResidencia = "La dirección de residencia es obligatoria.";
    } else if (formData.direccionResidencia.trim().length < 5 || formData.direccionResidencia.trim().length > 200) {
      errors.direccionResidencia = "Debe tener entre 5 y 200 caracteres.";
    }

    // Teléfono de Emergencia: obligatorio, solo dígitos, exactamente 10 dígitos
    if (!formData.telefonoEmergencia.trim()) {
      errors.telefonoEmergencia = "El teléfono de emergencia es obligatorio.";
    } else if (!soloDigitos.test(formData.telefonoEmergencia.trim())) {
      errors.telefonoEmergencia = "Solo se permiten números (sin letras ni caracteres especiales).";
    } else if (formData.telefonoEmergencia.trim().length !== 10) {
      errors.telefonoEmergencia = "Debe tener exactamente 10 dígitos.";
    }

    // Resumen Clínico: obligatorio, hasta 2000 caracteres
    if (!formData.resumenClinico.trim()) {
      errors.resumenClinico = "El resumen clínico es obligatorio.";
    } else if (formData.resumenClinico.trim().length > 2000) {
      errors.resumenClinico = "Máximo 2000 caracteres permitidos.";
    }

    return errors;
  };

  const fetchCatalogos = async () => {
    try {
      const baseUrl = 'https://localhost:7205/api/Catalogos';
      const [doc, gen, sang, civ] = await Promise.all([
        fetch(`${baseUrl}/TiposDocumento`).then(res => res.json()),
        fetch(`${baseUrl}/Generos`).then(res => res.json()),
        fetch(`${baseUrl}/TiposSangre`).then(res => res.json()),
        fetch(`${baseUrl}/EstadosCiviles`).then(res => res.json())
      ]);
      setCatalogos({ tiposDoc: doc, generos: gen, sangre: sang, civil: civ });
    } catch (err) {
      console.error("Error cargando catálogos:", err);
    }
  };

  const fetchPacientes = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://localhost:7205/api/Pacientes');
      if (response.ok) {
        const data = await response.json();
        setPacientes(data);
      }
    } catch (err) {
      console.error("Error al obtener pacientes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacientes();
    fetchCatalogos();
  }, []);

  const handleChange = (name, value) => {
    // Filtrado en tiempo real según el campo
    let filteredValue = value;

    // Campos que solo aceptan dígitos
    if (['numeroDocumento', 'telefono', 'telefonoEmergencia'].includes(name)) {
      filteredValue = value.replace(/\D/g, '');
    }

    // Campos que solo aceptan letras y espacios
    if (['primerNombre', 'segundoNombre', 'primerApellido', 'segundoApellido'].includes(name)) {
      filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
    }

    // Aplicar límites de longitud máxima
    const maxLengths = {
      numeroDocumento: 10,
      primerNombre: 25,
      segundoNombre: 25,
      primerApellido: 25,
      segundoApellido: 25,
      telefono: 10,
      telefonoEmergencia: 10,
      correoElectronico: 50,
      direccionResidencia: 200,
      resumenClinico: 2000
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

  const handleEdit = (paciente) => {
    setSelectedPaciente(paciente);
    setFormErrors({});
    setFormData({
      tipoDocumentoId: paciente.tipoDocumentoId || "",
      numeroDocumento: paciente.numeroDocumento ? String(paciente.numeroDocumento) : "",
      generoId: paciente.generoId || "",
      primerNombre: paciente.primerNombre || "",
      segundoNombre: paciente.segundoNombre || "",
      primerApellido: paciente.primerApellido || "",
      segundoApellido: paciente.segundoApellido || "",
      tipoSangreId: paciente.tipoSangreId || "",
      fechaNacimiento: paciente.fechaNacimiento ? paciente.fechaNacimiento.split('T')[0] : "",
      estadoCivilId: paciente.estadoCivilId || "",
      telefono: paciente.telefono ? String(paciente.telefono) : "",
      correoElectronico: paciente.correoElectronico || "",
      direccionResidencia: paciente.direccionResidencia || "",
      telefonoEmergencia: paciente.telefonoEmergencia ? String(paciente.telefonoEmergencia) : "",
      resumenClinico: paciente.resumenClinico || ""
    });
    setView('edit');
  };

  const handleView = (paciente) => {
    setSelectedPaciente(paciente);
    setView('detail');
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este paciente?")) {
      try {
        const response = await fetch(`https://localhost:7205/api/Pacientes/${id}`, { method: 'DELETE' });
        if (response.ok) {
          alert("Paciente eliminado con éxito.");
          fetchPacientes();
          setView('list');
        } else {
          alert("Error al eliminar el paciente.");
        }
      } catch (err) {
        console.error("Error de conexión:", err);
      }
    }
  };

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
    
    // CONSTRUCCIÓN DEL OBJETO EXACTO PARA EL BACKEND
    // Nota: Las propiedades virtuales se envían como null para evitar que el validador
    // de .NET intente crear objetos TipoDocumento, Genero, etc. vacíos.
    const payload = {
      id: selectedPaciente ? selectedPaciente.id : 0,
      tipoDocumentoId: parseInt(formData.tipoDocumentoId),
      tipoDocumento: null, 
      numeroDocumento: Number(formData.numeroDocumento),
      generoId: parseInt(formData.generoId),
      genero: null,
      primerNombre: formData.primerNombre.trim(),
      segundoNombre: formData.segundoNombre?.trim() || "",
      primerApellido: formData.primerApellido.trim(),
      segundoApellido: formData.segundoApellido?.trim() || "",
      tipoSangreId: parseInt(formData.tipoSangreId),
      tipoSangre: null,
      fechaNacimiento: formData.fechaNacimiento ? new Date(formData.fechaNacimiento).toISOString() : null,
      estadoCivilId: parseInt(formData.estadoCivilId),
      estadoCivil: null,
      telefono: Number(formData.telefono),
      correoElectronico: formData.correoElectronico?.trim() || "",
      direccionResidencia: formData.direccionResidencia?.trim() || "",
      telefonoEmergencia: formData.telefonoEmergencia ? Number(formData.telefonoEmergencia) : 0,
      resumenClinico: formData.resumenClinico?.trim() || ""
    };

    console.log("Enviando JSON:", payload);

    try {
      const url = view === 'edit' ? `https://localhost:7205/api/Pacientes/${selectedPaciente.id}` : 'https://localhost:7205/api/Pacientes';
      const response = await fetch(url, {
        method: view === 'edit' ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("Paciente guardado con éxito.");
        setFormData(initialState);
        setFormErrors({});
        fetchPacientes();
        setView('list');
      } else {
        const errorData = await response.json();
        console.error("ERROR DEL SERVIDOR (400):", errorData);
        
        // Si hay errores de validación, los mostramos detalladamente en consola
        if (errorData.errors) {
            console.warn("Detalles de validación fallida:");
            Object.keys(errorData.errors).forEach(key => {
                console.error(`Campo: ${key} -> Mensaje: ${errorData.errors[key].join(', ')}`);
            });
        }
        alert("Error al guardar. Revisa la consola (F12) para ver qué campo no cumple los requisitos.");
      }
    } catch (err) {
      console.error("Error de conexión:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Gestión de Pacientes</h2>
          <p className="text-slate-500 text-sm">Registro de pacientes y su historial.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={fetchPacientes} className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => { setFormData(initialState); setSelectedPaciente(null); setFormErrors({}); setView(view === 'list' ? 'register' : 'list'); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 font-bold shadow-lg transition-all"
          >
            {view === 'list' ? <><UserPlus size={20} /> Nuevo Paciente</> : <><ArrowLeft size={20} /> Volver</>}
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o cédula..." 
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-slate-400 text-xs uppercase border-b border-slate-100">
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Documento</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pacientes.filter(p => p.primerNombre.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-medium text-slate-700">{p.primerNombre} {p.primerApellido}</td>
                    <td className="px-4 py-4 text-sm text-slate-500 font-mono">{p.numeroDocumento}</td>
                    <td className="px-4 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => handleView(p)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors" title="Ver Detalle"><Eye size={18} /></button>
                      <button onClick={() => handleEdit(p)} className="p-2 text-slate-400 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 rounded-lg transition-colors" title="Editar"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : view === 'detail' && selectedPaciente ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
             <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Detalles del Paciente</h3>
             <div className="flex gap-3">
               <button onClick={() => handleEdit(selectedPaciente)} className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-100 transition-all"><Edit size={18}/> Editar</button>
               <button onClick={() => handleDelete(selectedPaciente.id)} className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-all"><Trash2 size={18}/> Eliminar</button>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Completo</p>
              <p className="font-bold text-slate-800">{selectedPaciente.primerNombre} {selectedPaciente.segundoNombre} {selectedPaciente.primerApellido} {selectedPaciente.segundoApellido}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Documento</p>
              <p className="font-bold text-slate-800">{catalogos.tiposDoc.find(c => c.id === selectedPaciente.tipoDocumentoId)?.nombre || selectedPaciente.tipoDocumentoId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Número Documento</p>
              <p className="font-bold text-slate-800">{selectedPaciente.numeroDocumento}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Género</p>
              <p className="font-bold text-slate-800">{catalogos.generos.find(c => c.id === selectedPaciente.generoId)?.nombre || selectedPaciente.generoId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Sangre</p>
              <p className="font-bold text-slate-800">{catalogos.sangre.find(c => c.id === selectedPaciente.tipoSangreId)?.nombre || selectedPaciente.tipoSangreId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha de Nacimiento</p>
              <p className="font-bold text-slate-800">{selectedPaciente.fechaNacimiento ? new Date(selectedPaciente.fechaNacimiento).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado Civil</p>
              <p className="font-bold text-slate-800">{catalogos.civil.find(c => c.id === selectedPaciente.estadoCivilId)?.nombre || selectedPaciente.estadoCivilId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teléfono Personal</p>
              <p className="font-bold text-slate-800">{selectedPaciente.telefono || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teléfono Emergencia</p>
              <p className="font-bold text-slate-800 text-red-600">{selectedPaciente.telefonoEmergencia || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Correo Electrónico</p>
              <p className="font-bold text-slate-800">{selectedPaciente.correoElectronico || 'N/A'}</p>
            </div>
            <div className="space-y-1 lg:col-span-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dirección de Residencia</p>
              <p className="font-bold text-slate-800">{selectedPaciente.direccionResidencia || 'N/A'}</p>
            </div>
            <div className="space-y-1 lg:col-span-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resumen Clínico</p>
              <p className="font-medium text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">{selectedPaciente.resumenClinico || 'Sin información clínica registrada.'}</p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-8 space-y-8">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CustomSelect 
                label="Tipo de Documento" 
                required
                error={formErrors.tipoDocumentoId}
                options={catalogos.tiposDoc.map(t => ({ value: t.id, label: t.nombre }))}
                value={formData.tipoDocumentoId}
                onChange={(e) => handleChange('tipoDocumentoId', e.target.value)}
              />
              <CustomInput 
                label="Número Identificación" 
                required 
                type="text"
                placeholder="Ej: 1234567890"
                error={formErrors.numeroDocumento}
                value={formData.numeroDocumento}
                onChange={(e) => handleChange('numeroDocumento', e.target.value)}
              />
              <CustomSelect 
                label="Género" 
                required
                error={formErrors.generoId}
                options={catalogos.generos.map(g => ({ value: g.id, label: g.nombre }))}
                value={formData.generoId}
                onChange={(e) => handleChange('generoId', e.target.value)}
              />
            </section>

            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <CustomInput label="Primer Nombre" required error={formErrors.primerNombre} value={formData.primerNombre} onChange={(e) => handleChange('primerNombre', e.target.value)} />
                <CustomInput label="Segundo Nombre" error={formErrors.segundoNombre} value={formData.segundoNombre} onChange={(e) => handleChange('segundoNombre', e.target.value)} />
                <CustomInput label="Primer Apellido" required error={formErrors.primerApellido} value={formData.primerApellido} onChange={(e) => handleChange('primerApellido', e.target.value)} />
                <CustomInput label="Segundo Apellido" error={formErrors.segundoApellido} value={formData.segundoApellido} onChange={(e) => handleChange('segundoApellido', e.target.value)} />
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CustomSelect 
                  label="Tipo de Sangre" 
                  required
                  error={formErrors.tipoSangreId}
                  options={catalogos.sangre.map(s => ({ value: s.id, label: s.nombre }))}
                  value={formData.tipoSangreId}
                  onChange={(e) => handleChange('tipoSangreId', e.target.value)}
                />
                <CustomInput label="Fecha Nacimiento" required type="date" error={formErrors.fechaNacimiento} value={formData.fechaNacimiento} onChange={(e) => handleChange('fechaNacimiento', e.target.value)} />
                <CustomSelect 
                  label="Estado Civil" 
                  required
                  error={formErrors.estadoCivilId}
                  options={catalogos.civil.map(c => ({ value: c.id, label: c.nombre }))}
                  value={formData.estadoCivilId}
                  onChange={(e) => handleChange('estadoCivilId', e.target.value)}
                />
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CustomInput label="Teléfono Personal" required type="text" placeholder="Ej: 3001234567" error={formErrors.telefono} value={formData.telefono} onChange={(e) => handleChange('telefono', e.target.value)} />
                <CustomInput label="Correo Electrónico" required type="email" placeholder="Ej: correo@ejemplo.com" error={formErrors.correoElectronico} value={formData.correoElectronico} onChange={(e) => handleChange('correoElectronico', e.target.value)} />
                <CustomInput label="Tel. Emergencia" required type="text" placeholder="Ej: 3009876543" error={formErrors.telefonoEmergencia} value={formData.telefonoEmergencia} onChange={(e) => handleChange('telefonoEmergencia', e.target.value)} />
            </section>

            <section className="space-y-4">
              <CustomInput label="Dirección de Residencia" required error={formErrors.direccionResidencia} value={formData.direccionResidencia} onChange={(e) => handleChange('direccionResidencia', e.target.value)} />
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Resumen Clínico <span className="text-red-500">*</span></label>
                <textarea 
                    className={`w-full px-4 py-3 bg-slate-50 border ${formErrors.resumenClinico ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} rounded-xl outline-none min-h-[100px] focus:ring-2 focus:ring-blue-500`}
                    value={formData.resumenClinico}
                    onChange={(e) => handleChange('resumenClinico', e.target.value)}
                />
                <div className="flex justify-between items-center">
                  {formErrors.resumenClinico && <p className="text-red-500 text-xs font-medium ml-1">{formErrors.resumenClinico}</p>}
                  <p className="text-slate-400 text-xs ml-auto">{formData.resumenClinico.length}/2000</p>
                </div>
              </div>
            </section>
          </div>

          <div className="bg-slate-50 p-8 flex justify-end gap-4 border-t border-slate-100">
            <button type="button" onClick={() => { setView('list'); setSelectedPaciente(null); setFormErrors({}); }} className="px-6 py-3 font-bold text-slate-400">Cancelar</button>
            <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-10 py-3 rounded-xl hover:bg-blue-700 font-bold shadow-lg">
              <Save size={20} /> {view === 'edit' ? 'Actualizar Paciente' : 'Guardar Paciente'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Pacientes;