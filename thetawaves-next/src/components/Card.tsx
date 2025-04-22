import React from 'react';
import Image from 'next/image';

interface CardProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  imageAlt?: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  imageUrl,
  imageAlt,
  children,
  className = '',
  onClick,
  isActive = false,
}) => {
  const baseClasses = 'flex items-center space-x-4 p-4 rounded-lg transition-colors';
  const activeClasses = isActive ? 'bg-[#BFB3DC]' : 'bg-[#CAC3E4] hover:bg-[#BFB3DC]';
  const borderClasses = 'border-2 border-[#4B1535]';
  const trackBorderClasses = 'border-t-2 border-[#4B1535]';

  
  return (
    <div 
      className={`${baseClasses} ${activeClasses} ${trackBorderClasses} ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {imageUrl && (
        <div className="w-12 h-12 relative flex-shrink-0 rounded-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={imageAlt || title}
            width={48}
            height={48}
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      <div className="flex-grow">
        <p className="text-[#4B1535] text-lg truncate">{title}</p>
        {subtitle && (
          <p className="text-[#4B1535] opacity-75 text-sm">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
};

// Example usage:
/*
<Card
  title="Song Name"
  subtitle="Artist Name"
  imageUrl="/path/to/image.jpg"
  imageAlt="Album Cover"
  isActive={true}
  onClick={() => console.log('Card clicked')}
>
  <button className="bg-[#4B1535] text-[#CAC3E4] px-3 py-1 rounded-full">
    Play
  </button>
</Card>
*/ 