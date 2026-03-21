export default function AuditTable({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-5 text-dim">
        <p>Nenhum registro de auditoria encontrado para os filtros selecionados.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
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
            <tr key={log.id}>
              <td className="mono-text">
                {log.created_at 
                  ? new Date(log.created_at).toLocaleString('pt-BR') 
                  : 'n/a'}
              </td>
              <td>
                <div className="user-info-min">
                  <strong>{log.user ? log.user.name : 'Sistema / API'}</strong>
                  <span className="text-dim">{log.user ? log.user.email : 'n/a'}</span>
                </div>
              </td>
              <td className="text-center">
                <span className={`method-badge ${log.method?.toLowerCase()}`}>
                  {log.method}
                </span>
              </td>
              <td className="url-cell">
                <code>{log.url}</code>
              </td>
              <td className="mono-text text-dim">
                {log.ip_address}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}