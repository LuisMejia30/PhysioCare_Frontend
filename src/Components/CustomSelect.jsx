const CustomSelect = ({ label, options = [], ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
    <select 
      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 appearance-none"
      {...props}
    >
      <option value="">Seleccione una opción</option>
      {options.map((opt, index) => (
        <option key={index} value={opt.value || opt}>{opt.label || opt}</option>
      ))}
    </select>
  </div>
);

export default CustomSelect;