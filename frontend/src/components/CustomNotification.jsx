import { useState, useEffect } from 'react';

const CustomNotification = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Show notification with a slight delay for smooth entrance
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    // Auto hide notification
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, 300);
  };

  if (!isVisible && !isLeaving) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  return (
    <div className={`fixed top-2 left-2 right-2 sm:top-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 sm:max-w-[450px] sm:w-auto z-50 transition-all duration-500 ease-out ${
      isLeaving 
        ? 'opacity-0 translate-y-[-100%] scale-95' 
        : 'opacity-100 translate-y-0 scale-100'
    }`}>
      <div className={`${getBgColor()} border rounded-lg p-3 w-full transform transition-all duration-500 ${
        isLeaving 
          ? 'scale-95 opacity-0' 
          : 'scale-100 opacity-100 animate-bounce-in'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`flex-shrink-0 transform transition-all duration-300 delay-100 ${
            isLeaving ? 'scale-0 rotate-180' : 'scale-100 rotate-0'
          }`}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium text-gray-900 sm:whitespace-nowrap sm:overflow-hidden sm:text-ellipsis whitespace-normal break-words transform transition-all duration-300 delay-150 ${
              isLeaving ? 'translate-x-4 opacity-0' : 'translate-x-0 opacity-100'
            }`}>
              {message}
            </p>
          </div>
          <div className={`flex-shrink-0 transform transition-all duration-300 delay-200 ${
            isLeaving ? 'scale-0 rotate-90' : 'scale-100 rotate-0'
          }`}>
            <button
              onClick={handleClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomNotification;
