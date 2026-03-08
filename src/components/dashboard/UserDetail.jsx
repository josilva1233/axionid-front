export default function UserDetail({ user, onBack, onAction, actionLoading }) {
  if (!user) return null;

  return (
    <div className="animate-in w-100"> {/* Adicionado w-100 para garantir largura total */}
      {/* CABEÇALHO */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn-action-outline" onClick={onBack}>
          ← Voltar para a lista
        </button>
        <div className="text-dim small">
          ID da Identidade: <span className="mono-text">{user.id}</span>
        </div>
      </div>

      <div className="detail-grid">
        {/* CARD: PERFIL */}
        <section className="info-card">
          <div className="profile-header d-flex align-items-center gap-4 mb-4">
            <div className="avatar-large">{user.name?.charAt(0)}</div>
            <div>
              <h3 className="text-white mb-1">{user.name}</h3>
              <div className="d-flex gap-2 align-items-center">
                <span className={`badge ${user.is_admin ? 'success' : 'operacional'}`}>
                  {user.is_admin ? 'Administrador' : 'Operacional'}
                </span>
                {!user.is_active && <span className="badge danger">Suspenso</span>}
              </div>
            </div>
          </div>

          <div className="info-list">
            <div className="info-item"><label>E-mail Corporativo</label><span>{user.email}</span></div>
            <div className="info-item"><label>Documento Identificador</label><span>{user.cpf_cnpj || 'Não informado'}</span></div>
            <div className="info-item border-0">
              <label>Status de Validação</label>
              <span className={user.profile_completed ? 'text-success' : 'text-warning'}>
                {user.profile_completed ? '✓ Perfil Completo' : '⚠ Cadastro Pendente'}
              </span>
            </div>
          </div>
        </section>

        {/* CARD: ENDEREÇO */}
        <section className="info-card">
          <h4 className="section-title text-white mb-4">Endereço de Registro</h4>
          {user.address ? (
            <div className="info-list">
              <div className="info-item"><label>CEP</label><span>{user.address.zip_code}</span></div>
              <div className="info-item"><label>Logradouro</label><span>{user.address.street}, {user.address.number}</span></div>
              <div className="info-item"><label>Bairro</label><span>{user.address.neighborhood}</span></div>
              <div className="info-item border-0"><label>Localidade</label><span>{user.address.city} - {user.address.state}</span></div>
            </div>
          ) : (
            <div className="empty-state d-flex align-items-center justify-content-center h-75 text-dim border border-secondary border-dashed rounded">
              Nenhum endereço vinculado.
            </div>
          )}
        </section>

        {/* SEÇÃO DE AÇÕES */}
        <section className="actions-section">
          <h4 className="text-danger small fw-bold text-uppercase mb-3">Gerenciamento Crítico</h4>
          <div className="d-flex flex-wrap gap-2">
            {user.is_admin ? (
              <button onClick={() => onAction('remove-admin')} disabled={actionLoading} className="btn-action btn-suspend">
                Revogar Admin
              </button>
            ) : (
              <button onClick={() => onAction('promote')} disabled={actionLoading} className="btn-action btn-promote">
                Promover Admin
              </button>
            )}

            <button onClick={() => onAction('toggle-status')} disabled={actionLoading} className="btn-action btn-suspend">
              {user.is_active ? 'Suspender Acesso' : 'Reativar Acesso'}
            </button>

            <button onClick={() => onAction('delete')} disabled={actionLoading} className="btn-action btn-delete-ghost ms-md-auto">
              {actionLoading ? 'Processando...' : 'Excluir Identidade'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}