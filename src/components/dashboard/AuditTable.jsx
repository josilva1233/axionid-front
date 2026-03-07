export default function AuditTable({ logs }) {
  return (
    <div className="table-card animate-in">
      <table className="axion-table">
        <thead><tr><th>Data</th><th>Usuário</th><th>Ação</th><th>Rota</th></tr></thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{new Date(log.executed_at).toLocaleString()}</td>
              <td>{log.user_name || 'Sistema'}</td>
              <td><span className="badge admin">{log.method}</span></td>
              <td><code>{log.url}</code></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}