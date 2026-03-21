import React from "react";

export default function ServiceOrderTable({ orders, loading, onViewDetail }) {
  // Função para definir a cor do badge de status
  const getStatusBadge = (status) => {
const styles = {
    open: { bg: "rgba(0, 255, 255, 0.1)", color: "#00ffff", label: "Aberto" },
    in_progress: { bg: "rgba(255, 193, 7, 0.1)", color: "#ffc107", label: "Em Atendimento" },
    resolved: { bg: "rgba(40, 167, 69, 0.1)", color: "#28a745", label: "Resolvido" },
    closed: { bg: "rgba(108, 117, 125, 0.1)", color: "#6c757d", label: "Fechado" },
  };
    const current = styles[status] || styles.open;
    return (
      <span 
        className="badge" 
        style={{ backgroundColor: current.bg, color: current.color, fontSize: '0.75rem' }}
      >
        {current.label.toUpperCase()}
      </span>
    );
  };

  // Função para definir a cor da prioridade
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ffc107';
      case 'urgent': return '#dc3545';
      default: return 'var(--primary)';
    }
  };

  return (
    <div className="table-responsive animate-in">
      <table className="axion-table w-100">
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
                {/* PROTOCOLO COM ESTILO MONO */}
                <td className="mono-text" style={{ fontSize: "0.85rem", color: 'var(--text-dim)' }}>
                  {os.protocol}
                </td>

                {/* TÍTULO EM DESTAQUE */}
                <td>
                  <div className="d-flex flex-column">
                    <strong style={{ color: "var(--primary)", letterSpacing: "0.5px" }}>
                      {os.title.toUpperCase()}
                    </strong>
                    <small className="text-dim" style={{ fontSize: '0.7rem' }}>
                      Criado em: {new Date(os.created_at).toLocaleDateString('pt-BR')}
                    </small>
                  </div>
                </td>

                {/* USUÁRIO QUE ABRIU */}
                <td className="text-dim" style={{ fontSize: "0.9rem" }}>
                  <i className="bi bi-person me-1"></i>
                  {os.user?.name || "Usuário Externo"}
                </td>

                {/* PRIORIDADE COM INDICADOR DE COR */}
                <td className="text-center">
                   <div className="d-flex align-items-center justify-content-center gap-2">
                      <span
                        className="status-indicator"
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: getPriorityColor(os.priority),
                        }}
                      />
                      <span className="text-dim" style={{ fontSize: "0.85rem" }}>
                        {os.priority.toUpperCase()}
                      </span>
                    </div>
                </td>

                {/* STATUS COM BADGE */}
                <td className="text-center">
                  {getStatusBadge(os.status)}
                </td>

                {/* AÇÕES */}
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