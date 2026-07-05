import React from 'react';

function PaginationFooter({ page, totalPages, totalCount, length, goToPreviousPage, goToNextPage }) {
  return (
    <div className="pagination-wrapper">
      <span className="pagination-info">
        Mostrati <strong>{length}</strong> di <strong>{totalCount}</strong>
      </span>

      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={goToPreviousPage}
          disabled={page === 0}
        >
          Precedente
        </button>

        <span className="pagination-page-info">
          <strong>{page + 1}</strong> di <strong>{totalPages}</strong>
        </span>

        <button
          className="pagination-btn"
          onClick={() => goToNextPage(totalPages)}
          disabled={page >= totalPages - 1}
        >
          Successivo
        </button>
      </div>
    </div>
  );
}

export default PaginationFooter;
