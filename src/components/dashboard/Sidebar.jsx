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
    // Delay de 300ms antes de recolher (dá tempo de voltar o mouse)
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
      {/* ... resto do componente igual ao anterior ... */}
    </aside>
  );
}