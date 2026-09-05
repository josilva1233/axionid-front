// components/dashboard/UserDropdown.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from "../../services/api";

const UserDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef(null);

  // Tema – preferência do banco
  const [isDark, setIsDark] = useState(() => {
    return user?.theme_preference ? user.theme_preference === 'dark' : true;
  });

  // Aplica o tema ao carregar
  useEffect(() => {
    if (user?.theme_preference) {
      const dark = user.theme_preference === 'dark';
      setIsDark(dark);
      document.documentElement.classList.toggle('dark', dark);
    }
  }, [user]);

  // Alterna o tema e salva no banco
  const toggleTheme = async () => {
    const newIsDark = !isDark;
    const newTheme = newIsDark ? 'dark' : 'light';

    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);

    try {
      await api.put('/api/v1/theme', { theme: newTheme });
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
      setIsDark(!newIsDark);
      document.documentElement.classList.toggle('dark', !newIsDark);
    }
  };

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowDetails(false);
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  // ============ CLASSES DE TEMA ============
  const textDropdown = isDark ? 'text-slate-200' : 'text-gray-800';
  const textDropdownDim = isDark ? 'text-slate-400' : 'text-gray-500';
  const textDropdownMuted = isDark ? 'text-slate-500' : 'text-gray-400';
  const bgDropdown = isDark ? 'bg-slate-800/95 border-slate-700/50' : 'bg-white/95 border-gray-200';
  const bgDropdownHeader = isDark ? 'bg-slate-800/80' : 'bg-gray-50/80';
  const bgDropdownHover = isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-100';
  const borderDropdown = isDark ? 'border-slate-700/50' : 'border-gray-200';
  const bgDropdownAddress = isDark ? 'bg-slate-800/30' : 'bg-gray-100/50';

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Avatar */}
      <button
        className={`
          w-9 h-9 sm:w-10 sm:h-10 rounded-full
          bg-gradient-to-br from-blue-500 to-purple-600
          text-white text-sm sm:text-base font-bold
          border-2 border-white/10
          hover:border-white/20 hover:-translate-y-0.5
          transition-all duration-300
          shadow-lg shadow-blue-500/20
          flex items-center justify-center uppercase
          ${isOpen || showDetails || showSettings ? 'ring-2 ring-blue-500/50 ring-offset-2 ring-offset-slate-900' : ''}
        `}
        onClick={() => {
          if (showDetails || showSettings) {
            setShowDetails(false);
            setShowSettings(false);
          } else {
            setIsOpen(!isOpen);
          }
        }}
        type="button"
        aria-expanded={isOpen || showDetails || showSettings}
      >
        {getInitials(user?.name)}
      </button>

      {/* ============ MENU PRINCIPAL ============ */}
      {isOpen && !showDetails && !showSettings && (
        <div
          className={`
            absolute right-0 top-[calc(100%+8px)] z-[1050] 
            w-[calc(100vw-2rem)] sm:w-auto min-w-[260px] sm:min-w-[280px] max-w-[90vw] sm:max-w-[380px]
            ${bgDropdown} border ${borderDropdown} rounded-xl shadow-2xl 
            overflow-hidden backdrop-blur-sm
            animate-[dropdownSlideIn_0.25s_cubic-bezier(0.4,0,0.2,1)_forwards]
          `}
          role="menu"
        >
          <header className={`px-4 sm:px-6 py-4 ${bgDropdownHeader} border-b ${borderDropdown}`}>
            <span className={`block text-[10px] font-semibold uppercase tracking-wider ${textDropdownMuted}`}>
              Sessão ativa:
            </span>
            <strong className={`block text-sm font-bold ${textDropdown} truncate mt-0.5`}>
              {user?.name || 'Usuário'}
            </strong>
            <span className={`block text-xs ${textDropdownDim} truncate mt-0.5`}>
              {user?.email || 'E-mail não informado'}
            </span>
          </header>

          <nav className="p-2 space-y-0.5">
            <button
              type="button"
              className={`
                flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium 
                ${textDropdown} ${bgDropdownHover} transition-all text-left
              `}
              onClick={() => setShowDetails(true)}
            >
              <span className="text-lg w-7 text-center">👤</span>
              Meus Detalhes
            </button>

            <button
              type="button"
              className={`
                flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium 
                ${textDropdown} ${bgDropdownHover} transition-all text-left
              `}
              onClick={() => setShowSettings(true)}
            >
              <span className="text-lg w-7 text-center">⚙️</span>
              Configurações
            </button>

            <button
              type="button"
              className={`
                flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium 
                text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-left 
                border-t ${borderDropdown} mt-1 pt-3
              `}
              onClick={onLogout}
            >
              <span className="text-lg w-7 text-center">🚪</span>
              Encerrar Sessão
            </button>
          </nav>
        </div>
      )}

      {/* ============ PAINEL DE CONFIGURAÇÕES ============ */}
      {showSettings && (
        <div
          className={`
            absolute right-0 top-[calc(100%+8px)] z-[1050] 
            w-[calc(100vw-2rem)] sm:w-auto min-w-[260px] sm:min-w-[280px] max-w-[90vw] sm:max-w-[380px]
            ${bgDropdown} border ${borderDropdown} rounded-xl shadow-2xl 
            overflow-hidden backdrop-blur-sm
            animate-[dropdownSlideIn_0.25s_cubic-bezier(0.4,0,0.2,1)_forwards]
          `}
        >
          <header className={`flex items-center justify-between px-4 sm:px-6 py-4 ${bgDropdownHeader} border-b ${borderDropdown}`}>
            <h5 className={`text-sm font-bold ${textDropdown} flex items-center gap-2`}>
              <span>⚙️</span> Configurações
            </h5>
            <button
              className={`${textDropdownDim} hover:${textDropdown} transition-colors text-xl`}
              onClick={() => setShowSettings(false)}
            >
              ✕
            </button>
          </header>

          <main className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${textDropdown}`}>Tema</p>
                <p className={`text-xs ${textDropdownDim}`}>
                  {isDark ? 'Escuro (atual)' : 'Claro (atual)'}
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className={`
                  relative w-14 h-8 rounded-full transition-colors duration-300 flex-shrink-0
                  ${isDark ? 'bg-blue-600' : 'bg-slate-600'}
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50
                `}
                role="switch"
                aria-checked={isDark}
              >
                <span
                  className={`
                    absolute top-1 left-1 w-6 h-6 bg-white rounded-full 
                    transition-transform duration-300 shadow-md
                    ${isDark ? 'translate-x-6' : 'translate-x-0'}
                  `}
                />
                <span className="sr-only">
                  {isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
                </span>
              </button>
            </div>
          </main>

          <footer className={`px-4 sm:px-6 py-4 border-t ${borderDropdown} ${bgDropdownHeader}`}>
            <button
              type="button"
              className={`
                w-full px-4 py-2.5 rounded-lg text-sm font-medium 
                ${textDropdown} ${bgDropdownHover} transition-all
              `}
              onClick={() => setShowSettings(false)}
            >
              ↩️ Voltar ao Menu
            </button>
          </footer>
        </div>
      )}

      {/* ============ PAINEL DE DETALHES ============ */}
      {showDetails && (
        <div
          className={`
            absolute right-0 top-[calc(100%+8px)] z-[1050] 
            w-[calc(100vw-2rem)] sm:w-auto min-w-[280px] sm:min-w-[320px] max-w-[90vw] sm:max-w-[420px]
            ${bgDropdown} border ${borderDropdown} rounded-xl shadow-2xl 
            overflow-hidden backdrop-blur-sm
            animate-[dropdownSlideIn_0.25s_cubic-bezier(0.4,0,0.2,1)_forwards]
          `}
        >
          <header className={`flex items-center justify-between px-4 sm:px-6 py-4 ${bgDropdownHeader} border-b ${borderDropdown}`}>
            <h5 className={`text-sm font-bold ${textDropdown} flex items-center gap-2`}>
              <span>🪪</span> Minha Identidade
            </h5>
            <span className={`
              inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] 
              font-semibold uppercase tracking-wide text-green-400 
              bg-green-500/10 border border-green-500/20
            `}>
              ✅ Verificada
            </span>
          </header>

          <main className="p-4 sm:p-6 max-h-[420px] overflow-y-auto custom-scrollbar space-y-4">
            <section>
              <p className={`text-[10px] font-semibold uppercase tracking-wider ${textDropdownDim} mb-2`}>
                Dados da Conta
              </p>
              <div className="space-y-3">
                <div>
                  <span className={`block text-[10px] font-medium ${textDropdownMuted} uppercase tracking-wide`}>
                    Nome Completo
                  </span>
                  <span className={`block text-sm font-medium ${textDropdown} mt-0.5 break-words`}>
                    {user?.name || 'Não informado'}
                  </span>
                </div>
                <div>
                  <span className={`block text-[10px] font-medium ${textDropdownMuted} uppercase tracking-wide`}>
                    E-mail Cadastrado
                  </span>
                  <span className={`block text-sm font-medium ${textDropdown} mt-0.5 break-all`}>
                    {user?.email || 'Não informado'}
                  </span>
                </div>
                <div>
                  <span className={`block text-[10px] font-medium ${textDropdownMuted} uppercase tracking-wide`}>
                    Documento ID
                  </span>
                  <span className={`block font-mono text-sm ${textDropdown} mt-0.5 break-all`}>
                    {user?.cpf_cnpj || 'Não informado'}
                  </span>
                </div>
              </div>
            </section>
            <div className={`h-px ${borderDropdown}`}></div>
            <section>
              <p className={`text-[10px] font-semibold uppercase tracking-wider ${textDropdownDim} mb-2`}>
                Endereço Registrado
              </p>
              {user?.address ? (
                <div className={`${bgDropdownAddress} border ${borderDropdown}/50 rounded-lg p-4 space-y-3`}>
                  <div>
                    <span className={`block text-[10px] font-medium ${textDropdownMuted} uppercase tracking-wide`}>
                      Logradouro
                    </span>
                    <span className={`block text-sm font-medium ${textDropdown} mt-0.5 break-words`}>
                      {user.address.street}, {user.address.number}
                    </span>
                  </div>
                  <div>
                    <span className={`block text-[10px] font-medium ${textDropdownMuted} uppercase tracking-wide`}>
                      Cidade / UF
                    </span>
                    <span className={`block text-sm font-medium ${textDropdown} mt-0.5`}>
                      {user.address.city} - {user.address.state}
                    </span>
                  </div>
                </div>
              ) : (
                <div className={`
                  flex flex-col items-center justify-center py-6 ${textDropdownDim} 
                  ${bgDropdownAddress} border border-dashed ${borderDropdown}/50 rounded-lg
                `}>
                  <span className="text-2xl mb-1">📍</span>
                  <span className="text-sm italic">Nenhum endereço vinculado à ID.</span>
                </div>
              )}
            </section>
          </main>

          <footer className={`px-4 sm:px-6 py-4 border-t ${borderDropdown} ${bgDropdownHeader}`}>
            <button
              type="button"
              className={`
                w-full px-4 py-2.5 rounded-lg text-sm font-medium 
                ${textDropdown} ${bgDropdownHover} transition-all
              `}
              onClick={() => setShowDetails(false)}
            >
              ↩️ Voltar ao Menu
            </button>
          </footer>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;