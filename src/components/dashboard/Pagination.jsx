// components/dashboard/Pagination.jsx

export default function Pagination({
  currentPage,
  lastPage,
  onPageChange,
  total,
  loading = false,
  isDark = false, // 🔥 NOVA PROP
}) {
  if (lastPage <= 1 && total <= 10) return null;

  // ============ CLASSES DE TEMA ============
  const containerBg = isDark ? 'bg-slate-800/30 border-slate-700/50' : 'bg-gray-100/80 border-gray-200';
  const textInfo = isDark ? 'text-slate-400' : 'text-gray-500';
  const textHighlight = isDark ? 'text-white' : 'text-gray-800';
  const badgeBg = isDark ? 'bg-slate-800/50 border-slate-700/30 text-blue-400' : 'bg-gray-200/80 border-gray-300 text-blue-700';
  const btnBase = isDark 
    ? 'border-slate-700/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 hover:border-slate-600/50' 
    : 'border-gray-300 text-gray-500 hover:bg-gray-200 hover:text-gray-700 hover:border-gray-400';
  const btnActive = isDark 
    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' 
    : 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200/50';
  const btnDisabled = 'opacity-40 cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400';
  const ellipsisText = isDark ? 'text-slate-500' : 'text-gray-400';

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
    <div className={`flex justify-center items-center px-6 py-4 border-t rounded-b-lg ${containerBg}`}>
      <div className="flex items-center justify-between w-full flex-wrap gap-3">
        {/* Info */}
        <div className={`flex items-center gap-2 text-sm font-medium ${textInfo}`}>
          <span>Mostrando página</span>
          <span className={`font-semibold ${textHighlight}`}>{currentPage}</span>
          <span>de</span>
          <span className={`font-semibold ${textHighlight}`}>{lastPage}</span>
          {total > 0 && (
            <>
              <span className={`${isDark ? 'text-slate-500' : 'text-gray-400'}`}>•</span>
              <span className={`px-3 py-0.5 rounded-full text-xs border ${badgeBg}`}>
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
              className={`inline-flex items-center justify-center min-w-[36px] h-9 px-2 rounded-md border bg-transparent text-sm font-medium transition-all ${btnBase} ${btnDisabled}`}
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
              className={`inline-flex items-center justify-center min-w-[36px] h-9 ${page === '...' ? 'cursor-default' : ''}`}
            >
              {page === '...' ? (
                <span className={`inline-flex items-center justify-center min-w-[36px] h-9 px-1 text-sm cursor-default ${ellipsisText}`}>
                  …
                </span>
              ) : (
                <button
                  className={`
                    inline-flex items-center justify-center min-w-[36px] h-9 px-2 rounded-md text-sm font-medium
                    transition-all duration-200
                    ${page === currentPage
                      ? btnActive
                      : `bg-transparent border border-transparent ${isDark ? 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 hover:border-slate-600/50' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700 hover:border-gray-400'}`
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
              className={`inline-flex items-center justify-center min-w-[36px] h-9 px-2 rounded-md border bg-transparent text-sm font-medium transition-all ${btnBase} ${btnDisabled}`}
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