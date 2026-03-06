import { memo } from "react";

// Memoizamos o componente pois tabelas de logs podem ser grandes
// e não precisam re-renderizar se a lista de logs for a mesma.
const AuditTable = memo(({ logs }) => {
  
  // Função auxiliar para formatar data (Padrão PT-BR)
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="empty-audit">
        <p>Nenhum registro de atividade encontrado nas últimas 24h.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="axion-table">
        <thead>
          <tr>
            <th>Data / Hora</th>
            <th>Agente / Usuário</th>
            <th>Ação (Método)</th>
            <th>Endpoint (URL)</th>
            <th>Origem (IP)</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.log_id} className="audit-row">
              <td className="mono-text timestamp">
                {formatDate(log.executed_at)}
              </td>
              
              <td className="user-column">
                <div className="user-info-min">
                  <span className="user-name">
                    {log.user_name || "🤖 Sistema / Cron"}
                  </span>
                  <span className="user-subtext">{log.user_email || "root@axionid.internal"}</span>
                </div>
              </td>

              <td>
                <span className={`method-badge ${log.method?.toLowerCase()}`}>
                  {log.method}
                </span>
              </td>

              <td className="url-cell">
                <code className="url-path" title={log.url}>
                  {log.url}
                </code>
              </td>

              <td className="mono-text ip-address">
                {log.ip_address}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default AuditTable;