import React, { useState, useEffect, useRef } from 'react';

const UserDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowDetails(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============ AVATAR ============
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  // ============ RENDER ============
  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Avatar Trigger */}
      <button
        className={`
          w-10 h-10 rounded-full
          bg-gradient-to-br from-blue-500 to-purple-600
          text-white text-base font-bold
          border-2 border-white/10
          hover:border-white/20 hover:-translate-y-0.5
          transition-all duration-300
          shadow-lg shadow-blue-500/20
          flex items-center justify-center
          uppercase
          ${isOpen || showDetails ? 'ring-2 ring-blue-500/50 ring-offset-2 ring-offset-slate-900' : ''}
        `}
        onClick={() => {
          if (showDetails) {
            setShowDetails(false);
          } else {
            setIsOpen(!isOpen);
          }
        }}
        type="button"
        title="Menu do Usuário"
        aria-expanded={isOpen || showDetails}
      >
        {getInitials(user?.name)}
      </button>

      {/* ============ MENU PRINCIPAL ============ */}
      {isOpen && !showDetails && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] z-[1050] min-w-[280px] max-w-[380px] bg-slate-800/95 border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden animate-[dropdownSlideIn_0.25s_cubic-bezier(0.4,0,0.2,1)_forwards] backdrop-blur-sm"
          role="menu"
          aria-label="Menu do usuário"
        >
          {/* Header */}
          <header className="px-6 py-4 bg-slate-800/50 border-b border-slate-700/50">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Sessão ativa:
            </span>
            <strong className="block text-sm font-bold text-white truncate mt-0.5">
              {user?.name || 'Usuário'}
            </strong>
            <span className="block text-xs text-slate-400 truncate mt-0.5">
              {user?.email || 'E-mail não informado'}
            </span>
          </header>

          <div className="h-px bg-slate-700/50"></div>

          {/* Body */}
          <nav className="p-2 space-y-0.5">
            <button
              type="button"
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all text-left"
              role="menuitem"
              onClick={() => setShowDetails(true)}
            >
              <span className="text-lg w-7 text-center flex-shrink-0" aria-hidden="true">
                👤
              </span>
              Meus Detalhes
            </button>

            <button
              type="button"
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-left border-t border-slate-700/50 mt-1 pt-3"
              role="menuitem"
              onClick={onLogout}
            >
              <span className="text-lg w-7 text-center flex-shrink-0" aria-hidden="true">
                🚪
              </span>
              Encerrar Sessão
            </button>
          </nav>
        </div>
      )}

      {/* ============ PAINEL DE DETALHES ============ */}
      {showDetails && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] z-[1050] min-w-[320px] max-w-[420px] bg-slate-800/95 border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden animate-[dropdownSlideIn_0.25s_cubic-bezier(0.4,0,0.2,1)_forwards] backdrop-blur-sm"
        >
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4 bg-slate-800/50 border-b border-slate-700/50">
            <h5 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🪪</span> Minha Identidade
            </h5>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide text-green-400 bg-green-500/10 border border-green-500/20">
              ✅ Verificada
            </span>
          </header>

          {/* Body */}
          <main className="p-6 max-h-[420px] overflow-y-auto custom-scrollbar space-y-4">
            {/* Dados da Conta */}
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Dados da Conta
              </p>
              <div className="space-y-3">
                <div>
                  <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                    Nome Completo
                  </span>
                  <span className="block text-sm font-medium text-white mt-0.5">
                    {user?.name || 'Não informado'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                    E-mail Cadastrado
                  </span>
                  <span className="block text-sm font-medium text-white mt-0.5">
                    {user?.email || 'Não informado'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                    Documento ID
                  </span>
                  <span className="block font-mono text-sm text-slate-300 mt-0.5">
                    {user?.cpf_cnpj || 'Não informado'}
                  </span>
                </div>
              </div>
            </section>

            <div className="h-px bg-slate-700/50"></div>

            {/* Endereço */}
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Endereço Registrado
              </p>
              {user?.address ? (
                <div className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                      Logradouro
                    </span>
                    <span className="block text-sm font-medium text-white mt-0.5">
                      {user.address.street}, {user.address.number}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                      Cidade / UF
                    </span>
                    <span className="block text-sm font-medium text-white mt-0.5">
                      {user.address.city} - {user.address.state}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-slate-500 bg-slate-800/30 border border-dashed border-slate-700/30 rounded-lg">
                  <span className="text-2xl mb-1">📍</span>
                  <span className="text-sm italic">Nenhum endereço vinculado à ID.</span>
                </div>
              )}
            </section>
          </main>

          {/* Footer */}
          <footer className="px-6 py-4 border-t border-slate-700/50 bg-slate-800/50">
            <button
              type="button"
              className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-600/50 transition-all"
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