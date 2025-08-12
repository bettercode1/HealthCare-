import React from 'react';
import { useTranslation } from 'react-i18next';

interface BettercodeLogoProps {
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
}

const BettercodeLogo: React.FC<BettercodeLogoProps> = ({ 
  variant = 'default', 
  className = '' 
}) => {
  const { t } = useTranslation();
  
  const variants = {
    default: {
      container: "flex items-center justify-center space-x-2",
      text: "text-gray-400 text-sm",
      logo: "h-6 w-auto opacity-80 hover:opacity-100 transition-opacity"
    },
    compact: {
      container: "flex items-center space-x-1",
      text: "text-gray-500 text-xs",
      logo: "h-4 w-auto opacity-80 hover:opacity-100 transition-opacity"
    },
    minimal: {
      container: "flex items-center space-x-1",
      text: "text-gray-400 text-xs",
      logo: "h-3 w-auto opacity-70 hover:opacity-100 transition-opacity"
    }
  };

  const currentVariant = variants[variant];

  return (
    <div className={`${currentVariant.container} ${className}`}>
      {variant === 'default' && (
        <span className={currentVariant.text}>{t('poweredBy')}</span>
      )}
      <div className="flex items-center space-x-1">
        <img 
          src="/src/assets/bettercode.jpg" 
          alt="Bettercode" 
          className={currentVariant.logo}
        />
      </div>
    </div>
  );
};

export default BettercodeLogo;
