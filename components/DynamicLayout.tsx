import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useDynamicContent, useRealTimeData } from '../hooks/useDynamicData';
import { DocumentData } from 'firebase/firestore';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

// Dynamic component interfaces
export interface DynamicComponentConfig {
  id: string;
  type: 'layout' | 'form' | 'table' | 'chart' | 'custom';
  component: string; // Component name/path
  props: Record<string, any>;
  children?: DynamicComponentConfig[];
  visibility?: {
    condition: string;
    dependencies: string[];
  };
  loading?: {
    skeleton?: boolean;
    delay?: number;
    timeout?: number;
  };
}

export interface DynamicLayout {
  id: string;
  name: string;
  components: DynamicComponentConfig[];
  metadata: {
    version: number;
    lastModified: string;
    author: string;
    tags: string[];
  };
  responsive: {
    breakpoints: Record<string, any>;
    mobileFirst: boolean;
  };
}

// Component registry
const componentRegistry: Record<string, React.ComponentType<any>> = {
  // Layout components
  'Container': lazy(() => import('./dynamic/Container')),
  'Grid': lazy(() => import('./dynamic/Grid')),
  'Flex': lazy(() => import('./dynamic/Flex')),
  
  // Form components
  'DynamicForm': lazy(() => import('./dynamic/DynamicForm')),
  'Button': lazy(() => import('./dynamic/Button')),
  
  // Data display components
  'DynamicTable': lazy(() => import('./dynamic/DynamicTable')),
  'DataCard': lazy(() => import('./dynamic/DataCard')),
  
  // Content components
  'Text': lazy(() => import('./dynamic/Text')),
  'h1': lazy(() => import('./dynamic/Text')),
  'h2': lazy(() => import('./dynamic/Text')),
  'p': lazy(() => import('./dynamic/Text')),
};

// Loading component
const LoadingComponent: React.FC<{ config: DynamicComponentConfig }> = ({ config }) => {
  const { loading = {} } = config;
  
  if (loading.skeleton) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="animate-spin text-gray-400" size={24} />
      <span className="ml-2 text-gray-500">Loading...</span>
    </div>
  );
};

// Error component
const ErrorComponent: React.FC<{ 
  error: string; 
  onRetry?: () => void;
  config: DynamicComponentConfig;
}> = ({ error, onRetry, config }) => {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center">
        <AlertCircle className="text-red-500 mr-2" size={20} />
        <h3 className="text-red-800 font-semibold">Component Error</h3>
      </div>
      <p className="text-red-600 mt-2 text-sm">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 flex items-center px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          <RefreshCw size={14} className="mr-1" />
          Retry
        </button>
      )}
    </div>
  );
};

// Dynamic component renderer
const DynamicComponent: React.FC<{
  config: DynamicComponentConfig;
  data?: DocumentData;
  onDataChange?: (data: any) => void;
  depth?: number;
}> = ({ config, data, onDataChange, depth = 0 }) => {
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const {
    type,
    component,
    props = {},
    children = [],
    visibility,
    loading: loadingConfig = {}
  } = config;

  // Check visibility conditions
  const isVisible = useComponentVisibility(visibility, data);
  
  if (!isVisible) {
    return null;
  }

  // Handle loading delay
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const delay = loadingConfig.delay || 0;
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, delay);

    return () => clearTimeout(timeout);
  }, [loadingConfig.delay]);

  // Component loading timeout
  useEffect(() => {
    const timeout = loadingConfig.timeout || 10000; // 10 seconds default
    const timer = setTimeout(() => {
      if (isLoading) {
        setError(`Component loading timeout: ${component}`);
      }
    }, timeout);

    return () => clearTimeout(timer);
  }, [loadingConfig.timeout, component, isLoading]);

  // Retry mechanism
  const handleRetry = () => {
    setError(null);
    setRetryCount(prev => prev + 1);
  };

  if (error) {
    return <ErrorComponent error={error} onRetry={handleRetry} config={config} />;
  }

  if (isLoading && loadingConfig.skeleton) {
    return <LoadingComponent config={config} />;
  }

  // Get the component from registry
  const Component = componentRegistry[component];
  
  if (!Component) {
    return <ErrorComponent error={`Unknown component: ${component}`} config={config} />;
  }

  // Process props with data binding
  const processedProps = useDataBinding(props, data, onDataChange);

  return (
    <Suspense fallback={<LoadingComponent config={config} />}>
      <Component key={`${component}-${retryCount}`} {...processedProps}>
        {children.map((childConfig, index) => (
          <DynamicComponent
            key={`${childConfig.id}-${index}`}
            config={childConfig}
            data={data}
            onDataChange={onDataChange}
            depth={depth + 1}
          />
        ))}
      </Component>
    </Suspense>
  );
};

// Dynamic layout component
export const DynamicLayout: React.FC<{
  layoutId: string;
  data?: DocumentData;
  onDataChange?: (data: any) => void;
  fallback?: React.ReactNode;
}> = ({ layoutId, data, onDataChange, fallback }) => {
  const { content: layout, loading, error, refetch } = useDynamicContent<DynamicLayout>(
    'page_layout',
    layoutId
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-gray-400" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorComponent 
          error={error} 
          onRetry={refetch} 
          config={{ id: layoutId, type: 'layout', component: 'DynamicLayout', props: {} }}
        />
      </div>
    );
  }

  if (!layout) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Layout not found: {layoutId}</p>
        {fallback}
      </div>
    );
  }

  return (
    <div className="dynamic-layout" data-layout-id={layoutId}>
      {layout.components.map((componentConfig, index) => (
        <DynamicComponent
          key={`${componentConfig.id}-${index}`}
          config={componentConfig}
          data={data}
          onDataChange={onDataChange}
        />
      ))}
    </div>
  );
};

// Hook for component visibility
function useComponentVisibility(
  visibility: { condition: string; dependencies: string[] } | undefined,
  data?: DocumentData
): boolean {
  if (!visibility) return true;

  // Simple visibility logic - can be extended
  const { condition, dependencies } = visibility;
  
  try {
    // Create a function from the condition string
    const conditionFunction = new Function('data', `return ${condition}`);
    return conditionFunction(data);
  } catch (error) {
    console.error('Error evaluating visibility condition:', error);
    return true; // Default to visible on error
  }
}

// Hook for data binding
function useDataBinding(
  props: Record<string, any>,
  data?: DocumentData,
  onDataChange?: (data: any) => void
): Record<string, any> {
  const [boundProps, setBoundProps] = useState(props);

  useEffect(() => {
    const processedProps = { ...props };
    
    // Process data bindings in props
    Object.keys(processedProps).forEach(key => {
      const value = processedProps[key];
      
      if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
        // Simple template binding: {{fieldName}}
        const fieldName = value.slice(2, -2).trim();
        processedProps[key] = data?.[fieldName] || value;
      } else if (typeof value === 'object' && value.__bind) {
        // Complex binding with transformations
        const { __bind, transform, default: defaultValue } = value;
        const boundValue = data?.[__bind] || defaultValue;
        processedProps[key] = transform ? transform(boundValue) : boundValue;
      }
    });

    setBoundProps(processedProps);
  }, [props, data]);

  return boundProps;
}

export default DynamicLayout;