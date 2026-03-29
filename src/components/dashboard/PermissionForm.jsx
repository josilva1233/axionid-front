// components/dashboard/PermissionForm.jsx
//import { useState } from "react";
//import { Form, Spinner, Modal } from "react-bootstrap";
//import "../../PermissionForm.css";

export default function PermissionForm({ loading, onCancel, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.label.trim()) {
      alert("Nome e label da permissão são obrigatórios.");
      return;
    }
    onSave(formData);
  };

  return (
    <Modal show={true} onHide={onCancel} centered className="permission-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-shield-plus me-2"></i>
          Nova Permissão
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Nome (Slug)</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="custom-input-dark"
              placeholder="ex: users.create"
              required
            />
            <Form.Text className="form-text-custom">
              Identificador único da permissão (usado no código)
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Label (Nome Exibido)</Form.Label>
            <Form.Control
              type="text"
              name="label"
              value={formData.label}
              onChange={handleChange}
              className="custom-input-dark"
              placeholder="ex: Criar Usuários"
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="form-label-custom">Descrição</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="custom-input-dark"
              placeholder="Descreva o que esta permissão concede..."
            />
          </Form.Group>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : "Criar Permissão"}
            </button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}