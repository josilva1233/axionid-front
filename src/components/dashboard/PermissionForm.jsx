import { useState } from "react";
import { Form, Spinner, Row, Col } from "react-bootstrap";

export default function PermissionForm({ onSave, onCancel, loading }) {
  const [formData, setFormData] = useState({ name: "", label: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.label.trim()) {
      return alert("Todos os campos são obrigatórios.");
    }
    onSave(formData);
  };

  return (
    <div className="filter-card mb-4 p-4 animate-in">
      <h4 className="text-white mb-4">Criar Nova Permissão</h4>

      <Form onSubmit={handleSubmit}>
        <Row className="align-items-end g-3">
          {/* LABEL AMIGÁVEL */}
          <Col md={4}>
            <Form.Group>
              <Form.Label className="filter-label">Nome Amigável (Label)</Form.Label>
              <Form.Control
                type="text"
                className="custom-input-dark"
                placeholder="Ex: Deletar Usuários"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                required
              />
            </Form.Group>
          </Col>

          {/* SLUG DO SISTEMA */}
          <Col md={4}>
            <Form.Group>
              <Form.Label className="filter-label">Slug do Sistema (Name)</Form.Label>
              <Form.Control
                type="text"
                className="custom-input-dark"
                placeholder="Ex: users.delete"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>
          </Col>

          {/* BOTÕES */}
          <Col md={2}>
            <button
              type="submit"
              className="bw-btn-table-action w-100 px-3 py-2 fw-bold"
              style={{ height: "45px" }}
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : "Salvar"}
            </button>
          </Col>

          <Col md={2}>
            <button
              type="button"
              className="btn-filter-clear w-100"
              style={{ height: "45px" }}
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
          </Col>
        </Row>
      </Form>
    </div>
  );
}