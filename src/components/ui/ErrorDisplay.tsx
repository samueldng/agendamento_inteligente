import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
        <div>
          <h4 className="text-red-800 font-medium">Erro</h4>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      </div>
    </div>
  );
}