import { Menu, PlusCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.rol || 'Paciente';
  const canCreateCita = userRole === 'Administrador' || userRole === 'Recepcionista' || userRole === 'Paciente';

  const pageNames = {
    '/': 'Principal',
    '/pacientes': 'Gestión de Pacientes',
    '/terapeutas': 'Gestión de Terapeutas',
    '/terapias': 'Catálogo de Terapias',
    '/citas': 'Agenda de Citas',
    '/reportes': 'Reportes y Estadísticas'
  };

  const handleNuevaCita = () => {
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
        {canCreateCita && (
          <button 
            onClick={handleNuevaCita}
            className="hidden md:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-md transition-all active:scale-95"
          >
            <PlusCircle size={18} /> Nueva Cita
          </button>
        )}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-black text-sm">
            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-none">{user.username || 'Usuario'}</p>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">{userRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;