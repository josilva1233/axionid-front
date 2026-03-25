// components/dashboard/ServiceOrderForm.jsx
import { useState } from "react";
import { Form, Spinner, Row, Col } from "react-bootstrap";
import api from "../../services/api";
import Swal from "sweetalert2";

export default function ServiceOrderForm({ groups, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    group_id: "",
  });

  const AxionAlert = Swal.mixin({
    background: "#111214",
    color: "#ffffff",
    confirmButtonColor: "#6366f1",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      AxionAlert.fire("Erro", "O título é obrigatório.", "error");
      return;
    }
    
    if (!formData.group_id) {
      AxionAlert.fire("Erro", "Selecione um grupo responsável.", "error");
      return;
    }

    setLoading(true);
    
    try {
      await api.post("/api/v1/service-orders", formData);
      
      AxionAlert.fire({
        icon: "success",
        title: "Chamado criado!",
        text: "Ordem de serviço registrada com sucesso.",
        timer: 1500,
        showConfirmButton: false,
      });
      
      if (onSuccess) onSuccess();
      
    } catch (err) {
      console.error("Erro ao criar OS:", err);
      AxionAlert.fire(
        "Erro",
        err.response?.data?.message || "Não foi possível criar o chamado.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="filter-card">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="card-title mb-0">
          <i className="bi bi-plus-circle-fill text-primary me-2"></i>
          Abrir Novo Chamado
        </h4>
        <button 
          className="btn btn-outline-light btn-sm rounded-pill px-3"
          onClick={onCancel}
          disabled={loading}
        >
          <i className="bi bi-x-lg me-1"></i> Fechar
        </button>
      </div>
      
      <Form onSubmit={handleSubmit}>
        <Row className="g-3">
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="filter-label">
                <i className="bi bi-tag-fill me-1"></i> Título do Chamado
              </Form.Label>
              <Form.Control
                type="text"
                className="custom-input-dark"
                placeholder="Ex: Problema com acesso ao sistema, Solicitação de equipamento..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Form.Group>
          </Col>

          <Col xs={12}>
            <Form.Group>
              <Form.Label className="filter-label">
                <i className="bi bi-chat-text-fill me-1"></i> Descrição
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                className="custom-input-dark"
                placeholder="Descreva detalhadamente o problema ou solicitação..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label className="filter-label">
                <i className="bi bi-flag-fill me-1"></i> Prioridade
              </Form.Label>
              <Form.Select
                className="custom-input-dark"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">🔵 Baixa</option>
                <option value="medium">🟡 Média</option>
                <option value="high">🟠 Alta</option>
                <option value="urgent">🔴 Urgente</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label className="filter-label">
                <i className="bi bi-people-fill me-1"></i> Grupo Responsável
              </Form.Label>
              <Form.Select
                className="custom-input-dark"
                value={formData.group_id}
                onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                required
              >
                <option value="">Selecione um grupo...</option>
                {groups && groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12}>
            <div className="d-flex gap-3 justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-outline-light btn-lg px-5 rounded-pill"
                onClick={onCancel}
                disabled={loading}
              >
                <i className="bi bi-x-lg me-2"></i> Cancelar
              </button>
              
              <button
                type="submit"
                className="btn btn-primary btn-lg px-5 rounded-pill"
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2"></i> Criar Chamado
                  </>
                )}
              </button>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
}