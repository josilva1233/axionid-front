import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const nameFromUrl = params.get('name') || '';
  const emailFromUrl = params.get('email') || '';
  const tokenFromUrl = params.get('token') || '';
  const isSocial = !!tokenFromUrl;

  const [step, setStep] = useState(isSocial ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: nameFromUrl,
    email: emailFromUrl,
    cpf_cnpj: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    if (isSocial) {
      localStorage.setItem('@AxionID:token', tokenFromUrl);
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenFromUrl}`;
    }
  }, [isSocial, tokenFromUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      return setError('As senhas não conferem.');
    }

    setLoading(true);
    setError('');

    try {
      if (isSocial) {
        await api.post('/api/v1/complete-profile', {
          cpf_cnpj: formData.cpf_cnpj,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          from_google: isSocial,
        });
      } else {
        const response = await api.post('/api/v1/register', formData);
        localStorage.setItem('@AxionID:token', response.data.token);
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Erro ao finalizar cadastro. Verifique os dados.'
      );
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

      {/* LADO DIREITO: Painel Azul & Formulário Multi-etapas */}
      <div className="w-full md:w-1/2 bg-[#1b4b82] rounded-t-[40px] md:rounded-t-none md:rounded-l-[45px] flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden">
        <div className="absolute -bottom-10 -right-10 text-white/5 pointer-events-none text-9xl font-black select-none">
          AXION
        </div>

        <div className="hidden md:block" />

        {/* Container Centralizado */}
        <div className="w-full max-w-[460px] mx-auto z-10 my-auto py-6">
          <p className="text-white/90 text-sm text-center mb-5 font-normal tracking-wide">
            Crie sua conta para acessar os serviços integrados:
          </p>

          {/* Card Branco */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 space-y-6">
            {/* Stepper Visual */}
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    step >= i ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              {/* PASSO 1: Informações Básicas */}
              {step === 1 && !isSocial && (
                <div className="space-y-5">
                  <div className="text-center sm:text-left">
                    <h2 className="text-lg font-bold text-slate-800">Crie sua conta</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Comece informando seus dados básicos para acesso.
                    </p>
                  </div>

                  {/* Nome Completo */}
                  <div className="relative">
                    <input
                      name="name"
                      type="text"
                      placeholder="Nome Completo"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      autoFocus
                      className="w-full pl-4 pr-11 py-3.5 bg-blue-50/40 border border-slate-200 rounded-xl text-slate-700 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition-all shadow-sm"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* E-mail Corporativo */}
                  <div className="relative">
                    <input
                      name="email"
                      type="email"
                      placeholder="E-mail Corporativo"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-4 pr-11 py-3.5 bg-blue-50/40 border border-slate-200 rounded-xl text-slate-700 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition-all shadow-sm"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full py-3.5 px-4 bg-[#0066cc] hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center"
                  >
                    Próximo Passo
                  </button>
                </div>
              )}

              {/* PASSO 2: Documento */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="text-center sm:text-left">
                    <h2 className="text-lg font-bold text-slate-800">
                      Olá, {formData.name ? formData.name.split(' ')[0] : 'Bem-vindo'}!
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Para sua segurança, informe seu CPF ou CNPJ para validarmos sua ID.
                    </p>
                  </div>

                  {/* Documento (CPF ou CNPJ) */}
                  <div className="relative">
                    <input
                      name="cpf_cnpj"
                      type="text"
                      placeholder="CPF ou CNPJ (apenas números)"
                      value={formData.cpf_cnpj}
                      onChange={handleChange}
                      autoFocus
                      required
                      className="w-full pl-4 pr-11 py-3.5 bg-blue-50/40 border border-slate-200 rounded-xl text-slate-700 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition-all shadow-sm"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h3" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {!isSocial && (
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold text-sm rounded-xl transition-all"
                      >
                        Voltar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={!formData.cpf_cnpj}
                      className="flex-[2] py-3.5 px-4 bg-[#0066cc] hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {/* PASSO 3: Segurança / Senha */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="text-center sm:text-left">
                    <h2 className="text-lg font-bold text-slate-800">Segurança</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Crie uma senha forte para proteger seu acesso.
                    </p>
                  </div>

                  {/* Senha */}
                  <div className="relative">
                    <input
                      name="password"
                      type="password"
                      placeholder="Senha de Acesso"
                      value={formData.password}
                      onChange={handleChange}
                      autoFocus
                      required
                      className="w-full pl-4 pr-11 py-3.5 bg-blue-50/40 border border-slate-200 rounded-xl text-slate-700 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition-all shadow-sm"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>

                  {/* Confirmar Senha */}
                  <div className="relative">
                    <input
                      name="password_confirmation"
                      type="password"
                      placeholder="Confirmar Senha"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      required
                      className="w-full pl-4 pr-11 py-3.5 bg-blue-50/40 border border-slate-200 rounded-xl text-slate-700 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition-all shadow-sm"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold text-sm rounded-xl transition-all"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-[2] py-3.5 px-4 bg-[#0066cc] hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Finalizando...</span>
                        </>
                      ) : (
                        "Concluir Registro"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Link para Fazer Login */}
            <div className="text-center pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Já possui uma conta?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-800 hover:underline font-semibold ml-0.5">
                  Fazer Login
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé Institucional */}
        <div className="text-center text-white/80 text-xs leading-relaxed mt-6 z-10 space-y-1">
          <p className="font-medium">SGA - Secretaria de Tecnologia da Informação</p>
          <p>
            Suporte:{' '}
            <a href="tel:8534911770" className="underline hover:text-white">
              (85) 3491-1770
            </a>{' '}
            |{' '}
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