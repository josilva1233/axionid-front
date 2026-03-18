import { useEffect } from "react";

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
        cpf_cnpj: user.cpf_cnpj || "",
        zip_code: user.address?.zip_code || "",
        street: user.address?.street || "",
        number: user.address?.number || "",
        neighborhood: user.address?.neighborhood || "",
        city: user.localidade || user.address?.city || "",
        state: user.uf || user.address?.state || "",
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

  return (
    <div className="user-detail-container animate-in w-100">
      {/* BARRA DE TOPO */}
      <div className="user-detail-header mb-4 p-3">
        <div className="header-left">
          <button className="btn-filter-clear btn-back" onClick={onBack}>
            <i className="bi bi-arrow-left me-2"></i>
            Voltar
          </button>

          <div className="vertical-divider"></div>

          <div className="user-title-block">
            <span className="user-name-text">{user.name}</span>
            <span className="user-id-text">ID: {user.id}</span>
          </div>
        </div>

        <div className="header-actions">
          {!isEditing ? (
            <button
              className="btn-critical-primary btn-edit"
              onClick={() => setIsEditing(true)}
            >
              <i className="bi bi-pencil me-2"></i>
              Editar
            </button>
          ) : (
            <>
              <button
                className="btn-critical-secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-save-changes"
                onClick={handleSave}
                disabled={actionLoading}
              >
                {actionLoading ? "..." : "Salvar Alterações"}
              </button>
            </>
          )}
        </div>
      </div>
      <br />
      {/* CARDS DE DETALHES */}
      <div className="detail-grid">
        {/* CARD: PERFIL */}
        <section className={`info-card ${isEditing ? "editing" : ""}`}>
          <div className="profile-header d-flex align-items-center gap-4 mb-4">
            <div className="avatar-large">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-grow-1">
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="custom-input-dark name-input mb-2"
              />
              <div className="d-flex gap-2 align-items-center">
                <span
                  className={`badge ${user.is_admin ? "badge-success" : "badge-operacional"}`}
                >
                  {user.is_admin ? "Administrador" : "Operacional"}
                </span>
                {!user.is_active && (
                  <span className="badge badge-danger">Suspenso</span>
                )}
              </div>
            </div>
          </div>

          <div className="info-list g-3 row">
            <div className="info-item col-12 mb-2">
              <label className="input-label">E-mail Corporativo</label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="custom-input-dark w-100"
              />
            </div>
            <div className="info-item col-12">
              <label className="input-label">Documento</label>
              <input
                type="text"
                value={user.cpf_cnpj || "Não informado"}
                disabled
                className="custom-input-dark w-100 mono-text disabled-readonly"
              />
            </div>
          </div>
        </section>

        {/* CARD: LOCALIZAÇÃO */}
        <section className={`info-card ${isEditing ? "editing" : ""}`}>
          <h4 className="card-title">Endereço de Registro</h4>
          <div className="row g-3">
            <div className="col-12 mb-2">
              <label className="input-label">CEP</label>
              <input
                type="text"
                name="zip_code"
                value={formData.zip_code || ""}
                onChange={handleChange}
                onBlur={handleCepBlur}
                disabled={!isEditing}
                className="custom-input-dark w-100 mono-text"
              />
            </div>
            <div className="col-md-9 mb-2">
              <label className="input-label">Rua</label>
              <input
                type="text"
                name="street"
                value={formData.street || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="custom-input-dark w-100"
              />
            </div>
            <div className="col-md-3 mb-2">
              <label className="input-label">Nº</label>
              <input
                type="text"
                name="number"
                value={formData.number || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="custom-input-dark w-100"
              />
            </div>
            <div className="col-12 mb-2">
              <label className="input-label">Bairro</label>
              <input
                type="text"
                name="neighborhood"
                value={formData.neighborhood || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="custom-input-dark w-100"
              />
            </div>
            <div className="col-md-8">
              <label className="input-label">Cidade</label>
              <input
                type="text"
                name="city"
                value={formData.city || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="custom-input-dark w-100"
              />
            </div>
            <div className="col-md-4">
              <label className="input-label">UF</label>
              <input
                type="text"
                name="state"
                value={formData.state || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="custom-input-dark w-100"
                maxLength="2"
              />
            </div>
            <div className="col-12">
              <label className="input-label">Complemento</label>
              <input
                type="text"
                name="complement"
                value={formData.complement || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="custom-input-dark w-100"
              />
            </div>
          </div>
        </section>
      </div>
      <br />
      {/* AÇÕES CRÍTICAS */}
      <section className="critical-actions-section mt-5 p-4">
        <h4 className="critical-title">Gestão de Acesso e Privilégios</h4>
        <div className="critical-actions-grid d-flex gap-3 flex-wrap">
          {user.is_admin ? (
            <button
              onClick={() => onAction("remove-admin")}
              disabled={actionLoading}
              className="btn-critical-secondary"
            >
              Revogar Privilégios Admin
            </button>
          ) : (
            <button
              onClick={() => onAction("promote")}
              disabled={actionLoading}
              className="btn-critical-primary"
            >
              Promover a Administrador
            </button>
          )}
          <button
            onClick={() => onAction("toggle-status")}
            disabled={actionLoading}
            className="btn-critical-secondary"
          >
            {user.is_active ? "Suspender Acesso" : "Reativar Acesso"}
          </button>
          <button
            onClick={() => onAction("delete")}
            disabled={actionLoading}
            className="btn-delete-permanent"
          >
            {actionLoading ? "Processando..." : "Excluir Identidade"}
          </button>
        </div>
      </section>
    </div>
  );
}
