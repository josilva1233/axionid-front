export default function Sidebar({ activeTab, setActiveTab, role, onLogout }) {
  return (
    <aside className="sidebar">
      {/* BRAND PADRONIZADA NO TOPO DA SIDEBAR */}
      <div className="sidebar-brand">
        <div className="brand">
          <h1>Axion<span>ID</span></h1>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {/* SEÇÃO PRINCIPAL - VISÍVEL PARA TODOS OS LOGADOS */}
        <div className="nav-group">
          <p className="nav-section-title">Principal</p>
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-label">
              {role === 'admin' ? 'Gestão de Usuários' : 'Meu Acesso'}
            </span>
          </button>
        </div>

        {/* SEÇÃO DE SEGURANÇA - EXCLUSIVA PARA ADMIN */}
        {role === 'admin' && (
          <div className="nav-group animate-in" style={{ marginTop: '24px' }}>
            <p className="nav-section-title">Segurança</p>
            <button 
              className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <span className="nav-icon">📜</span>
              <span className="nav-label">Logs de Auditoria</span>
            </button>
            
            {/* Exemplo de item futuro (opcional/comentado) */}
            {/* <button className="nav-item">
              <span className="nav-icon">🛡️</span>
              <span className="nav-label">Políticas de Acesso</span>
            </button> 
            */}
          </div>
        )}
      </nav>

      {/* FOOTER DA SIDEBAR COM BOTÃO DE LOGOUT ESTILIZADO */}
      <div className="sidebar-footer">
        <button 
          onClick={onLogout} 
          className="btn-logout-sidebar"
          title="Encerrar Sessão"
        >
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Sair do Sistema</span>
        </button>
        
        <div className="sidebar-version">
          v1.0.4-stable
        </div>
      </div>
    </aside>
  );
}