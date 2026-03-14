import { useState, useRef, useEffect } from "react";
import { Form, Button, Card, Badge, Spinner } from "react-bootstrap";

export default function OperationView() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Olá! Sou o assistente inteligente do AxionID. Como posso ajudar na sua operação hoje?' }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulação de resposta da IA
    setTimeout(() => {
      const aiResponse = { 
        role: 'ai', 
        content: `Analisei seu pedido sobre "${input}". No momento, estou em modo de demonstração, mas posso processar logs, gerar relatórios e validar acessos em tempo real assim que a integração com a API for concluída.` 
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="p-2 animate-in d-flex flex-column" style={{ height: 'calc(100vh - 160px)' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="text-white mb-1">Axion AI Research</h4>
          <p className="text-secondary small">Assistente operacional inteligente v1.0</p>
        </div>
        <Badge bg="info" className="p-2 shadow-sm">AI AGENT ACTIVE</Badge>
      </div>

      {/* Área de Chat */}
      <Card className="flex-grow-1 bg-dark border-secondary overflow-hidden d-flex flex-column">
        <Card.Body className="overflow-auto p-4 custom-scrollbar" style={{ background: '#0f1012' }}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`d-flex mb-4 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
              <div 
                className={`p-3 rounded-4 shadow-sm`} 
                style={{ 
                  maxWidth: '80%',
                  background: msg.role === 'user' ? '#6f42c1' : '#1d1e22',
                  color: '#fff',
                  border: msg.role === 'user' ? 'none' : '1px solid #343a40'
                }}
              >
                <div className="small mb-1 opacity-50 fw-bold">
                  {msg.role === 'user' ? 'VOCÊ' : 'AXION AI'}
                </div>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="text-secondary small animate-pulse">
              <Spinner animation="grow" size="sm" variant="info" className="me-2" />
              IA está processando...
            </div>
          )}
          <div ref={messagesEndRef} />
        </Card.Body>

        {/* Input de Pesquisa */}
        <Card.Footer className="bg-dark border-secondary p-3">
          <Form onSubmit={handleSend} className="d-flex gap-2">
            <Form.Control
              type="text"
              placeholder="Digite sua dúvida ou comando operacional..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="custom-input-dark border-secondary py-2"
              style={{ background: '#0a0b0d', color: '#fff' }}
            />
            <Button type="submit" variant="primary" className="px-4">
              <i className="bi bi-send"></i>
            </Button>
          </Form>
        </Card.Footer>
      </Card>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #343a40; border-radius: 10px; }
        .animate-pulse { animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}