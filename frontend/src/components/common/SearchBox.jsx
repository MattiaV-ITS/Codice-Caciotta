import React from 'react';

function SearchBox({ searchTerm, setSearchTerm, onEnter, searchable = null }) {
  return (
    <div className="search-box-wrapper">
      <div className="search-icon-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder={searchable ? `Cerca per ${searchable}...` : "Cerca..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onEnter();
          }}
        />

        <svg
          className="search-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="16"
          height="16"
        >
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5z" />
        </svg>
      </div>
    </div>
  );
}

export default SearchBox;
