import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Onboarding() {
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Função para aplicar máscara básica de CPF/CNPJ (Opcional, mas profissional)
  const handleInputChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não é dígito
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else {
      value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
    setCpfCnpj(value);
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Remove caracteres especiais antes de enviar para a API
    const rawValue = cpfCnpj.replace(/\D/g, "");

    try {
      // Mantida a sua rota exata: POST /api/v1/complete-profile
      await api.post("/api/v1/complete-profile", {
        cpf_cnpj: rawValue,
      });

      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || "Erro ao salvar dados. Verifique o documento.";
      setError(message);
      console.error("Erro no onboarding:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <main className="auth-card animate-in">
        <header className="brand">
          <h1>Axion<span>ID</span></h1>
        </header>

        <section className="auth-header-content">
          <h2>Finalize seu perfil</h2>
          <p>
            Para garantir a segurança da sua conta e validar sua identidade 
            digital, precisamos do seu CPF ou CNPJ.
          </p>
        </section>

        {error && (
          <div className="error-badge" role="alert">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCompleteRegistration} className="auth-form">
          <div className="input-group">
            <label htmlFor="cpfCnpj">Documento de Identificação</label>
            <input
              id="cpfCnpj"
              type="text"
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              value={cpfCnpj}
              onChange={handleInputChange}
              maxLength={18}
              required
              autoFocus
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading || cpfCnpj.length < 11}
          >
            {loading ? "Processando..." : "Concluir e Acessar Painel"}
          </button>
        </form>

        <footer className="auth-footer-info">
          <p>
            Seus dados são criptografados e protegidos por protocolos de segurança.
          </p>
        </footer>
      </main>
    </div>
  );
}