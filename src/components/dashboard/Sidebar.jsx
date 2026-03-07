import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeTab, setActiveTab, role, onLogout }) => {
  return (
    <aside className="sidebar">
      <div className="brand"><h1>Axion<span>ID</span></h1></div>
      <nav className="sidebar-nav">
        <button className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          👥 Gestão Usuários
        </button>
        {role === 'admin' && (
          <button className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
            📜 Auditoria
          </button>
        )}
      </nav>
      <div className="sidebar-footer">
        <button onClick={onLogout} className="btn-primary" style={{background: 'var(--error)'}}>Sair</button>
      </div>
    </aside>
  );
};
export default Sidebar;