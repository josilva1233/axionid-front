// components/dashboard/GroupPermissionManager.jsx
import { useState, useMemo } from "react";
import { Form, Spinner, Modal, Alert } from "react-bootstrap";
import Swal from "sweetalert2";
// import "../../GroupPermissionManager.css";

// Movemos a instância do alerta para fora do componente 
// para evitar recriação desnecessária a cada render.
const AxionAlert = Swal.mixin({
  background: "#111214",
  color: "#ffffff",
  confirmButtonColor: "#6366f1",
  cancelButtonColor: "#343a40",
});

export default function GroupPermissionManager({ 
  group = {}, 
  permissions = [], 
  onAddPermission, 
  onRemovePermission,
  actionLoading = false 
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const groupPermissions = group?.permissions || [];

  // useMemo evita filtros pesados e desnecessários em re-renders
  const availablePermissions = useMemo(() => {
    return permissions.filter(
      (perm) => !groupPermissions.some((gp) => gp.id === perm.id)
    );
  }, [permissions, groupPermissions]);

  const filteredPermissions = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return availablePermissions.filter(
      (perm) =>
        perm.name?.toLowerCase().includes(term) ||
        perm.label?.toLowerCase().includes(term)
    );
  }, [availablePermissions, searchTerm]);

  // Centraliza a limpeza de estado ao fechar o modal
  const handleCloseModal = () => {
    setShowAddModal(false);
    setSelectedPermission("");
    setSearchTerm("");
  };

  const handleAddPermission = async () => {
    if (!selectedPermission) {
      AxionAlert.fire("Erro", "Selecione uma permissão para adicionar.", "error");
      return;
    }
    
    try {
      await onAddPermission(selectedPermission);
      handleCloseModal();
      AxionAlert.fire({
        title: "Sucesso!",
        text: "Permissão adicionada com sucesso.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      AxionAlert.fire("Erro", "Não foi possível adicionar a permissão. Tente novamente.", "error");
    }
  };

  const handleRemovePermission = async (permissionId, permissionName) => {
    const result = await AxionAlert.fire({
      title: "Remover Permissão?",
      text: `Deseja remover a permissão "${permissionName}" deste grupo?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, remover",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await onRemovePermission(permissionId);
        AxionAlert.fire({
          title: "Removida!",
          text: "A permissão foi removida do grupo.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        AxionAlert.fire("Erro", "Não foi possível remover a permissão.", "error");
      }
    }
  };

  return (
    <div className="group-permission-manager">
      <div className="manager-header">
        <h5 className="manager-title">
          <i className="bi bi-shield-lock-fill"></i>
          Permissões do Grupo
        </h5>
        <button
          className="btn-add-permission"
          onClick={() => setShowAddModal(true)}
          disabled={actionLoading}
        >
          <i className="bi bi-plus-lg me-2"></i> Adicionar Permissão
        </button>
      </div>

      {groupPermissions.length === 0 ? (
        <div className="empty-permissions">
          <i className="bi bi-shield-slash"></i>
          <p>Nenhuma permissão vinculada a este grupo.</p>
          <button
            className="btn-add-first"
            onClick={() => setShowAddModal(true)}
            disabled={actionLoading}
          >
            <i className="bi bi-plus-circle me-2"></i> Adicionar primeira permissão
          </button>
        </div>
      ) : (
        <div className="permissions-list">
          {groupPermissions.map((perm) => (
            <div key={perm.id} className="permission-item">
              <div className="permission-info">
                <div className="permission-icon">
                  <i className="bi bi-key-fill"></i>
                </div>
                <div className="permission-details">
                  <div className="permission-name">{perm.label || perm.name}</div>
                  <code className="permission-slug">{perm.name}</code>
                </div>
              </div>
              <button
                className="btn-remove"
                aria-label={`Remover permissão ${perm.label || perm.name}`}
                onClick={() => handleRemovePermission(perm.id, perm.label || perm.name)}
                disabled={actionLoading}
                title="Remover permissão"
              >
                <i className="bi bi-trash3-fill"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal para adicionar permissão */}
      <Modal 
        show={showAddModal} 
        onHide={handleCloseModal} 
        centered 
        className="permission-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-plus-circle-fill text-primary me-2"></i>
            Adicionar Permissão ao Grupo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" className="alert-info-custom">
            <i className="bi bi-info-circle-fill me-2"></i>
            Selecione uma permissão para vincular ao grupo <strong>{group?.name || "Selecionado"}</strong>
          </Alert>

          <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">
              <i className="bi bi-search me-1"></i> Buscar Permissão
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite o nome ou chave da permissão..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              autoFocus
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="form-label-custom">Permissões Disponíveis</Form.Label>
            <div className="permissions-select-list">
              {filteredPermissions.length === 0 ? (
                <div className="empty-list">
                  <i className="bi bi-inbox"></i>
                  <p className="mt-2 mb-0 small">
                    {searchTerm 
                      ? "Nenhuma permissão encontrada para a busca." 
                      : "Nenhuma permissão disponível para adicionar."}
                  </p>
                </div>
              ) : (
                filteredPermissions.map((perm) => (
                  <div
                    key={perm.id}
                    className={`permission-option ${selectedPermission === perm.name ? 'selected' : ''}`}
                    onClick={() => setSelectedPermission(perm.name)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="permission-option-title">{perm.label || perm.name}</div>
                        <code className="permission-option-slug">{perm.name}</code>
                      </div>
                      {selectedPermission === perm.name && (
                        <i className="bi bi-check-circle-fill permission-option-check text-success"></i>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Form.Group>

          <div className="modal-actions d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCloseModal}
              disabled={actionLoading}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddPermission}
              disabled={actionLoading || !selectedPermission}
            >
              {actionLoading ? <Spinner animation="border" size="sm" /> : (
                <>
                  <i className="bi bi-link me-2"></i> Vincular Permissão
                </>
              )}
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}