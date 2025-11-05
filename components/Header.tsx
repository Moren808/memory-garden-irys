
import React from 'react';

const IrysLogo: React.FC = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#50FED5"/>
    </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="w-full p-4 flex items-center justify-center space-x-3 relative z-10">
        <IrysLogo />
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            Memory Garden on Irys
        </h1>
    </header>
  );
};
