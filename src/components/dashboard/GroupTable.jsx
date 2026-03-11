export default function GroupTable({ groups, onViewDetail }) {
  return (
    <div className="table-responsive animate-in">
      <table className="axion-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>NOME DO GRUPO</th>
            <th>CRIADOR</th>
            <th className="text-center">MEMBROS</th>
            <th className="text-center">MEU STATUS</th>
            <th className="text-end">AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          {groups.length > 0 ? (
            groups.map((g) => (
              <tr key={g.id}>
                {/* ID técnico com estilo Monos */}
                <td
                  className="mono-text"
                  style={{ fontSize: "0.8rem", opacity: 0.7 }}
                >
                  #{g.id}
                </td>

                {/* Nome do Grupo em destaque */}
                <td>
                  <strong style={{ color: "var(--primary)", letterSpacing: "0.5px" }}>
                    {g.name.toUpperCase()}
                  </strong>
                </td>

                {/* Criador do Grupo */}
                <td className="text-dim" style={{ fontSize: "0.9rem" }}>
                  {g.creator?.name || "Sistema"}
                </td>

                {/* Contagem de Membros com Badge Operacional */}
                <td className="text-center">
                  <span
                    className="badge badge-operacional"
                    style={{ fontSize: "0.75rem", minWidth: "40px" }}
                  >
                    {g.users_count || g.users?.length || 0}
                  </span>
                </td>

                {/* Status de Vínculo (Se o usuário logado é Admin do grupo ou membro) */}
                <td className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <span
                      className="status-indicator"
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "var(--primary)",
                      }}
                    />
                    <span style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
                      Ativo
                    </span>
                  </div>
                </td>

                {/* Botão de Ação Alinhado à Direita */}
                <td className="text-end">
                  <button
                    className="btn-table-action"
                    onClick={() => onViewDetail(g.id)}
                    title="Gerenciar Membros e Configurações"
                  >
                    <i className="bi bi-gear-fill me-1"></i>
                    Gerenciar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-5 text-dim">
                <div className="d-flex flex-column align-items-center">
                  <span style={{ fontSize: "1.5rem" }}>📁</span>
                  <p className="mt-2 mb-0">
                    Nenhum grupo identificado nesta conta.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}