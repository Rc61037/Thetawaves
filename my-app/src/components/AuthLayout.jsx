import React from 'react';

const AuthLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFEDF6]">
      <div className="relative">
        <div className="w-[500px] h-[500px] bg-[#9D86D5] rounded-[50%] flex flex-col items-center justify-center transform rotate-45 relative">
          <div className="absolute inset-0 bg-[#9D86D5]"
               style={{
                 clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                 transform: 'scale(1.4) rotate(-45deg)',
               }}
          />
          <div className="transform -rotate-45 z-10 flex flex-col items-center space-y-4 w-full max-w-[300px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout; 