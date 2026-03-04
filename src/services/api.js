import axios from 'axios';

const api = axios.create({
  baseURL: 'http://163.176.168.224'
});

// Interceptor para injetar o token em cada requisição
api.interceptors.request.use(config => {
  const token = localStorage.getItem('@AxionID:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;