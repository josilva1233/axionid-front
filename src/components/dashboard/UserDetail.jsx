import { useEffect } from "react";

export default function UserDetail({
  user,
  isEditing,      // Recebido do Dashboard (Pai)
  setIsEditing,   // Recebido do Dashboard (Pai)
  formData,       // Recebido do Dashboard (Pai)
  setFormData,    // Recebido do Dashboard (Pai)
  onAction,
  onUpdate,
  actionLoading,
}) {
  
  // ⚠️ A LINHA "const [isEditing, setIsEditing] = useState(false);" FOI REMOVIDA
  // Pois agora esses valores são controlados pelo componente pai (Dashboard).

  // Sincroniza os dados do formulário sempre que o usuário mudar ou entrar em modo edição
  useEffect(() => {
    if (user) {
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
  }, [user, isEditing, setFormData]);

  if (!user) return null;

  // --- FUNÇÃO: AUTO-COMPLETE CEP ---
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

          // Limpa estilos de erro se houver
          const fields = ["zip_code", "street", "neighborhood", "city", "state"];
          fields.forEach((name) => {
            const el = document.getElementsByName(name)[0];
            if (el) {
              el.style.border = "1px solid var(--border-color)";
              el.style.boxShadow = "none";
            }
          });
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (e.target.style.border.includes("rgb(220, 53, 69)")) {
      e.target.style.border = "1px solid var(--primary)";
      e.target.style.boxShadow = "none";
    }
  };

  // Estilo para inputs desabilitados
  const disabledInputStyle = {
    opacity: 0.8,
    cursor: "default",
    color: "#fff",
    borderColor: "rgba(255,255,255,0.1)",
  };

  return (
    <div className="animate-in w-100">
      <div
        className="detail-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {/* CARD: PERFIL */}
        <section
          className="info-card"
          style={{
            background: "var(--card-bg)",
            padding: "24px",
            borderRadius: "12px",
            border: isEditing ? "1px solid var(--primary)" : "1px solid var(--border-color)",
            transition: "all 0.3s ease",
          }}
        >
          <div className="profile-header d-flex align-items-center gap-4 mb-4">
            <div
              className="avatar-large"
              style={{
                width: "64px", height: "64px", borderRadius: "50%",
                background: "var(--primary)", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.5rem", fontWeight: "bold",
              }}
            >
                          <Col md={5}>
              <Form.Group>
                <Form.Label className="filter-label">Navegação</Form.Label>
                <button className="btn-filter-clear w-100 d-flex align-items-center justify-content-center" style={{ height: "45px" }} onClick={onBack}>
                  <i className="bi bi-arrow-left me-2"></i> Voltar para a lista
                </button>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="filter-label">Ações de Registro</Form.Label>
                {!isEditing ? (
                  <button className="btn-critical-primary w-100" style={{ height: "45px" }} onClick={() => setIsEditing(true)}>
                    <i className="bi bi-pencil me-2"></i> Editar Usuário
                  </button>
                ) : (
                  <div className="d-flex gap-2">
                    <button className="btn-critical-secondary w-50" style={{ height: "45px" }} onClick={() => setIsEditing(false)}>
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
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group>
                <Form.Label className="filter-label">ID do Sistema</Form.Label>
                <div className="custom-input-dark d-flex align-items-center px-3 mono-text" style={{ height: "45px", fontSize: "0.75rem", color: "var(--primary)", opacity: 0.8 }}>
                  {user.id.substring(0, 18)}...
                </div>
              </Form.Group>
            </Col>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-grow-1">
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="custom-input-dark mb-2"
                style={{
                  fontSize: "1.25rem", width: "100%", fontWeight: "600",
                  ...(!isEditing ? disabledInputStyle : {}),
                }}
              />
              <div className="d-flex gap-2 align-items-center">
                <span className={`badge ${user.is_admin ? "badge-success" : "badge-operacional"}`}>
                  {user.is_admin ? "Administrador" : "Operacional"}
                </span>
                {!user.is_active && <span className="badge badge-danger">Suspenso</span>}
              </div>
            </div>
          </div>

          <div className="info-list g-3 row">
            <div className="info-item col-12 mb-2">
              <label className="text-dim small d-block mb-1 text-uppercase fw-bold">E-mail Corporativo</label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="custom-input-dark w-100"
                style={!isEditing ? disabledInputStyle : {}}
              />
            </div>
            <div className="info-item col-12">
              <label className="text-dim small d-block mb-1 text-uppercase fw-bold">Documento</label>
              <input
                type="text"
                value={user.cpf_cnpj || "Não informado"}
                disabled
                className="custom-input-dark w-100 mono-text"
                style={disabledInputStyle}
              />
            </div>
          </div>
        </section>

        {/* CARD: LOCALIZAÇÃO */}
        <section
          className="info-card"
          style={{
            background: "var(--card-bg)",
            padding: "24px",
            borderRadius: "12px",
            border: isEditing ? "1px solid var(--primary)" : "1px solid var(--border-color)",
          }}
        >
          <h4 className="text-white mb-4" style={{ fontSize: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "10px" }}>
            Endereço de Registro
          </h4>
          <div className="info-list">
            <div className="row g-3">
              <div className="col-12 mb-2">
                <label className="text-dim small d-block text-uppercase fw-bold mb-1">CEP</label>
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code || ""}
                  onChange={handleChange}
                  onBlur={handleCepBlur}
                  disabled={!isEditing}
                  className="custom-input-dark w-100 mono-text"
                  style={!isEditing ? disabledInputStyle : {}}
                />
              </div>
              <div className="col-md-9 mb-2">
                <label className="text-dim small d-block text-uppercase fw-bold mb-1">Rua</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="custom-input-dark w-100"
                  style={!isEditing ? disabledInputStyle : {}}
                />
              </div>
              <div className="col-md-3 mb-2">
                <label className="text-dim small d-block text-uppercase fw-bold mb-1">Nº</label>
                <input
                  type="text"
                  name="number"
                  value={formData.number || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="custom-input-dark w-100"
                  style={!isEditing ? disabledInputStyle : {}}
                />
              </div>
              <div className="col-12 mb-2">
                <label className="text-dim small d-block text-uppercase fw-bold mb-1">Bairro</label>
                <input
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="custom-input-dark w-100"
                  style={!isEditing ? disabledInputStyle : {}}
                />
              </div>
              <div className="col-md-8">
                <label className="text-dim small d-block text-uppercase fw-bold mb-1">Cidade</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="custom-input-dark w-100"
                  style={!isEditing ? disabledInputStyle : {}}
                />
              </div>
              <div className="col-md-4">
                <label className="text-dim small d-block text-uppercase fw-bold mb-1">UF</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="custom-input-dark w-100"
                  maxLength="2"
                  style={!isEditing ? disabledInputStyle : {}}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* SEÇÃO DE AÇÕES CRÍTICAS */}
      <section
        className="actions-section mt-5 p-4"
        style={{
          background: "rgba(220, 53, 69, 0.05)",
          borderRadius: "16px",
          border: "1px solid rgba(220, 53, 69, 0.2)",
          opacity: isEditing ? 0.5 : 1,
          pointerEvents: isEditing ? "none" : "auto",
        }}
      >
        <h4 className="text-danger mb-4" style={{ fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1.5px" }}>
          Gestão de Acesso e Privilégios
        </h4>
        <div className="critical-actions-grid d-flex gap-3">
            {user.is_admin ? (
              <button onClick={() => onAction("remove-admin")} disabled={actionLoading} className="btn-critical-secondary">
                Revogar Privilégios Admin
              </button>
            ) : (
              <button onClick={() => onAction("promote")} disabled={actionLoading} className="btn-critical-primary">
                Promover a Administrador
              </button>
            )}
            <button onClick={() => onAction("toggle-status")} disabled={actionLoading} className="btn-critical-secondary">
              {user.is_active ? "Suspender Acesso" : "Reativar Acesso"}
            </button>
            <button onClick={() => onAction("delete")} disabled={actionLoading} className="btn-delete-permanent">
              {actionLoading ? "Processando..." : "Excluir Identidade"}
            </button>
        </div>
      </section>
    </div>
  );
}