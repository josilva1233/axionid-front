// components/dashboard/Pagination.jsx
//import '../../Pagination.css'; // ← Importando o CSS separado

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