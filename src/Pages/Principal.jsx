import React from 'react';
import { Activity } from 'lucide-react';

const Principal = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Banner de Bienvenida */}
      <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
          <Activity size={40} />
        </div>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Bienvenido al Panel de Control</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Gestione pacientes, asigne terapeutas y controle la agenda clínica desde un solo lugar.
        </p>
      </div>
    </div>
  );
};

export default Principal;