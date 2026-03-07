import React from 'react';

export default function AuditTable({ logs }) {
  if (!logs || logs.length === 0) return <div className="p-4">Nenhum registro encontrado.</div>;

  return (
    <div className="table-card">
      <table className="axion-table">
        <thead>
          <tr><th>Data/Hora</th><th>Usuário</th><th>Método</th><th>URL</th><th>IP</th></tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.executed_at ? new Date(log.executed_at).toLocaleString('pt-BR') : 'N/A'}</td>
              <td>{log.user_name || 'Sistema'}</td>
              <td><span className="badge">{log.method}</span></td>
              <td><code>{log.url}</code></td>
              <td>{log.ip_address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}