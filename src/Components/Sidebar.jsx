import { Link, useLocation } from 'react-router-dom';
import { Home, Users, UserCog, Stethoscope, ClipboardList, BarChart3, LogOut } from 'lucide-react';

const Sidebar = ({ isOpen, toggle }) => {
  const location = useLocation();
  
  const menuItems = [
    { name: 'Principal', icon: <Home size={20}/>, path: '/' },
    { name: 'Pacientes', icon: <Users size={20}/>, path: '/pacientes' },
    { name: 'Terapeutas', icon: <UserCog size={20}/>, path: '/terapeutas' },
    { name: 'Terapias', icon: <Stethoscope size={20}/>, path: '/terapias' },
    { name: 'Citas', icon: <ClipboardList size={20}/>, path: '/citas' },
    { name: 'Reportes', icon: <BarChart3 size={20}/>, path: '/reportes' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    window.location.href = '/login';
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 lg:translate-x-0 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:static`}>
      <div className="p-6 text-2xl font-bold border-b border-slate-800 text-blue-400">PhysioCare</div>
      
      <nav className="mt-6 px-4 space-y-2 flex-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            onClick={toggle}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${location.pathname === item.path ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            {item.icon} <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 p-3 rounded-xl transition-all text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={20} /> <span className="font-bold">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;