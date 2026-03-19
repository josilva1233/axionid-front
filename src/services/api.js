import axios from 'axios';

const api = axios.create({
  // Garanta que o VITE_API_URL no Vercel seja http://163.176.168.224:8000
  baseURL: import.meta.env.VITE_API_URL 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@AxionID:token');
  
  if (token) {
    /**
     * CORREÇÃO 1: Limpeza do Token
     * O .replace(/"/g, '') remove aspas duplas caso o token tenha sido salvo via JSON.stringify.
     * Sem isso, o Laravel Sanctum retorna 401.
     */
    const cleanToken = token.replace(/"/g, '').trim();
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  
  config.headers.Accept = 'application/json';

  /**
   * CORREÇÃO 2: Flexibilidade de Content-Type
   * Removemos a linha fixa de 'application/json'. 
   * Se você enviar um arquivo (FormData), o Axios definirá 'multipart/form-data' automaticamente.
   * Se enviar texto, o Axios usará JSON por padrão.
   */
  
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
      const publicPages = ['/', '/login', '/register'];
      const isPublicPage = publicPages.includes(window.location.pathname);

      // Só desloga se não for uma página de autenticação e se houver um erro real de sessão
      if (!isPublicPage) {
        console.warn("Sessão expirada ou Token inválido. Redirecionando...");
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