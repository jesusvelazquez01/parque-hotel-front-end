
// Re-export toast from sonner with proper typing
import { toast as sonnerToast } from 'sonner';

// Define types for our toast messages
type ToastMessage = string | {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
};

// Create a typed wrapper for the toast function
export const toast = Object.assign(
  // Base toast function
  (message: ToastMessage) => {
    if (typeof message === 'string') {
      return sonnerToast(message);
    } else {
      return sonnerToast(message.title || '', {
        description: message.description,
        // Map our variant to sonner's style if provided
        ...(message.variant && { 
          style: getStyleForVariant(message.variant)
        })
      });
    }
  },
  // Add helper methods
  {
    success: (message: ToastMessage) => {
      if (typeof message === 'string') {
        return sonnerToast.success(message);
      } else {
        return sonnerToast.success(message.title || '', {
          description: message.description
        });
      }
    },
    error: (message: ToastMessage) => {
      if (typeof message === 'string') {
        return sonnerToast.error(message);
      } else {
        return sonnerToast.error(message.title || '', {
          description: message.description
        });
      }
    },
    warning: (message: ToastMessage) => {
      if (typeof message === 'string') {
        return sonnerToast.warning(message);
      } else {
        return sonnerToast.warning(message.title || '', {
          description: message.description
        });
      }
    },
    info: (message: ToastMessage) => {
      if (typeof message === 'string') {
        return sonnerToast.info(message);
      } else {
        return sonnerToast.info(message.title || '', {
          description: message.description
        });
      }
    },
    loading: (message: ToastMessage) => {
      if (typeof message === 'string') {
        return sonnerToast.loading(message);
      } else {
        return sonnerToast.loading(message.title || '', {
          description: message.description
        });
      }
    },
    dismiss: (toastId?: string) => {
      return sonnerToast.dismiss(toastId);
    },
    custom: sonnerToast.custom,
    promise: sonnerToast.promise,
    // For compatibility with prior code
    getHistory: () => []
  }
);

// Helper function to convert our variant to sonner style
function getStyleForVariant(variant: string): React.CSSProperties | undefined {
  switch (variant) {
    case 'destructive':
      return { backgroundColor: 'var(--destructive)', color: 'var(--destructive-foreground)' };
    case 'success':
      return { backgroundColor: 'var(--success)', color: 'var(--success-foreground)' };
    case 'warning':
      return { backgroundColor: 'var(--warning)', color: 'var(--warning-foreground)' };
    case 'info':
      return { backgroundColor: 'var(--info)', color: 'var(--info-foreground)' };
    default:
      return undefined;
  }
}

// Re-export useToast for components that need toast context
export const useToast = () => {
  return { toast };
};
