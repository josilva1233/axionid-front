import { useState, useEffect, useRef } from 'react';

export default function Sidebar({ activeTab, setActiveTab, role, onLogout }) {
  const isAdmin = role === 'admin';
  const [isCollapsed, setIsCollapsed] = useState(true); // Começa recolhido
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef(null);

  // Limpa timeout ao desmontar
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
    // Cancela qualquer timeout pendente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Delay de 300ms antes de recolher
    timeoutRef.current = setTimeout(() => {
      if (!isHovered) {
        setIsCollapsed(true);
      }
    }, 300);
  };

  // Função manual para toggle (opcional)
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
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
                <small className="role-badge-sidebar">
                  {isAdmin ? 'Admin' : 'Comum'}
                </small>
              </>
            ) : (
              // Quando recolhido, mostra apenas o ícone
              <span className="brand-icon">🔒</span>
            )}
          </h1>
        </div>
        {/* Botão de toggle manual */}
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
            title={isCollapsed ? (isAdmin ? 'Gestão de Usuários' : 'Operações') : ''}
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
            title={isCollapsed ? (isAdmin ? 'Gestão de Grupos' : 'Meus Grupos') : ''}
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
            title={isCollapsed ? (isAdmin ? 'Gestão de Chamados' : 'Meus Chamados') : ''}
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
              title={isCollapsed ? 'Logs de Auditoria' : ''}
            >
              <span className="nav-icon">📜</span>
              {!isCollapsed && (
                <span className="nav-label">Logs de Auditoria</span>
              )}
            </button>

            <button 
              className={`nav-item ${activeTab === 'permissions' ? 'active' : ''}`}
              onClick={() => setActiveTab('permissions')}
              title={isCollapsed ? 'Permissões' : ''}
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
          title={isCollapsed ? 'Sair do Sistema' : ''}
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