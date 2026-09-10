import React from 'react';
import { StatusDot } from './Badge';

interface AvatarProps {
  name: string;
  image?: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'available' | 'working' | 'error' | 'offline';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  image,
  size = 'md',
  status,
  className = '',
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const statusSizes = {
    sm: 'w-2 h-2 -bottom-0 -right-0',
    md: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5',
    lg: 'w-3 h-3 -bottom-0.5 -right-0.5',
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Generate gradient based on name
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = [
    'from-primary to-secondary',
    'from-secondary to-accent',
    'from-accent to-success',
    'from-success to-warning',
    'from-warning to-error',
    'from-error to-primary',
  ];
  const gradient = gradients[hash % gradients.length];

  return (
    <div className={`relative inline-flex ${className}`}>
      {image ? (
        <img
          src={image}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-semibold text-white`}
        >
          {initials}
        </div>
      )}
      {status && (
        <span
          className={`absolute ${statusSizes[size]} rounded-full border-2 border-bg-card ${statusSizes[size]} ${statusSizes[size]} flex items-center justify-center`}
        >
          <StatusDot status={status} size={size === 'sm' ? 'sm' : 'md'} pulse />
        </span>
      )}
    </div>
  );
};
