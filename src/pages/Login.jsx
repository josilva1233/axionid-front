import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

// Constantes para evitar erros de digitação (Magic Strings)
const TOKEN_KEY = "@AxionID:token";
const ROLE_KEY = "@AxionID:role";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Função para padronizar o salvamento de sessão
  const saveSession = useCallback((token, user) => {
    const role = user.is_admin === 1 || user.is_admin === true ? "admin" : "user";
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ROLE_KEY, role);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }, []);

  // Efeito para capturar login via Google (URL params)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      setLoading(true);
      api.get("/api/v1/me")
        .then((res) => {
          saveSession(token, res.data);
          window.history.replaceState({}, document.title, "/login");
          navigate("/dashboard", { replace: true });
        })
        .catch((err) => {
          console.error("Erro na validação do Google Login:", err);
          setError("Falha na autenticação via Google.");
        })
        .finally(() => setLoading(false));
    }
  }, [navigate, saveSession]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/api/v1/login", {
        username: formData.username,
        password: formData.password,
      });

      saveSession(data.token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError("Credenciais inválidas. Verifique seu usuário e senha.");
      console.error("Login Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const origin = window.location.origin;
    // Mantida a sua rota original conforme solicitado
    window.location.href = `http://163.176.168.224/api/v1/auth/google?origin=${origin}`;
  };

  return (
    <div className="auth-container">
      <main className="auth-card animate-in">
        <header className="brand">
          <h1>Axion<span>ID</span></h1>
          <p className="subtitle">Gestão de Identidade e Acesso</p>
        </header>

        {error && (
          <div className="error-badge">
            <i className="error-icon">!</i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <label htmlFor="username">Identificação</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="CPF ou CNPJ"
              value={formData.username}
              onChange={handleInputChange}
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <div className="label-row">
              <label htmlFor="password">Senha</label>
              <Link to="/forgot-password" title="Recuperar acesso">
                Esqueceu a senha?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="loader"></span> : "Acessar Painel"}
          </button>

          <div className="divider">
            <span>ou continue com</span>
          </div>

          <button
            type="button"
            className="btn-google"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google Logo"
            />
            Google Workspace
          </button>
        </form>

        <footer className="auth-footer">
          <p>
            Ainda não tem acesso? <Link to="/register">Criar Conta AxionID</Link>
          </p>
        </footer>
      </main>
    </div>
  );
}