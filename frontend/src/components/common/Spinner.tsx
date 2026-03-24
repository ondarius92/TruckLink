import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'white' | 'gray';
  fullScreen?: boolean;
  text?: string;
}

const sizeStyles = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

const colorStyles = {
  blue: 'border-blue-600 border-t-transparent',
  white: 'border-white border-t-transparent',
  gray: 'border-gray-400 border-t-transparent',
};

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'blue',
  fullScreen = false,
  text,
}) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`
          rounded-full border-2 animate-spin
          ${sizeStyles[size]}
          ${colorStyles[color]}
        `}
      />
      {text && (
        <p className="text-sm text-gray-500 animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export const PageLoader: React.FC<{ text?: string }> = ({
  text = 'טוען...',
}) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Spinner size="lg" text={text} />
  </div>
);

export const InlineLoader: React.FC = () => (
  <div className="flex items-center justify-center py-8">
    <Spinner size="md" />
  </div>
);

export default Spinner;
