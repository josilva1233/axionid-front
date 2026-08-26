import { useState, useRef, useEffect } from "react";

export default function OperationView() {
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

    setTimeout(() => {
      let responseText = "";
      if (input.toLowerCase().includes("status")) {
        responseText = "Todos os sistemas AxionID estão operando com latência de 24ms. Nenhum incidente reportado.";
      } else if (input.toLowerCase().includes("ajuda")) {
        responseText = "Posso ajudar você a localizar usuários, entender permissões ou gerar relatórios de auditoria.";
      } else {
        responseText = `Entendi sua solicitação sobre "${input}". Como sou um assistente operacional, estou analisando os dados para fornecer a melhor resposta técnica.`;
      }

      const aiResponse = { role: 'ai', content: responseText };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="bg-slate-800/30 rounded-xl overflow-hidden border border-slate-700/50 min-h-[500px] flex flex-col">
      {/* ============ HEADER ============ */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-b border-slate-700/50">
        <div>
          <h4 className="text-white font-bold mb-0.5 text-lg">🤖 Axion AI Research</h4>
          <p className="text-slate-400 text-sm mb-0">Assistente operacional de nova geração</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-300 border border-slate-600/50">
            LLAMA-3.1
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/20">
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
                  ? 'bg-blue-600/20 border border-blue-500/20 rounded-br-none'
                  : 'bg-slate-800/50 border border-slate-700/50 rounded-bl-none'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">{msg.role === 'user' ? '👤' : '🤖'}</span>
                <span className={`text-xs font-semibold ${msg.role === 'user' ? 'text-blue-400' : 'text-purple-400'}`}>
                  {msg.role === 'user' ? 'Operador' : 'Axion AI'}
                </span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed mb-0 whitespace-pre-wrap">
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl rounded-bl-none px-4 py-3 max-w-[85%]">
              <div className="flex items-center gap-2">
                <span className="text-sm">🤖</span>
                <span className="text-xs font-semibold text-purple-400">Axion AI</span>
                <div className="flex items-center gap-1 ml-2">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-slate-400 text-sm ml-1">processando comando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ============ FOOTER ============ */}
      <div className="px-4 py-3 border-t border-slate-700/50 bg-slate-800/30">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            placeholder="Pergunte algo sobre o sistema ou operação..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}