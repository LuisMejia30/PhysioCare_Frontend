import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-900">
      {/* Fondo oscuro para móvil cuando el sidebar está abierto */}
      {isSidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Barra lateral fija que nunca se corta al hacer scroll */}
      <Sidebar isOpen={isSidebarOpen} toggle={() => setSidebarOpen(false)} />

      {/* Área de contenido: Navbar fijo arriba y main con scroll independiente */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="w-full mx-auto max-w-7xl pb-16">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;