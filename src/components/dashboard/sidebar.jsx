export default function Sidebar({ activeTab, setActiveTab, role, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand"><h1>Axion<span>ID</span></h1></div>
      </div>
      
      <nav className="sidebar-nav">
        <p className="nav-section-title">Principal</p>
        <button 
          className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <span className="nav-icon">👥</span> <span>Gestão Usuários</span>
        </button>

        {role === 'admin' && (
          <>
            <p className="nav-section-title">Segurança</p>
            <button 
              className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <span className="nav-icon">📜</span> <span>Histórico Auditoria</span>
            </button>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button onClick={onLogout} className="btn-logout-sidebar">Sair do Sistema</button>
      </div>
    </aside>
  );
}