const CustomInput = ({ label, type = "text", placeholder, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
    <input 
      type={type}
      placeholder={placeholder}
      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700"
      {...props} 
    />
  </div>
);

export default CustomInput;