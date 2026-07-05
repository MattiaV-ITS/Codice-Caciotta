import React from 'react';

function FilterBar({ label, options, active, onSelect }) {
  return (
    <div className="toolbar-filters">
      <span className="filter-label">{label}:</span>

      {options.map(opt => (
        <button
          key={opt.value}
          className={`btn-filter ${opt.className || ''} ${active === opt.value ? 'active' : ''}`}
          onClick={() => onSelect(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default FilterBar;
