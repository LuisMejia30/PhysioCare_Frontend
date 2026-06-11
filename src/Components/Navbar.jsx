import { Menu, PlusCircle, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate(); // Hook para la navegación

  const pageNames = {
    '/': 'Principal',
    '/pacientes': 'Gestión de Pacientes',
    '/terapeutas': 'Gestión de Terapeutas',
    '/terapias': 'Catálogo de Terapias',
    '/citas': 'Agenda de Citas',
    '/reportes': 'Reportes y Estadísticas'
  };

  const handleNuevaCita = () => {
    // Navegamos a la ruta de citas pasándole un estado para indicar que queremos abrir el registro
    navigate('/citas', { state: { abrirRegistro: true } });
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 text-slate-600">
          <Menu size={24} />
        </button>
        <h2 className="text-xl font-bold text-slate-800">
          {pageNames[location.pathname] || 'PhysioCare'}
        </h2>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={handleNuevaCita} // Evento de clic
          className="hidden md:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-md transition-all active:scale-95"
        >
          <PlusCircle size={18} /> Nueva Cita
        </button>
        <button 
          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors" 
          title="Cerrar Sesión"
        >
          <LogOut size={22} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;