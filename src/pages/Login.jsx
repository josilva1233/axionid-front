import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import api from "../services/api";
import "../Login.css"; // Vamos criar um arquivo CSS separado

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page-container">
      <div className="login-background">
        <div className="bg-gradient"></div>
        <div className="bg-pattern"></div>
      </div>

      <div className="login-card animate-in">
        {/* Header */}
        <div className="login-header">
          <div className="brand">
            <h1>
              Axion<span>ID</span>
            </h1>
          </div>
          <div className="auth-header">
            <h2>Acessar Conta</h2>
            <p>Identifique-se para gerenciar seus serviços.</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message" role="alert">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="login-form">
          {/* Campo Identificação */}
          <div className="form-group">
            <label htmlFor="username">Identificação</label>
            <div className="input-wrapper">
              <i className="bi bi-person input-icon"></i>
              <input
                id="username"
                type="text"
                placeholder="CPF, CNPJ ou e-mail"
                value={username}
                autoComplete="username"
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                disabled={loading}
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Senha</label>
              <Link to="/forgot-password" className="forgot-link">
                Esqueceu a senha?
              </Link>
            </div>
            <div className="input-wrapper">
              <i className="bi bi-lock input-icon"></i>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                <i className={`bi bi-eye${showPassword ? "-slash" : ""}`}></i>
              </button>
            </div>
          </div>

          {/* reCAPTCHA */}
          <div className="captcha-wrapper">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6Lc5n4ksAAAAAEXLVSyq519dGet20T0gaQ2LXzPY"
              onChange={(token) => setCaptchaToken(token)}
              onExpired={() => setCaptchaToken(null)}
              theme="dark"
              size="normal"
            />
          </div>

          {/* Botão Login */}
          <button 
            type="submit" 
            className="btn-login" 
            disabled={loading || !captchaToken}
          >
            {loading ? (
              <>
                <i className="bi bi-hourglass-split spinning"></i>
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i>
                <span>Acessar Painel</span>
              </>
            )}
          </button>

          {/* Divisor */}
          <div className="divider">
            <span>ou continue com</span>
          </div>

          {/* Botão Google Workspace */}
          <button
            type="button"
            className="btn-google"
            onClick={handleGoogleLogin}
            disabled={loading}
            aria-label="Fazer login com Google Workspace"
          >
            <div className="google-icon">
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt=""
                aria-hidden="true"
              />
            </div>
            <span>Continuar com Google Workspace</span>
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>
            Ainda não tem acesso? <Link to="/register">Criar Conta AxionID</Link>
          </p>
        </div>
      </div>
    </div>
  );
}