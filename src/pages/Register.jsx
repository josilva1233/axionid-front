import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const nameFromUrl = params.get("name") || "";
  const emailFromUrl = params.get("email") || "";
  const tokenFromUrl = params.get("token") || "";
  const isSocial = !!tokenFromUrl;

  const [step, setStep] = useState(isSocial ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: nameFromUrl,
    email: emailFromUrl,
    cpf_cnpj: "",
    password: "",
    password_confirmation: "",
  });

  useEffect(() => {
    if (isSocial) {
      localStorage.setItem("@AxionID:token", tokenFromUrl);
      api.defaults.headers.common["Authorization"] = `Bearer ${tokenFromUrl}`;
    }
  }, [isSocial, tokenFromUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      return setError("As senhas não conferem.");
    }

    setLoading(true);
    setError("");

    try {
      if (isSocial) {
        await api.post("/api/v1/complete-profile", {
          cpf_cnpj: formData.cpf_cnpj,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          from_google: isSocial,
        });
      } else {
        const response = await api.post("/api/v1/register", formData);
        localStorage.setItem("@AxionID:token", response.data.token);
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erro ao finalizar cadastro. Verifique os dados."
      );
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
          <p className="text-slate-400 text-xs">Crie sua conta para acessar o sistema</p>
        </div>

        {/* Cartão de Registro */}
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

          <form onSubmit={handleRegister} className="space-y-3">
            {/* PASSO 1: Informações Básicas */}
            {step === 1 && !isSocial && (
              <div className="space-y-3">
                <div className="text-center sm:text-left">
                  <h2 className="text-xs font-bold text-white">Dados de Acesso</h2>
                  <p className="text-[11px] text-slate-400">
                    Informe seus dados básicos.
                  </p>
                </div>

                {/* Nome Completo */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <input
                      name="name"
                      type="text"
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      autoFocus
                      className="w-full pl-3 pr-9 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:bg-slate-700 focus:border-[#4D6BFE] transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* E-mail */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <input
                      name="email"
                      type="email"
                      placeholder="Seu e-mail"
                      value={formData.email}
                      onChange={handleChange}
                      required
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
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-2 px-4 bg-[#4D6BFE] hover:bg-[#3D5AFE] active:bg-[#2E4BDB] text-white font-medium text-xs rounded-lg transition-all shadow-md shadow-blue-500/20 flex items-center justify-center"
                >
                  Próximo Passo
                </button>
              </div>
            )}

            {/* PASSO 2: Documento */}
            {step === 2 && (
              <div className="space-y-3">
                <div className="text-center sm:text-left">
                  <h2 className="text-xs font-bold text-white">
                    Olá, {formData.name ? formData.name.split(" ")[0] : "Bem-vindo"}!
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Informe seu CPF ou CNPJ para validação.
                  </p>
                </div>

                {/* Documento */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    CPF ou CNPJ
                  </label>
                  <div className="relative">
                    <input
                      name="cpf_cnpj"
                      type="text"
                      placeholder="Apenas números"
                      value={formData.cpf_cnpj}
                      onChange={handleChange}
                      autoFocus
                      required
                      className="w-full pl-3 pr-9 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:bg-slate-700 focus:border-[#4D6BFE] transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h3" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!isSocial && (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-2 px-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-lg transition-all"
                    >
                      Voltar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!formData.cpf_cnpj}
                    className="flex-[2] py-2 px-4 bg-[#4D6BFE] hover:bg-[#3D5AFE] active:bg-[#2E4BDB] text-white font-medium text-xs rounded-lg transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* PASSO 3: Senha */}
            {step === 3 && (
              <div className="space-y-3">
                <div className="text-center sm:text-left">
                  <h2 className="text-xs font-bold text-white">Segurança</h2>
                  <p className="text-[11px] text-slate-400">
                    Crie uma senha forte para seu acesso.
                  </p>
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type="password"
                      placeholder="Digite sua senha"
                      value={formData.password}
                      onChange={handleChange}
                      autoFocus
                      required
                      className="w-full pl-3 pr-9 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:bg-slate-700 focus:border-[#4D6BFE] transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <input
                      name="password_confirmation"
                      type="password"
                      placeholder="Confirme sua senha"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      required
                      className="w-full pl-3 pr-9 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:bg-slate-700 focus:border-[#4D6BFE] transition-all"
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
                    onClick={() => setStep(2)}
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

          {/* Fazer Login */}
          <div className="text-center pt-2 border-t border-slate-700/50 text-xs">
            <p className="text-slate-400 text-[11px]">
              Já possui uma conta?{" "}
              <Link
                to="/login"
                className="text-[#4D6BFE] hover:text-blue-400 hover:underline font-semibold ml-0.5"
              >
                Fazer Login
              </Link>
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