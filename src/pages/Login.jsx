import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import api from "../services/api";
import "../Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);

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

    if (!captchaToken) {
      setError("Por favor, confirme que você não é um robô.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/v1/login", {
        username,
        password,
        captcha_token: captchaToken,
      });

      const { token, user } = response.data;

      localStorage.setItem("@AxionID:token", token);
      const role =
        user.is_admin === 1 || user.is_admin === true ? "admin" : "user";
      localStorage.setItem("@AxionID:role", role);

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Usuário ou senha incorretos.");
      console.error("Erro no login manual", err);
      setCaptchaToken(null);
      recaptchaRef.current?.reset();
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
        {/* Header com a mesma identidade da tela de recuperar senha */}
        <div className="brand">
          <h1>
            Axion<span>ID</span>
          </h1>
        </div>

        <div className="auth-header">
          <h2>Acessar Conta</h2>
          <p>Identifique-se para gerenciar seus serviços.</p>
        </div>

        {/* Mensagem de erro com o mesmo estilo */}
        {error && (
          <div className="error-message">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          {/* Campo IDENTIFICAÇÃO - mesmo estilo da tela de recuperar senha */}
          <div className="input-group">
            <label>IDENTIFICAÇÃO</label>
            <input
              type="text"
              placeholder="seu@email.com"
              value={username}
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Campo SENHA com link "Esqueceu a senha?" */}
          <div className="input-group">
            <div className="label-row">
              <label>SENHA</label>
              <Link to="/forgot-password" className="forgot-link">
                Esqueceu a senha?
              </Link>
            </div>
            <input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {/* CAPTCHA */}
          <div className="captcha-container">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6Lc5n4ksAAAAAEXLVSyq519dGet20T0gaQ2LXzPY"
              onChange={(token) => setCaptchaToken(token)}
              onExpired={() => setCaptchaToken(null)}
              theme="dark"
            />
          </div>

          {/* Botão principal */}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Autenticando..." : "Acessar Painel"}
          </button>

          {/* Divisor "ou continue com" */}
          <div className="divider">
            <span>ou continue com</span>
          </div>

          {/* Botão Google Workspace */}
          <button
            type="button"
            className="btn-google-workspace"
            onClick={handleGoogleLogin}
          >
            <div className="google-icon-wrapper">
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt=""
              />
            </div>
            <span className="btn-text">Continuar com Google Workspace</span>
          </button>
        </form>

        {/* Footer com link para cadastro */}
        <div className="auth-footer">
          <p>
            Ainda não tem acesso? <Link to="/register">Criar Conta AxionID</Link>
          </p>
        </div>
      </div>
    </div>
  );
}