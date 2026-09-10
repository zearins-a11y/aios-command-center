import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  interactive = false,
  onClick,
  hover = true,
}) => {
  const baseStyles = 'bg-bg-card rounded-lg border border-border-default';
  const interactiveStyles = interactive || onClick
    ? 'cursor-pointer transition-all duration-200 hover:border-border-hover hover:shadow-lg hover:shadow-primary/5'
    : '';
  const hoverStyles = hover && !onClick
    ? 'card-glow'
    : '';

  return (
    <div
      className={`${baseStyles} ${interactiveStyles} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`px-4 py-3 border-b border-border-default ${className}`}>
    {children}
  </div>
);

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`px-4 py-3 border-t border-border-default ${className}`}>
    {children}
  </div>
);
