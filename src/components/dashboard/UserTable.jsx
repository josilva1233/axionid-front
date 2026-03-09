export default function UserTable({ users, onViewDetail }) {
  return (
    <div className="table-responsive animate-in">
      <table className="axion-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>NOME DO USUÁRIO</th>
            <th>E-MAIL CORPORATIVO</th>
            <th className="text-center">NÍVEL</th>
            <th className="text-center">STATUS</th>
            <th className="text-end">AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u) => (
              <tr key={u.id}>
                {/* ID com estilo Mono para leitura técnica */}
                <td className="mono-text" style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                  #{u.id}
                </td>

                {/* Nome em destaque */}
                <td>
                  <strong style={{ color: 'var(--text-main)' }}>{u.name}</strong>
                </td>

                {/* E-mail com cor atenuada */}
                <td className="text-dim" style={{ fontSize: '0.9rem' }}>
                  {u.email}
                </td>

                {/* Nível de Acesso com Badges Padronizadas */}
                <td className="text-center">
                  <span className={`badge ${u.is_admin ? 'badge-success' : 'badge-operacional'}`} style={{ fontSize: '0.7rem' }}>
                    {u.is_admin ? 'ADMIN' : 'USER'}
                  </span>
                </td>

                {/* Status Ativo/Bloqueado */}
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <span 
                      className="status-indicator" 
                      style={{ 
                        width: '8px', height: '8px', borderRadius: '50%', 
                        backgroundColor: u.is_active ? 'var(--success)' : 'var(--danger)' 
                      }} 
                    />
                    <span style={{ fontSize: '0.85rem', color: u.is_active ? 'var(--success)' : 'var(--danger)' }}>
                      {u.is_active ? 'Ativo' : 'Bloqueado'}
                    </span>
                  </div>
                </td>

                {/* Botão de Ação Alinhado à Direita */}
                <td className="text-end">
                  <button 
                    className="btn-action-outline btn-small" 
                    onClick={() => onViewDetail(u.id)}
                    style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                  >
                    Detalhe
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-5 text-dim">
                <div className="d-flex flex-column align-items-center">
                  <span style={{ fontSize: '1.5rem' }}>🔍</span>
                  <p className="mt-2 mb-0">Nenhum usuário encontrado na base de dados.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}