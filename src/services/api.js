import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false, // usamos Bearer, não cookie
  timeout: 10000, // evita request travada infinita
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});

// 🔐 REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@AxionID:token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🔁 RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {

    // 🔥 Se for erro de rede (CORS / servidor offline)
    if (!error.response) {
      console.error('Erro de conexão com a API.');
      return Promise.reject(error);
    }

    const status = error.response.status;

    // 🔐 Token expirado ou inválido
    if (status === 401) {
      console.warn('Sessão expirada ou token inválido.');

      localStorage.removeItem('@AxionID:token');
      localStorage.removeItem('@AxionID:role');
      localStorage.removeItem('user_data');

      // Evita loop infinito
      if (!window.location.pathname.includes('/')) {
        window.location.href = '/';
      }
    }

    // 🚫 Acesso negado
    if (status === 403) {
      console.warn('Acesso negado.');
    }

    // 💥 Erro interno
    if (status >= 500) {
      console.error('Erro interno no servidor.');
    }

    return Promise.reject(error);
  }
);

export default api;
