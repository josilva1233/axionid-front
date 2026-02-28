import axios from 'axios';

const api = axios.create({
  baseURL: 'http://163.176.168.224',
});

// Este é o "segredo" para parar o erro 401
api.interceptors.request.use((config) => {
  // Verifique se o nome aqui é exatamente o mesmo que você salvou no Login
  const token = localStorage.getItem('@AxionID:token');
  
  if (token) {
    // IMPORTANTE: O Bearer deve ter um espaço depois dele
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;