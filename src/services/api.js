export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5298/api';

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (response.status === 401) {
    // Limpieza completa de sesión idéntica a la de Sidebar.jsx
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    sessionStorage.clear();
    
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }

  const data = await response.json().catch(() => null);
  
  if (!response.ok) {
    throw new Error(data?.message || 'Error en la petición');
  }

  return data;
};