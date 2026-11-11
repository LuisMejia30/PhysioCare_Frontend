import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Components/Layout';
import Principal from './Pages/Principal';
import Pacientes from './Pages/Pacientes';
import Terapeutas from './Pages/Terapeutas';
import Terapias from './Pages/Terapias';
import Citas from './Pages/Citas';
import Reportes from './Pages/Reportes';
import Login from './Pages/Login';

// Componente para proteger las rutas verificando el token JWT y los roles permitidos
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!token || !user) {
    // Redirige al login si no está autenticado (no hay token o no hay info del usuario)
    return <Navigate to="/login" replace />;
  }

  // Si la ruta exige roles específicos y el usuario no los tiene, lo devuelve al inicio
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas envueltas en Layout (Acceso general autenticado) */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Principal />} />
          
          <Route path="pacientes" element={
            <ProtectedRoute allowedRoles={['Administrador', 'Recepcionista', 'Terapeuta']}>
              <Pacientes />
            </ProtectedRoute>
          } />
          
          <Route path="terapeutas" element={
            <ProtectedRoute allowedRoles={['Administrador']}>
              <Terapeutas />
            </ProtectedRoute>
          } />
          
          <Route path="terapias" element={
            <ProtectedRoute allowedRoles={['Administrador', 'Recepcionista']}>
              <Terapias />
            </ProtectedRoute>
          } />
          
          <Route path="citas" element={
            <ProtectedRoute allowedRoles={['Administrador', 'Recepcionista', 'Terapeuta', 'Paciente']}>
              <Citas />
            </ProtectedRoute>
          } />
          
          <Route path="reportes" element={
            <ProtectedRoute allowedRoles={['Administrador', 'Terapeuta', 'Paciente']}>
              <Reportes />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Capturar rutas no encontradas y redirigir */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;