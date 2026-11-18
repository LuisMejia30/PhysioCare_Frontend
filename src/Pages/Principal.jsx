import React from 'react';
import { Activity, Users, Calendar, Stethoscope, ClipboardList, BarChart3, ChevronRight, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeatureCard = ({ title, description, icon: Icon, path, linkText }) => (
  <div className="bg-slate-50 hover:bg-blue-50/50 transition-all rounded-2xl border border-slate-200 p-6 text-left flex flex-col justify-between group">
    <div>
      <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
        {Icon && <Icon size={24} />}
      </div>
      <h4 className="font-bold text-slate-800 text-lg mb-2">{title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed mb-4">{description}</p>
    </div>
    {path && (
      <Link 
        to={path} 
        className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 group-hover:text-blue-700 hover:underline"
      >
        {linkText || 'Ir al módulo'} <ChevronRight size={16} />
      </Link>
    )}
  </div>
);

const Principal = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.rol || 'Paciente';

  const roleConfigs = {
    Administrador: {
      title: `Bienvenido, ${user.username || 'Administrador'}`,
      subtitle: 'Panel de Administración General - PhysioCare',
      description: 'Gestione pacientes, personal terapéutico, servicios de fisioterapia y supervise la agenda médica general.',
      features: [
        {
          title: 'Pacientes',
          description: 'Consulta, crea y administra las historias clínicas y fichas de contacto.',
          icon: Users,
          path: '/pacientes',
          linkText: 'Ver Directorio'
        },
        {
          title: 'Agenda Médica',
          description: 'Revisa, programa y asigna citas clínicas con terapeutas en tiempo real.',
          icon: Calendar,
          path: '/citas',
          linkText: 'Abrir Agenda'
        },
        {
          title: 'Terapeutas y Terapias',
          description: 'Administra profesionales, especialidades y el catálogo de tratamientos.',
          icon: Stethoscope,
          path: '/terapias',
          linkText: 'Ver Catálogo'
        }
      ]
    },
    Recepcionista: {
      title: `Bienvenido, ${user.username || 'Recepcionista'}`,
      subtitle: 'Módulo de Recepción y Agendamiento',
      description: 'Coordine la atención al paciente, registre citas y mantenga actualizada la agenda médica.',
      features: [
        {
          title: 'Registro de Pacientes',
          description: 'Ingresa nuevos pacientes y actualiza sus números de contacto.',
          icon: Users,
          path: '/pacientes',
          linkText: 'Gestionar Pacientes'
        },
        {
          title: 'Agenda de Citas',
          description: 'Programa citas, revisa disponibilidades y atiende cancelaciones.',
          icon: Calendar,
          path: '/citas',
          linkText: 'Gestionar Citas'
        },
        {
          title: 'Servicios Disponibles',
          description: 'Consulta las especialidades y servicios de fisioterapia del centro.',
          icon: Stethoscope,
          path: '/terapias',
          linkText: 'Ver Terapias'
        }
      ]
    },
    Terapeuta: {
      title: `Hola, Terapeuta ${user.username || ''}`,
      subtitle: 'Portal de Atención Terapéutica',
      description: 'Acceda a su agenda de consultas personal, revise los pacientes asignados y actualice el estado de las sesiones.',
      features: [
        {
          title: 'Mi Agenda',
          description: 'Visualice únicamente las citas asignadas a su perfil y actualice su progreso.',
          icon: Calendar,
          path: '/citas',
          linkText: 'Ver Mis Citas'
        },
        {
          title: 'Mis Pacientes',
          description: 'Consulte historiales clínicos y registre notas de evolución por paciente.',
          icon: Users,
          path: '/pacientes',
          linkText: 'Ver Pacientes'
        },
        {
          title: 'Mis Sesiones y Reportes',
          description: 'Analice el volumen de terapias completadas y estadísticas de atención.',
          icon: BarChart3,
          path: '/reportes',
          linkText: 'Ver Estadísticas'
        }
      ]
    },
    Paciente: {
      title: `Bienvenido, ${user.username || 'Paciente'}`,
      subtitle: 'Tu Portal de Salud PhysioCare',
      description: 'Aquí puedes consultar tus citas agendadas, solicitar nuevas fechas y hacer seguimiento a tu proceso de rehabilitación.',
      features: [
        {
          title: 'Mis Citas',
          description: 'Consulta tus citas programadas, fechas, terapeuta a cargo y solicita nuevas citas.',
          icon: Calendar,
          path: '/citas',
          linkText: 'Ver Mis Citas'
        },
        {
          title: 'Mi Tratamiento',
          description: 'Revisa el historial de tus sesiones terapéuticas y progreso médico.',
          icon: Activity,
          path: '/reportes',
          linkText: 'Ver Mi Progreso'
        },
        {
          title: 'Atención al Paciente',
          description: 'Recuerda llegar 10 minutos antes a tus sesiones de fisioterapia con ropa cómoda.',
          icon: UserCheck,
          path: null,
          linkText: null
        }
      ]
    }
  };

  const currentConfig = roleConfigs[userRole] || roleConfigs['Paciente'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
          <Activity size={40} />
        </div>
        <div>
          <span className="inline-block mb-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 uppercase tracking-widest">
            {userRole}
          </span>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{currentConfig.title}</h2>
          <p className="text-blue-600 text-sm font-bold uppercase tracking-wider mt-1">{currentConfig.subtitle}</p>
        </div>
        <p className="text-slate-500 max-w-xl mx-auto text-base">
          {currentConfig.description}
        </p>

        <div className="grid md:grid-cols-3 gap-6 text-left mt-8 pt-6 border-t border-slate-100">
          {currentConfig.features.map((feat, index) => (
            <FeatureCard 
              key={index}
              title={feat.title}
              description={feat.description}
              icon={feat.icon}
              path={feat.path}
              linkText={feat.linkText}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Principal;
