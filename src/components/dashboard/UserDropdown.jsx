import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const UserDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fecha o menu ao clicar fora delete
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="user-dropdown-container" ref={dropdownRef}>
      <button 
        className="avatar-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {user?.name?.charAt(0).toUpperCase() || 'U'}
      </button>

      {isOpen && (
        <ul className="dropdown-floating-menu">
          <li className="menu-header">
            <span className="info-label">Logado como:</span>
            <span className="info-name">{user?.name}</span>
            <span className="info-email">{user?.email}</span>
          </li>
          <li className="menu-divider"></li>
          <li>
            <button className="menu-item" onClick={() => navigate('/perfil')}>
              <i className="bi bi-person"></i> Meus Detalhes
            </button>
          </li>
          <li>
            <button className="menu-item logout-action" onClick={onLogout}>
              <i className="bi bi-box-arrow-right"></i> Sair
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default UserDropdown;