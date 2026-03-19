import { useState } from "react";
import { Form, Spinner, Row, Col, Alert } from "react-bootstrap";
import api from "../../services/api"; // Certifique-se de que o caminho está correto

export default function ServiceOrderForm({ onSuccess, onCancel, groups = [] }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "low",
    group_id: "",
    attachment: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validação básica
    if (!formData.title.trim() || !formData.description.trim()) {
      setLoading(false);
      return setMessage({ type: "danger", text: "Título e descrição são obrigatórios." });
    }

    // Usamos FormData para suportar o envio de arquivos
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("priority", formData.priority);
    
    if (formData.group_id) data.append("group_id", formData.group_id);
    if (formData.attachment) data.append("attachment", formData.attachment);

    try {
      // Usando sua instância 'api' já configurada com Bearer Token e baseURL
      await api.post("/service-orders", data);
      
      setMessage({ type: "success", text: "Chamado aberto com sucesso!" });
      
      // Limpa o formulário
      setFormData({ title: "", description: "", priority: "low", group_id: "", attachment: null });
      
      if (onSuccess) setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      console.error(err);
      setMessage({ 
        type: "danger", 
        text: err.response?.data?.message || "Erro ao abrir chamado. Verifique os dados." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="filter-card mb-4 p-4 animate-in">
      <h4 className="text-white mb-4">Nova Ordem de Serviço</h4>

      {message && (
        <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
          {message.text}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Row className="g-3">
          {/* TÍTULO */}
          <Col md={8}>
            <Form.Group>
              <Form.Label className="filter-label">Título do Problema</Form.Label>
              <Form.Control
                type="text"
                className="custom-input-dark"
                placeholder="Ex: Erro ao acessar o sistema financeiro"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Form.Group>
          </Col>

          {/* PRIORIDADE */}
          <Col md={4}>
            <Form.Group>
              <Form.Label className="filter-label">Prioridade</Form.Label>
              <Form.Select
                className="custom-input-dark"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </Form.Select>
            </Form.Group>
          </Col>

          {/* DESCRIÇÃO */}
          <Col md={12}>
            <Form.Group>
              <Form.Label className="filter-label">Descrição Detalhada</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                className="custom-input-dark"
                placeholder="Descreva detalhadamente o problema..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Form.Group>
          </Col>

          {/* GRUPO E ANEXO */}
          <Col md={6}>
            <Form.Group>
              <Form.Label className="filter-label">Vincular a Grupo (Opcional)</Form.Label>
              <Form.Select
                className="custom-input-dark"
                value={formData.group_id}
                onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
              >
                <option value="">Somente eu (Privado)</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label className="filter-label">Anexo (Imagem ou PDF)</Form.Label>
              <Form.Control
                type="file"
                className="custom-input-dark"
                onChange={(e) => setFormData({ ...formData, attachment: e.target.files[0] })}
              />
            </Form.Group>
          </Col>

          {/* BOTÕES */}
          <Col md={12} className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn-filter-clear px-4"
              style={{ height: "45px" }}
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className="bw-btn-table-action px-5 fw-bold"
              style={{ height: "45px", minWidth: "150px" }}
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : "Abrir Chamado"}
            </button>
          </Col>
        </Row>
      </Form>
    </div>
  );
}