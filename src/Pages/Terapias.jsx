import React, { useState, useEffect } from 'react';
import { Search, Plus, ArrowLeft, Save, Activity, FileText, RefreshCw, Tag, AlertCircle, CheckCircle2, Award, Eye, Edit, Trash2 } from 'lucide-react';

// --- COMPONENTES DE UI (CON SOPORTE DE ERRORES) ---
const CustomInput = ({ label, icon: Icon, required, type = "text", error, ...props }) => (
  <div className="space-y-2">
    <label className="block text-sm font-bold text-slate-700 ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors">
          <Icon size={18} />
        </div>
      )}
      <input
        type={type}
        className={`w-full ${Icon ? 'pl-11' : 'px-4'} pr-4 py-3 bg-slate-50 border ${error ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} rounded-xl outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-slate-700`}
        {...props}
      />
    </div>
    {error && <p className="text-red-500 text-xs font-medium ml-1">{error}</p>}
  </div>
);

const CustomSelect = ({ label, options, required, icon: Icon, disabled, error, ...props }) => (
  <div className="space-y-2">
    <label className="block text-sm font-bold text-slate-700 ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors pointer-events-none">
          <Icon size={18} />
        </div>
      )}
      <select
        disabled={disabled}
        className={`w-full ${Icon ? 'pl-11' : 'px-4'} pr-10 py-3 ${disabled ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'bg-slate-50 text-slate-700'} border ${error ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} rounded-xl outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all appearance-none`}
        {...props}
      >
        <option value="">{disabled ? 'Seleccione especialidad primero...' : 'Seleccione una opción...'}</option>
        {options && options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.nombre}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
    {error && <p className="text-red-500 text-xs font-medium ml-1">{error}</p>}
  </div>
);

