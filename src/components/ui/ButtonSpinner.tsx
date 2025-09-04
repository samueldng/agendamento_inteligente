import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function ButtonSpinner({ size = 'sm' }: ButtonSpinnerProps) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin`} />
  );
}