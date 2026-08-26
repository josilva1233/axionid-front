import React from "react";

export default function SuccessModal({ isOpen, title, message, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-xs bg-slate-800 border border-slate-700/80 rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center space-y-4">
        {/* Ícone de Sucesso */}
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Textos */}
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white">{title || "Sucesso!"}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
        </div>

        {/* Botão de Ação */}
        <button
          onClick={onClose}
          className="w-full py-2 px-4 bg-[#4D6BFE] hover:bg-[#3D5AFE] active:bg-[#2E4BDB] text-white font-medium text-xs rounded-lg transition-all shadow-md shadow-blue-500/20"
        >
          Ir para o Login
        </button>
      </div>
    </div>
  );
}