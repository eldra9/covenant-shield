import React from 'react';

export const Sheen: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`absolute top-0 left-0 right-0 h-[1px] overflow-hidden pointer-events-none select-none z-10 ${className}`}>
      {/* Base Hairline */}
      <div className="w-full h-full bg-[#C9A04A]/25" />
      {/* Traveling highlight on card hover */}
      <div className="absolute top-0 left-[-120px] w-[120px] h-full bg-gradient-to-r from-transparent via-[#E6CB8A] to-transparent group-hover:animate-[sheenTravel_0.9s_var(--e-silk)_forwards]" />
    </div>
  );
};
