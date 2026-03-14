import { useState, useRef, useEffect } from "react";
import { Form, Button, Card, Badge, Spinner } from "react-bootstrap";

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

    try {
      /* EXEMPLO DE CHAMADA REAL (GROQ / OPENAI STYLE):
         Para usar real, você precisaria de um token no Header 'Authorization'.
         Vou simular a lógica de resposta inteligente.
      */
      
      // Simulação de resposta baseada no input
      setTimeout(() => {
        let responseText = "";
        if(input.toLowerCase().includes("status")) {
          responseText = "Todos os sistemas AxionID estão operando com latência de 24ms. Nenhum incidente reportado.";
        } else if(input.toLowerCase().includes("ajuda")) {
          responseText = "Posso ajudar você a localizar usuários, entender permissões ou gerar relatórios de auditoria.";
        } else {
          responseText = `Entendi sua solicitação sobre "${input}". Como sou um assistente operacional, estou analisando os dados para fornecer a melhor resposta técnica.`;
        }

        const aiResponse = { role: 'ai', content: responseText };
        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1000);

    } catch (error) {
      console.error("Erro na IA:", error);
      setIsTyping(false);
    }
  };

  return (
    <div className="p-4 animate-in d-flex flex-column" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="text-white mb-1">Axion AI Research</h4>
          <p className="text-secondary small">Assistente operacional de nova geração</p>
        </div>
        <div className="d-flex gap-2">
            <Badge bg="dark" className="border border-secondary p-2">LLAMA-3.1</Badge>
            <Badge bg="info" className="p-2 text-dark">ACTIVE</Badge>
        </div>
      </div>

      <Card className="flex-grow-1 bg-dark border-secondary overflow-hidden d-flex flex-column shadow-lg" style={{ borderRadius: '15px' }}>
        <Card.Body className="overflow-auto p-4 custom-scrollbar" style={{ background: '#0d0e10' }}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`d-flex mb-4 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
              <div 
                className={`p-3 rounded-4 shadow-sm ${msg.role === 'user' ? 'rounded-br-0' : 'rounded-bl-0'}`} 
                style={{ 
                  maxWidth: '75%',
                  background: msg.role === 'user' ? '#6f42c1' : '#1e1f24',
                  color: '#fff',
                  border: msg.role === 'user' ? 'none' : '1px solid #2d2e35'
                }}
              >
                <div className="d-flex align-items-center mb-1">
                    <span className="me-2" style={{ fontSize: '1.2rem' }}>
                        {msg.role === 'user' ? '👤' : '🤖'}
                    </span>
                    <span className="small opacity-50 fw-bold">
                        {msg.role === 'user' ? 'Operador' : 'Axion AI'}
                    </span>
                </div>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="text-info small d-flex align-items-center">
              <Spinner animation="grow" size="sm" className="me-2" />
              IA está processando comando...
            </div>
          )}
          <div ref={messagesEndRef} />
        </Card.Body>

        <Card.Footer className="bg-dark border-top border-secondary p-3">
          <Form onSubmit={handleSend} className="d-flex gap-2">
            <Form.Control
              type="text"
              placeholder="Pergunte algo sobre o sistema ou operação..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="custom-input-dark border-secondary py-2"
              style={{ background: '#16171b', color: '#fff', borderRadius: '10px' }}
            />
            <Button type="submit" variant="primary" className="px-4 d-flex align-items-center" style={{ borderRadius: '10px' }}>
               Enviar
            </Button>
          </Form>
        </Card.Footer>
      </Card>
    </div>
  );
}