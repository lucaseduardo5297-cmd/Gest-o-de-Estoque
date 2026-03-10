import React from 'react';

export default function Logo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 400 320" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Symbol Group */}
      <g transform="translate(40, 20)">
        {/* Tree/Leaves Structure */}
        <path d="M60 100C60 70 80 50 100 50" stroke="#C5B49E" strokeWidth="6" strokeLinecap="round"/>
        <path d="M60 100C60 70 40 50 20 50" stroke="#C5B49E" strokeWidth="6" strokeLinecap="round"/>
        
        {/* Leaves */}
        <path d="M60 40L65 25L60 10L55 25L60 40Z" fill="#C5B49E"/>
        <path d="M35 55L30 40L20 30L35 40L35 55Z" fill="#C5B49E"/>
        <path d="M85 55L90 40L100 30L85 40L85 55Z" fill="#C5B49E"/>
        <path d="M15 85L5 75L0 60L15 75L15 85Z" fill="#C5B49E"/>
        <path d="M105 85L115 75L120 60L105 75L105 85Z" fill="#C5B49E"/>

        {/* The 'S' Symbol */}
        <path 
          d="M85 105C85 95 78 90 60 90C42 90 35 95 35 105C35 120 85 120 85 145C85 155 78 165 60 165C42 165 35 155 35 145" 
          stroke="#5D3D4C" 
          strokeWidth="14" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* "rede" text next to symbol */}
        <text x="130" y="145" fill="#5D3D4C" fontFamily="Arial, sans-serif" fontSize="60" fontWeight="400">rede</text>
      </g>
      
      {/* "SÊNIOR" Text */}
      <text x="20" y="240" fill="#5D3D4C" fontFamily="Arial, sans-serif" fontSize="90" fontWeight="800" letterSpacing="2">SÊNIOR</text>
      
      {/* Tagline */}
      <text x="20" y="285" fill="#C5B49E" fontFamily="Arial, sans-serif" fontSize="26" fontWeight="400" letterSpacing="1">Residência e Hospedagem</text>
    </svg>
  );
}
