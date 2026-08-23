import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import api from "../services/api";
import "../Login.css";

// ─── Configurações ───────────────────────────────────────
const CONFIG = {
  SITE_KEY: "6Lc5n4ksAAAAAEXLVSyq519dGet20T0gaQ2LXzPY",
  API_GOOGLE_AUTH: "http://163.176.168.224/api/v1/auth/google",
  STORAGE_KEYS: {
    TOKEN: "@AxionID:token",
    ROLE: "@AxionID:role",
  },
  ROUTES: {
    DASHBOARD: "/dashboard",
    LOGIN: "/login",
  },
  MESSAGES: {
    NO_CAPTCHA: "Por favor, confirme que você não é um robô.",
    LOGIN_FAILED: "Usuário ou senha incorretos.",
  },
};

// ─── Componente ───────────────────────────────────────────
export default function Login() {
  // Estados
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Hooks
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);

  // ─── Trata retorno do login Google ─────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) return;

    localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const fetchUser = async () => {
      try {
        const res = await api.get("/api/v1/me");
        const user = res.data;
        const role = user.is_admin === 1 || user.is_admin === true ? "admin" : "user";
        localStorage.setItem(CONFIG.STORAGE_KEYS.ROLE, role);

        window.history.replaceState({}, document.title, CONFIG.ROUTES.LOGIN);
        navigate(CONFIG.ROUTES.DASHBOARD, { replace: true });
      } catch (err) {
        console.error("Erro ao buscar perfil do Google:", err);
        navigate(CONFIG.ROUTES.LOGIN, { replace: true });
      }
    };

    fetchUser();
  }, [navigate]);

  // ─── Define papel do usuário ────────────────────────────
  const resolveUserRole = useCallback((user) => {
    return user.is_admin === 1 || user.is_admin === true ? "admin" : "user";
  }, []);

  // ─── Login por senha ─────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      setError(CONFIG.MESSAGES.NO_CAPTCHA);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/api/v1/login", {
        username,
        password,
        captcha_token: captchaToken,
      });

      const { token, user } = data;
      const role = resolveUserRole(user);

      localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(CONFIG.STORAGE_PATH.ROLE, role);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      navigate(CONFIG.ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || CONFIG.MESSAGES.LOGIN_FAILED);
      console.error("Erro no login:", err);
      setCaptchaToken(null);
      recaptchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  // ─── Login via Google ───────────────────────────────────
  const handleGoogleLogin = useCallback(() => {
    const origin = window.location.origin;
    window.location.href = `${CONFIG.API_GOOGLE_AUTH}?origin=${encodeURIComponent(origin)}`;
  }, []);

  // ─── Captcha ────────────────────────────────────────────
  const handleCaptchaChange = useCallback((token) => {
    setCaptchaToken(token);
  }, []);

  const handleCaptchaExpire = useCallback(() => {
    setCaptchaToken(null);
  }, []);

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Marca */}
        <div className="brand">
          <h1>Axion<span>ID</span></h1>
        </div>

        {/* Cabeçalho */}
        <div className="auth-header">
          <h2>Acessar Conta</h2>
          <p>Identifique-se para gerenciar seus serviços.</p>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="error-message" role="alert">
            <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleLogin} className="auth-form" noValidate>
          {/* Usuário */}
          <div className="input-group">
            <label htmlFor="username">IDENTIFICAÇÃO</label>
            <input
              id="username"
              type="text"
              placeholder="seu@email.com"
              value={username}
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Senha */}
          <div className="input-group">
            <div className="label-row">
              <label htmlFor="password">SENHA</label>
              <Link to="/forgot-password" className="forgot-link">
                Esqueceu a senha?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {/* Captcha */}
          <div className="captcha-container">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={CONFIG.SITE_KEY}
              onChange={handleCaptchaChange}
              onExpired={handleCaptchaExpire}
              theme="dark"
            />
          </div>

          {/* Botão entrar */}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Autenticando..." : "Acessar Painel"}
          </button>

          {/* Divisor */}
          <div className="divider">
            <span>ou continue com</span>
          </div>

          {/* Botão Google */}
          <button
            type="button"
            className="btn-google-workspace"
            onClick={handleGoogleLogin}
          >
            <div className="google-icon-wrapper">
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                loading="lazy"
              />
            </div>
            <span className="btn-text">Continuar com Google Workspace</span>
          </button>
        </form>

        {/* Rodapé */}
        <div className="auth-footer">
          <p>
            Ainda não tem acesso? <Link to="/register">Criar Conta AxionID</Link>
          </p>
        </div>
      </div>
    </div>
  );
}