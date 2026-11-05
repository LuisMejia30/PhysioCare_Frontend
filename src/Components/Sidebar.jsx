import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, UserCog, Stethoscope, ClipboardList, BarChart3, LogOut, Calendar, Activity } from 'lucide-react';

const Sidebar = ({ isOpen, toggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Obtenemos los datos del usuario logueado desde localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.rol || 'Paciente'; // Rol por defecto si no se ha asignado uno

  // Configuración de menús adaptados dinámicamente por rol
  const roleMenus = {
    Administrador: [
      { name: 'Principal', icon: <Home size={20}/>, path: '/dashboard' },
      { name: 'Pacientes', icon: <Users size={20}/>, path: '/pacientes' },
      { name: 'Terapeutas', icon: <UserCog size={20}/>, path: '/terapeutas' },
      { name: 'Terapias', icon: <Stethoscope size={20}/>, path: '/terapias' },
      { name: 'Citas', icon: <ClipboardList size={20}/>, path: '/citas' },
      { name: 'Reportes', icon: <BarChart3 size={20}/>, path: '/reportes' },
    ],
    Recepcionista: [
      { name: 'Principal', icon: <Home size={20}/>, path: '/dashboard' },
      { name: 'Pacientes', icon: <Users size={20}/>, path: '/pacientes' },
      { name: 'Citas', icon: <ClipboardList size={20}/>, path: '/citas' },
      { name: 'Terapias', icon: <Stethoscope size={20}/>, path: '/terapias' },
    ],
    Terapeuta: [
      { name: 'Mi Agenda', icon: <Calendar size={20}/>, path: '/citas' },
      { name: 'Mis Pacientes', icon: <Users size={20}/>, path: '/pacientes' },
      { name: 'Mis Sesiones', icon: <Activity size={20}/>, path: '/reportes' },
    ],
    Paciente: [
      { name: 'Mi Resumen', icon: <Home size={20}/>, path: '/resumen' },
      { name: 'Mis Citas', icon: <Calendar size={20}/>, path: '/citas' },
      { name: 'Mi Tratamiento', icon: <Activity size={20}/>, path: '/reportes' },
    ]
  };

  // Seleccionamos los ítems de menú según el rol (fallback a paciente)
  const menuItems = roleMenus[userRole] || roleMenus['Paciente'];

  const handleLogout = () => {
    // Limpieza completa de sesión JWT y credenciales locales
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    sessionStorage.clear();

    // Redirección directa al Login
    navigate('/login');
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 lg:translate-x-0 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:static h-screen`}>
      {/* Encabezado con nombre del sistema y badge dinámico de Rol */}
      <div className="p-6 border-b border-slate-800">
        <div className="text-2xl font-bold text-blue-400">PhysioCare</div>
        <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
          {userRole}
        </span>
      </div>
      
      {/* Navegación según permisos */}
      <nav className="mt-6 px-4 space-y-2 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={toggle}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon} <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Botón de Cierre de Sesión al final de la barra lateral */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 p-3 rounded-xl transition-all text-red-400 hover:bg-red-500/10 hover:text-red-300 font-semibold"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;