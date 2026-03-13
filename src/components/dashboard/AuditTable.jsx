export default function AuditTable({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-5 text-dim">
        <p>Nenhum registro de auditoria encontrado para os filtros selecionados.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive animate-in">
      <table className="axion-table">
        <thead>
          <tr>
            <th>DATA / HORA</th>
            <th>USUÁRIO / ORIGEM</th>
            <th className="text-center">MÉTODO</th>
            <th>RECURSO (URL)</th>
            <th>ENDEREÇO IP</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            /* CORREÇÃO: Usar log.id em vez de log.log_id */
            <tr key={log.id}>
              
              {/* CORREÇÃO: Usar created_at em vez de executed_at */}
              <td className="mono-text" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                {log.created_at 
                  ? new Date(log.created_at).toLocaleString('pt-BR') 
                  : 'n/a'}
              </td>

              {/* Informações do Usuário empilhadas */}
              <td>
                <div className="user-info-min" style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                    {/* CORREÇÃO: Acessar log.user.name devido ao with('user') do Eloquent */}
                    {log.user ? log.user.name : 'Sistema / API'}
                  </strong>
                  <span className="text-dim" style={{ fontSize: '0.75rem' }}>
                    {/* CORREÇÃO: Acessar log.user.email */}
                    {log.user ? log.user.email : 'n/a'}
                  </span>
                </div>
              </td>

              {/* Badge de Método HTTP dinâmico */}
              <td className="text-center">
                <span className={`method-badge ${log.method?.toLowerCase()}`}>
                  {log.method}
                </span>
              </td>

              {/* URL com quebra de linha inteligente */}
              <td className="url-cell">
                <code style={{ fontSize: '0.8rem', color: 'var(--primary)', opacity: 0.8 }}>
                  {log.url}
                </code>
              </td>

              {/* IP Address */}
              <td className="mono-text text-dim" style={{ fontSize: '0.85rem' }}>
                {log.ip_address}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}