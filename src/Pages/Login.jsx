import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, Activity, AlertCircle } from 'lucide-react';
import CustomInput from '../Components/CustomInput';

const AuthHeader = () => (
  <div className="flex flex-col items-center mb-10">
    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-600/30">
      <Activity size={32} />
    </div>
    <h1 className="text-3xl font-black tracking-tight text-slate-900">PhysioCare</h1>
    <p className="text-slate-500 font-medium mt-2">Ingresa tus credenciales para continuar</p>
  </div>
);

const ErrorBanner = ({ message }) => (
  message && (
    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
      <AlertCircle size={18} />
      {message}
    </div>
  )
);

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://localhost:7205/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        setError(errorData?.message || 'Error al comunicarse con el servidor o credenciales incorrectas');
        return;
      }

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Credenciales incorrectas');
        return;
      }

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', data.username || username);

      // guardar token si el backend lo devuelve
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Error de red. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-slate-800">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
        <AuthHeader />
        <ErrorBanner message={error} />

        <form onSubmit={handleLogin} className="space-y-6">
          <CustomInput
            label="Usuario"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            icon={User}
            placeholder="Ej. Admin"
            required
          />

          <CustomInput
            label="Contraseña"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            icon={Lock}
            placeholder="••••••••"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/30"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verificando...
              </span>
            ) : (
              <>
                Ingresar al Sistema <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="mt-8 text-sm font-medium text-slate-400">
        &copy; {new Date().getFullYear()} PhysioCare. Todos los derechos reservados.
      </p>
    </div>
  );
};

export default Login;