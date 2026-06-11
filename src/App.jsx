import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Components/Layout';
import Principal from './Pages/Principal';
import Pacientes from './Pages/Pacientes';
import Terapeutas from './Pages/Terapeutas';
import Terapias from './Pages/Terapias';
import Citas from './Pages/Citas';
import Reportes from './Pages/Reportes';
import Login from './Pages/Login';

// Componente para proteger las rutas
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    // Redirige al login si no está autenticado
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas envueltas en Layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Principal />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="terapeutas" element={<Terapeutas />}/>
          <Route path="terapias" element={<Terapias />}/>
          <Route path="citas" element={<Citas />}/>
          <Route path="reportes" element={<Reportes />}/>
        </Route>
        
        {/* Capturar rutas no encontradas y redirigir */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;