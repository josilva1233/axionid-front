import React, { useState } from 'react';

export default function GroupDetail({ group, onBack, onAddUser, onRemoveUser, actionLoading }) {
  const [emailToAdd, setEmailToAdd] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!emailToAdd) return;
    
    // Dispara a função que está no Dashboard.js
    onAddUser(emailToAdd);
    setEmailToAdd('');
  };

  if (!group) {
    return (
      <div className="text-center py-5">
        <p className="text-dim">Carregando dados do grupo...</p>
        <button className="btn-secondary" onClick={onBack}>Voltar</button>
      </div>
    );
  }

  return (
    <div className="group-detail-container animate-in">
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn-filter-clear" onClick={onBack} style={{ width: 'auto', padding: '8px 15px' }}>
          <i className="bi bi-arrow-left me-2"></i>Voltar
        </button>
        <h2 className="mb-0 text-white" style={{ fontSize: '1.4rem' }}>
          Gerenciar Grupo: <span className="text-primary">{group.name?.toUpperCase()}</span>
        </h2>
      </div>

      <div className="row g-4">
        {/* LISTA DE MEMBROS */}
        <div className="col-md-8">
          <div className="content-card p-4">
            <h5 className="text-white mb-4">Membros Atuais</h5>
            <div className="table-responsive">
              <table className="axion-table">
                <thead>
                  <tr>
                    <th>NOME</th>
                    <th>E-MAIL</th>
                    <th className="text-end">AÇÃO</th>
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
                            onClick={() => onRemoveUser(user.id, user.name)}
                            disabled={actionLoading}
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-4 text-dim">
                        Nenhum membro vinculado a este grupo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FORMULÁRIO LATERAL */}
        <div className="col-md-4">
          <div className="content-card p-4">
            <h5 className="text-white mb-3">Adicionar Membro</h5>
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
                className="btn btn-primary w-100" 
                disabled={actionLoading || !emailToAdd}
              >
                {actionLoading ? 'Processando...' : 'Inserir no Grupo'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}