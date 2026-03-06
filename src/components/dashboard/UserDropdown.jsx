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
