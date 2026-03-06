import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1: Identificação, 2: Endereço, 3: Segurança

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

  // Busca CEP automática com tratamento de erro profissional
  const handleZipCodeBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, "");
    if (cep.length !== 8) return;

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
        setErrors((prev) => ({ ...prev, zip_code: "CEP não encontrado." }));
      }
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpa erro do campo ao digitar
    if (errors[name]) setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: ["As senhas não coincidem."] });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Rota original mantida: POST /api/v1/complete-profile
      const response = await api.post("/api/v1/complete-profile", formData);
      
      if (response.data.user?.is_admin) {
        localStorage.setItem("@AxionID:role", "admin");
      }

      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        alert("Erro crítico ao conectar com o servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper para renderizar mensagens de erro da API
  const ErrorMessage = ({ field }) => (
    errors[field] ? <span className="field-error-text">{Array.isArray(errors[field]) ? errors[field][0] : errors[field]}</span> : null
  );

  return (
    <div className="auth-container">
      <main className="auth-card animate-in">
        <header className="brand">
          <h1>Axion<span>ID</span></h1>
        </header>

        {/* STEPPER VISUAL */}
        <nav className="stepper" aria-label="Progresso do cadastro">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`step-bar ${step >= i ? "active" : ""}`} 
            />
          ))}
        </nav>

        <form onSubmit={handleSubmit} className="auth-form">
          
          {/* PASSO 1: IDENTIFICAÇÃO */}
          {step === 1 && (
            <section className="step-content animate-in">
              <div className="auth-header-content">
                <h2>Identificação</h2>
                <p>Valide seu documento para ativar sua ID digital.</p>
              </div>

              <div className="input-group">
                <label htmlFor="cpf_cnpj">CPF ou CNPJ</label>
                <input
                  id="cpf_cnpj"
                  name="cpf_cnpj"
                  placeholder="Somente números"
                  value={formData.cpf_cnpj}
                  onChange={handleChange}
                  required
                />
                <ErrorMessage field="cpf_cnpj" />
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={() => setStep(2)}
                disabled={!formData.cpf_cnpj}
              >
                Próximo: Endereço
              </button>
            </section>
          )}

          {/* PASSO 2: ENDEREÇO */}
          {step === 2 && (
            <section className="step-content animate-in">
              <div className="auth-header-content">
                <h2>Onde você reside?</h2>
                <p>Dados necessários para faturamento e segurança.</p>
              </div>

              <div className="input-group">
                <label htmlFor="zip_code">CEP</label>
                <input
                  id="zip_code"
                  name="zip_code"
                  placeholder="00000-000"
                  value={formData.zip_code}
                  onBlur={handleZipCodeBlur}
                  onChange={handleChange}
                  required
                />
                <ErrorMessage field="zip_code" />
              </div>

              <div className="input-row">
                <div className="input-group flex-3">
                  <label htmlFor="street">Logradouro</label>
                  <input id="street" name="street" value={formData.street} onChange={handleChange} required />
                </div>
                <div className="input-group flex-1">
                  <label htmlFor="number">Nº</label>
                  <input id="number" name="number" value={formData.number} onChange={handleChange} required />
                </div>
              </div>

              <div className="input-row">
                <div className="input-group flex-2">
                  <label htmlFor="neighborhood">Bairro</label>
                  <input id="neighborhood" name="neighborhood" value={formData.neighborhood} onChange={handleChange} required />
                </div>
                <div className="input-group flex-1">
                  <label htmlFor="state">UF</label>
                  <input id="state" name="state" maxLength="2" value={formData.state} onChange={handleChange} required />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="city">Cidade</label>
                <input id="city" name="city" value={formData.city} onChange={handleChange} required />
              </div>

              <div className="btn-group">
                <button type="button" className="btn-secondary" onClick={() => setStep(1)}>Voltar</button>
                <button type="button" className="btn-primary" onClick={() => setStep(3)}>Próximo: Segurança</button>
              </div>
            </section>
          )}

          {/* PASSO 3: SEGURANÇA */}
          {step === 3 && (
            <section className="step-content animate-in">
              <div className="auth-header-content">
                <h2>Segurança</h2>
                <p>Crie sua senha mestre para acessos futuros.</p>
              </div>

              <div className="input-group">
                <label htmlFor="password">Nova Senha</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Mínimo 6 caracteres"
                  onChange={handleChange}
                  required
                />
                <ErrorMessage field="password" />
              </div>

              <div className="input-group">
                <label htmlFor="password_confirmation">Confirmar Senha</label>
                <input
                  id="password_confirmation"
                  type="password"
                  name="password_confirmation"
                  placeholder="Repita a senha"
                  onChange={handleChange}
                  required
                />
                <ErrorMessage field="password_confirmation" />
              </div>

              <div className="btn-group">
                <button type="button" className="btn-secondary" onClick={() => setStep(2)}>Voltar</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Processando..." : "Concluir Cadastro"}
                </button>
              </div>
            </section>
          )}
        </form>
      </main>
    </div>
  );
}