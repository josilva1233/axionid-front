export default function UserDetail({ user, onBack, onAction, actionLoading }) {
  if (!user) return null;

  return (
    <div className="animate-in w-100">
      {/* CABEÇALHO DE NAVEGAÇÃO */}
      <div
        className="d-flex justify-content-between align-items-center mb-4 pb-3"
        style={{ borderBottom: "1px solid var(--border-color)" }}
      >
        <button
          className="btn-secondary"
          onClick={onBack}
          style={{ padding: "8px 16px", fontSize: "0.9rem" }}
        >
          ← Voltar para a lista
        </button>
        <div className="text-dim small">
          UUID Identidade:{" "}
          <span className="mono-text" style={{ color: "var(--primary)" }}>
            {user.id}
          </span>
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
            border: "1px solid var(--border-color)",
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
            <div>
              <h3 className="text-white mb-1" style={{ fontSize: "1.25rem" }}>
                {user.name}
              </h3>
              <div className="d-flex gap-2 align-items-center">
                <span
                  className={`badge ${user.is_admin ? "badge-success" : "badge-operacional"}`}
                  style={{
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    padding: "4px 8px",
                    borderRadius: "4px",
                  }}
                >
                  {user.is_admin ? "Administrador" : "Operacional"}
                </span>
                {!user.is_active && (
                  <span
                    className="badge badge-danger"
                    style={{
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    Suspenso
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="info-list">
            <div className="info-item mb-3">
              <label className="text-dim small d-block mb-1 text-uppercase fw-bold">
                E-mail Corporativo
              </label>
              <span className="text-white">{user.email}</span>
            </div>
            <div className="info-item mb-3">
              <label className="text-dim small d-block mb-1 text-uppercase fw-bold">
                Documento (CPF/CNPJ)
              </label>
              <span className="text-white mono-text">
                {user.cpf_cnpj || "Não informado"}
              </span>
            </div>
            <div className="info-item">
              <label className="text-dim small d-block mb-1 text-uppercase fw-bold">
                Status de Validação
              </label>
              <span
                className={
                  user.profile_completed ? "text-success" : "text-warning"
                }
                style={{ fontWeight: "500" }}
              >
                {user.profile_completed
                  ? "✓ Perfil Verificado"
                  : "⚠ Pendente de Dados"}
              </span>
            </div>
          </div>
        </section>

        {/* CARD: LOCALIZAÇÃO E REGISTRO */}
        <section
          className="info-card"
          style={{
            background: "var(--card-bg)",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
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
          {user.address ? (
            <div className="info-list">
              <div className="info-item mb-2">
                <label className="text-dim small d-block text-uppercase">
                  Logradouro
                </label>
                <span className="text-white">
                  {user.address.street}, {user.address.number}
                </span>
              </div>
              <div className="info-item mb-2">
                <label className="text-dim small d-block text-uppercase">
                  Bairro
                </label>
                <span className="text-white">{user.address.neighborhood}</span>
              </div>
              <div className="info-item mb-2">
                <label className="text-dim small d-block text-uppercase">
                  Cidade/UF
                </label>
                <span className="text-white">
                  {user.address.city} - {user.address.state}
                </span>
              </div>
              <div className="info-item">
                <label className="text-dim small d-block text-uppercase">
                  CEP
                </label>
                <span className="text-white mono-text">
                  {user.address.zip_code}
                </span>
              </div>
            </div>
          ) : (
            <div
              className="empty-state d-flex flex-column align-items-center justify-content-center h-75 text-dim border border-secondary border-dashed rounded"
              style={{ minHeight: "150px", opacity: 0.6 }}
            >
              <span style={{ fontSize: "1.5rem" }}>📍</span>
              <p className="small mt-2">Nenhum endereço vinculado.</p>
            </div>
          )}
        </section>
      </div>

      {/* SEÇÃO DE AÇÕES CRÍTICAS */}
      <section
        className="actions-section mt-5 p-4"
        style={{
          background: "rgba(220, 53, 69, 0.05)",
          borderRadius: "16px",
          border: "1px solid rgba(220, 53, 69, 0.2)",
        }}
      >
        <h4
          className="text-danger mb-4"
          style={{
            fontSize: "0.75rem",
            fontWeight: "800",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            opacity: 0.8,
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
