import React from 'react';

const Logo = ({ width = '30', height = '30', className = '' }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 30 30" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="30" height="30" rx="5" fill="#4a63e7" />
      <text x="8" y="22" fill="white" fontWeight="bold" fontSize="22">F</text>
      <circle cx="22" cy="10" r="4" fill="#ffffff" />
      <path d="M16 18L20 22L24 18" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
};

export default Logo; 