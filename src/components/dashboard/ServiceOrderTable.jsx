
export default function ServiceOrderTable({ orders, loading, onViewDetail }) {
  const getStatusBadge = (status) => {
    const styles = {
      open: { bg: "rgba(0, 255, 255, 0.1)", color: "#00ffff", label: "Aberto" },
      in_progress: { bg: "rgba(255, 193, 7, 0.1)", color: "#ffc107", label: "Em Atendimento" },
      resolved: { bg: "rgba(40, 167, 69, 0.1)", color: "#28a745", label: "Resolvido" },
      closed: { bg: "rgba(108, 117, 125, 0.1)", color: "#6c757d", label: "Fechado" },
    };
    const current = styles[status] || styles.open;
    return (
      <span className="badge-custom" style={{ backgroundColor: current.bg, color: current.color }}>
        {current.label.toUpperCase()}
      </span>
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ffc107';
      case 'urgent': return '#dc3545';
      default: return 'var(--primary)';
    }
  };

  return (
    <div className="table-responsive">
      <table className="axion-table">
        <thead>
          <tr>
            <th>PROTOCOLO</th>
            <th>TÍTULO / ASSUNTO</th>
            <th>SOLICITANTE</th>
            <th className="text-center">PRIORIDADE</th>
            <th className="text-center">STATUS</th>
            <th className="text-end">AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((os) => (
              <tr key={os.id}>
                <td className="mono-text">
                  {os.protocol}
                </td>
                <td>
                  <div className="order-title">
                    <strong className="text-primary">
                      {os.title.toUpperCase()}
                    </strong>
                    <small className="text-dim">
                      Criado em: {new Date(os.created_at).toLocaleDateString('pt-BR')}
                    </small>
                  </div>
                </td>
                <td className="text-dim">
                  <i className="bi bi-person me-1"></i>
                  {os.user?.name || "Usuário Externo"}
                </td>
                <td className="text-center">
                  <div className="priority-indicator">
                    <span
                      className="priority-dot"
                      style={{ backgroundColor: getPriorityColor(os.priority) }}
                    />
                    <span className="text-dim">
                      {os.priority.toUpperCase()}
                    </span>
                  </div>
                </td>
                <td className="text-center">
                  {getStatusBadge(os.status)}
                </td>
                <td className="text-end">
                  <button
                    className="btn-table-action"
                    onClick={() => onViewDetail(os.id)}
                  >
                    <i className="bi bi-eye-fill me-1"></i>
                    Detalhes
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-5 text-dim">
                {loading ? "Carregando chamados..." : "Nenhuma Ordem de Serviço encontrada."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}