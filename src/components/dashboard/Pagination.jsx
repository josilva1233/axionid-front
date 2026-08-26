// components/dashboard/Pagination.jsx

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
    <div className="flex justify-center items-center px-6 py-4 border-t border-slate-700/50 bg-slate-800/30 rounded-b-lg">
      <div className="flex items-center justify-between w-full flex-wrap gap-3">
        {/* Info */}
        <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
          <span>Mostrando página</span>
          <span className="text-white font-semibold">{currentPage}</span>
          <span>de</span>
          <span className="text-white font-semibold">{lastPage}</span>
          {total > 0 && (
            <>
              <span className="text-slate-500">•</span>
              <span className="bg-slate-800/50 px-3 py-0.5 rounded-full text-xs text-blue-400 border border-slate-700/30">
                Total: {total} registros
              </span>
            </>
          )}
        </div>

        {/* Navegação */}
        <nav className="flex items-center gap-0.5 list-none m-0 p-0">
          {/* Anterior */}
          <li className={`inline-flex items-center justify-center min-w-[36px] h-9 ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : ''}`}>
            <button
              className="inline-flex items-center justify-center min-w-[36px] h-9 px-2 rounded-md border border-slate-700/50 bg-transparent text-slate-400 text-sm font-medium hover:bg-slate-700/50 hover:text-slate-200 hover:border-slate-600/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={loading || currentPage === 1}
              aria-label="Página anterior"
            >
              <span className="text-sm">‹</span>
            </button>
          </li>

          {/* Números */}
          {getPageNumbers().map((page, index) => (
            <li
              key={index}
              className={`
                inline-flex items-center justify-center min-w-[36px] h-9
                ${page === '...' ? 'cursor-default' : ''}
              `}
            >
              {page === '...' ? (
                <span className="inline-flex items-center justify-center min-w-[36px] h-9 px-1 text-slate-500 text-sm cursor-default">
                  …
                </span>
              ) : (
                <button
                  className={`
                    inline-flex items-center justify-center min-w-[36px] h-9 px-2 rounded-md text-sm font-medium
                    transition-all duration-200
                    ${page === currentPage
                      ? 'bg-blue-600 text-white border border-blue-600 shadow-lg shadow-blue-600/20 font-semibold'
                      : 'bg-transparent text-slate-400 border border-transparent hover:bg-slate-700/50 hover:text-slate-200 hover:border-slate-600/50'
                    }
                    disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400
                  `}
                  onClick={() => onPageChange(page)}
                  disabled={loading}
                  aria-label={`Ir para página ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              )}
            </li>
          ))}

          {/* Próximo */}
          <li className={`inline-flex items-center justify-center min-w-[36px] h-9 ${currentPage === lastPage ? 'opacity-40 cursor-not-allowed' : ''}`}>
            <button
              className="inline-flex items-center justify-center min-w-[36px] h-9 px-2 rounded-md border border-slate-700/50 bg-transparent text-slate-400 text-sm font-medium hover:bg-slate-700/50 hover:text-slate-200 hover:border-slate-600/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={loading || currentPage === lastPage}
              aria-label="Próxima página"
            >
              <span className="text-sm">›</span>
            </button>
          </li>
        </nav>
      </div>
    </div>
  );
}