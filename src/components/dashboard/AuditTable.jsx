export default function AuditTable({ logs }) {
  return (
    <div className="table-card">
      <table className="axion-table">
        <thead>
          <tr>
            <th>Data/Hora</th>
            <th>Usuário</th>
            <th>Método</th>
            <th>URL</th>
            <th>IP</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.log_id}>
              <td className="mono-text">{new Date(log.executed_at).toLocaleString()}</td>
              <td>
                <div className="user-info-min">
                  <strong>{log.user_name || 'Sistema'}</strong>
                  <span>{log.user_email}</span>
                </div>
              </td>
              <td><span className={`method-badge ${log.method}`}>{log.method}</span></td>
              <td className="url-cell">{log.url}</td>
              <td className="mono-text">{log.ip_address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}