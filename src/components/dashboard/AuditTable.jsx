import React from 'react';

export default function AuditTable({ logs }) {
  // 1. Tratamento para lista vazia ou nula
  if (!logs || logs.length === 0) {
    return (
      <div className="table-null-state">
        <p>Nenhum registro de auditoria encontrado para este período.</p>
      </div>
    );
  }

  // 2. Função auxiliar para cores dos métodos
  const getMethodClass = (method) => {
    const methods = {
      GET: 'badge-get',
      POST: 'badge-post',
      PUT: 'badge-put',
      DELETE: 'badge-delete',
      PATCH: 'badge-patch'
    };
    return methods[method?.toUpperCase()] || 'badge-default';
  };

  return (
    <div className="table-card animate-in">
      <table className="axion-table">
        <thead>
          <tr>
            <th>Data/Hora</th>
            <th>Usuário</th>
            <th>Método</th>
            <th>URL / Endpoint</th>
            <th>IP de Origem</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id || log.log_id}>
              {/* Formatação de Data amigável */}
              <td className="mono-text">
                {log.executed_at 
                  ? new Date(log.executed_at).toLocaleString('pt-BR') 
                  : 'N/A'}
              </td>

              {/* Informações do Usuário com fallback */}
              <td>
                <div className="user-info-min">
                  <span className="user-name">
                    {log.user_name || log.user?.name || 'Sistema/Automático'}
                  </span>
                  <small className="user-email text-dim">
                    {log.user_email || log.user?.email || '-'}
                  </small>
                </div>
              </td>

              {/* Badge Dinâmica de Método HTTP */}
              <td>
                <span className={`method-badge ${getMethodClass(log.method)}`}>
                  {log.method || 'REQ'}
                </span>
              </td>

              {/* Célula de URL com quebra de linha segura */}
              <td className="url-cell">
                <code className="text-primary" style={{ fontSize: '0.85rem' }}>
                  {log.url || '/'}
                </code>
              </td>

              {/* Endereço IP */}
              <td className="mono-text">
                {log.ip_address || '0.0.0.0'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}