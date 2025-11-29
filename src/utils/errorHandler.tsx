export type ErrorType = 'error' | 'warning' | 'info' | 'success';

export interface ErrorOptions {
  title?: string;
  description?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  showError(message: string, options: ErrorOptions = {}) {
    const {
      title = 'Error',
      description,
      duration = 5000,
      dismissible = true,
      action
    } = options;

    console.error(`Error: ${title} - ${message}`);
    if (description) {
      console.error(`Description: ${description}`);
    }
  }

  showWarning(message: string, options: ErrorOptions = {}) {
    const {
      title = 'Warning',
      description,
      duration = 4000,
      dismissible = true,
      action
    } = options;

    console.warn(`Warning: ${title} - ${message}`);
    if (description) {
      console.warn(`Description: ${description}`);
    }
  }

  showInfo(message: string, options: ErrorOptions = {}) {
    const {
      title = 'Info',
      description,
      duration = 3000,
      dismissible = true,
      action
    } = options;

    console.info(`Info: ${title} - ${message}`);
    if (description) {
      console.info(`Description: ${description}`);
    }
  }

  showSuccess(message: string, options: ErrorOptions = {}) {
    const {
      title = 'Success',
      description,
      duration = 3000,
      dismissible = true,
      action
    } = options;

    console.log(`Success: ${title} - ${message}`);
    if (description) {
      console.log(`Description: ${description}`);
    }
  }

  handleFirebaseError(error: any, context: string = '') {
    let message = 'An unexpected error occurred';
    let title = 'Database Error';

    if (error?.code) {
      switch (error.code) {
        case 'permission-denied':
          message = 'You don\'t have permission to perform this action';
          title = 'Permission Denied';
          break;
        case 'unavailable':
          message = 'The service is temporarily unavailable. Please try again.';
          title = 'Service Unavailable';
          break;
        case 'deadline-exceeded':
          message = 'The operation timed out. Please try again.';
          title = 'Timeout';
          break;
        case 'not-found':
          message = 'The requested item was not found';
          title = 'Not Found';
          break;
        case 'already-exists':
          message = 'This item already exists';
          title = 'Duplicate Item';
          break;
        default:
          message = error.message || message;
      }
    } else if (error?.message) {
      message = error.message;
    }

    this.showError(message, {
      title: context ? `${title}: ${context}` : title,
      duration: 6000
    });
  }

  handleNetworkError(error: any) {
    let message = 'Network error occurred';
    
    if (error?.message?.includes('Failed to fetch')) {
      message = 'Unable to connect to the server. Please check your internet connection.';
    } else if (error?.message?.includes('NetworkError')) {
      message = 'Network error. Please check your connection and try again.';
    } else if (error?.status) {
      switch (error.status) {
        case 404:
          message = 'The requested resource was not found';
          break;
        case 401:
          message = 'You are not authorized to perform this action';
          break;
        case 403:
          message = 'Access forbidden';
          break;
        case 500:
          message = 'Server error occurred. Please try again later.';
          break;
        default:
          message = `Server responded with status ${error.status}`;
      }
    }

    this.showError(message, {
      title: 'Network Error',
      duration: 5000
    });
  }

  handleValidationError(errors: Record<string, string[]>) {
    const errorMessages = Object.entries(errors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('\n');

    this.showError(errorMessages, {
      title: 'Validation Error',
      duration: 5000
    });
  }

  handleFormError(error: any, formName: string = 'form') {
    if (error?.errors) {
      this.handleValidationError(error.errors);
    } else if (error?.message) {
      this.showError(error.message, {
        title: `${formName} Error`,
        duration: 5000
      });
    } else {
      this.showError('Please check your input and try again', {
        title: `${formName} Error`,
        duration: 5000
      });
    }
  }

  async handleAsync<T>(
    promise: Promise<T>,
    options: {
      successMessage?: string;
      errorMessage?: string;
      onSuccess?: (result: T) => void;
      onError?: (error: any) => void;
      silent?: boolean;
    } = {}
  ): Promise<T | null> {
    try {
      const result = await promise;
      
      if (!options.silent && options.successMessage) {
        this.showSuccess(options.successMessage);
      }
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (error) {
      if (!options.silent) {
        const message = options.errorMessage || 'An error occurred';
        
        if (error?.code) {
          this.handleFirebaseError(error);
        } else if (error?.status || error?.message?.includes('fetch')) {
          this.handleNetworkError(error);
        } else {
          this.showError(message);
        }
      }
      
      if (options.onError) {
        options.onError(error);
      }
      
      return null;
    }
  }
}

export const errorHandler = ErrorHandler.getInstance();

export const showError = (message: string, options?: ErrorOptions) => 
  errorHandler.showError(message, options);

export const showWarning = (message: string, options?: ErrorOptions) => 
  errorHandler.showWarning(message, options);

export const showInfo = (message: string, options?: ErrorOptions) => 
  errorHandler.showInfo(message, options);

export const showSuccess = (message: string, options?: ErrorOptions) => 
  errorHandler.showSuccess(message, options);

export const handleFirebaseError = (error: any, context?: string) => 
  errorHandler.handleFirebaseError(error, context);

export const handleNetworkError = (error: any) => 
  errorHandler.handleNetworkError(error);

export const handleValidationError = (errors: Record<string, string[]>) => 
  errorHandler.handleValidationError(errors);

export const handleFormError = (error: any, formName?: string) => 
  errorHandler.handleFormError(error, formName);

export const handleAsync = <T,>(promise: Promise<T>, options?: any) => 
  errorHandler.handleAsync(promise, options);

export default errorHandler;