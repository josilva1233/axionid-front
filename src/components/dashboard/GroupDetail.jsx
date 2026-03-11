import React, { useState } from 'react';

export default function GroupDetail({ group, onBack, onAddUser, onRemoveUser, actionLoading }) {
  const [emailToAdd, setEmailToAdd] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (emailToAdd) {
      onAddUser(emailToAdd);
      setEmailToAdd('');
    }
  };

  if (!group) return <div className="text-center py-5 text-dim">Grupo não encontrado.</div>;

  return (
    <div className="group-detail-container animate-in">
      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-3">
          <button 
            className="btn-filter-clear" 
            onClick={onBack} 
            style={{ width: 'auto', padding: '8px 15px', borderRadius: '8px' }}
          >
            <i className="bi bi-arrow-left me-2"></i>Voltar
          </button>
          <h2 className="mb-0 text-white" style={{ fontSize: '1.4rem', fontWeight: '600' }}>
            Gerenciar: <span className="text-primary">{group.name.toUpperCase()}</span>
          </h2>
        </div>
      </div>

      <div className="row g-4">
        {/* LISTA DE MEMBROS */}
        <div className="col-md-8">
          <div className="content-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white mb-0">Membros do Grupo</h5>
              <span className="badge badge-operacional">{group.users?.length || 0} usuários</span>
            </div>
            
            <div className="table-responsive">
              <table className="axion-table">
                <thead>
                  <tr>
                    <th>NOME</th>
                    <th>E-MAIL</th>
                    <th className="text-end">AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {group.users && group.users.length > 0 ? (
                    group.users.map((user) => (
                      <tr key={user.id}>
                        <td><strong className="text-white">{user.name}</strong></td>
                        <td className="text-dim">{user.email}</td>
                        <td className="text-end">
                          <button 
                            className="btn btn-outline-danger btn-sm"
                            style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '5px 10px' }}
                            onClick={() => onRemoveUser(user.id, user.name)}
                            disabled={actionLoading}
                          >
                            <i className="bi bi-person-x me-1"></i>Remover
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-5 text-dim">
                        Nenhum membro encontrado neste grupo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* BOX LATERAL PARA ADICIONAR */}
        <div className="col-md-4">
          <div className="content-card p-4" style={{ border: '1px solid var(--border-color)' }}>
            <h5 className="text-white mb-3">Adicionar Membro</h5>
            <p className="text-dim small mb-4">
              O usuário deve estar previamente cadastrado no sistema AxionID.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="filter-label mb-2">E-mail do Usuário</label>
                <input 
                  type="email" 
                  className="custom-input-dark w-100"
                  value={emailToAdd}
                  onChange={(e) => setEmailToAdd(e.target.value)}
                  placeholder="usuario@email.com"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary w-100 py-2 fw-bold" 
                disabled={actionLoading || !emailToAdd}
              >
                {actionLoading ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  <><i className="bi bi-person-plus-fill me-2"></i>Inserir no Grupo</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}