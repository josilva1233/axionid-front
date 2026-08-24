import { useState, useEffect, useRef } from 'react';

export default function Sidebar({ activeTab, setActiveTab, role, onLogout, onToggle }) {
  const isAdmin = role === 'admin';
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsCollapsed(false);
    if (onToggle) onToggle(false);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    timeoutRef.current = setTimeout(() => {
      if (!isHovered) {
        setIsCollapsed(true);
        if (onToggle) onToggle(true);
      }
    }, 300);
  };

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onToggle) onToggle(newState);
  };

  return (
    <aside 
      className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="sidebar-brand">
        <div className="brand">
          <h1>
            {!isCollapsed ? (
              <>
                Axion<span>ID</span>
                <small className="role-badge-sidebar">ADMIN</small>
              </>
            ) : (
              <span className="brand-icon">⚡</span>
            )}
          </h1>
        </div>
        <button 
          className="toggle-sidebar-btn"
          onClick={toggleSidebar}
          title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isCollapsed ? '➡️' : '⬅️'}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-group">
          {!isCollapsed && <p className="nav-section-title">Principal</p>}
          
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="nav-icon">👥</span>
            {!isCollapsed && (
              <span className="nav-label">
                {isAdmin ? 'Gestão de Usuários' : 'Operações'}
              </span>
            )}
          </button>

          <button 
            className={`nav-item ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            <span className="nav-icon">📁</span>
            {!isCollapsed && (
              <span className="nav-label">
                {isAdmin ? 'Gestão de Grupos' : 'Meus Grupos'}
              </span>
            )}
          </button>
        </div>

        <div className="nav-group">
          {!isCollapsed && <p className="nav-section-title">Atendimento</p>}
          
          <button 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <span className="nav-icon">🎫</span>
            {!isCollapsed && (
              <span className="nav-label">
                {isAdmin ? 'Gestão de Chamados' : 'Meus Chamados'}
              </span>
            )}
          </button>
        </div>

        {isAdmin && (
          <div className="nav-group">
            {!isCollapsed && <p className="nav-section-title">Segurança</p>}
            
            <button 
              className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <span className="nav-icon">📜</span>
              {!isCollapsed && (
                <span className="nav-label">Logs de Auditoria</span>
              )}
            </button>

            <button 
              className={`nav-item ${activeTab === 'permissions' ? 'active' : ''}`}
              onClick={() => setActiveTab('permissions')}
            >
              <span className="nav-icon">🛡️</span>
              {!isCollapsed && (
                <span className="nav-label">Permissões</span>
              )}
            </button>
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <button 
          onClick={onLogout} 
          className="btn-logout-sidebar"
        >
          <span className="nav-icon">🚪</span>
          {!isCollapsed && (
            <span className="nav-label">Sair do Sistema</span>
          )}
        </button>
        
        {!isCollapsed && (
          <div className="sidebar-version">
            v1.0.4-stable
          </div>
        )}
      </div>
    </aside>
  );
}