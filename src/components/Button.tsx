import { ReactNode, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-300',
  outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400',
  ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300'
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-md
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-colors duration-200
    disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `;

  const renderIcon = () => {
    if (loading) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    return icon;
  };

  const iconElement = renderIcon();

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={baseClasses.trim()}
    >
      {iconElement && iconPosition === 'left' && (
        <span className={children ? 'mr-2' : ''}>
          {iconElement}
        </span>
      )}
      
      {loading ? 'Carregando...' : children}
      
      {iconElement && iconPosition === 'right' && (
        <span className={children ? 'ml-2' : ''}>
          {iconElement}
        </span>
      )}
    </button>
  );
}