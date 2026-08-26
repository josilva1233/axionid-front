import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    cpf_cnpj: "",
    zip_code: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    complement: "",
    password: "",
    password_confirmation: "",
  });

  const handleZipCodeBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, "");
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
            zip_code: cep,
          }));
          setErrors((prev) => ({ ...prev, zip_code: null }));
        } else {
          alert("CEP não encontrado.");
        }
      } catch (err) {
        console.error("Erro ao buscar CEP");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      return alert("As senhas não coincidem.");
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await api.post("/api/v1/complete-profile", formData);
      alert("Cadastro finalizado com sucesso!");

      const role =
        response.data.user?.is_admin === 1 || response.data.user?.is_admin === true
          ? "admin"
          : "user";
      localStorage.setItem("@AxionID:role", role);

      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors || error.response.data);
      } else {
        alert("Erro ao conectar com o servidor. Tente novamente.");
      }
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
          <p className="text-slate-400 text-xs">Conclua o preenchimento do seu perfil</p>
        </div>

        {/* Cartão de Cadastro */}
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

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* PASSO 1: Identificação */}
            {step === 1 && (
              <div className="space-y-3">
                <div className="text-center sm:text-left">
                  <h2 className="text-xs font-bold text-white">Identificação</h2>
                  <p className="text-[11px] text-slate-400">
                    Valide seu documento para ativar sua conta.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Documento
                  </label>
                  <div className="relative">
                    <input
                      name="cpf_cnpj"
                      type="text"
                      placeholder="CPF ou CNPJ (apenas números)"
                      value={formData.cpf_cnpj}
                      onChange={handleChange}
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
                  {errors.cpf_cnpj && (
                    <p className="text-red-400 text-[10px] mt-1 font-medium">{errors.cpf_cnpj[0]}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!formData.cpf_cnpj}
                  className="w-full py-2 px-4 bg-[#4D6BFE] hover:bg-[#3D5AFE] active:bg-[#2E4BDB] text-white font-medium text-xs rounded-lg transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center"
                >
                  Próximo: Endereço
                </button>
              </div>
            )}

            {/* PASSO 2: Endereço */}
            {step === 2 && (
              <div className="space-y-2.5">
                <div className="text-center sm:text-left">
                  <h2 className="text-xs font-bold text-white">Onde você reside?</h2>
                  <p className="text-[11px] text-slate-400">
                    Dados necessários para segurança e faturamento.
                  </p>
                </div>

                {/* CEP */}
                <div>
                  <div className="relative">
                    <input
                      name="zip_code"
                      type="text"
                      placeholder="CEP (00000-000)"
                      value={formData.zip_code}
                      onBlur={handleZipCodeBlur}
                      onChange={handleChange}
                      required
                      className="w-full pl-3 pr-9 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:bg-slate-700 focus:border-[#4D6BFE] transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Rua & Nº */}
                <div className="flex gap-2">
                  <input
                    name="street"
                    placeholder="Rua / Logradouro"
                    value={formData.street}
                    onChange={handleChange}
                    required
                    className="flex-[3] w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:bg-slate-700 focus:border-[#4D6BFE] transition-all"
                  />
                  <input
                    name="number"
                    placeholder="Nº"
                    value={formData.number}
                    onChange={handleChange}
                    required
                    className="flex-1 w-full px-2 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs text-white text-center placeholder-slate-400 focus:outline-none focus:bg-slate-700 focus:border-[#4D6BFE] transition-all"
                  />
                </div>

                {/* Bairro & UF */}
                <div className="flex gap-2">
                  <input
                    name="neighborhood"
                    placeholder="Bairro"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    required
                    className="flex-[2] w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:bg-slate-700 focus:border-[#4D6BFE] transition-all"
                  />
                  <input
                    name="state"
                    placeholder="UF"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    maxLength="2"
                    className="flex-1 w-full px-2 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs text-white text-center uppercase placeholder-slate-400 focus:outline-none focus:bg-slate-700 focus:border-[#4D6BFE] transition-all"
                  />
                </div>

                {/* Cidade */}
                <div>
                  <input
                    name="city"
                    placeholder="Cidade"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:bg-slate-700 focus:border-[#4D6BFE] transition-all"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-2 px-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-lg transition-all"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-[2] py-2 px-4 bg-[#4D6BFE] hover:bg-[#3D5AFE] active:bg-[#2E4BDB] text-white font-medium text-xs rounded-lg transition-all shadow-md shadow-blue-500/20 flex items-center justify-center"
                  >
                    Próximo: Segurança
                  </button>
                </div>
              </div>
            )}

            {/* PASSO 3: Segurança */}
            {step === 3 && (
              <div className="space-y-3">
                <div className="text-center sm:text-left">
                  <h2 className="text-xs font-bold text-white">Segurança</h2>
                  <p className="text-[11px] text-slate-400">
                    Crie uma senha forte para acessar sua conta.
                  </p>
                </div>

                {/* Nova Senha */}
                <div>
                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      placeholder="Nova Senha (mín. 6 caracteres)"
                      onChange={handleChange}
                      required
                      className="w-full pl-3 pr-9 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:bg-slate-700 focus:border-[#4D6BFE] transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-[10px] mt-1 font-medium">{errors.password[0]}</p>
                  )}
                </div>

                {/* Confirmar Senha */}
                <div>
                  <div className="relative">
                    <input
                      type="password"
                      name="password_confirmation"
                      placeholder="Confirmar Senha"
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
                      "Concluir Cadastro"
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
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