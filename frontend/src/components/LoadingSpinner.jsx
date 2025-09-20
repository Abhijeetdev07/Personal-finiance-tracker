import { motion } from 'framer-motion';
import { FiLoader, FiDownload, FiFileText, FiCheck, FiX } from 'react-icons/fi';

// Enhanced Loading Spinner Component for Export Operations
export default function LoadingSpinner({ 
  isLoading = false, 
  progress = 0, 
  message = 'Loading...', 
  type = 'default',
  size = 'md',
  showProgress = false 
}) {
  if (!isLoading) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32
  };

  const getIcon = () => {
    switch (type) {
      case 'export':
        return <FiDownload className={sizeClasses[size]} />;
      case 'file':
        return <FiFileText className={sizeClasses[size]} />;
      case 'success':
        return <FiCheck className={sizeClasses[size]} />;
      case 'error':
        return <FiX className={sizeClasses[size]} />;
      default:
        return <FiLoader className={`${sizeClasses[size]} animate-spin`} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'export':
        return 'text-green-600';
      case 'file':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Spinner Icon */}
      <motion.div
        className={`${getColor()} mb-2`}
        animate={type === 'default' ? { rotate: 360 } : {}}
        transition={type === 'default' ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
      >
        {getIcon()}
      </motion.div>

      {/* Loading Message */}
      <p className="text-sm font-medium text-gray-700 text-center mb-2">
        {message}
      </p>

      {/* Progress Bar */}
      {showProgress && (
        <div className="w-full max-w-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Inline Loading Spinner for buttons
export function InlineSpinner({ size = 16, className = '' }) {
  return (
    <motion.div
      className={`inline-block ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <FiLoader size={size} />
    </motion.div>
  );
}

// Full Screen Loading Overlay
export function LoadingOverlay({ 
  isVisible = false, 
  message = 'Processing...', 
  progress = 0,
  showProgress = false,
  onCancel = null 
}) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
      >
        <div className="text-center">
          {/* Large Spinner */}
          <motion.div
            className="w-16 h-16 mx-auto mb-4 text-blue-600"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <FiLoader className="w-full h-full" />
          </motion.div>

          {/* Message */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {message}
          </h3>

          {/* Progress */}
          {showProgress && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  className="bg-blue-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Cancel Button */}
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Export Status Indicator
export function ExportStatusIndicator({ 
  status = 'idle', // idle, loading, success, error
  message = '',
  progress = 0,
  onRetry = null,
  onClose = null 
}) {
  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return {
          icon: <FiLoader className="w-5 h-5 animate-spin" />,
          color: 'bg-blue-50 border-blue-200 text-blue-800',
          iconColor: 'text-blue-600'
        };
      case 'success':
        return {
          icon: <FiCheck className="w-5 h-5" />,
          color: 'bg-green-50 border-green-200 text-green-800',
          iconColor: 'text-green-600'
        };
      case 'error':
        return {
          icon: <FiX className="w-5 h-5" />,
          color: 'bg-red-50 border-red-200 text-red-800',
          iconColor: 'text-red-600'
        };
      default:
        return null;
    }
  };

  if (status === 'idle') return null;

  const config = getStatusConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-4 rounded-lg border ${config.color} mb-4`}
    >
      <div className="flex items-start gap-3">
        <div className={config.iconColor}>
          {config.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {message}
          </p>
          
          {status === 'loading' && progress > 0 && (
            <div className="mt-2">
              <div className="w-full bg-white/50 rounded-full h-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {Math.round(progress)}% complete
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {status === 'error' && onRetry && (
            <button
              onClick={onRetry}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors"
            >
              Retry
            </button>
          )}
          
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs opacity-70 hover:opacity-100 transition-opacity"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
