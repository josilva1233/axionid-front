import axios from 'axios';

const api = axios.create({
  // Garanta que o VITE_API_URL no seu .env seja http://163.176.168.224
  baseURL: import.meta.env.VITE_API_URL 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@AxionID:token');
  
  if (token) {
    // Importante: O Sanctum espera 'Bearer ' antes do token
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  config.headers.Accept = 'application/json';
  config.headers['Content-Type'] = 'application/json';
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response, 
  (error) => {
    // Se o erro for 401 (Não autorizado)
    if (error.response && error.response.status === 401) {
      
      // LOGICA DE SEGURANÇA:
      // Se eu estiver na página de LOGIN (/) ou no CALLBACK do Google, 
      // NÃO devo deslogar, pois o token pode estar sendo processado agora.
      const publicPages = ['/', '/login', '/register'];
      const isPublicPage = publicPages.includes(window.location.pathname);

      if (!isPublicPage) {
        console.warn("Sessão expirada. Redirecionando para o login...");
        localStorage.removeItem('@AxionID:token');
        localStorage.removeItem('@AxionID:role');
        localStorage.removeItem('user_data');
        
        window.location.href = '/'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;