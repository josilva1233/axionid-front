// src/components/dashboard/AIChat.jsx
import { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

export default function AIChat({ isDark = false }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("checking");
  const messagesEndRef = useRef(null);

  // 🔥 SweetAlert com tema
  const AxionAlert = Swal.mixin({
    background: isDark ? "#111214" : "#ffffff",
    color: isDark ? "#ffffff" : "#1f2937",
    confirmButtonColor: "#6366f1",
    cancelButtonColor: "#343a40",
    customClass: {
      popup: `border ${isDark ? 'border-slate-700' : 'border-gray-200'} rounded-xl`,
      confirmButton: "px-4 py-2 rounded-full font-bold mx-2 bg-indigo-500 hover:bg-indigo-400 transition-colors",
      cancelButton: "px-4 py-2 rounded-full font-bold mx-2 bg-slate-700 hover:bg-slate-600 transition-colors",
    },
  });

  // ============ CLASSES DE TEMA ============
  const containerBg = isDark
    ? 'bg-slate-800/50 border-slate-700/50'
    : 'bg-white/80 border-gray-200';
  const headerBg = isDark
    ? 'bg-slate-800/30 border-slate-700/50'
    : 'bg-gray-100/80 border-gray-200';
  const textHeading = isDark ? 'text-white' : 'text-gray-800';
  const textSub = isDark ? 'text-slate-400' : 'text-gray-500';
  const inputBg = isDark
    ? 'bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder-slate-500'
    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400';
  const focusRing = 'focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50';
  const msgUserBg = isDark ? 'bg-blue-600' : 'bg-blue-600';
  const msgUserText = isDark ? 'text-white' : 'text-white';
  const msgAiBg = isDark ? 'bg-slate-700/50' : 'bg-gray-200/80';
  const msgAiText = isDark ? 'text-slate-200' : 'text-gray-800';
  const statusText = isDark ? 'text-slate-400' : 'text-gray-500';
  const emptyText = isDark ? 'text-slate-400' : 'text-gray-500';
  const emptyTitle = isDark ? 'text-white' : 'text-gray-800';
  const suggestionBg = isDark ? 'bg-slate-700/50 text-slate-300' : 'bg-gray-200/80 text-gray-700';
  const btnClear = isDark
    ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
    : 'text-gray-500 hover:text-red-600 hover:bg-red-50';
  const btnSend = 'bg-blue-600 hover:bg-blue-500 text-white';
  const footerBg = isDark
    ? 'border-slate-700/50 bg-slate-800/30'
    : 'border-gray-200 bg-gray-100/80';
  const metaText = isDark ? 'text-slate-500' : 'text-gray-400';

  // Carregar histórico ao montar
  useEffect(() => {
    loadHistory();
    checkStatus();
  }, []);

  // Scroll para o final quando novas mensagens chegam
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Carregar histórico do usuário
  const loadHistory = async () => {
    try {
      const response = await api.get("/ai/history");
      setMessages(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  };

  // Verificar status da IA (Ollama)
  const checkStatus = async () => {
    try {
      const response = await api.get("/ai/status");
      setStatus(response.data.status);
    } catch (error) {
      setStatus("offline");
    }
  };

  // Enviar mensagem
  const sendMessage = async () => {
    if (!input.trim()) return;
    if (status === "offline") {
      AxionAlert.fire({
        icon: "warning",
        title: "IA Offline",
        text: "A IA está indisponível no momento. Verifique se o Ollama está rodando.",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await api.post("/ai/chat", {
        message: userMessage,
        model: "llama3.1",
      });

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: response.data.message }
      ]);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setMessages(prev => [
        ...prev,
        { 
          role: "assistant", 
          content: "❌ Desculpe, tive um problema ao processar sua mensagem. Tente novamente." 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Limpar histórico
  const clearHistory = async () => {
    const result = await AxionAlert.fire({
      title: "Limpar histórico?",
      text: "Todas as conversas serão removidas permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, limpar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      try {
        await api.delete("/ai/history");
        setMessages([]);
        AxionAlert.fire({
          icon: "success",
          title: "Histórico limpo!",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        AxionAlert.fire({
          icon: "error",
          title: "Erro",
          text: "Não foi possível limpar o histórico.",
          confirmButtonColor: "#6366f1",
        });
      }
    }
  };

  // Tecla Enter para enviar
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-[600px] border rounded-xl overflow-hidden ${containerBg}`}>
      {/* ============ HEADER ============ */}
      <div className={`flex items-center justify-between px-6 py-4 border-b ${headerBg}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h3 className={`font-bold ${textHeading}`}>Axion AI</h3>
            <span className={`text-xs ${
              status === "online" ? "text-green-400" : status === "offline" ? "text-red-400" : "text-yellow-400"
            }`}>
              {status === "online" ? "🟢 ACTIVE" : status === "offline" ? "🔴 OFFLINE" : "⏳ CONECTANDO..."}
            </span>
          </div>
        </div>
        <button
          onClick={clearHistory}
          className={`text-xs transition-colors px-3 py-1.5 rounded-lg ${btnClear}`}
          disabled={messages.length === 0}
        >
          🗑️ Limpar
        </button>
      </div>

      {/* ============ MESSAGES ============ */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {messages.length === 0 && (
          <div className={`text-center ${emptyText} mt-10`}>
            <p className="text-4xl mb-3">👋</p>
            <p className={`font-medium ${emptyTitle}`}>Olá! Sou o assistente Axion AI.</p>
            <p className={`text-sm mt-1 ${emptyText}`}>Como posso ajudar na sua operação hoje?</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <span className={`px-3 py-1.5 rounded-full text-xs ${suggestionBg}`}>📊 Estatísticas do sistema</span>
              <span className={`px-3 py-1.5 rounded-full text-xs ${suggestionBg}`}>👤 Buscar usuário</span>
              <span className={`px-3 py-1.5 rounded-full text-xs ${suggestionBg}`}>🎫 Chamados urgentes</span>
              <span className={`px-3 py-1.5 rounded-full text-xs ${suggestionBg}`}>📁 Informações de grupo</span>
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-xl ${
                msg.role === "user"
                  ? `${msgUserBg} ${msgUserText}`
                  : `${msgAiBg} ${msgAiText}`
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <span className={`text-[10px] opacity-50 mt-1 block ${msg.role === "user" ? 'text-white/70' : isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {msg.role === "user" ? "Você" : "Axion AI"}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className={`px-4 py-2.5 rounded-xl ${msgAiBg}`}>
              <span className="flex gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ============ INPUT ============ */}
      <div className={`p-4 border-t ${footerBg}`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              status === "offline" 
                ? "🔴 IA offline - Verifique o servidor" 
                : "Digite sua mensagem..."
            }
            disabled={loading || status === "offline"}
            className={`flex-1 px-4 py-2.5 ${inputBg} rounded-lg text-sm ${focusRing} transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          <button
            onClick={sendMessage}
            disabled={loading || status === "offline" || !input.trim()}
            className={`px-4 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5 ${btnSend}`}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span>
            ) : (
              "📤 Enviar"
            )}
          </button>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <span className={`text-[10px] ${metaText}`}>🧠 Modelo: LLAMA-3.1</span>
          <span className={`text-[10px] ${
            status === "online" ? "text-green-400" : "text-red-400"
          }`}>
            {status === "online" ? "● Online" : "● Offline"}
          </span>
          <span className={`text-[10px] ${metaText}`}>
            {messages.length} mensagens
          </span>
        </div>
      </div>
    </div>
  );
}