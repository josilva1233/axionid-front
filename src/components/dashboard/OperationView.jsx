import { useState, useRef, useEffect } from "react";
import api from "../../services/api";

export default function OperationView({ isDark = false }) {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Olá! Sou o assistente inteligente do AxionID. Como posso ajudar na sua operação hoje?' }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await api.post("/ai/chat", { message: input });
      const aiMsg = response.data.message || "Desculpe, não consegui processar sua pergunta.";
      
      const aiResponse = { role: 'ai', content: aiMsg };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMsg = "❌ Erro ao processar sua pergunta. Tente novamente.";
      setMessages(prev => [...prev, { role: 'ai', content: errorMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  // ============ CLASSES DE TEMA ============
  const containerBg = isDark 
    ? 'bg-slate-800/30 border-slate-700/50' 
    : 'bg-gray-100/50 border-gray-200';
  const headerBg = isDark 
    ? 'from-slate-800/50 to-slate-900/50 border-slate-700/50' 
    : 'from-gray-100/80 to-white border-gray-200';
  const textHeading = isDark ? 'text-white' : 'text-gray-800';
  const textSub = isDark ? 'text-slate-400' : 'text-gray-500';
  const badgeStatus = isDark 
    ? 'bg-slate-700/50 text-slate-300 border-slate-600/50' 
    : 'bg-gray-200 text-gray-700 border-gray-300';
  const badgeActive = isDark 
    ? 'bg-green-500/20 text-green-400 border-green-500/20' 
    : 'bg-green-100 text-green-700 border-green-200';
  const msgUserBg = isDark 
    ? 'bg-blue-600/20 border-blue-500/20' 
    : 'bg-blue-100/80 border-blue-300/30';
  const msgAiBg = isDark 
    ? 'bg-slate-800/50 border-slate-700/50' 
    : 'bg-white/80 border-gray-200';
  const msgUserText = isDark ? 'text-slate-200' : 'text-gray-800';
  const msgAiText = isDark ? 'text-slate-200' : 'text-gray-700';
  const msgUserLabel = isDark ? 'text-blue-400' : 'text-blue-700';
  const msgAiLabel = isDark ? 'text-purple-400' : 'text-purple-700';
  const inputBg = isDark 
    ? 'bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder-slate-500' 
    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400';
  const inputFocus = 'focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50';
  const btnSend = 'bg-blue-600 hover:bg-blue-500 text-white';
  const footerBg = isDark ? 'bg-slate-800/30 border-slate-700/50' : 'bg-gray-50/80 border-gray-200';

  return (
    <div className={`rounded-xl overflow-hidden border flex flex-col min-h-[500px] ${containerBg}`}>
      {/* ============ HEADER ============ */}
      <div className={`flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-gradient-to-r ${headerBg} border-b`}>
        <div>
          <h4 className={`font-bold mb-0.5 text-lg ${textHeading}`}>🤖 Axion AI Research</h4>
          <p className={`text-sm mb-0 ${textSub}`}>Assistente operacional de nova geração</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold border ${badgeStatus}`}>
            LLAMA-3.1
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${badgeActive}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            ACTIVE
          </span>
        </div>
      </div>

      {/* ============ MENSAGENS ============ */}
      <div className="flex-1 p-4 overflow-y-auto max-h-[400px] custom-scrollbar space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[85%] rounded-2xl p-4
                ${msg.role === 'user'
                  ? `${msgUserBg} rounded-br-none`
                  : `${msgAiBg} rounded-bl-none`
                }
              `}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">{msg.role === 'user' ? '👤' : '🤖'}</span>
                <span className={`text-xs font-semibold ${msg.role === 'user' ? msgUserLabel : msgAiLabel}`}>
                  {msg.role === 'user' ? 'Operador' : 'Axion AI'}
                </span>
              </div>
              <p className={`text-sm leading-relaxed mb-0 whitespace-pre-wrap ${msg.role === 'user' ? msgUserText : msgAiText}`}>
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className={`${msgAiBg} rounded-2xl rounded-bl-none px-4 py-3 max-w-[85%]`}>
              <div className="flex items-center gap-2">
                <span className="text-sm">🤖</span>
                <span className={`text-xs font-semibold ${msgAiLabel}`}>Axion AI</span>
                <div className="flex items-center gap-1 ml-2">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className={`text-sm ml-1 ${textSub}`}>processando comando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ============ FOOTER ============ */}
      <div className={`px-4 py-3 border-t ${footerBg}`}>
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            placeholder="Pergunte algo sobre o sistema ou operação..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={`flex-1 px-4 py-2.5 border rounded-xl text-sm transition-all ${inputBg} ${inputFocus}`}
          />
          <button
            type="submit"
            className={`px-6 py-2.5 font-semibold rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${btnSend}`}
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}