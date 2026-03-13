import { useState } from "react";
import { Form, Spinner, Row, Col } from "react-bootstrap";

export default function GroupForm({ onSave, onCancel, loading }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("O nome do grupo é obrigatório.");
    // Como sua API espera apenas 'name', removi a description para manter limpo
    onSave({ name });
  };

  return (
    <div className="group-form-container animate-in p-4 mb-4 border border-secondary rounded-3 shadow-sm bg-dark-custom">
      <h4 className="text-white mb-4">Criar Novo Grupo</h4>
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-4">
          <Form.Label className="text-dim small mb-2">Nome do Grupo</Form.Label>
          <Form.Control
            type="text"
            className="custom-input-dark py-2"
            placeholder="Ex: Administradores, Financeiro..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>

        {/* Usamos Row e Col para garantir o alinhamento lado a lado perfeito.
          O g-2 adiciona o espaçamento (gap) entre as colunas.
        */}
        <Row className="g-2">
          <Col xs={6}>
            <button
              type="submit"
              className="btn-primary-axion w-100 py-2 fw-bold"
              disabled={loading}
            >
              {loading ? (
                <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
              ) : (
                "Salvar Grupo"
              )}
            </button>
          </Col>

          <Col xs={6}>
            <button
              type="button"
              className="btn-filter-clear w-100 py-2"
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