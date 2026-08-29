// src/components/dashboard/AIChat.jsx
import { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("checking");
  const messagesEndRef = useRef(null);

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
      Swal.fire({
        icon: "warning",
        title: "IA Offline",
        text: "A IA está indisponível no momento. Verifique se o Ollama está rodando.",
        background: "#111214",
        color: "#ffffff",
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
    const result = await Swal.fire({
      title: "Limpar histórico?",
      text: "Todas as conversas serão removidas permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, limpar",
      cancelButtonText: "Cancelar",
      background: "#111214",
      color: "#ffffff",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      try {
        await api.delete("/ai/history");
        setMessages([]);
        Swal.fire({
          icon: "success",
          title: "Histórico limpo!",
          timer: 1500,
          showConfirmButton: false,
          background: "#111214",
          color: "#ffffff",
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: "Não foi possível limpar o histórico.",
          background: "#111214",
          color: "#ffffff",
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
    <div className="flex flex-col h-[600px] bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
      {/* ============ HEADER ============ */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h3 className="text-white font-bold">Axion AI</h3>
            <span className={`text-xs ${
              status === "online" ? "text-green-400" : status === "offline" ? "text-red-400" : "text-yellow-400"
            }`}>
              {status === "online" ? "🟢 ACTIVE" : status === "offline" ? "🔴 OFFLINE" : "⏳ CONECTANDO..."}
            </span>
          </div>
        </div>
        <button
          onClick={clearHistory}
          className="text-xs text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
          disabled={messages.length === 0}
        >
          🗑️ Limpar
        </button>
      </div>

      {/* ============ MESSAGES ============ */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 mt-10">
            <p className="text-4xl mb-3">👋</p>
            <p className="font-medium text-white">Olá! Sou o assistente Axion AI.</p>
            <p className="text-sm mt-1">Como posso ajudar na sua operação hoje?</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <span className="px-3 py-1.5 bg-slate-700/50 rounded-full text-xs text-slate-300">📊 Estatísticas do sistema</span>
              <span className="px-3 py-1.5 bg-slate-700/50 rounded-full text-xs text-slate-300">👤 Buscar usuário</span>
              <span className="px-3 py-1.5 bg-slate-700/50 rounded-full text-xs text-slate-300">🎫 Chamados urgentes</span>
              <span className="px-3 py-1.5 bg-slate-700/50 rounded-full text-xs text-slate-300">📁 Informações de grupo</span>
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
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700/50 text-slate-200"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <span className="text-[10px] opacity-50 mt-1 block">
                {msg.role === "user" ? "Você" : "Axion AI"}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-700/50 px-4 py-2.5 rounded-xl">
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
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
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
            className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={sendMessage}
            disabled={loading || status === "offline" || !input.trim()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span>
            ) : (
              "📤 Enviar"
            )}
          </button>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-[10px] text-slate-500">🧠 Modelo: LLAMA-3.1</span>
          <span className={`text-[10px] ${
            status === "online" ? "text-green-400" : "text-red-400"
          }`}>
            {status === "online" ? "● Online" : "● Offline"}
          </span>
          <span className="text-[10px] text-slate-500">
            {messages.length} mensagens
          </span>
        </div>
      </div>
    </div>
  );
}