export default function MyProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aqui buscamos os dados do usuário LOGADO
    const fetchMyDetails = async () => {
      try {
        setLoading(true);
        // Geralmente o backend tem um endpoint /me ou /profile para o token atual
        const res = await api.get("/api/v1/auth/me"); 
        setUser(res.data.data);
      } catch (err) {
        console.error("Erro ao carregar perfil", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyDetails();
  }, []);

  if (loading) return <div className="loading-state">Carregando seu perfil...</div>;
  if (!user) return <div>Usuário não encontrado.</div>;

  return (
    <div className="dashboard-layout animate-in">
      {/* Reutilizando a estrutura que você me enviou */}
      <div className="main-wrapper" style={{ marginLeft: 0 }}> {/* Ajuste se não houver sidebar */}
        <header className="main-header">
          <h2>Meu Perfil</h2>
        </header>

        <main className="content-area">
          <div className="detail-grid">
            {/* CARD: PERFIL (Igual ao seu código anterior) */}
            <section className="info-card">
              <div className="profile-header">
                <div className="avatar-large">{user.name?.charAt(0)}</div>
                <div>
                  <h3>{user.name}</h3>
                  <span className={`badge ${user.is_admin ? "success" : "operacional"}`}>
                    {user.is_admin ? "Administrador" : "Operacional"}
                  </span>
                </div>
              </div>

              <div className="info-list">
                <div className="info-item">
                  <label>E-mail Corporativo</label>
                  <span>{user.email}</span>
                </div>
                <div className="info-item">
                  <label>Status</label>
                  <span className={user.profile_completed ? "text-success" : "text-warning"}>
                    {user.profile_completed ? "✓ Conta Verificada" : "⚠ Perfil Incompleto"}
                  </span>
                </div>
              </div>
            </section>

            {/* CARD: ENDEREÇO (Igual ao seu código anterior) */}
            <section className="info-card">
              <h4 className="section-title">Meu Endereço</h4>
              {user.address ? (
                <div className="info-list" style={{ marginTop: "20px" }}>
                   <div className="info-item">
                    <label>Localidade</label>
                    <span>{user.address.city} - {user.address.state}</span>
                  </div>
                  {/* ... outros campos de endereço ... */}
                </div>
              ) : (
                <div className="empty-state">Nenhum endereço cadastrado.</div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}