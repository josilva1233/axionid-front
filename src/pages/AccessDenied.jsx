// pages/AccessDenied.jsx
import { useNavigate } from 'react-router-dom';

export default function AccessDenied() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="max-w-md w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-2xl p-8 text-center">
        <div className="text-7xl mb-4">🚫</div>
        <h1 className="text-3xl font-bold text-white mb-2">Acesso Negado</h1>
        <p className="text-slate-300 mb-6">
          Você ainda não possui permissão para acessar esse sistema.
          <br />
          <span className="text-sm text-slate-400">
            Entre em contato com o administrador para solicitar acesso.
          </span>
        </p>
        <button
          onClick={handleLogout}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
        >
          Voltar ao Login
        </button>
      </div>
    </div>
  );
}