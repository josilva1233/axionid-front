import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    token: "",
    password: "",
    password_confirmation: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/api/v1/forgot-password", { email: formData.email });
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message || "E-mail não encontrado em nossa base."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/api/v1/verify-code", {
        email: formData.email,
        token: formData.token,
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Código inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      return setError("As senhas não conferem.");
    }

    setLoading(true);
    setError("");
    try {
      await api.post("/api/v1/reset-password", formData);
      alert("Senha redefinida com sucesso!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao redefinir senha.");
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
          <p className="text-slate-400 text-xs">Recuperação de acesso à plataforma</p>
        </div>

        {/* Cartão de Recuperação */}
        <div className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-xl p-4 space-y-3">
          {/* Stepper Visual */}
          <div className="flex items-center gap-2 mb-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  step >= i ? "bg-[#4D6BFE]" : "bg-slate-700"
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="p-2 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-xs text-center font-medium">
              {error}
            </div>
          )}

          {/* PASSO 1: Solicitar Código */}
          {step === 1 && (
            <form onSubmit={handleRequestCode} className="space-y-3">
              <div className="text-center sm:text-left">
                <h2 className="text-xs font-bold text-white">Recuperar Senha</h2>
                <p className="text-[11px] text-slate-400">
                  Informe seu e-mail para receber um código de validação.
                </p>
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    required
                    autoFocus
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    className="w-full pl-3 pr-9 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:bg-slate-700 focus:border-[#4D6BFE] transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-[#4D6BFE] hover:bg-[#3D5AFE] active:bg-[#2E4BDB] text-white font-medium text-xs rounded-lg transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  "Enviar Código"
                )}
              </button>

              <div className="text-center pt-1">
                <Link
                  to="/login"
                  className="text-xs text-[#4D6BFE] hover:text-blue-400 hover:underline font-semibold"
                >
                  ← Voltar para o Login
                </Link>
              </div>
            </form>
          )}

          {/* PASSO 2: Validar Código */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-3">
              <div className="text-center sm:text-left">
                <h2 className="text-xs font-bold text-white">Verificar Código</h2>
                <p className="text-[11px] text-slate-400">
                  Código enviado para <strong className="text-slate-200">{formData.email}</strong>
                </p>
              </div>

              {/* Código */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Código de Verificação
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="token"
                    required
                    autoFocus
                    maxLength="6"
                    value={formData.token}
                    onChange={handleChange}
                    placeholder="6 dígitos"
                    className="w-full pl-3 pr-9 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs text-white text-center tracking-widest font-semibold placeholder-slate-400 focus:outline-none focus:bg-slate-700 focus:border-[#4D6BFE] transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2 px-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-lg transition-all"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-2 px-4 bg-[#4D6BFE] hover:bg-[#3D5AFE] active:bg-[#2E4BDB] text-white font-medium text-xs rounded-lg transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Validando...</span>
                    </>
                  ) : (
                    "Confirmar Código"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* PASSO 3: Redefinir Senha */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-3">
              <div className="text-center sm:text-left">
                <h2 className="text-xs font-bold text-white">Nova Senha</h2>
                <p className="text-[11px] text-slate-400">
                  Crie uma nova senha para o seu acesso.
                </p>
              </div>

              {/* Nova Senha */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    required
                    autoFocus
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full pl-3 pr-9 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:bg-slate-700 focus:border-[#4D6BFE] transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Confirmar Nova Senha */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password_confirmation"
                    required
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    placeholder="Repita a nova senha"
                    className="w-full pl-3 pr-9 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:bg-slate-700 focus:border-[#4D6BFE] transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-[#4D6BFE] hover:bg-[#3D5AFE] active:bg-[#2E4BDB] text-white font-medium text-xs rounded-lg transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Redefinindo...</span>
                  </>
                ) : (
                  "Atualizar e Acessar"
                )}
              </button>
            </form>
          )}

          {/* Dica de Rodapé do Card */}
          <div className="text-center pt-2 border-t border-slate-700/50">
            <p className="text-[10px] text-slate-400 leading-tight">
              Não recebeu o e-mail? Verifique sua caixa de spam ou tente novamente.
            </p>
          </div>
        </div>
      </div>

      {/* Rodapé Fixo */}
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