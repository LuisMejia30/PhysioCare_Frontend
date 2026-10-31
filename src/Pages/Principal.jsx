import React from 'react';
import { Activity } from 'lucide-react';

const FeatureItem = ({ title, description }) => (
  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-left">
    <h4 className="font-bold text-slate-800 mb-2">{title}</h4>
    <p className="text-sm text-slate-500">{description}</p>
  </div>
);

const WelcomeBanner = () => (
  <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-6">
    <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
      <Activity size={40} />
    </div>
    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Bienvenido al Panel de Control</h3>
    <p className="text-slate-500 max-w-md mx-auto">
      Gestione pacientes, asigne terapeutas y controle la agenda clínica desde un solo lugar.
    </p>

    <div className="grid md:grid-cols-3 gap-4 text-left mt-8">
      <FeatureItem title="Pacientes" description="Consulta, registra y actualiza historias clínicas." />
      <FeatureItem title="Agenda" description="Organiza citas y revisa la disponibilidad en tiempo real." />
      <FeatureItem title="Terapias" description="Ajusta servicios, especialidades y categorías del centro." />
    </div>
  </div>
);

const Principal = () => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <WelcomeBanner />
  </div>
);

export default Principal;