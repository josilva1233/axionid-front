import { useState, useEffect } from "react";

export default function UserDetail({
  user,
  onBack,
  onAction,
  onUpdate,
  actionLoading,
}) {
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

  // --- FUNÇÃO: AUTO-COMPLETE CEP ---
  const handleCepBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, ""); // Remove hifens ou pontos

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

          // Limpa bordas vermelhas se os dados forem preenchidos
          const fields = [
            "zip_code",
            "street",
            "neighborhood",
            "city",
            "state",
          ];
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

    // Remove a cor vermelha assim que o usuário começa a digitar no campo
    if (e.target.style.border.includes("rgb(220, 53, 69)")) {
      e.target.style.border = "1px solid var(--primary)";
      e.target.style.boxShadow = "none";
    }
  };

  const handleSave = async () => {
    await onUpdate(user.id, formData);
    setIsEditing(false);
  };

  // Estilo comum para os inputs quando desabilitados (para não ficarem cinzas demais)
  const disabledInputStyle = {
    opacity: 0.8,
    cursor: "not-serif",
    color: "#fff", // Mantém o texto branco
    borderColor: "rgba(255,255,255,0.1)", // Borda sutil
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
              style={{ fontSize: "0.85rem" }}
            >
              <i className="bi bi-pencil me-2"></i> Editar Usuário
            </button>
          ) : (
            <div className="d-flex gap-2">
              <button
                className="btn-critical-secondary px-3 py-2"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-save-confirm px-8 py-4 text-lg font-bold" // Aumentei o padding e a fonte
                onClick={handleSave}
                disabled={actionLoading}
                style={{
                  background: "var(--success)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                }}
              >
                {actionLoading ? (
                  "Salvando..."
                ) : (
                  <>
                    <i className="bi bi-pencil me-2"></i> Salvar
                  </>
                )}
              </button>
            </div>
          )}
          <div className="text-dim small d-none d-md-block">
            UUID:{" "}
            <span className="mono-text" style={{ color: "var(--primary)" }}>
              {user.id}
            </span>
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
              {/* NOME: Sempre um input, mas desabilitado se !isEditing */}
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing} // <-- CHAVE DA MUDANÇA
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
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="custom-input-dark w-100"
                style={!isEditing ? disabledInputStyle : {}}
              />
            </div>
            <div className="info-item col-12">
              <label className="text-dim small d-block mb-1 text-uppercase fw-bold">
                Documento (CPF/CNPJ)
              </label>
              {/* Documento não é editável por regra de negócio, então fica sempre disabled */}
              <input
                type="text"
                name="cpf_cnpj"
                value={user.cpf_cnpj || "Não informado"}
                disabled={true}
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
          <div className="info-list">
            <div className="row g-3">
              {/* CEP */}
              <div className="col-12 mb-2">
                <label className="text-dim small d-block text-uppercase fw-bold mb-1">
                  CEP (Auto-complete)
                </label>
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleChange}
                  onBlur={handleCepBlur}
                  disabled={!isEditing}
                  className="custom-input-dark w-100 mono-text"
                  placeholder="00000-000"
                  style={!isEditing ? disabledInputStyle : {}}
                />
              </div>

              {/* Rua e Número */}
              <div className="col-md-9 mb-2">
                <label className="text-dim small d-block text-uppercase fw-bold mb-1">
                  Rua
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
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
                  value={formData.number}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="custom-input-dark w-100"
                  style={!isEditing ? disabledInputStyle : {}}
                />
              </div>

              {/* Bairro */}
              <div className="col-12 mb-2">
                <label className="text-dim small d-block text-uppercase fw-bold mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="custom-input-dark w-100"
                  style={!isEditing ? disabledInputStyle : {}}
                />
              </div>

              {/* Cidade e UF */}
              <div className="col-md-8">
                <label className="text-dim small d-block text-uppercase fw-bold mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
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
                  value={formData.state}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="custom-input-dark w-100"
                  maxLength="2"
                  style={!isEditing ? disabledInputStyle : {}}
                />
              </div>

              {/* Complemento */}
              <div className="col-12 mt-2">
                <label className="text-dim small d-block text-uppercase fw-bold mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  name="complement"
                  value={formData.complement}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="custom-input-dark w-100"
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

        <div className="critical-actions-grid">
          <div className="main-actions">
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
              {actionLoading
                ? "Processando..."
                : "Excluir Identidade Permanentemente"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