const Terapias = () => {
  const [view, setView] = useState('list');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [terapias, setTerapias] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
  const [selectedTerapia, setSelectedTerapia] = useState(null);
  
  const [message, setMessage] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // --- CONFIGURACIÓN DE URL ---
  // Cambiado a ServicioTerapias según el nombre de tu controlador
  const API_BASE = "https://localhost:7205/api"; 
  const ENDPOINT_TERAPIAS = `${API_BASE}/ServicioTerapias`;

  const initialFormState = {
    nombreServicio: '',
    especialidadId: '', 
    CategoriaTerapiaId: '',
    descripcion: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- VALIDACIONES ---
  const validateForm = () => {
    const errors = {};

    // Nombre del Servicio: obligatorio, entre 3 y 50 caracteres, sin números
    if (!formData.nombreServicio.trim()) {
      errors.nombreServicio = "El nombre del servicio es obligatorio.";
    } else if (/\d/.test(formData.nombreServicio)) {
      errors.nombreServicio = "El nombre no debe contener números.";
    } else if (formData.nombreServicio.trim().length < 3 || formData.nombreServicio.trim().length > 50) {
      errors.nombreServicio = "Debe tener entre 3 y 50 caracteres.";
    }

    // Especialidad (obligatorio)
    if (!formData.especialidadId) {
      errors.especialidadId = "La especialidad es obligatoria.";
    }

    // Categoría (obligatorio)
    if (!formData.CategoriaTerapiaId) {
      errors.CategoriaTerapiaId = "La categoría es obligatoria.";
    }

    // Descripción: obligatorio, hasta 2000 caracteres
    if (!formData.descripcion.trim()) {
      errors.descripcion = "La descripción es obligatoria.";
    } else if (formData.descripcion.trim().length > 2000) {
      errors.descripcion = "Máximo 2000 caracteres permitidos.";
    }

    return errors;
  };

  useEffect(() => {
    fetchTerapias();
    fetchEspecialidades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTerapias = async () => {
    try {
      const res = await fetch(ENDPOINT_TERAPIAS);
      if (res.ok) {
        const data = await res.json();
        setTerapias(data);
      }
    } catch (err) { 
      console.error("Error al cargar terapias:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const fetchEspecialidades = async () => {
    try {
      const res = await fetch(`${API_BASE}/Catalogos/Especialidades`);
      if (res.ok) setEspecialidades(await res.json());
    } catch (err) { console.error("Error API Especialidades:", err); }
  };

  useEffect(() => {
    const fetchCategorias = async () => {
      if (!formData.especialidadId) {
        setCategoriasFiltradas([]);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/Catalogos/CategoriasPorEspecialidad/${formData.especialidadId}`);
        if (res.ok) setCategoriasFiltradas(await res.json());
      } catch (err) { console.error("Error API Categorías:", err); }
    };
    fetchCategorias();
  }, [formData.especialidadId]);

  const handleChange = (field, value) => {
    let filteredValue = value;

    // Filtrado en tiempo real: nombre del servicio sin números
    if (field === 'nombreServicio') {
      filteredValue = value.replace(/\d/g, '');
    }

    // Aplicar límites de longitud máxima
    const maxLengths = {
      nombreServicio: 50,
      descripcion: 2000
    };

    if (maxLengths[field] && filteredValue.length > maxLengths[field]) {
      filteredValue = filteredValue.slice(0, maxLengths[field]);
    }

    if (field === 'especialidadId') {
      setFormData(prev => ({ ...prev, especialidadId: filteredValue, CategoriaTerapiaId: '' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: filteredValue }));
    }

    // Limpiar el error del campo cuando el usuario empieza a corregir
    if (formErrors[field]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleEdit = (terapia) => {
    setSelectedTerapia(terapia);
    setFormErrors({});
    setMessage(null);
    setFormData({
      nombreServicio: terapia.nombreServicio || '',
      especialidadId: terapia.categoriaTerapia?.especialidadTerapeutaId || '', 
      CategoriaTerapiaId: terapia.categoriaTerapiaId || '',
      descripcion: terapia.descripcion || ''
    });
    setView('edit');
  };

  const handleView = (terapia) => {
    setSelectedTerapia(terapia);
    setView('detail');
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este servicio de terapia?")) {
      try {
        const response = await fetch(`${ENDPOINT_TERAPIAS}/${id}`, { method: 'DELETE' });
        if (response.ok) {
          alert("Servicio eliminado con éxito.");
          fetchTerapias();
          setView('list');
        } else {
          alert("Error al eliminar el servicio.");
        }
      } catch (err) {
        console.error("Error de conexión:", err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    // Ejecutar validaciones
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      setSaving(false);
      // Hacer scroll al primer error
      setTimeout(() => {
        const firstErrorField = document.querySelector('.text-red-500.text-xs');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    // Objeto exacto que espera ServicioTerapia.cs
    const payload = {
      id: selectedTerapia ? selectedTerapia.id : 0,
      nombreServicio: formData.nombreServicio.trim(),
      // IMPORTANTE: Convertir a Number para evitar Error 400 en el backend
      categoriaTerapiaId: Number(formData.CategoriaTerapiaId),
      descripcion: formData.descripcion?.trim() || ""
    };

    console.log("Enviando datos a:", ENDPOINT_TERAPIAS, payload);

    try {
      const url = view === 'edit' ? `${ENDPOINT_TERAPIAS}/${selectedTerapia.id}` : ENDPOINT_TERAPIAS;
      const response = await fetch(url, {
        method: view === 'edit' ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '¡Servicio registrado con éxito!' });
        setTimeout(() => {
          setView('list');
          fetchTerapias();
          setFormData(initialFormState);
          setFormErrors({});
          setMessage(null);
        }, 1500);
      } else {
        // Capturamos el error detallado de .NET
        const errorData = await response.json();
        console.error("Error detallado del servidor:", errorData);
        
        let errorMsg = "No se pudo guardar la terapia.";
        
        // Manejo de errores de validación de ModelState de .NET
        if (errorData.errors) {
            errorMsg = Object.values(errorData.errors).flat().join(". ");
        } else if (errorData.title) {
            errorMsg = errorData.title;
        }

        setMessage({ type: 'error', text: errorMsg });
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      setMessage({ type: 'error', text: 'Error crítico: No hay conexión con el servidor API.' });
    } finally {
      setSaving(false);
    }
  };

  // Renderizado de Lista
  if (view === 'list') {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-800">Servicios de Terapia</h1>
            <p className="text-slate-500 font-medium">Catálogo activo en la clínica</p>
          </div>
          <button 
            onClick={() => {
              setView('form');
              setSelectedTerapia(null);
              setFormData(initialFormState);
              setFormErrors({});
              setMessage(null);
            }}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
            <Plus size={20} />
            Nuevo Servicio
          </button>
        </header>

        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
          <input 
            type="text" 
            placeholder="Filtrar por nombre del servicio..." 
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <RefreshCw className="animate-spin text-purple-600" size={40} />
            <p className="text-slate-400 font-bold">Cargando catálogo...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {terapias
              .filter(t => t.nombreServicio?.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(t => (
                <div key={t.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <Activity size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">REF: {t.id}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-1 leading-tight">{t.nombreServicio}</h3>
                  <div className="flex items-center gap-2 text-purple-500 text-xs font-bold mb-3">
                    <Tag size={12} /> {t.categoriaTerapia?.nombre || 'General'}
                  </div>
                  <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed flex-1">
                    {t.descripcion || 'Sin descripción disponible.'}
                  </p>
                  
                  <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-50">
                    <button onClick={() => handleView(t)} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"><Eye size={14}/> Ver</button>
                    <button onClick={() => handleEdit(t)} className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"><Edit size={14}/> Editar</button>
                    <button onClick={() => handleDelete(t.id)} className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors"><Trash2 size={14}/> Eliminar</button>
                  </div>
                </div>
              ))}
            
            {terapias.length === 0 && !loading && (
              <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">No hay servicios registrados todavía.</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (view === 'detail' && selectedTerapia) {
    return (
      <div className="min-h-screen p-6 md:p-12 bg-slate-50">
        <div className="max-w-3xl mx-auto space-y-6">
          <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-400 hover:text-purple-600 font-bold mb-2 transition-colors">
            <ArrowLeft size={20} /> Volver al catálogo
          </button>
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
             <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-6 relative z-10">
               <div>
                 <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">{selectedTerapia.nombreServicio}</h1>
                 <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest">
                   <Tag size={14}/> {selectedTerapia.categoriaTerapia?.nombre || 'General'}
                 </span>
               </div>
               <div className="flex flex-col sm:flex-row gap-2">
                 <button onClick={() => handleEdit(selectedTerapia)} className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold hover:bg-emerald-100 transition-all"><Edit size={16}/> Editar</button>
                 <button onClick={() => handleDelete(selectedTerapia.id)} className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-red-100 transition-all"><Trash2 size={16}/> Eliminar</button>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Especialidad</p>
                <p className="font-bold text-slate-800 text-lg flex items-center gap-2"><Award size={18} className="text-purple-400"/> {especialidades.find(e => e.id === selectedTerapia.categoriaTerapia?.especialidadTerapeutaId)?.nombre || 'No especificada'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Referencia del Sistema</p>
                <p className="font-mono font-bold text-slate-600 text-lg bg-slate-50 px-3 py-1 rounded-lg inline-block border border-slate-100">REF-{selectedTerapia.id}</p>
              </div>
              <div className="space-y-3 md:col-span-2 mt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descripción del Tratamiento</p>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedTerapia.descripcion || 'Este servicio no cuenta con una descripción detallada en el sistema actualmente.'}</p>
                </div>
              </div>
            </div>
            <Activity className="absolute -bottom-10 -right-10 text-slate-50 w-64 h-64 z-0 pointer-events-none" strokeWidth={1} />
          </div>
        </div>
      </div>
    );
  }

  // Renderizado de Formulario
  return (
    <div className="min-h-screen p-6 md:p-12 bg-slate-50">
      <div className="max-w-2xl mx-auto">
        <button 
            onClick={() => {
              setView('list');
              setSelectedTerapia(null);
              setFormData(initialFormState);
              setFormErrors({});
              setMessage(null);
            }} 
          className="flex items-center gap-2 text-slate-400 hover:text-purple-600 font-bold mb-6 transition-colors"
        >
          <ArrowLeft size={20} /> Volver al catálogo
        </button>

        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="p-10 bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
            <h2 className="text-3xl font-black">{view === 'edit' ? 'Editar Terapia' : 'Crear Terapia'}</h2>
            <p className="text-purple-100 opacity-80 mt-1">{view === 'edit' ? 'Modifique los detalles del servicio terapéutico' : 'Defina los detalles del nuevo servicio terapéutico'}</p>
          </div>

          <div className="p-10 space-y-8">
            {message && (
              <div className={`p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="mt-0.5" size={18}/> : <AlertCircle className="mt-0.5" size={18}/>}
                <div className="text-sm font-bold leading-tight">{message.text}</div>
              </div>
            )}

            <CustomInput 
              label="Nombre del Servicio" 
              icon={Activity} 
              required 
              placeholder="Ej: Masaje Descontracturante"
              error={formErrors.nombreServicio}
              value={formData.nombreServicio}
              onChange={(e) => handleChange('nombreServicio', e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CustomSelect 
                label="Especialidad" 
                icon={Award} 
                required 
                error={formErrors.especialidadId}
                options={especialidades}
                value={formData.especialidadId}
                onChange={(e) => handleChange('especialidadId', e.target.value)}
              />

              <CustomSelect 
                label="Categoría" 
                icon={Tag} 
                required 
                disabled={!formData.especialidadId}
                error={formErrors.CategoriaTerapiaId}
                options={categoriasFiltradas}
                value={formData.CategoriaTerapiaId}
                onChange={(e) => handleChange('CategoriaTerapiaId', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2 ml-1">
                <FileText size={16} className="text-purple-500" /> Descripción del Servicio <span className="text-red-500">*</span>
              </label>
              <textarea 
                placeholder="Explique en qué consiste el tratamiento..."
                className={`w-full p-5 bg-slate-50 border ${formErrors.descripcion ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 min-h-[140px] transition-all resize-none text-slate-700`}
                value={formData.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
              />
              <div className="flex justify-between items-center">
                {formErrors.descripcion && <p className="text-red-500 text-xs font-medium ml-1">{formErrors.descripcion}</p>}
                <p className="text-slate-400 text-xs ml-auto">{formData.descripcion.length}/2000</p>
              </div>
            </div>
          </div>

          <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4">
             <button
              type="button"
              onClick={() => { setView('list'); setSelectedTerapia(null); setFormData(initialFormState); setFormErrors({}); setMessage(null); }}
              className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-[2] bg-purple-600 text-white py-4 rounded-2xl hover:bg-purple-700 font-black flex items-center justify-center gap-3 disabled:opacity-50 transition-all shadow-xl shadow-purple-100 transform hover:-translate-y-1"
            >
              {saving ? <RefreshCw className="animate-spin" size={20}/> : <Save size={22} />}
              {saving ? "Procesando..." : (view === 'edit' ? "Actualizar Servicio" : "Guardar Servicio")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Terapias;