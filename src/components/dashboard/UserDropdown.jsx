import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const UserDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fecha o menu se clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="user-menu-wrapper" ref={dropdownRef}>
      {/* Avatar Circular (Apenas a Letra) */}
      <button 
        className="nav-avatar-circle" 
        onClick={toggleMenu}
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
      </button>

      {/* Menu Flutuante */}
      {isOpen && (
        <ul className="custom-dropdown-menu shadow animate-in-fade">
          <li className="user-info-header">
            <span className="label-dim">Logado como:</span>
            <span className="user-name-text">{user?.name}</span>
            <span className="user-email-text">{user?.email}</span>
          </li>
          
          <li className="dropdown-divider"></li>
          
          <li>
            <button className="dropdown-item-custom" onClick={() => { navigate('/perfil'); setIsOpen(false); }}>
              <i className="bi bi-person me-2"></i> Meus Detalhes
            </button>
          </li>
          
          <li>
            <button className="dropdown-item-custom logout-red" onClick={onLogout}>
              <i className="bi bi-box-arrow-right me-2"></i> Sair
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default UserDropdown;