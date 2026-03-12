import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("@AxionID:token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      api
        .get("/api/v1/me")
        .then((res) => {
          const user = res.data;
          const role =
            user.is_admin === 1 || user.is_admin === true ? "admin" : "user";
          localStorage.setItem("@AxionID:role", role);
          window.history.replaceState({}, document.title, "/login");
          navigate("/dashboard", { replace: true });
        })
        .catch((err) => {
          console.error("Erro ao buscar perfil do Google login", err);
          navigate("/login", { replace: true });
        });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/v1/login", { username, password });
      const { token, user } = response.data;

      localStorage.setItem("@AxionID:token", token);
      const role =
        user.is_admin === 1 || user.is_admin === true ? "admin" : "user";
      localStorage.setItem("@AxionID:role", role);

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError("Usuário ou senha incorretos.");
      console.error("Erro no login manual", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const origin = window.location.origin;
    window.location.href = `http://163.176.168.224/api/v1/auth/google?origin=${origin}`;
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-in">
        <div className="brand">
          <h1>
            Axion<span>ID</span>
          </h1>
        </div>

        <div
          className="auth-header"
          style={{ textAlign: "center", marginBottom: "20px" }}
        >
          <h2>Acessar Conta</h2>
          <p>Identifique-se para gerenciar seus serviços.</p>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: "15px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <label>Identificação</label>
            <input
              type="text"
              placeholder="CPF ou CNPJ"
              value={username}
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <div
              className="label-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <label>Senha</label>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: "0.8rem",
                  color: "var(--primary)",
                  textDecoration: "none",
                }}
              >
                Esqueceu a senha?
              </Link>
            </div>
            <input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autocomplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Autenticando..." : "Acessar Painel"}
          </button>

          <div className="divider">
            <span>ou continue com</span>
          </div>

          <button
            type="button"
            className="btn-google-workspace"
            onClick={handleGoogleLogin}
            aria-label="Fazer login com Google Workspace"
          >
            <div className="google-icon-wrapper">
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt=""
                aria-hidden="true"
              />
            </div>
            <span className="btn-text">Continuar com Google Workspace</span>
          </button>
        </form>

        <div
          className="auth-footer"
          style={{ marginTop: "20px", textAlign: "center" }}
        >
          <p>
            Ainda não tem acesso?{" "}
            <Link to="/register">Criar Conta AxionID</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
