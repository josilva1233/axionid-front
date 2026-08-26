import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import api from "../services/api";

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
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white overflow-hidden">
      {/* LADO ESQUERDO: Branding & Grafismo */}
      <div className="relative w-full md:w-1/2 flex items-center justify-center p-8 lg:p-12 min-h-[300px] md:min-h-screen">
        {/* Curvas Orgânicas Decorativas em SVG */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none text-slate-300 stroke-current opacity-60"
          viewBox="0 0 500 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M-100 0 C 150 200, 100 400, 300 500" strokeWidth="1.5" />
          <path d="M-50 -50 C 200 150, 150 350, 400 500" strokeWidth="1.5" />
          <path d="M0 -100 C 250 100, 200 300, 500 450" strokeWidth="1.5" />
        </svg>

        {/* Logo / Marca Principal */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-900 flex items-center justify-center text-white font-black text-2xl shadow-md">
              A
            </div>
            <span className="text-4xl lg:text-5xl font-extrabold text-blue-900 tracking-tight">
              Axion<span className="text-blue-600">ID</span>
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            Plataforma Unificada de Identidade
          </p>
        </div>
      </div>

      {/* LADO DIREITO: Painel Azul & Formulário */}
      <div className="w-full md:w-1/2 bg-[#1b4b82] rounded-t-[40px] md:rounded-t-none md:rounded-l-[40px] flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden">
        {/* Marca d'água sutil no canto inferior direito */}
        <div className="absolute -bottom-10 -right-10 text-white/5 pointer-events-none text-9xl font-black select-none">
          AXION
        </div>

        {/* Espaçador Superior */}
        <div className="hidden md:block" />

        {/* Container Centralizado do Card */}
        <div className="w-full max-w-[420px] mx-auto z-10 my-auto">
          {/* Subtítulo superior */}
          <p className="text-white/90 text-xs text-center mb-3 font-normal">
            Informe suas credenciais para realizar o acesso:
          </p>

          {/* Card Branco com Login */}
          <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8">
            {/* Mensagem de Erro */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Campo Usuário com ícone à direita */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Login"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  className="w-full pl-4 pr-10 py-3 bg-blue-50/50 border border-slate-200 rounded-md text-slate-700 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>

              {/* Campo Senha com ícone à direita */}
              <div className="relative">
                <input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-4 pr-10 py-3 bg-blue-50/50 border border-slate-200 rounded-md text-slate-700 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>

              {/* Esqueceu a Senha */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              {/* ReCAPTCHA */}
              <div className="flex justify-center my-3 overflow-x-auto">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6Lc5n4ksAAAAAEXLVSyq519dGet20T0gaQ2LXzPY"
                  onChange={(token) => setCaptchaToken(token)}
                  onExpired={() => setCaptchaToken(null)}
                  theme="light"
                />
              </div>

              {/* Botão Submit principal estilo azul chapado */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#0066cc] hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-md transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  "Login"
                )}
              </button>

              {/* Botão Google Workspace */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-slate-600 text-xs font-medium transition-colors"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-4 h-4"
                />
                <span>Continuar com Google</span>
              </button>
            </form>

            {/* Cadastro */}
            <div className="text-center mt-4 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Ainda não tem acesso?{" "}
                <Link to="/register" className="text-blue-600 hover:underline font-semibold">
                  Criar Conta
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé Institucional */}
        <div className="text-center text-white/80 text-[11px] leading-relaxed mt-6 z-10">
          <p className="font-medium">SGA - Secretaria de Tecnologia da Informação</p>
          <p>
            Suporte:{" "}
            <a href="tel:8534911770" className="underline hover:text-white">
              (85) 3491-1770
            </a>{" "}
            |{" "}
            <a href="mailto:sti.atendimento@tjce.jus.br" className="underline hover:text-white">
              sti.atendimento@tjce.jus.br
            </a>
          </p>
          <p className="text-white/40 mt-3 text-[10px]">Versão: 1.2.1</p>
        </div>
      </div>
    </div>
  );
}