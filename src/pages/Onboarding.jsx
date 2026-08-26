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
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white overflow-x-hidden">
      {/* LADO ESQUERDO: Branding & Grafismo */}
      <div className="relative w-full md:w-1/2 flex items-center justify-center p-8 lg:p-16 min-h-[250px] md:min-h-screen">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none text-slate-300 stroke-current opacity-50"
          viewBox="0 0 500 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M-100 0 C 150 200, 100 400, 300 500" strokeWidth="1.5" />
          <path d="M-50 -50 C 200 150, 150 350, 400 500" strokeWidth="1.5" />
          <path d="M0 -100 C 250 100, 200 300, 500 450" strokeWidth="1.5" />
        </svg>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-blue-900 flex items-center justify-center text-white font-black text-3xl shadow-lg">
              A
            </div>
            <span className="text-4xl lg:text-5xl font-extrabold text-blue-900 tracking-tight">
              Axion<span className="text-blue-600">ID</span>
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-3 font-medium">
            Plataforma Unificada de Identidade
          </p>
        </div>
      </div>

      {/* LADO DIREITO: Painel Azul & Formulário */}
      <div className="w-full md:w-1/2 bg-[#1b4b82] rounded-t-[40px] md:rounded-t-none md:rounded-l-[45px] flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden">
        <div className="absolute -bottom-10 -right-10 text-white/5 pointer-events-none text-9xl font-black select-none">
          AXION
        </div>

        <div className="hidden md:block" />

        {/* Container Centralizado */}
        <div className="w-full max-w-[460px] mx-auto z-10 my-auto py-6">
          <p className="text-white/90 text-sm text-center mb-5 font-normal tracking-wide">
            Finalize seu perfil para validar sua identidade digital:
          </p>

          {/* Card Branco */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 space-y-6">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleCompleteRegistration} className="space-y-5">
              {/* Campo Documento de Identificação */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="CPF ou CNPJ (apenas números)"
                  value={cpfCnpj}
                  onChange={(e) => setCpfCnpj(e.target.value)}
                  required
                  autoFocus
                  className="w-full pl-4 pr-11 py-3.5 bg-blue-50/40 border border-slate-200 rounded-xl text-slate-700 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition-all shadow-sm"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h3" />
                  </svg>
                </div>
              </div>

              {/* Botão Principal */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#0066cc] hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Validando dados...</span>
                  </>
                ) : (
                  "Concluir e Acessar Painel"
                )}
              </button>
            </form>

            {/* Mensagem de Segurança */}
            <div className="text-center pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 leading-relaxed">
                Seus dados são criptografados e protegidos por protocolos de segurança AxionID.
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé Institucional */}
        <div className="text-center text-white/80 text-xs leading-relaxed mt-6 z-10 space-y-1">
          <p className="font-medium">SGA - Secretaria de Tecnologia da Informação</p>
          <p>
            Suporte:{" "}
            <a href="tel:8534911770" className="underline hover:text-white">
              (85) 3491-1770
            </a>{" "}
            |{" "}
            <a href="mailto:sti.atendimento@tjce.jus.br" className="underline hover:text-white">
              sti.atendimento@tjce.jus.br
            </a>
          </p>
          <p className="text-white/40 pt-1 text-[11px]">Versão: 1.2.1</p>
        </div>
      </div>
    </div>
  );
}