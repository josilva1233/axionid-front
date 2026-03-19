import React from "react";

export default function PermissionTable({ permissions, loading, currentUser, onEdit }) {
  return (
    <div className="table-responsive animate-in">
      <table className="axion-table w-100">
        <thead>
          <tr>
            <th>ID</th>
            <th>NOME DA PERMISSÃO (LABEL)</th>
            <th>CHAVE DO SISTEMA (SLUG)</th>
            <th className="text-center">TIPO</th>
            <th className="text-center">STATUS</th>
            <th className="text-end">AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          {permissions.length > 0 ? (
            permissions.map((perm) => {
              // Verifica se o usuário logado é Admin Global do Sistema
              const isSystemAdmin = currentUser?.is_admin === 1 || currentUser?.is_admin === true;

              return (
                <tr key={perm.id}>
                  {/* ID técnico com estilo Monos */}
                  <td
                    className="mono-text"
                    style={{ fontSize: "0.8rem", opacity: 0.7 }}
                  >
                    #{perm.id}
                  </td>

                  {/* Nome da Permissão (Label) em destaque */}
                  <td>
                    <strong
                      style={{
                        color: "var(--primary)",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {perm.label ? perm.label.toUpperCase() : "SEM NOME"}
                    </strong>
                  </td>

                  {/* Slug do sistema com estilo de código discreto */}
                  <td>
                    <code 
                      className="bg-dark px-2 py-1 rounded text-info" 
                      style={{ 
                        fontSize: '0.82rem', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontFamily: 'monospace' 
                      }}
                    >
                      {perm.name}
                    </code>
                  </td>

                  {/* Badge Operacional (IAM) */}
                  <td className="text-center">
                    <span
                      className="badge badge-operacional"
                      style={{ fontSize: "0.7rem", minWidth: "55px" }}
                    >
                      IAM
                    </span>
                  </td>

                  {/* Status do Registro */}
                  <td className="text-center">
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <span
                        className="status-indicator"
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: "#28a745", // Verde para ativo
                        }}
                      />
                      <span className="text-dim" style={{ fontSize: "0.85rem" }}>
                        Ativo
                      </span>
                    </div>
                  </td>

                  {/* Ações: Editar para Admins, Cadeado para outros */}
                  <td className="text-end">
                    {isSystemAdmin ? (
                      <button
                        className="btn-table-action"
                        onClick={() => onEdit && onEdit(perm)}
                        title="Editar Permissão"
                      >
                        <i className="bi bi-pencil-square me-1"></i>
                        Editar
                      </button>
                    ) : (
                      <span
                        className="text-dim small"
                        style={{ fontStyle: "italic", opacity: 0.7 }}
                      >
                        <i className="bi bi-lock-fill me-1"></i> Read-only
                      </span>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-5 text-dim">
                <div className="d-flex flex-column align-items-center">
                  <span style={{ fontSize: "1.5rem" }}>
                    {loading ? "⏳" : "🛡️"}
                  </span>
                  <p className="mt-2 mb-0">
                    {loading ? "Carregando permissões..." : "Nenhuma permissão identificada no sistema."}
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