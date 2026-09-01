// components/dashboard/UserDropdown.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const UserDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const dropdownRef = useRef(null);

  // 🔥 Tema – inicializado com a preferência do banco ou dark
  const [isDark, setIsDark] = useState(() => {
    return user?.theme_preference ? user.theme_preference === 'dark' : true;
  });

  // 🔥 Aplica o tema ao carregar o componente
  useEffect(() => {
    if (user?.theme_preference) {
      const dark = user.theme_preference === 'dark';
      setIsDark(dark);
      document.documentElement.classList.toggle('dark', dark);
    }
  }, [user]);

  // 🔥 Alterna o tema e salva no banco via API
  const toggleTheme = async () => {
    const newIsDark = !isDark;
    const newTheme = newIsDark ? 'dark' : 'light';

    // Atualiza UI imediatamente
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);

    try {
      await api.put('/theme', { theme: newTheme });
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
      // Reverte em caso de erro
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
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Avatar */}
      <button
        className={`
          w-10 h-10 rounded-full
          bg-gradient-to-br from-blue-500 to-purple-600
          text-white text-base font-bold
          border-2 border-white/10
          hover:border-white/20 hover:-translate-y-0.5
          transition-all duration-300
          shadow-lg shadow-blue-500/20
          flex items-center justify-center uppercase
          ${isOpen || showDetails ? 'ring-2 ring-blue-500/50 ring-offset-2 ring-offset-slate-900' : ''}
        `}
        onClick={() => {
          if (showDetails) setShowDetails(false);
          else setIsOpen(!isOpen);
        }}
        type="button"
        aria-expanded={isOpen || showDetails}
      >
        {getInitials(user?.name)}
      </button>

      {/* Menu Principal */}
      {isOpen && !showDetails && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] z-[1050] min-w-[280px] max-w-[380px] 
                     bg-dropdown border border-dropdown-border rounded-xl shadow-2xl 
                     overflow-hidden backdrop-blur-sm
                     animate-[dropdownSlideIn_0.25s_cubic-bezier(0.4,0,0.2,1)_forwards]"
          role="menu"
        >
          <header className="px-6 py-4 bg-dropdown-header border-b border-dropdown-border">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-dropdown-muted">
              Sessão ativa:
            </span>
            <strong className="block text-sm font-bold text-dropdown-text truncate mt-0.5">
              {user?.name || 'Usuário'}
            </strong>
            <span className="block text-xs text-dropdown-dim truncate mt-0.5">
              {user?.email || 'E-mail não informado'}
            </span>
          </header>

          <nav className="p-2 space-y-0.5">
            <button
              type="button"
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium 
                         text-dropdown-text hover:text-dropdown-hover hover:bg-dropdown-hover-bg 
                         transition-all text-left"
              onClick={() => setShowDetails(true)}
            >
              <span className="text-lg w-7 text-center">👤</span>
              Meus Detalhes
            </button>

            {/* Configurações com toggle de tema */}
            <button
              type="button"
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium 
                         text-dropdown-text hover:text-dropdown-hover hover:bg-dropdown-hover-bg 
                         transition-all text-left"
              onClick={toggleTheme}
            >
              <span className="text-lg w-7 text-center">⚙️</span>
              <span className="flex-1">Configurações</span>
              <span className="text-xs bg-dropdown-badge px-2 py-0.5 rounded-full text-dropdown-dim">
                {isDark ? '🌙 Escuro' : '☀️ Claro'}
              </span>
            </button>

            <button
              type="button"
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium 
                         text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-left 
                         border-t border-dropdown-border mt-1 pt-3"
              onClick={onLogout}
            >
              <span className="text-lg w-7 text-center">🚪</span>
              Encerrar Sessão
            </button>
          </nav>
        </div>
      )}

      {/* Painel de Detalhes (inalterado) */}
      {showDetails && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[1050] min-w-[320px] max-w-[420px] 
                        bg-dropdown border border-dropdown-border rounded-xl shadow-2xl 
                        overflow-hidden backdrop-blur-sm">
          {/* ... conteúdo igual ao original ... */}
          <header className="flex items-center justify-between px-6 py-4 bg-dropdown-header border-b border-dropdown-border">
            <h5 className="text-sm font-bold text-dropdown-text flex items-center gap-2">
              <span>🪪</span> Minha Identidade
            </h5>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] 
                             font-semibold uppercase tracking-wide text-green-400 
                             bg-green-500/10 border border-green-500/20">
              ✅ Verificada
            </span>
          </header>
          <main className="p-6 max-h-[420px] overflow-y-auto custom-scrollbar space-y-4">
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-dropdown-dim mb-2">
                Dados da Conta
              </p>
              <div className="space-y-3">
                <div>
                  <span className="block text-[10px] font-medium text-dropdown-muted uppercase tracking-wide">
                    Nome Completo
                  </span>
                  <span className="block text-sm font-medium text-dropdown-text mt-0.5">
                    {user?.name || 'Não informado'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-medium text-dropdown-muted uppercase tracking-wide">
                    E-mail Cadastrado
                  </span>
                  <span className="block text-sm font-medium text-dropdown-text mt-0.5">
                    {user?.email || 'Não informado'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-medium text-dropdown-muted uppercase tracking-wide">
                    Documento ID
                  </span>
                  <span className="block font-mono text-sm text-dropdown-text mt-0.5">
                    {user?.cpf_cnpj || 'Não informado'}
                  </span>
                </div>
              </div>
            </section>
            <div className="h-px bg-dropdown-border"></div>
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-dropdown-dim mb-2">
                Endereço Registrado
              </p>
              {user?.address ? (
                <div className="bg-dropdown-address-bg border border-dropdown-border/50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="block text-[10px] font-medium text-dropdown-muted uppercase tracking-wide">
                      Logradouro
                    </span>
                    <span className="block text-sm font-medium text-dropdown-text mt-0.5">
                      {user.address.street}, {user.address.number}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-medium text-dropdown-muted uppercase tracking-wide">
                      Cidade / UF
                    </span>
                    <span className="block text-sm font-medium text-dropdown-text mt-0.5">
                      {user.address.city} - {user.address.state}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-dropdown-dim 
                                bg-dropdown-address-bg border border-dashed border-dropdown-border/50 rounded-lg">
                  <span className="text-2xl mb-1">📍</span>
                  <span className="text-sm italic">Nenhum endereço vinculado à ID.</span>
                </div>
              )}
            </section>
          </main>
          <footer className="px-6 py-4 border-t border-dropdown-border bg-dropdown-header">
            <button
              type="button"
              className="w-full px-4 py-2.5 rounded-lg text-sm font-medium 
                         text-dropdown-text hover:text-dropdown-hover 
                         bg-dropdown-hover-bg hover:bg-dropdown-hover-bg/80 transition-all"
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