// src/components/dashboard/TermManagement.jsx (ou DashboardManagement.jsx)
import React, { useState, useEffect } from "react";
import DashboardFilters from "../components/dashboard/DashboardFilters";
import TermTable from "./TermTable"; 
// Importe outras tabelas se necessário para as outras abas:
// import UserTable from "./UserTable";
// import GroupTable from "./GroupTable";

export default function TermManagement({ role = "admin" }) {
  // Estado para controlar qual aba está ativa ("terms", "users", "groups", etc.)
  const [activeTab, setActiveTab] = useState("terms");

  // Estados de dados gerais
  const [terms, setTerms] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [acceptanceCounts, setAcceptanceCounts] = useState({});

  // Estados de visualização detalhada (ex: detalhe de um usuário)
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditingUser, setIsEditingUser] = useState(false);

  // Estado unificado de filtros para todas as abas
  const [filters, setFilters] = useState({
    // Filtros de Terms
    version: "",
    status: "",
    creator: "",
    // Filtros de Users
    name: "",
    completed: "",
    // Filtros de Groups
    // (adicionais se houver)
  });

  // Carregamento inicial de dados (Simulado/Integrável com sua API)
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Substitua pelas chamadas reais da sua API
      // const termsRes = await api.get('/terms');
      // setTerms(termsRes.data);

      // Dados de exemplo para teste imediato
      setTerms([
        { id: 1, version: "1.0.0", is_active: true, creator: { name: "Administrador" } },
        { id: 2, version: "1.1.0", is_active: false, creator: { name: "João Silva" } },
      ]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Manipulador genérico de mudança de filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Botão Limpar Filtros (Limpa apenas o contexto da aba ativa ou todos)
  const handleClearFilters = () => {
    setFilters({
      version: "",
      status: "",
      creator: "",
      name: "",
      completed: "",
    });
  };

  // ==========================================
  // LÓGICA DE FILTRAGEM POR ABA
  // ==========================================

  // 1. Filtro para a aba de Termos
  const filteredTerms = terms.filter((term) => {
    const matchesVersion = filters.version
      ? term.version?.toLowerCase().includes(filters.version.toLowerCase())
      : true;

    let matchesStatus = true;
    if (filters.status === "active") {
      matchesStatus = term.is_active === true || term.is_active === 1;
    } else if (filters.status === "inactive") {
      matchesStatus = term.is_active === false || term.is_active === 0;
    }

    let matchesCreator = true;
    if (filters.creator) {
      const creatorName =
        typeof term.creator === "object"
          ? term.creator?.name || ""
          : String(term.creator || "");
      matchesCreator = creatorName.toLowerCase().includes(filters.creator.toLowerCase());
    }

    return matchesVersion && matchesStatus && matchesCreator;
  });

  // ==========================================
  // FUNÇÕES DE AÇÃO (Callbacks)
  // ==========================================
  const handleViewUsers = (term) => {
    console.log("Visualizar usuários do termo:", term);
  };

  const handleToggleStatus = async (termId) => {
    console.log("Alternar status do termo ID:", termId);
    // Exemplo de atualização otimista ou re-fetch
    setTerms(prev => prev.map(t => t.id === termId ? { ...t, is_active: !t.is_active } : t));
  };

  const handleEditTerm = (term) => {
    console.log("Editar termo:", term);
  };

  const handleDeleteTerm = async (termId) => {
    console.log("Excluir termo ID:", termId);
    setTerms(prev => prev.filter(t => t.id !== termId));
  };

  const handleNewTerm = () => {
    console.log("Abrir modal de novo termo");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Navegação de Abas (Opcional caso seu layout principal já controle, mas útil se for independente) */}
      <div className="flex gap-4 border-b border-slate-700/50 pb-4 mb-6">
        <button
          onClick={() => setActiveTab("terms")}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            activeTab === "terms"
              ? "bg-[#4D6BFE] text-white shadow-lg shadow-[#4D6BFE]/20"
              : "text-slate-400 hover:text-white bg-slate-800/40"
          }`}
        >
          📄 Termos
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            activeTab === "users"
              ? "bg-[#4D6BFE] text-white shadow-lg shadow-[#4D6BFE]/20"
              : "text-slate-400 hover:text-white bg-slate-800/40"
          }`}
        >
          👥 Usuários
        </button>
        {/* Adicione outras abas conforme necessário */}
      </div>

      {/* Cabeçalho dinâmico baseado na aba */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white capitalize">
            Gerenciamento de {activeTab}
          </h1>
          <p className="text-sm text-slate-400">
            Gerencie e filtre os registros do sistema em tempo real.
          </p>
        </div>
        {activeTab === "terms" && (
          <button
            onClick={handleNewTerm}
            className="bg-[#4D6BFE] hover:bg-[#3B5DE8] text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-[#4D6BFE]/20 flex items-center gap-2"
          >
            <span>➕</span> Novo Termo
          </button>
        )}
      </div>

      {/* Componente de Filtros Unificado */}
      <DashboardFilters
        activeTab={activeTab}
        role={role}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
        actionLoading={actionLoading}
        user={selectedUser}
        isEditing={isEditingUser}
        setIsEditing={setIsEditingUser}
        onBack={() => setSelectedUser(null)}
        handleSave={() => console.log("Salvando...")}
      />

      {/* Renderização Condicional da Tabela baseada na Aba Ativa */}
      <div className="mt-6">
        {activeTab === "terms" && (
          <TermTable
            terms={filteredTerms}
            acceptanceCounts={acceptanceCounts}
            onViewUsers={handleViewUsers}
            onToggleStatus={handleToggleStatus}
            onEdit={handleEditTerm}
            onDelete={handleDeleteTerm}
            loading={loading}
          />
        )}

        {activeTab === "users" && (
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-8 text-center text-slate-400">
            {/* Aqui entra a sua <UserTable /> se houver */}
            <p>Tabela de Usuários carregada aqui (conectada aos filtros de `name` e `completed`).</p>
          </div>
        )}
      </div>
    </div>
  );
}