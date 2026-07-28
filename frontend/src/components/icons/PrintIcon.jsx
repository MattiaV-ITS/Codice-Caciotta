import React from 'react';

const PrintIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--gray-500)"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="4" y="8" width="16" height="12" rx="1.5" />
    <path d="M7 4H17V8H7V4Z" strokeLinejoin="round" />
    <rect x="7" y="14" width="10" height="6" rx="1" />
    <path d="M8 11H16" />
    <circle cx="16" cy="16" r="0.8" fill="var(--gray-500)" />
  </svg>
);

export default PrintIcon;