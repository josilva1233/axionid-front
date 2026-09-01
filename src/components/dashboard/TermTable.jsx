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
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-6 h-6 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"
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
      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
        <span className="text-5xl mb-4 opacity-60">📭</span>

        <p className="text-sm">
          Nenhum termo cadastrado.
        </p>

        <p className="text-xs text-slate-600 mt-1">
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
    <div className="overflow-x-auto rounded-xl bg-slate-800/50 border border-slate-700/50 transition-colors hover:border-blue-500/30">
      <table className="w-full min-w-[800px] table-fixed">
        <thead className="bg-slate-800/80 sticky top-0 z-10">
          <tr>
            <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[150px]">
              Versão
            </th>

            <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[120px]">
              Status
            </th>

            <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap hidden md:table-cell">
              Criado por
            </th>

            <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap hidden lg:table-cell w-[130px]">
              Data
            </th>

            <th className="px-[18px] py-4 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[130px]">
              Usuários
            </th>

            <th className="px-[18px] py-4 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[100px]">
              Ações
            </th>
          </tr>
        </thead>

        <tbody>
          {terms.map((term) => {
            const acceptanceCount =
              acceptanceCounts?.[term.id] || 0;

            const isDropdownOpen =
              openDropdown === term.id;

            return (
              <tr
                key={term.id}
                className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-all"
              >
                {/* ==================================================
                    VERSÃO
                ================================================== */}
                <td className="px-[18px] py-3.5 align-middle">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-sm font-medium ${
                        term.is_active
                          ? "text-blue-400"
                          : "text-slate-300"
                      }`}
                    >
                      v{term.version}
                    </span>

                    {term.is_active && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-green-500/20 text-green-400 rounded-full">
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
                      term.is_active
                        ? "bg-green-500/20 text-green-400"
                        : "bg-slate-700/50 text-slate-400"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        term.is_active
                          ? "bg-green-400 animate-pulse"
                          : "bg-slate-400"
                      }`}
                    ></span>

                    {term.is_active
                      ? "Ativo"
                      : "Inativo"}
                  </span>
                </td>

                {/* ==================================================
                    CRIADO POR
                ================================================== */}
                <td className="px-[18px] py-3.5 align-middle text-slate-300 hidden md:table-cell">
                  {term.creator?.name || "—"}
                </td>

                {/* ==================================================
                    DATA
                ================================================== */}
                <td className="px-[18px] py-3.5 align-middle text-slate-400 hidden lg:table-cell">
                  {formatDate(term.created_at)}
                </td>

                {/* ==================================================
                    USUÁRIOS
                ================================================== */}
                <td className="px-[18px] py-3.5 align-middle text-center">
                  <button
                    onClick={() =>
                      handleAction(onViewUsers, term.id)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-lg transition-all"
                  >
                    <span>{acceptanceCount}</span>

                    <span>
                      usuário
                      {acceptanceCount !== 1 ? "s" : ""}
                    </span>
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
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-all ${
                        isDropdownOpen
                          ? "bg-slate-700/50 text-slate-200"
                          : ""
                      }`}
                      onClick={() =>
                        handleToggleDropdown(term.id)
                      }
                      aria-label="Ações do termo"
                      aria-expanded={isDropdownOpen}
                    >
                      <span className="text-xl leading-none">
                        ⋯
                      </span>
                    </button>

                    {/* ==================================================
                        DROPDOWN
                    ================================================== */}
                    {isDropdownOpen && (
                      <div
                        className="absolute right-0 mt-1 w-52 bg-slate-800/95 border border-slate-700/50 rounded-lg shadow-xl z-50 overflow-hidden"
                      >
                        {/* VER USUÁRIOS */}
                        <button
                          type="button"
                          onClick={() =>
                            handleAction(
                              onViewUsers,
                              term.id
                            )
                          }
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 transition-all text-left"
                        >
                          👥 Ver usuários
                        </button>

                        {/* SEPARADOR */}
                        <div className="h-px bg-slate-700/50"></div>

                        {/* ATIVAR / DESATIVAR */}
                        <button
                          type="button"
                          onClick={() =>
                            handleAction(
                              onToggleStatus,
                              term
                            )
                          }
                          className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-all text-left ${
                            term.is_active
                              ? "text-yellow-400 hover:bg-yellow-500/10"
                              : "text-green-400 hover:bg-green-500/10"
                          }`}
                        >
                          {term.is_active
                            ? "⏸️ Desativar"
                            : "▶️ Ativar"}
                        </button>

                        {/* EDITAR */}
                        <button
                          type="button"
                          onClick={() =>
                            handleAction(
                              onEdit,
                              term
                            )
                          }
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 transition-all text-left"
                        >
                          ✏️ Editar termo
                        </button>

                        {/* SEPARADOR */}
                        <div className="h-px bg-slate-700/50"></div>

                        {/* EXCLUIR */}
                        <button
                          type="button"
                          onClick={() =>
                            handleAction(
                              onDelete,
                              term.id
                            )
                          }
                          disabled={acceptanceCount > 0}
                          className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left transition-all ${
                            acceptanceCount > 0
                              ? "text-red-400 hover:bg-red-500/10"
                              : "text-slate-500 cursor-not-allowed"
                          }`}
                          title={
                            acceptanceCount === 0
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
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 justify-end">
                      <span>⚠️</span>
                      <span>
                        {acceptanceCount} aceitaram
                      </span>
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