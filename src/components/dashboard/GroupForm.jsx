import { useState } from "react";
import { Form, Spinner, Row, Col } from "react-bootstrap";

export default function GroupForm({ onSave, onCancel, loading }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("O nome do grupo é obrigatório.");
    onSave({ name });
  };

  return (
    <div className="filter-card mb-4 p-4 animate-in">
      {/* Título fora da Row para manter o padrão */}
      <h4 className="text-white mb-4">Criar Novo Grupo</h4>

      <Form onSubmit={handleSubmit}>
        <Row className="align-items-end g-3">
          {/* CAMPO DE NOME - Ocupa 6 colunas (mesmo tamanho do busca por nome) */}
          <Col md={6}>
            <Form.Group>
              <Form.Label className="filter-label">Nome do Grupo</Form.Label>
              <Form.Control
                type="text"
                className="custom-input-dark"
                placeholder="Ex: Administradores, Financeiro..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>
          </Col>

          {/* BOTÃO SALVAR - Ocupa 3 colunas */}
          <Col md={3}>
            <button
              type="submit"
              className="btn-primary-axion w-btn-table-action w-100 px-3 py-2 fw-bold"
              style={{ height: "45px" }} // Garante a mesma altura do input
              disabled={loading}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i> Salvar Grupo
                </>
              )}
            </button>
          </Col>

          {/* BOTÃO CANCELAR - Ocupa 3 colunas */}
          <Col md={3}>
            <button
              type="button"
              className="btn-filter-clear w-100"
              style={{ height: "45px" }} // Garante a mesma altura do input
              onClick={onCancel}
              disabled={loading}
            >
              <i className="bi bi-x-lg me-2"></i> Cancelar
            </button>
          </Col>
        </Row>
      </Form>
    </div>
  );
}