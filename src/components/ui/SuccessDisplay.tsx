import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessDisplayProps {
  message: string;
  className?: string;
}

export function SuccessDisplay({ message, className = '' }: SuccessDisplayProps) {
  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
        <div>
          <h4 className="text-green-800 font-medium">Sucesso</h4>
          <p className="text-green-700 text-sm mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
}