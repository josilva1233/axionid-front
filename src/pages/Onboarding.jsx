import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Onboarding() {
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // POST /api/v1/complete-profile
      await api.post("/api/v1/complete-profile", {
        cpf_cnpj: cpfCnpj,
      });

      // Sucesso: Redireciona para o Dashboard
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        "Ocorreu um erro ao salvar seus dados. Verifique o formato do documento.",
      );
      console.error("Erro no onboarding", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-in">
        {/* LOGO PADRONIZADA */}
        <div className="brand">
          <h1>
            Axion<span>ID</span>
          </h1>
        </div>

        <div
          className="auth-header"
          style={{ textAlign: "center", marginBottom: "24px" }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              marginBottom: "8px",
              color: "var(--text-main)",
            }}
          >
            Finalize seu perfil
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--text-dim)",
              lineHeight: "1.4",
            }}
          >
            Para garantir a segurança da sua conta e validar sua identidade
            digital, precisamos do seu CPF ou CNPJ.
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleCompleteRegistration} className="auth-form">
          <div className="input-group">
            <label>Documento de Identificação</label>
            <input
              type="text"
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(e.target.value)}
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: "10px" }}
          >
            {loading ? "Salvando dados..." : "Concluir e Acessar Painel"}
          </button>
        </form>

        <div
          className="auth-footer"
          style={{
            marginTop: "20px",
            textAlign: "center",
            borderTop: "1px solid var(--border-color)",
            paddingTop: "20px",
          }}
        >
          <p style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
            Seus dados são criptografados e protegidos por protocolos de
            segurança.
          </p>
        </div>
      </div>
    </div>
  );
}
