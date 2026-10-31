const CustomInput = ({ label, type = 'text', placeholder, required = false, error, icon: Icon, ...props }) => (
  <div className="space-y-2 w-full">
    {label && (
      <label className="block text-sm font-bold text-slate-700 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}

    <div className="relative group">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
          <Icon size={18} />
        </div>
      )}

      <input
        type={type}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-11' : 'px-4'} pr-4 py-3 bg-slate-50 border ${error ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700`}
        {...props}
      />
    </div>

    {error && <p className="text-red-500 text-xs font-medium ml-1">{error}</p>}
  </div>
);

export default CustomInput;