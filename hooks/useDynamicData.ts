import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  dynamicFirebaseService, 
  DynamicContent, 
  PaginationOptions 
} from '../services/dynamicFirebaseService';
import { DocumentData, QueryConstraint } from 'firebase/firestore';

// Hook states
interface UseDynamicDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  unsubscribe: () => void;
}

interface UsePaginatedDataState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  totalCount: number;
}

interface UseRealTimeState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  unsubscribe: () => void;
  isConnected: boolean;
}

// Performance monitoring
interface PerformanceMetrics {
  lastFetchTime: number;
  averageFetchTime: number;
  fetchCount: number;
  cacheHitRate: number;
}

// Dynamic data fetching hook
export function useDynamicData<T = DocumentData>(
  collectionName: string,
  documentId?: string,
  dependencies: any[] = []
): UseDynamicDataState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lastFetchTime: 0,
    averageFetchTime: 0,
    fetchCount: 0,
    cacheHitRate: 0
  });

  const unsubscribeRef = useRef<(() => void) | null>(null);

  const fetchData = useCallback(async () => {
    const startTime = performance.now();
    
    try {
      setLoading(true);
      setError(null);

      if (documentId) {
        const result = await dynamicFirebaseService.getDynamicContent(collectionName, documentId);
        setData(result as T);
      } else {
        const result = await dynamicFirebaseService.getDynamicContent(collectionName);
        setData(result as T);
      }

      const endTime = performance.now();
      const fetchTime = endTime - startTime;
      
      setMetrics(prev => ({
        lastFetchTime: fetchTime,
        averageFetchTime: (prev.averageFetchTime * prev.fetchCount + fetchTime) / (prev.fetchCount + 1),
        fetchCount: prev.fetchCount + 1,
        cacheHitRate: prev.cacheHitRate
      }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error(`Error fetching ${collectionName}:`, err);
    } finally {
      setLoading(false);
    }
  }, [collectionName, documentId]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const unsubscribe = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    return () => {
      unsubscribe();
    };
  }, [fetchData, unsubscribe, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch,
    unsubscribe
  };
}

// Real-time data synchronization hook
export function useRealTimeData<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  enabled: boolean = true
): UseRealTimeState<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setIsConnected(true);

    const unsubscribe = dynamicFirebaseService.subscribeToCollection(
      collectionName,
      (newData) => {
        setData(newData as T[]);
        setLoading(false);
        setIsConnected(true);
      },
      constraints,
      (err) => {
        setError(err.message);
        setLoading(false);
        setIsConnected(false);
      }
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [collectionName, JSON.stringify(constraints), enabled]);

  const unsubscribe = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
      setIsConnected(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    unsubscribe,
    isConnected
  };
}

// Paginated data hook
export function usePaginatedData<T = DocumentData>(
  collectionName: string,
  pageSize: number = 10,
  constraints: QueryConstraint[] = [],
  orderByField: string = 'createdAt'
): UsePaginatedDataState<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [lastDocument, setLastDocument] = useState<any>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const options = {
        pageSize,
        lastDocument,
        orderByField,
        orderDirection: 'desc' as const
      };

      const result = await dynamicFirebaseService.paginatedQuery(
        collectionName,
        options,
        constraints
      );

      setData(prev => [...prev, ...result.data as T[]]);
      setLastDocument(result.lastDocument);
      setHasMore(result.hasMore);
      setTotalCount(prev => prev + result.data.length);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error(`Error loading more data from ${collectionName}:`, err);
    } finally {
      setLoading(false);
    }
  }, [collectionName, pageSize, lastDocument, orderByField, constraints, loading, hasMore]);

  const refresh = useCallback(() => {
    setData([]);
    setLastDocument(null);
    setHasMore(true);
    setTotalCount(0);
    loadMore();
  }, [loadMore]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    totalCount
  };
}

// Dynamic content management hook
export function useDynamicContent(
  contentType: string,
  documentId?: string,
  version?: number
) {
  const { data, loading, error, refetch } = useDynamicData<DynamicContent>(
    'dynamic_content',
    documentId,
    [contentType, version]
  );

  const content = data?.content || null;
  const metadata = data?.metadata || null;

  return {
    content,
    metadata,
    loading,
    error,
    refetch
  };
}

// Connection status hook
export function useConnectionStatus() {
  const [status, setStatus] = useState({
    isConfigured: false,
    activeListeners: 0,
    cacheSize: 0
  });

  useEffect(() => {
    const updateStatus = () => {
      const connectionStatus = dynamicFirebaseService.getConnectionStatus();
      setStatus(connectionStatus);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return status;
}