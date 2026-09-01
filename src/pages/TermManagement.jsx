// src/pages/TermManagement.jsx
import React, { useState, useEffect } from "react";
import DashboardFilters from "../components/dashboard/DashboardFilters";
import TermTable from "../components/dashboard/TermTable";
import api from "../services/api"; // Certifique-se de que o caminho do seu axios instance está correto

export default function TermManagement({ role = "admin" }) {
  const [activeTab, setActiveTab] = useState("terms");

  // Estados de dados
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [acceptanceCounts, setAcceptanceCounts] = useState({});

  // Estados de controle e modais / visualização
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditingUser, setIsEditingUser] = useState(false);

  // Estados de Filtros alinhados com o backend e DashboardFilters
  const [filters, setFilters] = useState({
    version: "",
    status: "",
    creator: "",
    name: "",
    completed: "",
  });

  // Carregar dados iniciais da API
  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    setLoading(true);
    try {
      // Consumindo a rota protegida do admin: GET /v1/admin/terms
      const response = await api.get("/admin/terms");
      
      // Ajuste conforme o formato de retorno do seu TermController (ex: response.data.data ou response.data)
      const termsData = response.data.data || response.data || [];
      setTerms(termsData);

      // Opcional: Buscar estatísticas de aceitação para popular o contador na tabela
      try {
        const statsRes = await api.get("/admin/terms/acceptances/stats");
        // Espera-se um objeto mapeado por term_id, ex: { 1: 15, 2: 8 }
        if (statsRes.data) {
          setAcceptanceCounts(statsRes.data);
        }
      } catch (err) {
        console.warn("Não foi possível carregar as estatísticas de aceitação:", err);
      }

    } catch (error) {
      console.error("Erro ao buscar termos da API:", error);
    } finally {
      setLoading(false);
    }
  };

  // Manipulador de mudança de filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Limpar Filtros
  const handleClearFilters = () => {
    setFilters({
      version: "",
      status: "",
      creator: "",
      name: "",
      completed: "",
    });
  };

  // Lógica de Filtro Frontend baseada nos estados locais
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

  // Ações conectadas com a API
  const handleViewUsers = (termId) => {
    console.log("Visualizar usuários que aceitaram o termo ID:", termId);
    // Aqui você pode redirecionar para uma rota ou abrir um modal chamando:
    // api.get(`/admin/terms/acceptances?term_id=${termId}`)
  };

  const handleToggleStatus = async (term) => {
    setActionLoading(true);
    try {
      // Rota correspondente: PATCH /v1/admin/terms/{id}/toggle
      await api.patch(`/admin/terms/${term.id}/toggle`);
      
      // Atualiza o estado localmente após sucesso no backend
      setTerms((prev) =>
        prev.map((t) => (t.id === term.id ? { ...t, is_active: !t.is_active } : t))
      );
    } catch (error) {
      console.error("Erro ao alterar status do termo:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditTerm = (term) => {
    console.log("Editar termo:", term);
    // Lógica para abrir modal de edição e enviar via PUT /v1/admin/terms/{id}
  };

  const handleDeleteTerm = async (termId) => {
    if (!window.confirm("Tem certeza que deseja excluir este termo?")) return;

    setActionLoading(true);
    try {
      // Rota correspondente: DELETE /v1/admin/terms/{id}
      await api.delete(`/admin/terms/${termId}`);
      
      setTerms((prev) => prev.filter((t) => t.id !== termId));
    } catch (error) {
      console.error("Erro ao excluir termo:", error);
      alert(error.response?.data?.message || "Erro ao excluir termo.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleNewTerm = () => {
    console.log("Abrir modal de criação de novo termo (POST /v1/admin/terms)");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Abas de Navegação do Painel */}
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
      </div>

      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white capitalize">
            Gerenciamento de {activeTab}
          </h1>
          <p className="text-sm text-slate-400">
            Gerencie e filtre os registros do sistema diretamente da base de dados.
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

      {/* Filtros Unificados */}
      <DashboardFilters
        activeTab={activeTab}
        role={role}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
        actionLoading={actionLoading || loading}
        user={selectedUser}
        isEditing={isEditingUser}
        setIsEditing={setIsEditingUser}
        onBack={() => setSelectedUser(null)}
        handleSave={() => console.log("Salvando...")}
      />

      {/* Exibição da Tabela baseada na Aba Ativa */}
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
            <p>Módulo de listagem de usuários conectado à rota `/v1/admin/users`.</p>
          </div>
        )}
      </div>
    </div>
  );
}