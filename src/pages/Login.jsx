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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f7f8fa] px-4 py-8">
      <div className="w-full max-w-[400px]">
        {/* Logo e título centralizados */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#4D6BFE] flex items-center justify-center text-white font-black text-xl shadow-md">
              A
            </div>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">
              Axion<span className="text-[#4D6BFE]">ID</span>
            </span>
          </div>
          <p className="text-slate-500 text-sm">Entre na sua conta</p>
        </div>

        {/* Cartão branco com sombra suave */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Campo Usuário */}
            <div className="relative">
              <input
                type="text"
                placeholder="Usuário ou e-mail"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#4D6BFE] focus:ring-2 focus:ring-[#4D6BFE]/20 transition-all"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            {/* Campo Senha */}
            <div className="relative">
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#4D6BFE] focus:ring-2 focus:ring-[#4D6BFE]/20 transition-all"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            {/* Link Esqueci a Senha */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-[#4D6BFE] hover:text-blue-700 hover:underline font-medium transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>

            {/* reCAPTCHA centralizado */}
            <div className="flex justify-center overflow-hidden">
              <div className="transform scale-90 origin-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6Lc5n4ksAAAAAEXLVSyq519dGet20T0gaQ2LXzPY"
                  onChange={(token) => setCaptchaToken(token)}
                  onExpired={() => setCaptchaToken(null)}
                  theme="light"
                />
              </div>
            </div>

            {/* Botão Principal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#4D6BFE] hover:bg-[#3D5AFE] active:bg-[#2E4BDB] text-white font-semibold text-sm rounded-lg transition-all shadow-md shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                "Entrar"
              )}
            </button>

            {/* Separador */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-xs text-slate-400">ou</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Botão Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-xs font-medium transition-colors"
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
          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Ainda não tem acesso?{" "}
              <Link
                to="/register"
                className="text-[#4D6BFE] hover:text-blue-700 hover:underline font-semibold ml-0.5"
              >
                Criar Conta
              </Link>
            </p>
          </div>
        </div>

        {/* Rodapé discreto */}
        <div className="text-center text-slate-400 text-xs mt-6 space-y-1">
          <p className="font-medium text-slate-500">
            SGA - Secretaria de Tecnologia da Informação
          </p>
          <p>
            Suporte:{" "}
            <a href="tel:8534911770" className="underline hover:text-slate-600">
              (85) 3491-1770
            </a>{" "}
            |{" "}
            <a
              href="mailto:sti.atendimento@tjce.jus.br"
              className="underline hover:text-slate-600"
            >
              sti.atendimento@tjce.jus.br
            </a>
          </p>
          <p className="text-slate-300 text-[11px]">Versão: 1.2.1</p>
        </div>
      </div>
    </div>
  );
}