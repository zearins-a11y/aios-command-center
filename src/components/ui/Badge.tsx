import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'gray';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'info',
  size = 'md',
  children,
  dot = false,
  className = '',
}) => {
  const variants = {
    success: 'bg-success/10 text-success border-success/30',
    warning: 'bg-warning/10 text-warning border-warning/30',
    error: 'bg-error/10 text-error border-error/30',
    info: 'bg-accent/10 text-accent border-accent/30',
    gray: 'bg-bg-card text-text-muted border-border-default',
  };

  const dotColors = {
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    info: 'bg-accent',
    gray: 'bg-text-dim',
  };

  const sizes = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {dot && (
        <span className={`${dotSizes[size]} rounded-full ${dotColors[variant]} ${variant === 'success' ? 'live-indicator' : ''}`} />
      )}
      {children}
    </span>
  );
};

interface StatusDotProps {
  status: 'available' | 'working' | 'error' | 'offline';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  size = 'md',
  pulse = false,
}) => {
  const colors = {
    available: 'bg-success',
    working: 'bg-warning',
    error: 'bg-error',
    offline: 'bg-text-dim',
  };

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-block rounded-full ${colors[status]} ${sizes[size]} ${status === 'available' || status === 'working' ? 'status-glow' : ''} ${pulse && (status === 'available' || status === 'working') ? 'live-indicator' : ''}`}
    />
  );
};
