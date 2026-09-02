// src/components/dashboard/TermTable.jsx
import React, { useState, useRef, useEffect } from "react";

export default function TermTable({
  terms,
  acceptanceCounts,
  onViewUsers,
  onToggleStatus,
  onEdit,
  onDelete,
  loading = false,
  isDark = false, // 🔥 NOVA PROP
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  // ============================================================
  // FECHAR DROPDOWN AO CLICAR FORA
  // ============================================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown === null) return;

      const ref = dropdownRefs.current[openDropdown];

      if (ref && !ref.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  // ============================================================
  // TOGGLE DROPDOWN
  // ============================================================
  const handleToggleDropdown = (termId) => {
    setOpenDropdown((current) =>
      current === termId ? null : termId
    );
  };

  // ============================================================
  // AÇÃO + FECHAR MENU
  // ============================================================
  const handleAction = (callback, ...args) => {
    setOpenDropdown(null);

    if (callback) {
      callback(...args);
    }
  };

  // ============================================================
  // CLASSES DE TEMA
  // ============================================================
  const bgTable = isDark 
    ? 'bg-slate-800/50 border-slate-700/50' 
    : 'bg-white/80 border-gray-200';
  const bgHeader = isDark 
    ? 'bg-slate-800/80' 
    : 'bg-gray-100/80';
  const textHeader = isDark 
    ? 'text-slate-400 border-slate-700/50' 
    : 'text-gray-500 border-gray-200';
  const borderRow = isDark 
    ? 'border-slate-700/30 hover:bg-slate-800/30' 
    : 'border-gray-100 hover:bg-gray-50';
  const textVersion = isDark 
    ? 'text-blue-400' 
    : 'text-blue-700';
  const textVersionInactive = isDark 
    ? 'text-slate-300' 
    : 'text-gray-600';
  const badgeActive = isDark 
    ? 'bg-green-500/20 text-green-400' 
    : 'bg-green-100 text-green-700';
  const badgeInactive = isDark 
    ? 'bg-slate-700/50 text-slate-400' 
    : 'bg-gray-200 text-gray-500';
  const textCreator = isDark 
    ? 'text-slate-300' 
    : 'text-gray-700';
  const textDate = isDark 
    ? 'text-slate-400' 
    : 'text-gray-500';
  const btnUsers = isDark 
    ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400' 
    : 'bg-blue-50 hover:bg-blue-100 text-blue-700';
  const btnMore = isDark 
    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50' 
    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100';
  const dropdownBg = isDark 
    ? 'bg-slate-800/95 border-slate-700/50' 
    : 'bg-white/95 border-gray-200';
  const dropdownText = isDark 
    ? 'text-slate-300 hover:bg-slate-700/50' 
    : 'text-gray-700 hover:bg-gray-100';
  const dropdownSeparator = isDark 
    ? 'bg-slate-700/50' 
    : 'bg-gray-200';
  const textEmpty = isDark 
    ? 'text-slate-500' 
    : 'text-gray-500';
  const textEmptySub = isDark 
    ? 'text-slate-600' 
    : 'text-gray-400';

  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="relative">
          <div className={`w-12 h-12 border-4 ${isDark ? 'border-blue-500/20 border-t-blue-500' : 'border-blue-300/20 border-t-blue-600'} rounded-full animate-spin`}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-6 h-6 border-4 ${isDark ? 'border-blue-400/30 border-t-blue-400' : 'border-blue-500/30 border-t-blue-500'} rounded-full animate-spin`}
              style={{ animationDelay: "150ms" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // SEM TERMOS
  // ============================================================
  if (!terms || terms.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${textEmpty}`}>
        <span className="text-5xl mb-4 opacity-60">📭</span>
        <p className="text-sm">Nenhum termo cadastrado.</p>
        <p className={`text-xs mt-1 ${textEmptySub}`}>
          Clique em "Novo Termo" para criar o primeiro.
        </p>
      </div>
    );
  }

  // ============================================================
  // FORMATAR DATA
  // ============================================================
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className={`overflow-x-auto rounded-xl border transition-colors hover:border-blue-500/30 ${bgTable}`}>
      <table className="w-full min-w-[800px] table-fixed">
        <thead className={`sticky top-0 z-10 ${bgHeader}`}>
          <tr>
            <th className={`px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[150px] ${textHeader}`}>
              Versão
            </th>
            <th className={`px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[120px] ${textHeader}`}>
              Status
            </th>
            <th className={`px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap hidden md:table-cell ${textHeader}`}>
              Criado por
            </th>
            <th className={`px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap hidden lg:table-cell w-[130px] ${textHeader}`}>
              Data
            </th>
            <th className={`px-[18px] py-4 text-center text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[130px] ${textHeader}`}>
              Usuários
            </th>
            <th className={`px-[18px] py-4 text-right text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[100px] ${textHeader}`}>
              Ações
            </th>
          </tr>
        </thead>

        <tbody>
          {terms.map((term) => {
            const acceptanceCount = acceptanceCounts?.[term.id] || 0;
            const isDropdownOpen = openDropdown === term.id;

            return (
              <tr
                key={term.id}
                className={`border-b transition-all ${borderRow}`}
              >
                {/* ==================================================
                    VERSÃO
                ================================================== */}
                <td className="px-[18px] py-3.5 align-middle">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-sm font-medium ${
                        term.is_active
                          ? textVersion
                          : textVersionInactive
                      }`}
                    >
                      v{term.version}
                    </span>

                    {term.is_active && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${badgeActive}`}>
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        Ativo
                      </span>
                    )}
                  </div>
                </td>

                {/* ==================================================
                    STATUS
                ================================================== */}
                <td className="px-[18px] py-3.5 align-middle">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      term.is_active ? badgeActive : badgeInactive
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        term.is_active
                          ? "bg-green-400 animate-pulse"
                          : isDark ? "bg-slate-400" : "bg-gray-400"
                      }`}
                    ></span>
                    {term.is_active ? "Ativo" : "Inativo"}
                  </span>
                </td>

                {/* ==================================================
                    CRIADO POR
                ================================================== */}
                <td className={`px-[18px] py-3.5 align-middle ${textCreator} hidden md:table-cell`}>
                  {term.creator?.name || "—"}
                </td>

                {/* ==================================================
                    DATA
                ================================================== */}
                <td className={`px-[18px] py-3.5 align-middle ${textDate} hidden lg:table-cell`}>
                  {formatDate(term.created_at)}
                </td>

                {/* ==================================================
                    USUÁRIOS
                ================================================== */}
                <td className="px-[18px] py-3.5 align-middle text-center">
                  <button
                    onClick={() => handleAction(onViewUsers, term.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${btnUsers}`}
                  >
                    <span>{acceptanceCount}</span>
                    <span>usuário{acceptanceCount !== 1 ? "s" : ""}</span>
                  </button>
                </td>

                {/* ==================================================
                    AÇÕES
                ================================================== */}
                <td className="px-[18px] py-3.5 align-middle text-right">
                  <div
                    className="relative inline-block"
                    ref={(el) => {
                      dropdownRefs.current[term.id] = el;
                    }}
                  >
                    {/* BOTÃO ⋯ */}
                    <button
                      type="button"
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-md transition-all ${
                        isDropdownOpen
                          ? isDark 
                            ? "bg-slate-700/50 text-slate-200" 
                            : "bg-gray-200 text-gray-700"
                          : btnMore
                      }`}
                      onClick={() => handleToggleDropdown(term.id)}
                      aria-label="Ações do termo"
                      aria-expanded={isDropdownOpen}
                    >
                      <span className="text-xl leading-none">⋯</span>
                    </button>

                    {/* ==================================================
                        DROPDOWN
                    ================================================== */}
                    {isDropdownOpen && (
                      <div
                        className={`absolute right-0 mt-1 w-52 border rounded-lg shadow-xl z-50 overflow-hidden ${dropdownBg}`}
                      >
                        {/* VER USUÁRIOS */}
                        <button
                          type="button"
                          onClick={() => handleAction(onViewUsers, term.id)}
                          className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-all text-left ${dropdownText}`}
                        >
                          👥 Ver usuários
                        </button>

                        {/* SEPARADOR */}
                        <div className={`h-px ${dropdownSeparator}`}></div>

                        {/* ATIVAR / DESATIVAR */}
                        <button
                          type="button"
                          onClick={() => handleAction(onToggleStatus, term)}
                          className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-all text-left ${
                            term.is_active
                              ? isDark
                                ? "text-yellow-400 hover:bg-yellow-500/10"
                                : "text-yellow-600 hover:bg-yellow-50"
                              : isDark
                                ? "text-green-400 hover:bg-green-500/10"
                                : "text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {term.is_active ? "⏸️ Desativar" : "▶️ Ativar"}
                        </button>

                        {/* EDITAR */}
                        <button
                          type="button"
                          onClick={() => handleAction(onEdit, term)}
                          className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-all text-left ${dropdownText}`}
                        >
                          ✏️ Editar termo
                        </button>

                        {/* SEPARADOR */}
                        <div className={`h-px ${dropdownSeparator}`}></div>

                        {/* EXCLUIR */}
                        <button
                          type="button"
                          onClick={() => handleAction(onDelete, term.id)}
                          disabled={acceptanceCount > 0}
                          className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left transition-all ${
                            acceptanceCount > 0
                              ? isDark
                                ? "text-red-400 hover:bg-red-500/10"
                                : "text-red-600 hover:bg-red-50"
                              : isDark
                                ? "text-slate-500 cursor-not-allowed"
                                : "text-gray-400 cursor-not-allowed"
                          }`}
                          title={
                            acceptanceCount > 0
                              ? "Não é possível excluir um termo que já foi aceito"
                              : "Excluir termo"
                          }
                        >
                          🗑️ Excluir termo
                        </button>
                      </div>
                    )}
                  </div>

                  {/* AVISO DE ACEITES */}
                  {acceptanceCount > 0 && (
                    <div className={`text-[10px] mt-1 flex items-center gap-1 justify-end ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                      <span>⚠️</span>
                      <span>{acceptanceCount} aceitaram</span>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}