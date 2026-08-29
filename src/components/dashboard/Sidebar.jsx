// components/dashboard/Sidebar.jsx
import { useState, useEffect, useRef } from 'react';
import { usePermissions } from '../hooks/usePermissions';

export default function Sidebar({ activeTab, setActiveTab, role, onLogout, onToggle }) {
  // 🔥 USAR O HOOK DE PERMISSÕES
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

  // Limpeza do timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // ============ HANDLERS ============
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

  // ============ NAVEGAÇÃO COM PERMISSÕES ============
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
    {
      id: 'audit',
      icon: '📜',
      label: 'Logs de Auditoria',
      section: 'Segurança',
      visible: canViewAudit,
    },
    {
      id: 'permissions',
      icon: '🛡️',
      label: 'Permissões',
      section: 'Segurança',
      visible: canViewPermissions,
    },
  ];

  // 🔥 FILTRAR ITENS POR PERMISSÃO
  const filteredNavItems = navItems.filter(item => item.visible);

  // Se não houver itens visíveis, mostrar mensagem
  if (filteredNavItems.length === 0) {
    return (
      <aside className="fixed left-0 top-0 h-screen w-[70px] z-[1000] bg-slate-900/95 border-r border-slate-700/50">
        <div className="flex items-center justify-center h-full">
          <span className="text-slate-500 text-xs text-center">Sem<br/>acesso</span>
        </div>
      </aside>
    );
  }

  // Agrupa por seção
  const groupedItems = filteredNavItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  // ============ RENDER ============
  return (
    <aside 
      className={`
        fixed left-0 top-0 h-screen z-[1000]
        bg-slate-900/95 backdrop-blur-sm
        border-r border-slate-700/50
        shadow-2xl
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        overflow-hidden
        flex flex-col
        ${isCollapsed ? 'w-[70px]' : 'w-[250px]'}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ============ BRAND ============ */}
      <div className="relative px-6 py-4 min-h-[70px] border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center">
          {!isCollapsed ? (
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Axion<span className="text-blue-500">ID</span>
              <small className="text-[10px] font-semibold uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                {isAdmin ? 'ADMIN' : 'USER'}
              </small>
            </h1>
          ) : (
            <span className="text-3xl font-bold text-blue-500">⚡</span>
          )}
        </div>

        {/* Toggle Button */}
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

      {/* ============ NAVEGAÇÃO ============ */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 custom-scrollbar">
        {Object.entries(groupedItems).map(([section, items]) => (
          <div key={section} className="mb-3">
            {/* Título da seção */}
            {!isCollapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-3 py-2">
                {section}
              </p>
            )}

            {/* Itens da seção */}
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
                    ? 'bg-blue-500/15 text-blue-400' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }
                `}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : ''}
              >
                {/* Ícone */}
                <span className="text-lg w-6 text-center flex-shrink-0">
                  {item.icon}
                </span>

                {/* Label */}
                {!isCollapsed && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}

                {/* Indicador de ativo */}
                {activeTab === item.id && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-blue-500 rounded-r"></span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* ============ FOOTER ============ */}
      <div className={`
        border-t border-slate-700/50
        ${isCollapsed ? 'px-2 py-3' : 'px-4 py-4'}
      `}>
        <button
          onClick={onLogout}
          className={`
            flex items-center gap-3
            w-full rounded-md
            transition-all duration-200
            text-red-400 hover:text-red-300
            hover:bg-red-500/10
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
          <div className="text-center text-[10px] text-slate-500 mt-3">
            v1.0.4-stable
          </div>
        )}
      </div>
    </aside>
  );
}