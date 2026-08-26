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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f7f8fa] px-4 py-12">
      <div className="w-full max-w-[480px]">
        {/* Logo e título */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-xl bg-[#4D6BFE] flex items-center justify-center text-white font-black text-3xl shadow-md">
              A
            </div>
            <span className="text-4xl font-bold text-slate-800 tracking-tight">
              Axion<span className="text-[#4D6BFE]">ID</span>
            </span>
          </div>
          <p className="text-slate-500 text-lg">Entre na sua conta</p>
        </div>

        {/* Cartão branco com mais padding interno */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-12 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-8">
            {/* Campo Usuário */}
            <div>
              <label className="block text-base font-medium text-slate-700 mb-4">
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
                  className="w-full pl-4 pr-12 py-5 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#4D6BFE] focus:ring-2 focus:ring-[#4D6BFE]/20 transition-all"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-base font-medium text-slate-700 mb-4">
                Senha
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-4 pr-12 py-5 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#4D6BFE] focus:ring-2 focus:ring-[#4D6BFE]/20 transition-all"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Lembrar de mim / Esqueceu a senha - com margem superior extra */}
            <div className="flex justify-between items-center mt-2">
              <label className="flex items-center gap-2 text-base text-slate-600">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-slate-300 text-[#4D6BFE] focus:ring-[#4D6BFE]"
                />
                Lembrar de mim
              </label>
              <Link
                to="/forgot-password"
                className="text-base text-[#4D6BFE] hover:text-blue-700 hover:underline font-medium transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>

            {/* reCAPTCHA - mais espaço ao redor */}
            <div className="flex justify-center py-4">
              <div className="transform scale-100 origin-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6Lc5n4ksAAAAAEXLVSyq519dGet20T0gaQ2LXzPY"
                  onChange={(token) => setCaptchaToken(token)}
                  onExpired={() => setCaptchaToken(null)}
                  theme="light"
                />
              </div>
            </div>

            {/* Botão Principal - com margem superior extra */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 px-4 bg-[#4D6BFE] hover:bg-[#3D5AFE] active:bg-[#2E4BDB] text-white font-semibold text-lg rounded-xl transition-all shadow-md shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                "Entrar"
              )}
            </button>

            {/* Separador */}
            <div className="flex items-center gap-4 py-1">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-base text-slate-400">ou</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Botão Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-base font-medium transition-colors"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-6 h-6"
              />
              <span>Continuar com Google</span>
            </button>
          </form>

          {/* Cadastro */}
          <div className="text-center pt-6 border-t border-slate-100">
            <p className="text-base text-slate-500">
              Ainda não tem acesso?{" "}
              <Link
                to="/register"
                className="text-[#4D6BFE] hover:text-blue-700 hover:underline font-semibold ml-1"
              >
                Criar Conta
              </Link>
            </p>
          </div>
        </div>

        {/* Rodapé */}
        <div className="text-center text-slate-400 text-sm mt-8 space-y-2">
          <p className="font-medium text-slate-500">
            STI - Sistema de Tecnologia da Informação
          </p>
          <p>
            Suporte:{" "}
            <a href="tel:21990849204" className="underline hover:text-slate-600">
              (21) 990849204
            </a>{" "}
            |{" "}
            <a
              href="mailto:josilva1233@gmail.com"
              className="underline hover:text-slate-600"
            >
              josilva1233@gmail.com
            </a>
          </p>
          <p className="text-slate-300 text-xs">Versão: 1.2.1</p>
        </div>
      </div>
    </div>
  );
}