import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Onboarding() {
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/api/v1/complete-profile', {
        cpf_cnpj: cpfCnpj,
      });

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Ocorreu um erro ao salvar seus dados. Verifique o formato do documento.');
      console.error("Erro no onboarding", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col justify-between items-center bg-slate-900 px-4 py-3 overflow-y-auto sm:overflow-hidden">
      {/* Container Centralizado */}
      <div className="flex-1 flex flex-col justify-center items-center w-full max-w-sm my-auto">
        {/* Logo e Título */}
        <div className="flex flex-col items-center mb-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#4D6BFE] flex items-center justify-center text-white font-black text-lg shadow-md">
              A
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Axion<span className="text-[#4D6BFE]">ID</span>
            </span>
          </div>
          <p className="text-slate-400 text-xs">Finalize seu perfil para validar sua identidade digital</p>
        </div>

        {/* Cartão de Onboarding */}
        <div className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-xl p-4 space-y-3">
          {error && (
            <div className="p-2 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleCompleteRegistration} className="space-y-3">
            {/* Campo Documento */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Documento de Identificação
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="CPF ou CNPJ (apenas números)"
                  value={cpfCnpj}
                  onChange={(e) => setCpfCnpj(e.target.value)}
                  required
                  autoFocus
                  className="w-full pl-3 pr-9 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:bg-slate-700 focus:border-[#4D6BFE] transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Botão Concluir */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-[#4D6BFE] hover:bg-[#3D5AFE] active:bg-[#2E4BDB] text-white font-medium text-xs rounded-lg transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validando dados...</span>
                </>
              ) : (
                "Concluir e Acessar Painel"
              )}
            </button>
          </form>

          {/* Mensagem de Segurança */}
          <div className="text-center pt-2 border-t border-slate-700/50 text-[11px]">
            <p className="text-slate-400 leading-tight">
              Seus dados são criptografados e protegidos por protocolos de segurança AxionID.
            </p>
          </div>
        </div>
      </div>

      {/* Rodapé Fixo na Parte Inferior */}
      <div className="text-center text-slate-500 text-[10px] space-y-0.5 pt-2 pb-1">
        <p className="font-medium text-slate-400">
          STI - Sistema de Tecnologia da Informação e Conhecimento
        </p>
        <p>
          Suporte:{" "}
          <a href="tel:21990849204" className="underline hover:text-slate-300">
            (21) 990849204
          </a>{" "}
          |{" "}
          <a
            href="mailto:josilva1233@gmail.com"
            className="underline hover:text-slate-300"
          >
            josilva1233@gmail.com
          </a>
        </p>
        <p className="text-slate-600 text-[9px]">Versão: 1.2.1</p>
      </div>
    </div>
  );
}