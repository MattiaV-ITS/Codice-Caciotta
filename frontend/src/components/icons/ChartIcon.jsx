import React from 'react';

const ChartIcon = (props) => (
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
    <rect x="3" y="12" width="4" height="9" rx="1" />
    <rect x="10" y="6" width="4" height="15" rx="1" />
    <rect x="17" y="3" width="4" height="18" rx="1" />
  </svg>
);

export default ChartIcon;