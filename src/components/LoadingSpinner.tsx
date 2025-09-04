import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  className?: string;
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const textSizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
};

function SpinnerVariant({ size }: { size: keyof typeof sizeClasses }) {
  return <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />;
}

function DotsVariant({ size }: { size: keyof typeof sizeClasses }) {
  const dotSize = size === 'xs' ? 'w-1 h-1' : size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-3 h-3';
  
  return (
    <div className="flex space-x-1">
      <div className={`${dotSize} bg-blue-600 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
      <div className={`${dotSize} bg-blue-600 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
      <div className={`${dotSize} bg-blue-600 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
    </div>
  );
}

function PulseVariant({ size }: { size: keyof typeof sizeClasses }) {
  return (
    <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-pulse`}></div>
  );
}

function SkeletonVariant() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
    </div>
  );
}

export default function LoadingSpinner({ 
  size = 'md', 
  variant = 'spinner',
  className = '', 
  text,
  fullScreen = false,
  overlay = false
}: LoadingSpinnerProps) {
  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return <DotsVariant size={size} />;
      case 'pulse':
        return <PulseVariant size={size} />;
      case 'skeleton':
        return <SkeletonVariant />;
      default:
        return <SpinnerVariant size={size} />;
    }
  };

  const content = (
    <div className="flex flex-col items-center space-y-2">
      {renderVariant()}
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 text-center`}>{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center ${overlay ? 'bg-black bg-opacity-50 z-50' : 'bg-white z-40'} ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {content}
    </div>
  );
}

// Componente específico para loading de botões
export function ButtonSpinner({ size = 'sm', className = '' }: { size?: 'xs' | 'sm' | 'md'; className?: string }) {
  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin ${className}`} />
  );
}

// Componente para loading de página inteira
export function PageLoader({ text = 'Carregando...' }: { text?: string }) {
  return (
    <LoadingSpinner
      size="lg"
      text={text}
      fullScreen
      overlay
      className="bg-white"
    />
  );
}

// Componente para loading de seções
export function SectionLoader({ text, className = '' }: { text?: string; className?: string }) {
  return (
    <div className={`py-12 ${className}`}>
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}

// Componente para skeleton loading de cards
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-300 h-48 rounded-t-lg"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
      </div>
    </div>
  );
}

// Componente para skeleton loading de tabelas
export function TableSkeleton({ rows = 5, cols = 4, className = '' }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-300 rounded"></div>
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}