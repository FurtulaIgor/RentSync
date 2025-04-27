import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  onClick?: () => void;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  description, 
  onClick,
  className = ''
}) => {
  return (
    <div 
      className={`p-6 rounded-lg border shadow-sm transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>
        <div className="p-2 rounded-full bg-white shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;