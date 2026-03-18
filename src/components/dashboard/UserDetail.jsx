import { useEffect } from "react";
import { Row, Col } from "react-bootstrap";

export default function UserDetail({
  user,
  isEditing = false,
  formData = {},
  setFormData = () => {},
  onAction = () => {},
  actionLoading = false,
  onBack = () => {},
  setIsEditing = () => {},
  handleSave = () => {},
}) {
  useEffect(() => {
    if (user && setFormData) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        zip_code: user.address?.zip_code || "",
        street: user.address?.street || "",
        number: user.address?.number || "",
        neighborhood: user.address?.neighborhood || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        complement: user.address?.complement || "",
      });
    }
  }, [user, setFormData]);

  if (!user) return null;

  const handleCepBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, "");
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const disabledInputStyle = {
    opacity: 0.8,
    cursor: "default",
    color: "#fff",
    borderColor: "rgba(255,255,255,0.1)",
  };

  const userIdDisplay = user.id ? String(user.id).substring(0, 18) + "..." : "N/A";

  return (
    <div className="mb-4 p-4 animate-in" style={{ background: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
      <Row className="align-items-end g-3">
        {/* Botão Voltar */}
        <Col md={5}>
          <button
            className="btn-filter-clear w-100 d-flex align-items-center justify-content-center"
            style={{ height: "45px" }}
            onClick={onBack}
          >
            <i className="bi bi-arrow-left me-2"></i> Voltar
          </button>
        </Col>

        {/* Botões Editar / Cancelar + Salvar */}
        <Col md={4}>
          {!isEditing ? (
            <button
              className="btn-critical-primary w-100"
              style={{ height: "45px" }}
              onClick={() => setIsEditing(true)}
            >
              <i className="bi bi-pencil me-2"></i> Editar
            </button>
          ) : (
            <div className="d-flex gap-2">
              <button
                className="btn-critical-secondary w-50"
                style={{ height: "45px" }}
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-table-action w-50"
                style={{ height: "45px", background: "var(--success)", border: "none" }}
                onClick={handleSave}
                disabled={actionLoading}
              >
                {actionLoading ? "..." : "Salvar"}
              </button>
            </div>
          )}
        </Col>

        {/* ID do Usuário */}
        <Col md={3}>
          <div className="custom-input-dark d-flex align-items-center px-3 mono-text" style={{ height: "45px", fontSize: "0.75rem", color: "var(--primary)", opacity: 0.8 }}>
            ID: {userIdDisplay}
          </div>
        </Col>
      </Row>
    </div>
  );
}