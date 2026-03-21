import { useState } from "react";
import { Form, Spinner } from "react-bootstrap";

export default function GroupForm({ onSave, onCancel, loading }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("O nome do grupo é obrigatório.");
    onSave({ name });
  };

  return (
    <div className="filter-card">
      <h4 className="card-title">Criar Novo Grupo</h4>

      <Form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-col">
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
          </div>

          <div className="form-col-actions">
            <button
              type="submit"
              className="btn-primary"
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

            <button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              <i className="bi bi-x-lg me-2"></i> Cancelar
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
}