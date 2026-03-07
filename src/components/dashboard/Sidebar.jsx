import React from 'react';

export default function Sidebar({ activeTab, setActiveTab, role, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand" style={{marginBottom: '40px'}}><h1>Axion<span>ID</span></h1></div>
      <nav style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
        <button className={`btn-primary ${activeTab === 'users' ? '' : 'btn-outline'}`} 
                style={{background: activeTab === 'users' ? 'var(--primary)' : 'transparent'}}
                onClick={() => setActiveTab('users')}>👥 Usuários</button>
        
        {role === 'admin' && (
          <button className={`btn-primary ${activeTab === 'audit' ? '' : 'btn-outline'}`}
                  style={{background: activeTab === 'audit' ? 'var(--primary)' : 'transparent'}}
                  onClick={() => setActiveTab('audit')}>📜 Auditoria</button>
        )}
      </nav>
      <button className="btn-primary" style={{marginTop: 'auto', background: 'var(--error)'}} onClick={onLogout}>Sair</button>
    </aside>
  );
}