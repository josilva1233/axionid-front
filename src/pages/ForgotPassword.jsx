import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Token, 3: Reset
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    token: "",
    password: "",
    password_confirmation: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Centralizador de chamadas de API para as etapas
  const handleStepSubmit = async (e, endpoint, nextStep, successMsg = null) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Ajuste os dados conforme o endpoint
      const payload = step === 1 ? { email: formData.email } :
                      step === 2 ? { email: formData.email, token: formData.token } : 
                      formData;

      await api.post(endpoint, payload);
      
      if (successMsg) alert(successMsg);
      if (nextStep === "FINISH") navigate("/login");
      else setStep(nextStep);
      
    } catch (err) {
      setError(err.response?.data?.message || "Ocorreu um erro. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-in">
      <div className="auth-card">
        <header className="brand" onClick={() => navigate("/login")} style={{cursor: 'pointer'}}>
          <h1>Axion<span>ID</span></h1>
        </header>

        {/* STEPPER VISUAL */}
        <div className="stepper-bar">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`step-indicator ${step >= i ? "active" : ""}`} 
            />
          ))}
        </div>

        {error && <div className="error-badge">{error}</div>}

        <main className="step-container">
          {/* ETAPA 1: SOLICITAR CÓDIGO */}
          {step === 1 && (
            <form onSubmit={(e) => handleStepSubmit(e, "/api/v1/forgot-password", 2)} className="auth-form">
              <div className="auth-header-text">
                <h2>Recuperar Acesso</h2>
                <p>Enviaremos um código de segurança para o seu e-mail.</p>
              </div>

              <div className="input-group">
                <label>E-mail Institucional</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="exemplo@empresa.com"
                  autoComplete="email"
                />
              </div>

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? "Processando..." : "Enviar Código de Resgate"}
              </button>
              
              <Link to="/login" className="link-back">← Voltar para o Login</Link>
            </form>
          )}

          {/* ETAPA 2: VALIDAR TOKEN */}
          {step === 2 && (
            <form onSubmit={(e) => handleStepSubmit(e, "/api/v1/verify-code", 3)} className="auth-form">
              <div className="auth-header-text">
                <h2>Verificação</h2>
                <p>Insira o código de 6 dígitos enviado para seu e-mail.</p>
              </div>

              <div className="input-group">
                <input
                  type="text"
                  name="token"
                  className="input-token"
                  required
                  value={formData.token}
                  onChange={handleChange}
                  placeholder="000000"
                  maxLength="6"
                />
              </div>

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? "Validando..." : "Confirmar Identidade"}
              </button>
              
              <button type="button" onClick={() => setStep(1)} className="btn-ghost">
                Mudar E-mail
              </button>
            </form>
          )}

          {/* ETAPA 3: NOVA SENHA */}
          {step === 3 && (
            <form onSubmit={(e) => handleStepSubmit(e, "/api/v1/reset-password", "FINISH", "Senha atualizada com sucesso!")} className="auth-form">
              <div className="auth-header-text">
                <h2>Nova Senha</h2>
                <p>Crie uma senha forte para proteger sua conta.</p>
              </div>

              <div className="input-group">
                <label>Nova Senha</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <div className="input-group">
                <label>Confirmar Senha</label>
                <input
                  type="password"
                  name="password_confirmation"
                  required
                  value={formData.password_confirmation}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? "Atualizando..." : "Finalizar e Acessar"}
              </button>
            </form>
          )}
        </main>

        <footer className="auth-footer-note">
          <p>Dificuldades no acesso? <Link to="/support">Contate o Suporte</Link></p>
        </footer>
      </div>
    </div>
  );
}