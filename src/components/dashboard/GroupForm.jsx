import { useState } from "react";
import { Form, Spinner } from "react-bootstrap";
export default function GroupForm({ onSave, onCancel, loading }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("O nome do grupo é obrigatório.");
    onSave({ name, description });
  };

  return (
    <div
      className="group-form-container animate-in p-4 mb-4"
      style={{
        background: "rgba(255,255,255,0.03)",
        borderRadius: "12px",
        border: "1px solid var(--border-color)",
      }}
    >
      <h4 className="text-white mb-4">Criar Novo Grupo</h4>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label className="text-dim">Nome do Grupo</Form.Label>

          <Form.Control
            type="text"
            className="custom-input-dark"
            placeholder="Ex: Administradores, Financeiro..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label className="text-dim">Descrição (Opcional)</Form.Label>

          <Form.Control
            as="textarea"
            rows={3}
            className="custom-input-dark"
            placeholder="Descreva a finalidade deste grupo..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>

        <div className="d-flex gap-2">
          <button
            type="submit"
            className="btn-primary-custom"
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : "Salvar Grupo"}
          </button>

          <button
            type="button"
            className="btn-filter-clear"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </Form>
    </div>
  );
}
