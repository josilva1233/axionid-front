import React from "react";

export default function PermissionTable({ permissions, loading }) {
  return (
    <div className="table-responsive animate-in">
      <table className="axion-table w-100">
        <thead>
          <tr>
            <th>ID</th>
            <th>NOME DA PERMISSÃO (LABEL)</th>
            <th>CHAVE DO SISTEMA (SLUG)</th>
            <th className="text-center">TIPO</th>
            <th className="text-end">CRIADO EM</th>
          </tr>
        </thead>
        <tbody>
          {permissions.length > 0 ? (
            permissions.map((perm) => (
              <tr key={perm.id}>
                {/* ID técnico com estilo Monos para seguir o padrão do GroupTable */}
                <td
                  className="mono-text"
                  style={{ fontSize: "0.8rem", opacity: 0.7 }}
                >
                  #{perm.id}
                </td>

                {/* Nome da Permissão (Label) em destaque com var(--primary) */}
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
                    style={{ fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {perm.name}
                  </code>
                </td>

                {/* Badge Operacional para indicar que é uma permissão de IAM */}
                <td className="text-center">
                  <span
                    className="badge badge-operacional"
                    style={{ fontSize: "0.75rem", minWidth: "60px" }}
                  >
                    IAM
                  </span>
                </td>

                {/* Data de criação alinhada à direita */}
                <td className="text-end text-dim" style={{ fontSize: "0.9rem" }}>
                  <i className="bi bi-calendar3 me-2" style={{ fontSize: '0.8rem' }}></i>
                  {perm.created_at 
                    ? new Date(perm.created_at).toLocaleDateString('pt-BR') 
                    : 'Sistema'}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-5 text-dim">
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