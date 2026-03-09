import { useState, useEffect } from "react";

export default function UserDetail({ user, onBack, onAction, onUpdate, actionLoading }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

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
  }, [user, isEditing]);

  if (!user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    await onUpdate(user.id, formData);
    setIsEditing(false);
  };

  return (
    <div className="animate-in w-100">
      {/* CABEÇALHO DE NAVEGAÇÃO */}
      <div
        className="d-flex justify-content-between align-items-center mb-4 pb-3"
        style={{ borderBottom: "1px solid var(--border-color)" }}
      >
        <button
          type="button"
          className="btn-back-link"
          onClick={onBack}
          aria-label="Voltar para a lista de usuários"
        >
          <i className="bi bi-arrow-left"></i>
          <span>Voltar para a lista</span>
        </button>

        <div className="d-flex align-items-center gap-3">
          {!isEditing ? (
            <button 
              className="btn-critical-primary px-4 py-2" 
              onClick={() => setIsEditing(true)}
              style={{ fontSize: '0.85rem' }}
            >
              <i className="bi bi-pencil me-2"></i> Editar Usuário
            </button>
          ) : (
            <div className="d-flex gap-2">
              <button className="btn-critical-secondary px-3 py-2" onClick={() => setIsEditing(false)}>
                Cancelar
              </button>
              <button 
                className="btn-save-confirm px-4 py-2" 
                onClick={handleSave}
                disabled={actionLoading}
                style={{ background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '6px' }}
              >
                {actionLoading ? "Salvando..." : <><i className="bi bi-check-lg me-2"></i> Salvar</>}
              </button>
            </div>
          )}
          <div className="text-dim small d-none d-md-block">
            UUID: <span className="mono-text" style={{ color: "var(--primary)" }}>{user.id}</span>
          </div>
        </div>
      </div>

      <div
        className="detail-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {/* CARD: PERFIL E IDENTIFICAÇÃO */}
        <section
          className="info-card"
          style={{
            background: "var(--card-bg)",
            padding: "24px",
            borderRadius: "12px",
            border: isEditing ? "1px solid var(--primary)" : "1px solid var(--border-color)",
            transition: "all 0.3s ease"
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
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="custom-input-dark mb-1"
                  style={{ fontSize: "1.1rem", width: "100%" }}
                />
              ) : (
                <h3 className="text-white mb-1" style={{ fontSize: "1.25rem" }}>{user.name}</h3>
              )}
              <div className="d-flex gap-2 align-items-center">
                <span className={`badge ${user.is_admin ? "badge-success" : "badge-operacional"}`}>
                  {user.is_admin ? "Administrador" : "Operacional"}
                </span>
                {!user.is_active && <span className="badge badge-danger">Suspenso</span>}
              </div>
            </div>
          </div>

          <div className="info-list">
            <div className="info-item mb-3">
              <label className="text-dim small d-block mb-1 text-uppercase fw-bold">E-mail Corporativo</label>
              {isEditing ? (
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="custom-input-dark w-100" />
              ) : (
                <span className="text-white">{user.email}</span>
              )}
            </div>
            <div className="info-item mb-3">
              <label className="text-dim small d-block mb-1 text-uppercase fw-bold">Documento (CPF/CNPJ)</label>
              <span className="text-white mono-text">{user.cpf_cnpj || "Não informado"}</span>
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
            <div className="row g-2">
              <div className="col-9 mb-2">
                <label className="text-dim small d-block text-uppercase">Rua</label>
                {isEditing ? (
                  <input type="text" name="street" value={formData.street} onChange={handleChange} className="custom-input-dark w-100" />
                ) : (
                  <span className="text-white">{user.address?.street || "---"}</span>
                )}
              </div>
              <div className="col-3 mb-2">
                <label className="text-dim small d-block text-uppercase">Nº</label>
                {isEditing ? (
                  <input type="text" name="number" value={formData.number} onChange={handleChange} className="custom-input-dark w-100" />
                ) : (
                  <span className="text-white">{user.address?.number || "---"}</span>
                )}
              </div>
              <div className="col-12 mb-2">
                <label className="text-dim small d-block text-uppercase">Bairro</label>
                {isEditing ? (
                  <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange} className="custom-input-dark w-100" />
                ) : (
                  <span className="text-white">{user.address?.neighborhood || "---"}</span>
                )}
              </div>
              <div className="col-8">
                <label className="text-dim small d-block text-uppercase">Cidade</label>
                {isEditing ? (
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className="custom-input-dark w-100" />
                ) : (
                  <span className="text-white">{user.address?.city || "---"}</span>
                )}
              </div>
              <div className="col-4">
                <label className="text-dim small d-block text-uppercase">UF</label>
                {isEditing ? (
                  <input type="text" name="state" value={formData.state} onChange={handleChange} className="custom-input-dark w-100" maxLength="2" />
                ) : (
                  <span className="text-white">{user.address?.state || "---"}</span>
                )}
              </div>
              <div className="col-12 mt-2">
                <label className="text-dim small d-block text-uppercase">CEP</label>
                {isEditing ? (
                  <input type="text" name="zip_code" value={formData.zip_code} onChange={handleChange} className="custom-input-dark w-100" />
                ) : (
                  <span className="text-white mono-text">{user.address?.zip_code || "---"}</span>
                )}
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
          pointerEvents: isEditing ? 'none' : 'auto' // Desabilita ações críticas enquanto edita
        }}
      >
        <h4 className="text-danger mb-4" style={{ fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1.5px" }}>
          Gestão de Acesso e Privilégios
        </h4>

        <div className="critical-actions-grid">
          <div className="main-actions">
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
              {actionLoading ? "Processando..." : "Excluir Identidade Permanentemente"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}