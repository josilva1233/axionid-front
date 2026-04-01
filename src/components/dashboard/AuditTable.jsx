// components/dashboard/AuditTable.jsx
import React, { useState } from "react";
import { Modal, Form, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

export default function AuditTable({ logs, loading, onViewDetail, onDelete, currentUser }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingLog, setDeletingLog] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const AxionAlert = Swal.mixin({
    background: "#111214",
    color: "#ffffff",
    confirmButtonColor: "#6366f1",
  });

  const handleViewDetail = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const handleDelete = async (log) => {
    const result = await AxionAlert.fire({
      title: "Excluir Registro?",
      text: `Deseja remover permanentemente este registro de auditoria?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      setDeleteLoading(true);
      try {
        if (onDelete) await onDelete(log.id);
        AxionAlert.fire({
          icon: "success",
          title: "Registro excluído!",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        AxionAlert.fire("Erro", "Falha ao excluir registro.", "error");
      } finally {
        setDeleteLoading(false);
        setShowDeleteModal(false);
      }
    }
  };

  const getMethodBadgeClass = (method) => {
    const methodColors = {
      GET: { bg: "rgba(99, 102, 241, 0.1)", color: "#6366f1" },
      POST: { bg: "rgba(34, 197, 94, 0.1)", color: "#22c55e" },
      PUT: { bg: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" },
      PATCH: { bg: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" },
      DELETE: { bg: "rgba(239, 68, 68, 0.1)", color: "#ef4444" },
    };
    const style = methodColors[method] || methodColors.GET;
    return { backgroundColor: style.bg, color: style.color };
  };

  const isSystemAdmin = currentUser?.is_admin === 1 || currentUser?.is_admin === true;

  return (
    <>
      <div className="permission-table-container">
        <table className="permission-table">
          <thead>
            <tr>
              <th>DATA / HORA</th>
              <th>USUÁRIO / ORIGEM</th>
              <th className="text-center">MÉTODO</th>
              <th>RECURSO (URL)</th>
              <th>ENDEREÇO IP</th>
              {isSystemAdmin && <th className="text-end">AÇÕES</th>}
            </tr>
          </thead>
          <tbody>
            {logs && logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id} onClick={() => handleViewDetail(log)} style={{ cursor: "pointer" }}>
                  <td className="mono-text">
                    {log.created_at 
                      ? new Date(log.created_at).toLocaleString('pt-BR') 
                      : 'n/a'}
                  </td>
                  <td>
                    <div className="user-info-min">
                      <strong className="text-primary">
                        {log.user ? log.user.name : 'Sistema / API'}
                      </strong>
                      <br />
                      <small className="text-dim">
                        {log.user ? log.user.email : 'n/a'}
                      </small>
                    </div>
                  </td>
                  <td className="text-center">
                    <span 
                      className="status-badge"
                      style={getMethodBadgeClass(log.method?.toUpperCase())}
                    >
                      <span 
                        className="status-dot" 
                        style={{ backgroundColor: getMethodBadgeClass(log.method?.toUpperCase()).color }}
                      />
                      <span>{log.method?.toUpperCase() || 'N/A'}</span>
                    </span>
                  </td>
                  <td>
                    <code className="permission-code" style={{ fontSize: "12px" }}>
                      {log.url}
                    </code>
                  </td>
                  <td className="mono-text text-dim">
                    <i className="bi bi-geo-alt-fill me-1"></i>
                    {log.ip_address || 'n/a'}
                  </td>
                  {isSystemAdmin && (
                    <td className="text-end">
                      <button
                        className="btn-action btn-action-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(log);
                        }}
                        title="Excluir Registro"
                      >
                        <i className="bi bi-trash3-fill me-1"></i>
                        Excluir
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isSystemAdmin ? 6 : 5} className="empty-state">
                  <div className="empty-state">
                    <div className="empty-icon">{loading ? "⏳" : "🔒"}</div>
                    <p>
                      {loading 
                        ? "Carregando registros de auditoria..." 
                        : "Nenhum registro de auditoria encontrado para os filtros selecionados."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalhes */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered className="permission-modal" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalhes do Registro de Auditoria</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLog && (
            <div className="audit-details">
              <div className="detail-group">
                <label className="detail-label">ID do Registro:</label>
                <code className="detail-value">#{selectedLog.id}</code>
              </div>

              <div className="detail-group">
                <label className="detail-label">Data/Hora:</label>
                <div className="detail-value mono-text">
                  {selectedLog.created_at 
                    ? new Date(selectedLog.created_at).toLocaleString('pt-BR') 
                    : 'n/a'}
                </div>
              </div>

              <div className="detail-group">
                <label className="detail-label">Usuário:</label>
                <div className="detail-value">
                  <strong>{selectedLog.user ? selectedLog.user.name : 'Sistema / API'}</strong>
                  {selectedLog.user && (
                    <div className="text-dim small">{selectedLog.user.email}</div>
                  )}
                </div>
              </div>

              <div className="detail-group">
                <label className="detail-label">Método HTTP:</label>
                <div className="detail-value">
                  <span 
                    className="status-badge"
                    style={getMethodBadgeClass(selectedLog.method?.toUpperCase())}
                  >
                    <span 
                      className="status-dot" 
                      style={{ backgroundColor: getMethodBadgeClass(selectedLog.method?.toUpperCase()).color }}
                    />
                    <span>{selectedLog.method?.toUpperCase() || 'N/A'}</span>
                  </span>
                </div>
              </div>

              <div className="detail-group">
                <label className="detail-label">URL:</label>
                <code className="detail-value" style={{ wordBreak: "break-all" }}>
                  {selectedLog.url}
                </code>
              </div>

              <div className="detail-group">
                <label className="detail-label">Endereço IP:</label>
                <div className="detail-value mono-text">
                  <i className="bi bi-geo-alt-fill me-1"></i>
                  {selectedLog.ip_address || 'n/a'}
                </div>
              </div>

              {selectedLog.user_agent && (
                <div className="detail-group">
                  <label className="detail-label">User Agent:</label>
                  <div className="detail-value small text-dim" style={{ wordBreak: "break-all" }}>
                    {selectedLog.user_agent}
                  </div>
                </div>
              )}

              {selectedLog.payload && (
                <div className="detail-group">
                  <label className="detail-label">Payload:</label>
                  <pre className="detail-code">
                    {JSON.stringify(selectedLog.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>
            Fechar
          </button>
          {isSystemAdmin && selectedLog && (
            <button 
              className="btn-action-danger" 
              onClick={() => {
                setShowDetailModal(false);
                handleDelete(selectedLog);
              }}
              style={{ padding: "8px 16px", borderRadius: "6px" }}
            >
              <i className="bi bi-trash3-fill me-1"></i>
              Excluir Registro
            </button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered className="permission-modal">
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tem certeza que deseja excluir este registro de auditoria?</p>
          <small className="text-dim">Esta ação não pode ser desfeita.</small>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-secondary" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>
            Cancelar
          </button>
          <button 
            className="btn-action-danger" 
            onClick={() => deletingLog && handleDelete(deletingLog)} 
            disabled={deleteLoading}
            style={{ padding: "8px 16px", borderRadius: "6px" }}
          >
            {deleteLoading ? <Spinner animation="border" size="sm" /> : "Confirmar Exclusão"}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}