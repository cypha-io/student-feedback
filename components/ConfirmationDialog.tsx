'use client';

import { useState, createContext, useContext, ReactNode } from 'react';

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmationContextType {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider');
  }
  return context;
};

interface ConfirmationProviderProps {
  children: ReactNode;
}

export const ConfirmationProvider = ({ children }: ConfirmationProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmationOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = (options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(options);
      setResolvePromise(() => resolve);
      setIsOpen(true);
    });
  };

  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise(true);
    }
    closeDialog();
  };

  const handleCancel = () => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    closeDialog();
  };

  const closeDialog = () => {
    setIsOpen(false);
    setOptions(null);
    setResolvePromise(null);
  };

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      {isOpen && options && (
        <ConfirmationDialog
          options={options}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmationContext.Provider>
  );
};

interface ConfirmationDialogProps {
  options: ConfirmationOptions;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog = ({ options, onConfirm, onCancel }: ConfirmationDialogProps) => {
  const getTypeStyles = () => {
    switch (options.type) {
      case 'danger':
        return {
          icon: '🗑️',
          iconBg: 'bg-red-100 dark:bg-red-900/20',
          iconColor: 'text-red-600 dark:text-red-400',
          confirmBg: 'bg-red-600 hover:bg-red-700',
        };
      case 'warning':
        return {
          icon: '⚠️',
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
        };
      default:
        return {
          icon: 'ℹ️',
          iconBg: 'bg-blue-100 dark:bg-blue-900/20',
          iconColor: 'text-blue-600 dark:text-blue-400',
          confirmBg: 'bg-blue-600 hover:bg-blue-700',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className={`flex-shrink-0 w-10 h-10 ${styles.iconBg} rounded-full flex items-center justify-center mr-4`}>
              <span className={`text-lg ${styles.iconColor}`}>{styles.icon}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {options.title}
              </h3>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {options.message}
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {options.cancelText || 'Cancel'}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 ${styles.confirmBg} text-white rounded-lg transition-colors`}
            >
              {options.confirmText || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
