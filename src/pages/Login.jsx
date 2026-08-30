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
          
          // 🔥 CORREÇÃO: Redireciona para verificar termos
          navigate("/terms-check", { replace: true });
        })
        .catch((err) => {
          console.error("Erro ao buscar perfil do Google login", err);
          localStorage.removeItem("@AxionID:token");
          localStorage.removeItem("@AxionID:role");
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
      
      // 🔥 CORREÇÃO: Redireciona para verificar termos
      navigate("/terms-check", { replace: true });
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
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://163.176.168.224";
    window.location.href = `${baseUrl}/api/v1/auth/google?origin=${origin}`;
  };

  return (
    <div className="h-screen w-full flex flex-col justify-between items-center bg-slate-900 px-4 py-3 overflow-y-auto sm:overflow-hidden">
      {/* Container Centralizado */}
      <div className="flex-1 flex flex-col justify-center items-center w-full max-w-sm my-auto">
        {/* Logo e Título */}
        <div className="flex flex-col items-center mb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#4D6BFE] flex items-center justify-center text-white font-black text-lg shadow-md">
              A
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Axion<span className="text-[#4D6BFE]">ID</span>
            </span>
          </div>
          <p className="text-slate-400 text-xs">Entre na sua conta</p>
        </div>

        {/* Cartão de Login */}
        <div className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-xl p-4 space-y-3">
          {error && (
            <div className="p-2 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-[11px] text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            {/* Campo Usuário */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Usuário
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  className="w-full pl-3 pr-9 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:bg-slate-700 focus:border-[#4D6BFE] transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-3 pr-9 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:bg-slate-700 focus:border-[#4D6BFE] transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Lembrar de mim / Esqueceu a senha */}
            <div className="flex justify-between items-center text-[11px]">
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-700/50 text-[#4D6BFE] focus:ring-[#4D6BFE]"
                />
                Lembrar de mim
              </label>
              <Link
                to="/forgot-password"
                className="text-[#4D6BFE] hover:text-blue-400 hover:underline font-medium transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center py-0.5 overflow-hidden">
              <div className="transform scale-85 origin-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6Lc5n4ksAAAAAEXLVSyq519dGet20T0gaQ2LXzPY"
                  onChange={(token) => setCaptchaToken(token)}
                  onExpired={() => setCaptchaToken(null)}
                  theme="dark"
                />
              </div>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-[#4D6BFE] hover:bg-[#3D5AFE] active:bg-[#2E4BDB] text-white font-medium text-xs rounded-lg transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                "Entrar"
              )}
            </button>

            {/* Separador */}
            <div className="flex items-center gap-3 py-0.5">
              <div className="flex-1 h-px bg-slate-700/60"></div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">ou</span>
              <div className="flex-1 h-px bg-slate-700/60"></div>
            </div>

            {/* Botão Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 text-xs font-medium transition-colors"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-4 h-4"
              />
              <span>Continuar com Google</span>
            </button>
          </form>

          {/* Criar Conta */}
          <div className="text-center pt-2.5 border-t border-slate-700/50 text-xs">
            <p className="text-slate-400">
              Ainda não tem acesso?{" "}
              <Link
                to="/register"
                className="text-[#4D6BFE] hover:text-blue-400 hover:underline font-semibold ml-0.5"
              >
                Criar Conta
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Rodapé Fixo */}
      <div className="text-center text-slate-500 text-[10px] space-y-0.5 pt-2 pb-1">
        <p className="font-medium text-slate-400">
          STI - Sistema de Tecnologia da Informação e Conhecimento
        </p>
        <p>
          Suporte:{" "}
          <a href="tel:21990849204" className="underline hover:text-slate-300">
            (21) 990849204
          </a>{" "}
          |{" "}
          <a
            href="mailto:josilva1233@gmail.com"
            className="underline hover:text-slate-300"
          >
            josilva1233@gmail.com
          </a>
        </p>
        <p className="text-slate-600 text-[9px]">Versão: 1.2.1</p>
      </div>
    </div>
  );
}