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
    <div className="auth-container"> {/* Container pai para centralização e fundo */}
      <div className="auth-card animate-in">
        <div className="brand">
          <h1>
            Axion<span>ID</span>
          </h1>
        </div>

        {error && <div className="error-message" style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <label>Identificação</label>
            <input
              type="text"
              placeholder="CPF ou CNPJ"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <div className="label-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label>Senha</label>
              <Link to="/forgot-password" style={{ fontSize: "0.8rem", color: "var(--primary)", textDecoration: "none" }}>
                Esqueceu a senha?
              </Link>
            </div>
            <input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Autenticando..." : "Acessar Painel"}
          </button>

          <div className="divider" style={{ textAlign: 'center', margin: '20px 0', color: 'var(--text-dim)', fontSize: '0.85rem', position: 'relative' }}>
            <span style={{ background: 'var(--card-bg)', padding: '0 10px', position: 'relative', zIndex: 1 }}>ou continue com</span>
            <hr style={{ position: 'absolute', top: '50%', width: '100%', border: '0', borderTop: '1px solid var(--border)', margin: 0 }} />
          </div>

          <button
            type="button"
            className="btn-secondary" /* Usando a classe btn-secondary do seu CSS consolidado */
            onClick={handleGoogleLogin}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              width="18"
              alt="Google"
            />
            Google Workspace
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
          <p>
            Ainda não tem acesso?{" "}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Criar Conta AxionID</Link>
          </p>
        </div>
      </div>
    </div>
  );
}