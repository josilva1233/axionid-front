import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import api from "../services/api";
import { FaEnvelope, FaLock, FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login() {
  // Estados
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimer, setBlockTimer] = useState(0);
  
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);
  const inputRef = useRef(null);

  // Verificar se usuário está bloqueado
  useEffect(() => {
    const blockData = localStorage.getItem('@AxionID:block');
    if (blockData) {
      const { timestamp, attempts } = JSON.parse(blockData);
      const elapsed = Math.floor((Date.now() - timestamp) / 1000);
      
      if (elapsed < 300) { // 5 minutos de bloqueio
        setIsBlocked(true);
        setBlockTimer(300 - elapsed);
        setAttempts(attempts);
      } else {
        localStorage.removeItem('@AxionID:block');
        setAttempts(0);
      }
    }
    
    // Focar no primeiro campo
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Timer para desbloqueio
  useEffect(() => {
    let timer;
    if (isBlocked && blockTimer > 0) {
      timer = setInterval(() => {
        setBlockTimer(prev => {
          if (prev <= 1) {
            setIsBlocked(false);
            localStorage.removeItem('@AxionID:block');
            setAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBlocked, blockTimer]);

  // Verificar token do Google
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error) {
      setError("Falha na autenticação com Google. Tente novamente.");
      return;
    }

    if (token) {
      handleSocialLogin(token);
    }
  }, [navigate]);

  const handleSocialLogin = async (token) => {
    try {
      localStorage.setItem("@AxionID:token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await api.get("/api/v1/me");
      const user = response.data;

      // Salvar dados do usuário
      localStorage.setItem("@AxionID:user", JSON.stringify(user));
      const role = user.is_admin ? "admin" : "user";
      localStorage.setItem("@AxionID:role", role);

      // Limpar URL
      window.history.replaceState({}, document.title, "/login");

      // Log de sucesso
      await api.post('/api/v1/audit/log', {
        action: 'social_login',
        details: { provider: 'google', user_id: user.id }
      });

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Erro no login social:", err);
      setError("Erro ao autenticar com Google. Tente novamente.");
      localStorage.removeItem("@AxionID:token");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpar erro ao digitar
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validações
    if (!formData.email || !formData.password) {
      setError("Preencha todos os campos.");
      return;
    }

    if (!captchaToken) {
      setError("Por favor, confirme que você não é um robô.");
      return;
    }

    // Verificar bloqueio
    if (isBlocked) {
      setError(`Muitas tentativas. Aguarde ${blockTimer} segundos.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/v1/login", {
        email: formData.email,
        password: formData.password,
        captcha_token: captchaToken,
        remember_me: formData.rememberMe
      });

      const { token, user } = response.data;

      // Salvar dados
      localStorage.setItem("@AxionID:token", token);
      localStorage.setItem("@AxionID:user", JSON.stringify(user));
      const role = user.is_admin ? "admin" : "user";
      localStorage.setItem("@AxionID:role", role);
      
      if (formData.rememberMe) {
        localStorage.setItem("@AxionID:remember", "true");
      } else {
        localStorage.removeItem("@AxionID:remember");
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Resetar tentativas
      localStorage.removeItem('@AxionID:block');
      setAttempts(0);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      // Incrementar tentativas
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      // Bloquear após 5 tentativas
      if (newAttempts >= 5) {
        setIsBlocked(true);
        setBlockTimer(300);
        localStorage.setItem('@AxionID:block', JSON.stringify({
          attempts: newAttempts,
          timestamp: Date.now()
        }));
        setError("Muitas tentativas. Aguarde 5 minutos.");
      } else {
        const remaining = 5 - newAttempts;
        setError(
          err.response?.data?.message || 
          `Credenciais inválidas. ${remaining} tentativa(s) restante(s).`
        );
      }

      // Resetar captcha
      setCaptchaToken(null);
      recaptchaRef.current?.reset();

      console.error("Erro no login:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const origin = window.location.origin;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://163.176.168.224";
    // Salvar tentativa de login social
    localStorage.setItem('@AxionID:social_attempt', 'google');
    window.location.href = `${baseUrl}/api/v1/auth/google?origin=${origin}`;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-3">
      {/* Container Principal */}
      <div className="flex-1 flex flex-col justify-center items-center w-full max-w-sm my-auto">
        {/* Logo e Título */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-3xl font-black text-white">A</span>
            </div>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">
            Axion<span className="text-blue-400">ID</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Sistema de Gestão de Chamados</p>
        </div>

        {/* Cartão de Login */}
        <div className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl p-6 space-y-4">
          {/* Alertas */}
          {error && (
            <div className={`p-3 border rounded-lg text-sm ${error.includes('Aguarde') ? 'bg-yellow-900/30 border-yellow-700/50 text-yellow-300' : 'bg-red-900/30 border-red-700/50 text-red-300'}`}>
              <div className="flex items-start gap-2">
                <span className="text-lg">
                  {error.includes('Aguarde') ? '⏳' : '⚠️'}
                </span>
                <span>{error}</span>
              </div>
              {isBlocked && (
                <div className="mt-2 text-center font-mono text-lg">
                  {formatTime(blockTimer)}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Campo E-mail */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                E-mail
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  ref={inputRef}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  disabled={loading || isBlocked}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm placeholder-slate-400 focus:outline-none focus:bg-slate-700 focus:border-blue-500/50 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Senha
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={loading || isBlocked}
                  className="w-full pl-10 pr-12 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm placeholder-slate-400 focus:outline-none focus:bg-slate-700 focus:border-blue-500/50 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Lembrar de mim */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={loading || isBlocked}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700/50 text-blue-600 focus:ring-blue-500/50 transition-colors"
                />
                <span className="text-sm text-slate-400">Lembrar de mim</span>
              </label>
              <span className="text-xs text-slate-500">
                {attempts > 0 && !isBlocked && `${5 - attempts} tentativas restantes`}
              </span>
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <div className="transform scale-90 origin-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6Lc5n4ksAAAAAEXLVSyq519dGet20T0gaQ2LXzPY"}
                  onChange={(token) => setCaptchaToken(token)}
                  onExpired={() => setCaptchaToken(null)}
                  theme="dark"
                  size="normal"
                />
              </div>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={loading || isBlocked}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Autenticando...
                </span>
              ) : isBlocked ? (
                `Aguarde ${formatTime(blockTimer)}`
              ) : (
                "Entrar"
              )}
            </button>

            {/* Separador */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-800 text-slate-400">ou continue com</span>
              </div>
            </div>

            {/* Botão Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading || isBlocked}
              className="w-full flex items-center justify-center gap-3 py-3 bg-white/5 hover:bg-white/10 border border-slate-700 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              <span>Continuar com Google</span>
            </button>
          </form>

          {/* Criar Conta */}
          <div className="text-center pt-2 border-t border-slate-700/50">
            <p className="text-sm text-slate-400">
              Não tem uma conta?{" "}
              <Link
                to="/register"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div className="text-center text-slate-500 text-xs space-y-1 pt-4 pb-2">
        <p className="font-medium text-slate-400">
          STI - Sistema de Tecnologia da Informação
        </p>
        <p>
          Suporte:{" "}
          <a href="tel:21990849204" className="hover:text-slate-300 transition-colors">
            (21) 99084-9204
          </a>
          {" | "}
          <a
            href="mailto:josilva1233@gmail.com"
            className="hover:text-slate-300 transition-colors"
          >
            josilva1233@gmail.com
          </a>
        </p>
        <p className="text-slate-600 text-[10px]">
          Versão: 2.0.0 | {new Date().getFullYear()} AxionID
        </p>
      </div>
    </div>
  );
}