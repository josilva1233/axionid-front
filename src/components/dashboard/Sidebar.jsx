// components/dashboard/Sidebar.jsx
import { useState, useEffect, useRef } from 'react';
import { usePermissions } from '../../hooks/usePermissions';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  role, 
  onLogout, 
  onToggle,
  isDark = false,
}) {
  const {
    canViewUsers,
    canViewGroups,
    canViewOrders,
    canViewAudit,
    canViewPermissions,
    isAdmin,
  } = usePermissions();

  const [isCollapsed, setIsCollapsed] = useState(false);
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

  const bgSidebar = isDark 
    ? 'bg-slate-900/95 border-slate-700/50' 
    : 'bg-white/95 border-gray-200/80';
  const textBrand = isDark ? 'text-white' : 'text-gray-800';
  const textBrandSpan = isDark ? 'text-blue-500' : 'text-blue-600';
  const badgeRole = isDark 
    ? 'bg-slate-800 text-slate-400' 
    : 'bg-gray-200 text-gray-600';
  const borderSubtle = isDark ? 'border-slate-700/50' : 'border-gray-200';
  const textSection = isDark ? 'text-slate-500' : 'text-gray-400';
  const textNavDefault = isDark ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700';
  const textNavActive = isDark 
    ? 'bg-blue-500/15 text-blue-400' 
    : 'bg-blue-50 text-blue-700';
  const indicatorActive = isDark ? 'bg-blue-500' : 'bg-blue-600';
  const textFooter = isDark ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : 'text-red-600 hover:text-red-700 hover:bg-red-50';
  const textVersion = isDark ? 'text-slate-500' : 'text-gray-400';

  const navItems = [
    {
      id: 'users',
      icon: '👥',
      label: isAdmin ? 'Gestão de Usuários' : 'Operações',
      section: 'Principal',
      visible: canViewUsers,
    },
    {
      id: 'groups',
      icon: '📁',
      label: isAdmin ? 'Gestão de Grupos' : 'Meus Grupos',
      section: 'Principal',
      visible: canViewGroups,
    },
    {
      id: 'orders',
      icon: '🎫',
      label: isAdmin ? 'Gestão de Chamados' : 'Meus Chamados',
      section: 'Atendimento',
      visible: canViewOrders,
    },
    // 🔥 NOVO: Assistente (visível para todos)
    {
      id: 'ai',
      icon: '🤖',
      label: 'Assistente',
      section: 'Principal',
      visible: true,
    },
    {
      id: 'audit',
      icon: '📜',
      label: 'Logs de Auditoria',
      section: 'Segurança',
      visible: canViewAudit || isAdmin,
    },
    {
      id: 'permissions',
      icon: '🛡️',
      label: 'Permissões',
      section: 'Segurança',
      visible: canViewPermissions || isAdmin,
    },
    {
      id: 'terms',
      icon: '📄',
      label: 'Termos de Uso',
      section: 'Segurança',
      visible: isAdmin,
    },
  ];

  const filteredNavItems = navItems.filter(item => item.visible);

  if (filteredNavItems.length === 0) {
    return (
      <aside className={`fixed left-0 top-0 h-screen w-[70px] z-[1000] ${bgSidebar} border-r`}>
        <div className="flex items-center justify-center h-full">
          <span className={`text-xs text-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
            Sem<br/>acesso
          </span>
        </div>
      </aside>
    );
  }

  const groupedItems = filteredNavItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <aside 
      className={`
        fixed left-0 top-0 h-screen z-[1000]
        ${bgSidebar} backdrop-blur-sm
        border-r shadow-2xl
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        overflow-hidden
        flex flex-col
        ${isCollapsed ? 'w-[70px]' : 'w-[250px]'}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`relative px-6 py-4 min-h-[70px] border-b ${borderSubtle} flex items-center justify-between`}>
        <div className="flex items-center">
          {!isCollapsed ? (
            <h1 className={`text-2xl font-bold ${textBrand} flex items-center gap-2`}>
              Axion<span className={textBrandSpan}>ID</span>
              <small className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${badgeRole}`}>
                {isAdmin ? 'ADMIN' : 'USER'}
              </small>
            </h1>
          ) : (
            <span className={`text-3xl font-bold ${textBrandSpan}`}>⚡</span>
          )}
        </div>

        <button 
          className={`
            absolute -right-3 top-1/2 -translate-y-1/2
            w-6 h-6 rounded-full
            bg-blue-600 hover:bg-blue-500
            text-white text-xs
            flex items-center justify-center
            transition-all duration-300
            opacity-70 hover:opacity-100
            shadow-lg
            ${isCollapsed ? 'rotate-180' : ''}
          `}
          onClick={toggleSidebar}
          title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          ◀
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2 custom-scrollbar">
        {Object.entries(groupedItems).map(([section, items]) => (
          <div key={section} className="mb-3">
            {!isCollapsed && (
              <p className={`text-[10px] font-semibold uppercase tracking-wider ${textSection} px-3 py-2`}>
                {section}
              </p>
            )}
            {items.map((item) => (
              <button
                key={item.id}
                className={`
                  flex items-center gap-3
                  w-full rounded-md
                  transition-all duration-200
                  cursor-pointer
                  relative
                  ${isCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}
                  ${activeTab === item.id 
                    ? textNavActive
                    : textNavDefault
                  }
                `}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : ''}
              >
                <span className="text-lg w-6 text-center flex-shrink-0">
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
                {activeTab === item.id && (
                  <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 ${indicatorActive} rounded-r`}></span>
                )}
                {item.id === 'terms' && !isCollapsed && (
                  <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${
                    isDark 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    Novo
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className={`
        border-t ${borderSubtle}
        ${isCollapsed ? 'px-2 py-3' : 'px-4 py-4'}
      `}>
        <button
          onClick={onLogout}
          className={`
            flex items-center gap-3
            w-full rounded-md
            transition-all duration-200
            ${textFooter}
            ${isCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}
          `}
          title={isCollapsed ? 'Sair do Sistema' : ''}
        >
          <span className="text-lg w-6 text-center flex-shrink-0">🚪</span>
          {!isCollapsed && (
            <span className="text-sm font-medium whitespace-nowrap">
              Sair do Sistema
            </span>
          )}
        </button>
        {!isCollapsed && (
          <div className={`text-center text-[10px] ${textVersion} mt-3`}>
            v1.0.4-stable
          </div>
        )}
      </div>
    </aside>
  );
}