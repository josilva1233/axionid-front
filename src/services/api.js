import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL 
});

api.interceptors.request.use((config) => {
  // CORREÇÃO AQUI: Use a chave correta
  const token = localStorage.getItem('@AxionID:token');
  
  if (token) {
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
    if (error.response && error.response.status === 401) {
      // CORREÇÃO AQUI: Limpa as chaves certas
      localStorage.removeItem('@AxionID:token');
      localStorage.removeItem('@AxionID:role');
      
      if (window.location.pathname !== '/') {
        window.location.href = '/'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;