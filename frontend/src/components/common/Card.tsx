import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  padding = 'md',
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-2xl border border-gray-100 shadow-sm
        ${paddingStyles[padding]}
        ${hoverable
          ? 'cursor-pointer hover:shadow-md hover:border-gray-200 transition-all duration-200'
          : ''
        }
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  suffix?: string;
}

const colorStyles = {
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-green-50 text-green-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
  purple: 'bg-purple-50 text-purple-700',
};

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  color = 'blue',
  suffix,
}) => {
  return (
    <div
      className={`
        rounded-2xl p-4 flex flex-col gap-1
        ${colorStyles[color]}
      `}
    >
      {icon && <span className="text-2xl">{icon}</span>}
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="text-2xl font-bold">
        {value}
        {suffix && (
          <span className="text-sm font-normal mr-1">{suffix}</span>
        )}
      </p>
    </div>
  );
};

export default Card;
