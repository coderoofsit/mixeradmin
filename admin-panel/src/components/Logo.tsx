import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'text' | 'image' | 'combined';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'combined',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-20'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

//   if (variant === 'text') {
//     return (
//       <div className={`flex items-center ${className}`}>
//         <span className={`font-display font-bold logo-gradient-text ${textSizes[size]}`}>
//           Mixer
//         </span>
//       </div>
//     );
//   }

  if (variant === 'image') {
    return (
      <div className={`flex items-center ${className}`}>
        <img
          src="/assets/logos/Mixer Logo/Primary Logo/Primary Logo.png"
          alt="Mixer Logo"
          className={`${sizeClasses[size]} w-auto`}
        />
      </div>
    );
  }

  // Combined variant (default)
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img
        src="/assets/logos/Mixer Logo/Primary Logo/Primary Logo.png"
        alt="Mixer Logo"
        className={`${sizeClasses[size]} w-auto`}
      />
      <span className={`font-display font-bold logo-gradient-text ${textSizes[size]}`}>
        Mixer
      </span>
    </div>
  );
};

export default Logo; 