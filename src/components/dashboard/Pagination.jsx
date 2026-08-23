// components/dashboard/Pagination.jsx
 // ← Importando o CSS separado

export default function Pagination({ 
  currentPage, 
  lastPage, 
  onPageChange,
  total,
  loading = false
}) {
  if (lastPage <= 1 && total <= 10) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (lastPage <= maxVisible) {
      for (let i = 1; i <= lastPage; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(lastPage);
      } else if (currentPage >= lastPage - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = lastPage - 4; i <= lastPage; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(lastPage);
      }
    }
    
    return pages;
  };

  return (
    <div className="pagination-wrapper">
      <div className="pagination-info">
        <div className="pagination-text">
          Mostrando página {currentPage} de {lastPage}
          {total > 0 && ` • Total: ${total} registros`}
        </div>
        
        <ul className="pagination-nav">
          <li className={`pagination-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button 
              className="pagination-link" 
              onClick={() => onPageChange(currentPage - 1)}
              disabled={loading || currentPage === 1}
            >
              <i className="bi bi-chevron-left pagination-icon"></i>
            </button>
          </li>
          
          {getPageNumbers().map((page, index) => (
            <li 
              key={index} 
              className={`pagination-item 
                ${page === currentPage ? 'active' : ''} 
                ${page === '...' ? 'ellipsis' : ''}`}
            >
              {page === '...' ? (
                <span className="pagination-link">...</span>
              ) : (
                <button
                  className="pagination-link"
                  onClick={() => onPageChange(page)}
                  disabled={loading}
                >
                  {page}
                </button>
              )}
            </li>
          ))}
          
          <li className={`pagination-item ${currentPage === lastPage ? 'disabled' : ''}`}>
            <button 
              className="pagination-link" 
              onClick={() => onPageChange(currentPage + 1)}
              disabled={loading || currentPage === lastPage}
            >
              <i className="bi bi-chevron-right pagination-icon"></i>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}


/* ==========================================================
   PAGINAÇÃO - ESTILO COMPLETO PADRONIZADO
   ========================================================== */

/* ============================================
   WRAPPER PRINCIPAL
   ============================================ */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-lg, 16px) var(--spacing-xl, 24px);
  border-top: 1px solid var(--border, #2a2d3a);
  background: var(--bg-card, #14161e);
  border-radius: 0 0 var(--radius-lg, 12px) var(--radius-lg, 12px);
}

.pagination-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  flex-wrap: wrap;
  gap: var(--spacing-md, 12px);
}

/* ============================================
   TEXTO INFORMATIVO
   ============================================ */
.pagination-text {
  font-size: 13px;
  color: var(--text-dim, #94a3b8);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 8px);
}

.pagination-text .highlight {
  color: var(--text-main, #e2e8f0);
  font-weight: 600;
}

.pagination-text .total-badge {
  background: var(--bg-input, #1a1d2a);
  padding: 2px 12px;
  border-radius: var(--radius-2xl, 20px);
  font-size: 12px;
  color: var(--primary, #6366f1);
  border: 1px solid var(--border-light, #1e2130);
}

/* ============================================
   NAVEGAÇÃO
   ============================================ */
.pagination-nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
  list-style: none;
  margin: 0;
  padding: 0;
}

/* ============================================
   ITEM DA PAGINAÇÃO
   ============================================ */
.pagination-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
}

.pagination-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-item.disabled .pagination-link {
  cursor: not-allowed;
  pointer-events: none;
}

.pagination-item.ellipsis .pagination-link {
  cursor: default;
  color: var(--text-muted, #4a4f6a);
  background: transparent;
  border: none;
  padding: 0 4px;
}

.pagination-item.ellipsis .pagination-link:hover {
  background: transparent;
  color: var(--text-muted, #4a4f6a);
}

/* ============================================
   LINK DA PAGINAÇÃO
   ============================================ */
.pagination-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 var(--spacing-sm, 8px);
  border-radius: var(--radius-md, 8px);
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-dim, #94a3b8);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast, 0.2s ease);
  text-decoration: none;
  font-family: var(--font-primary, 'Inter', sans-serif);
}

.pagination-link:hover:not(.disabled) {
  background: var(--bg-hover, #1e2130);
  color: var(--text-main, #e2e8f0);
  border-color: var(--border-light, #1e2130);
  transform: translateY(-1px);
}

.pagination-link:active {
  transform: scale(0.95);
}

.pagination-link:focus-visible {
  outline: 2px solid var(--primary, #6366f1);
  outline-offset: 2px;
}

/* ============================================
   ESTADO ATIVO
   ============================================ */
.pagination-item.active .pagination-link {
  background: var(--primary, #6366f1);
  color: var(--text-white, #ffffff);
  border-color: var(--primary, #6366f1);
  box-shadow: var(--shadow-primary, 0 4px 20px rgba(99, 102, 241, 0.3));
  font-weight: 600;
}

.pagination-item.active .pagination-link:hover {
  background: var(--primary-hover, #818cf8);
  border-color: var(--primary-hover, #818cf8);
  box-shadow: 0 4px 24px rgba(99, 102, 241, 0.4);
  transform: translateY(-2px);
}

/* ============================================
   ÍCONES DE NAVEGAÇÃO
   ============================================ */
.pagination-icon {
  font-size: 14px;
  line-height: 1;
  transition: transform var(--transition-fast, 0.2s ease);
}

.pagination-link:hover .pagination-icon {
  transform: scale(1.1);
}

.pagination-item:first-child .pagination-link,
.pagination-item:last-child .pagination-link {
  padding: 0 10px;
  border: 1px solid var(--border, #2a2d3a);
}

.pagination-item:first-child .pagination-link:hover,
.pagination-item:last-child .pagination-link:hover {
  border-color: var(--border-light, #1e2130);
}

/* ============================================
   RESPONSIVIDADE - TABLETS
   ============================================ */
@media screen and (max-width: 768px) {
  .pagination-wrapper {
    padding: var(--spacing-md, 12px) var(--spacing-lg, 16px);
  }

  .pagination-info {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm, 8px);
  }

  .pagination-text {
    font-size: 12px;
    justify-content: center;
    text-align: center;
  }

  .pagination-nav {
    justify-content: center;
    gap: 2px;
  }

  .pagination-item {
    min-width: 32px;
    height: 32px;
  }

  .pagination-link {
    min-width: 32px;
    height: 32px;
    font-size: 12px;
    padding: 0 6px;
  }

  .pagination-icon {
    font-size: 12px;
  }

  .pagination-item:first-child .pagination-link,
  .pagination-item:last-child .pagination-link {
    padding: 0 8px;
  }

  .pagination-text .total-badge {
    font-size: 11px;
    padding: 1px 10px;
  }
}

/* ============================================
   RESPONSIVIDADE - MOBILE
   ============================================ */
@media screen and (max-width: 480px) {
  .pagination-wrapper {
    padding: var(--spacing-sm, 8px) var(--spacing-md, 12px);
  }

  .pagination-text {
    font-size: 11px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .pagination-nav {
    gap: 2px;
  }

  .pagination-item {
    min-width: 28px;
    height: 28px;
  }

  .pagination-link {
    min-width: 28px;
    height: 28px;
    font-size: 11px;
    padding: 0 4px;
    border-radius: var(--radius-sm, 6px);
  }

  .pagination-icon {
    font-size: 11px;
  }

  .pagination-item:first-child .pagination-link,
  .pagination-item:last-child .pagination-link {
    padding: 0 6px;
  }

  /* Esconde números intermediários em telas muito pequenas */
  .pagination-item:not(.active):not(:first-child):not(:last-child):not(.ellipsis) {
    display: none;
  }

  /* Mostra apenas: Primeiro, Anterior, Ativo, Próximo, Último */
  .pagination-item.active {
    display: inline-flex;
  }

  .pagination-item.ellipsis {
    display: inline-flex;
  }

  .pagination-item:first-child,
  .pagination-item:last-child {
    display: inline-flex;
  }

  .pagination-text .total-badge {
    font-size: 10px;
    padding: 1px 8px;
  }
}

/* ============================================
   TELAS MUITO PEQUENAS (360px)
   ============================================ */
@media screen and (max-width: 360px) {
  .pagination-wrapper {
    padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
  }

  .pagination-text {
    font-size: 10px;
  }

  .pagination-item {
    min-width: 24px;
    height: 24px;
  }

  .pagination-link {
    min-width: 24px;
    height: 24px;
    font-size: 10px;
    padding: 0 3px;
  }

  .pagination-icon {
    font-size: 10px;
  }

  .pagination-item:first-child .pagination-link,
  .pagination-item:last-child .pagination-link {
    padding: 0 4px;
  }

  .pagination-text .total-badge {
    font-size: 9px;
    padding: 1px 6px;
  }
}

/* ============================================
   HIGH CONTRAST
   ============================================ */
@media (prefers-contrast: high) {
  .pagination-link {
    border-width: 2px;
  }

  .pagination-item.active .pagination-link {
    border: 2px solid var(--text-white, #ffffff);
    background: var(--primary, #6366f1);
  }

  .pagination-item:first-child .pagination-link,
  .pagination-item:last-child .pagination-link {
    border-width: 2px;
  }

  .pagination-text .total-badge {
    border-width: 2px;
  }

  .pagination-link:hover:not(.disabled) {
    border-width: 2px;
  }
}

/* ============================================
   REDUCED MOTION
   ============================================ */
@media (prefers-reduced-motion: reduce) {
  .pagination-link {
    transition: none !important;
  }

  .pagination-link:hover:not(.disabled) {
    transform: none !important;
  }

  .pagination-item.active .pagination-link:hover {
    transform: none !important;
  }

  .pagination-link:active {
    transform: none !important;
  }

  .pagination-link:hover .pagination-icon {
    transform: none !important;
  }
}

/* ============================================
   SKELETON LOADING (OPCIONAL)
   ============================================ */
.pagination-skeleton {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 8px);
  padding: var(--spacing-md, 12px) var(--spacing-xl, 24px);
  border-top: 1px solid var(--border, #2a2d3a);
}

.pagination-skeleton .skeleton-item {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md, 8px);
  background: var(--bg-input, #1a1d2a);
  animation: skeletonPulse 1.5s ease-in-out infinite;
}

.pagination-skeleton .skeleton-item:first-child {
  width: 40px;
}

.pagination-skeleton .skeleton-item:last-child {
  width: 40px;
}

@keyframes skeletonPulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* ============================================
   TEMA CLARO (OPCIONAL)
   ============================================ */
@media (prefers-color-scheme: light) {
  .pagination-wrapper {
    background: var(--bg-card, #ffffff);
  }

  .pagination-text {
    color: var(--text-dim, #475569);
  }

  .pagination-text .total-badge {
    background: var(--bg-input, #e2e8f0);
    color: var(--primary, #6366f1);
  }

  .pagination-link {
    color: var(--text-dim, #475569);
  }

  .pagination-link:hover:not(.disabled) {
    background: var(--bg-hover, #f1f5f9);
    color: var(--text-main, #0f172a);
  }

  .pagination-item:first-child .pagination-link,
  .pagination-item:last-child .pagination-link {
    border-color: var(--border, #e2e8f0);
  }

  .pagination-item:first-child .pagination-link:hover,
  .pagination-item:last-child .pagination-link:hover {
    border-color: var(--border-light, #f1f5f9);
  }

  .pagination-item.active .pagination-link {
    background: var(--primary, #6366f1);
    color: var(--text-white, #ffffff);
  }

  .pagination-item.ellipsis .pagination-link {
    color: var(--text-muted, #94a3b8);
  }

  .pagination-skeleton .skeleton-item {
    background: var(--bg-input, #e2e8f0);
  }
}

/* ============================================
   ANIMAÇÃO DE CARREGAMENTO (SPINNER)
   ============================================ */
.pagination-loading {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm, 8px);
  color: var(--text-dim, #94a3b8);
  font-size: 13px;
}

.pagination-loading .spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border, #2a2d3a);
  border-top-color: var(--primary, #6366f1);
  border-radius: var(--radius-circle, 50%);
  animation: spinnerRotate 0.8s linear infinite;
}

@keyframes spinnerRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}