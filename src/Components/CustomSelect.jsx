import React from 'react';

const CustomSelect = ({ label, options = [], required = false, error, icon: Icon, disabled = false, ...props }) => (
  <div className="space-y-2 w-full">
    {label && (
      <label className="block text-sm font-bold text-slate-700 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}

    <div className="relative group">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
          <Icon size={18} />
        </div>
      )}

      <select
        disabled={disabled}
        className={`w-full ${Icon ? 'pl-11' : 'px-4'} pr-10 py-3 ${disabled ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'bg-slate-50 text-slate-700'} border ${error ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none`}
        {...props}
      >
        <option value="">{disabled ? 'Seleccione una opción primero...' : 'Seleccione una opción...'}</option>
        {options.map((opt, index) => (
          <option key={opt.value ?? opt.id ?? index} value={opt.value ?? opt.id ?? ''}>
            {opt.label ?? opt.nombre ?? opt}
          </option>
        ))}
      </select>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    {error && <p className="text-red-500 text-xs font-medium ml-1">{error}</p>}
  </div>
);

export default CustomSelect;