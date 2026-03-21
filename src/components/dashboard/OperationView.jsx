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
    <div className="operation-view">
      <div className="operation-header">
        <div>
          <h4 className="text-white mb-1">Axion AI Research</h4>
          <p className="text-secondary small">Assistente operacional de nova geração</p>
        </div>
        <div className="operation-badges">
          <Badge bg="dark" className="border border-secondary p-2">LLAMA-3.1</Badge>
          <Badge bg="info" className="p-2 text-dark">ACTIVE</Badge>
        </div>
      </div>

      <Card className="chat-container">
        <Card.Body className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}>
              <div className="message-bubble">
                <div className="message-sender">
                  <span className="message-icon">{msg.role === 'user' ? '👤' : '🤖'}</span>
                  <span className="message-sender-name">{msg.role === 'user' ? 'Operador' : 'Axion AI'}</span>
                </div>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="typing-indicator">
              <Spinner animation="grow" size="sm" className="me-2" />
              IA está processando comando...
            </div>
          )}
          <div ref={messagesEndRef} />
        </Card.Body>

        <Card.Footer className="chat-footer">
          <Form onSubmit={handleSend} className="chat-form">
            <Form.Control
              type="text"
              placeholder="Pergunte algo sobre o sistema ou operação..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="custom-input-dark"
            />
            <Button type="submit" variant="primary" className="send-button">
              Enviar
            </Button>
          </Form>
        </Card.Footer>
      </Card>
    </div>
  );
}