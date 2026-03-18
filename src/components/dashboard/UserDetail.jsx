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

  // ✅ CORRIGIDO: user.id pode ser número
  const userIdDisplay = user.id
    ? String(user.id).substring(0, 18) + "..."
    : "N/A";

  return (
    <div className="animate-in w-100">
 {/* BARRA DE TOPO CORRIGIDA - TUDO EM LINHA */}
<div
  className="mb-4 p-3 animate-in"
  style={{
    background: "var(--card-bg)",
    borderRadius: "12px",
    border: "1px solid var(--border-color)",
  }}
>
  <div className="d-flex align-items-center justify-content-between w-100">
    
    {/* GRUPO DA ESQUERDA: VOLTAR + INFO (EM LINHA) */}
    <div className="d-flex align-items-center gap-3">
      <button
        className="btn-filter-clear d-flex align-items-center justify-content-center"
        style={{ height: "45px", minWidth: "100px", whiteSpace: "nowrap" }}
        onClick={onBack}
      >
        <i className="bi bi-arrow-left me-2"></i>
        Voltar
      </button>

      {/* LINHA DIVISORA VERTICAL */}
      <div style={{ width: "1px", height: "30px", background: "rgba(255,255,255,0.1)" }}></div>

      {/* TEXTOS: NOME E ID LADO A LADO OU EMPILHADOS CURTOS */}
      <div className="d-flex flex-column justify-content-center">
        <h5 className="mb-0" style={{ fontWeight: 600, color: "#fff", fontSize: "1.1rem", lineHeight: "1.2" }}>
          {user.name}
        </h5>
        <small style={{ opacity: 0.5, fontFamily: "monospace", fontSize: "0.7rem" }}>
          SISTEMA ID: <span style={{ color: "var(--primary)" }}>{user.id}</span>
        </small>
      </div>
    </div>

    {/* GRUPO DA DIREITA: BOTÕES DE AÇÃO */}
    <div className="d-flex gap-2">
      {!isEditing ? (
        <button
          className="btn-critical-primary d-flex align-items-center"
          style={{ height: "45px", padding: "0 20px" }}
          onClick={() => setIsEditing(true)}
        >
          <i className="bi bi-pencil me-2"></i>
          <span style={{ whiteSpace: "nowrap" }}>Editar Usuário</span>
        </button>
      ) : (
        <>
          <button
            className="btn-critical-secondary"
            style={{ height: "45px", padding: "0 20px" }}
            onClick={() => setIsEditing(false)}
          >
            Cancelar
          </button>
          <button
            className="btn-table-action"
            style={{
              height: "45px",
              padding: "0 25px",
              background: "var(--success)",
              border: "none",
            }}
            onClick={handleSave}
            disabled={actionLoading}
          >
            {actionLoading ? "..." : "Salvar Alterações"}
          </button>
        </>
      )}
    </div>
  </div>
</div>

      {/* REMOVI O BLOCO "ID DO SISTEMA" QUE ESTAVA SOBRANDO AQUI EMBAIXO */}

      {/* CARDS DE DETALHES */}
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
            border: isEditing
              ? "1px solid var(--primary)"
              : "1px solid var(--border-color)",
            transition: "all 0.3s ease",
          }}
        >
          <div className="profile-header d-flex align-items-center gap-4 mb-4">
            <div
              className="avatar-large"
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "var(--primary)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                fontWeight: "bold",
              }}
            >
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
                  fontSize: "1.25rem",
                  width: "100%",
                  fontWeight: "600",
                  ...(!isEditing ? disabledInputStyle : {}),
                }}
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
              <label className="text-dim small d-block mb-1 text-uppercase fw-bold">
                E-mail Corporativo
              </label>
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
              <label className="text-dim small d-block mb-1 text-uppercase fw-bold">
                Documento
              </label>
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
            border: isEditing
              ? "1px solid var(--primary)"
              : "1px solid var(--border-color)",
          }}
        >
          <h4
            className="text-white mb-4"
            style={{
              fontSize: "1rem",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              paddingBottom: "10px",
            }}
          >
            Endereço de Registro
          </h4>
          <div className="row g-3">
            <div className="col-12 mb-2">
              <label className="text-dim small d-block text-uppercase fw-bold mb-1">
                CEP
              </label>
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
              <label className="text-dim small d-block text-uppercase fw-bold mb-1">
                Rua
              </label>
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
              <label className="text-dim small d-block text-uppercase fw-bold mb-1">
                Nº
              </label>
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
              <label className="text-dim small d-block text-uppercase fw-bold mb-1">
                Bairro
              </label>
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
              <label className="text-dim small d-block text-uppercase fw-bold mb-1">
                Cidade
              </label>
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
              <label className="text-dim small d-block text-uppercase fw-bold mb-1">
                UF
              </label>
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
        </section>
      </div>

      {/* AÇÕES CRÍTICAS */}
      <section
        className="actions-section mt-5 p-4"
        style={{
          background: "rgba(220, 53, 69, 0.05)",
          borderRadius: "16px",
          border: "1px solid rgba(220, 53, 69, 0.2)",
          opacity: 1,
          pointerEvents: "auto",
        }}
      >
        <h4
          className="text-danger mb-4"
          style={{
            fontSize: "0.75rem",
            fontWeight: "800",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
          }}
        >
          Gestão de Acesso e Privilégios
        </h4>
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
