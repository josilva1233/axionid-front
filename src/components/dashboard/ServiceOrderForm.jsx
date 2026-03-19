import { useState } from "react";
import { Form, Spinner, Row, Col, Alert } from "react-bootstrap";
import api from "../../services/api"; // Importando sua instância configurada do Axios

export default function ServiceOrderForm({ onSuccess, onCancel, groups = [] }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "low",
    group_id: "",
    attachment: null,
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'danger', text: string }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    // Criamos o FormData para suportar o anexo (arquivo)
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("priority", formData.priority);

    if (formData.group_id) data.append("group_id", formData.group_id);
    if (formData.attachment) data.append("attachment", formData.attachment);

    try {
      // CORREÇÃO: Adicionado /api/v1/ para bater na rota correta do Laravel
      await api.post("/api/v1/service-orders", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      AxionAlert.fire({
        icon: "success",
        title: "Chamado Aberto!",
        text: "Sua solicitação foi registrada com sucesso.",
        timer: 2000,
        showConfirmButton: false,
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setStatus({
        type: "danger",
        text: err.response?.data?.message || "Erro ao conectar com o servidor.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="filter-card mb-4 p-4 animate-in">
      <h4 className="text-white mb-4">Novo Chamado (OS)</h4>

      {status && (
        <Alert
          variant={status.type}
          className="mb-4"
          onClose={() => setStatus(null)}
          dismissible
        >
          {status.text}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Row className="g-3">
          {/* TÍTULO DO PROBLEMA */}
          <Col md={8}>
            <Form.Group>
              <Form.Label className="filter-label">
                Título do Problema
              </Form.Label>
              <Form.Control
                type="text"
                className="custom-input-dark"
                placeholder="Ex: Impressora não liga"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </Form.Select>
            </Form.Group>
          </Col>
          {/* DESCRIÇÃO DETALHADA */}
          <Col md={12}>
            <Form.Group>
              <Form.Label className="filter-label">
                Descrição Detalhada
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                className="custom-input-dark"
                placeholder="Descreva o que está acontecendo..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </Form.Group>
          </Col>
          {/* VÍNCULO A GRUPO */}
          <Col md={6}>
            <Form.Group>
              <Form.Label className="filter-label">
                Vincular a Grupo (Opcional)
              </Form.Label>
              <Form.Select
                className="custom-input-dark"
                value={formData.group_id}
                onChange={(e) =>
                  setFormData({ ...formData, group_id: e.target.value })
                }
              >
                <option value="">Somente eu (Privado)</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          {/* ANEXO */}
          <Col md={6}>
            <Form.Group>
              <Form.Label className="filter-label">
                Anexo (Imagem ou PDF)
              </Form.Label>
              <Form.Control
                type="file"
                className="custom-input-dark"
                onChange={(e) =>
                  setFormData({ ...formData, attachment: e.target.files[0] })
                }
              />
            </Form.Group>
          </Col>
          {/* BOTÕES DE AÇÃO - Alinhados conforme o padrão do GroupForm */}
          <Col md={6}></Col> {/* Espaçador */}
          <Col md={3}>
            <button
              type="submit"
              className="bw-btn-table-action w-100 px-3 py-2 fw-bold"
              style={{ height: "45px" }}
              disabled={loading}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <>
                  <i className="bi bi-send me-2"></i> Abrir Chamado
                </>
              )}
            </button>
          </Col>
          <Col md={3}>
            <button
              type="button"
              className="btn-filter-clear w-100"
              style={{ height: "45px" }}
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
