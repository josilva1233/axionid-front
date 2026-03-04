import axios from 'axios';

const api = axios.create({
  // Garanta que no seu arquivo .env a URL termine SEM a barra /
  baseURL: import.meta.env.VITE_API_URL 
});

/**
 * INTERCEPTOR DE REQUISIÇÃO
 * Garante que toda chamada leve o Token de Autenticação
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@AxionID:token');
  
  if (token) {
    // Adiciona o cabeçalho Authorization padrão Bearer
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Define cabeçalhos padrão para aceitar JSON do Laravel
  config.headers.Accept = 'application/json';
  config.headers['Content-Type'] = 'application/json';
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

/**
 * INTERCEPTOR DE RESPOSTA
 * Se a API responder 401 (Não autorizado), desloga o usuário automaticamente
 */
api.interceptors.response.use(
  (response) => response, 
  (error) => {
    // Se o token expirou ou é inválido, limpamos o local e mandamos pro login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('@AxionID:token');
      localStorage.removeItem('@AxionID:role');
      
      // Redireciona apenas se não estivermos já na página de login
      if (window.location.pathname !== '/') {
        window.location.href = '/'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;