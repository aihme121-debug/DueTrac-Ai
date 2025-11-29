import { 
  db, 
  isConfigured 
} from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  onSnapshot, 
  writeBatch,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot
} from 'firebase/firestore';

// Dynamic data interfaces
export interface DynamicContent {
  id: string;
  type: 'ui_component' | 'page_layout' | 'configuration' | 'user_data';
  content: any;
  metadata?: {
    version: number;
    lastModified: string;
    modifiedBy?: string;
    tags?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface RealTimeQuery {
  collection: string;
  constraints?: QueryConstraint[];
  callback: (data: DocumentData[]) => void;
  errorCallback?: (error: Error) => void;
}

export interface PaginationOptions {
  pageSize: number;
  lastDocument?: DocumentSnapshot;
  orderByField: string;
  orderDirection?: 'asc' | 'desc';
}

export interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

// Cache management
class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }
}

// Dynamic Firebase Service
export class DynamicFirebaseService {
  private static instance: DynamicFirebaseService;
  private cacheManager: CacheManager;
  private activeListeners: Map<string, () => void> = new Map();
  private batchQueue: any[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    this.cacheManager = new CacheManager();
  }

  static getInstance(): DynamicFirebaseService {
    if (!DynamicFirebaseService.instance) {
      DynamicFirebaseService.instance = new DynamicFirebaseService();
    }
    return DynamicFirebaseService.instance;
  }

  // Real-time data synchronization
  subscribeToCollection(
    collectionName: string,
    callback: (data: DocumentData[]) => void,
    constraints: QueryConstraint[] = [],
    errorCallback?: (error: Error) => void
  ): () => void {
    if (!isConfigured || !db) {
      const error = new Error('Firebase not configured');
      errorCallback?.(error);
      return () => {};
    }

    const cacheKey = `${collectionName}_${JSON.stringify(constraints)}`;
    
    // Check cache first
    const cachedData = this.cacheManager.get(cacheKey);
    if (cachedData) {
      callback(cachedData);
    }

    const q = query(collection(db, collectionName), ...constraints);
    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Update cache
        this.cacheManager.set(cacheKey, data);
        
        // Call callback with fresh data
        callback(data);
      },
      (error) => {
        console.error(`Error in real-time listener for ${collectionName}:`, error);
        errorCallback?.(error);
      }
    );

    // Store unsubscribe function
    this.activeListeners.set(cacheKey, unsubscribe);
    
    return () => {
      unsubscribe();
      this.activeListeners.delete(cacheKey);
    };
  }

  // Dynamic content management
  async getDynamicContent(contentType: string, id?: string): Promise<DynamicContent | DynamicContent[]> {
    if (!isConfigured || !db) {
      throw new Error('Firebase not configured');
    }

    const cacheKey = `dynamic_content_${contentType}_${id || 'all'}`;
    const cachedData = this.cacheManager.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    try {
      if (id) {
        const docRef = doc(db, 'dynamic_content', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as DynamicContent;
          this.cacheManager.set(cacheKey, data);
          return data;
        } else {
          throw new Error(`Dynamic content not found: ${id}`);
        }
      } else {
        const q = query(
          collection(db, 'dynamic_content'),
          where('type', '==', contentType)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as DynamicContent[];
        
        this.cacheManager.set(cacheKey, data);
        return data;
      }
    } catch (error) {
      console.error('Error fetching dynamic content:', error);
      throw error;
    }
  }

  // Optimized batch operations
  async batchOperation(operations: Array<{
    type: 'set' | 'update' | 'delete';
    collection: string;
    id: string;
    data?: any;
  }>): Promise<void> {
    if (!isConfigured || !db) {
      throw new Error('Firebase not configured');
    }

    const batch = writeBatch(db);
    
    operations.forEach(op => {
      const ref = doc(db, op.collection, op.id);
      
      switch (op.type) {
        case 'set':
          batch.set(ref, {
            ...op.data,
            updatedAt: serverTimestamp()
          }, { merge: true });
          break;
        case 'update':
          batch.update(ref, {
            ...op.data,
            updatedAt: serverTimestamp()
          });
          break;
        case 'delete':
          batch.delete(ref);
          break;
      }
    });

    try {
      await batch.commit();
      
      // Invalidate relevant cache entries
      operations.forEach(op => {
        const cacheKey = `${op.collection}_${op.id}`;
        this.cacheManager.invalidate(cacheKey);
      });
    } catch (error) {
      console.error('Batch operation failed:', error);
      throw error;
    }
  }

  // Pagination with cursor-based navigation
  async paginatedQuery(
    collectionName: string,
    options: PaginationOptions,
    constraints: QueryConstraint[] = []
  ): Promise<{
    data: DocumentData[];
    lastDocument: DocumentSnapshot | null;
    hasMore: boolean;
  }> {
    if (!isConfigured || !db) {
      throw new Error('Firebase not configured');
    }

    const { pageSize, lastDocument, orderByField, orderDirection = 'asc' } = options;
    
    const baseConstraints = [
      orderBy(orderByField, orderDirection),
      limit(pageSize + 1) // Fetch one extra to check if there's more
    ];

    if (lastDocument) {
      baseConstraints.push(startAfter(lastDocument));
    }

    const q = query(collection(db, collectionName), ...baseConstraints, ...constraints);
    const snapshot = await getDocs(q);
    
    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    const dataDocs = hasMore ? docs.slice(0, -1) : docs;
    
    return {
      data: dataDocs.map(doc => ({ id: doc.id, ...doc.data() })),
      lastDocument: dataDocs.length > 0 ? dataDocs[dataDocs.length - 1] : null,
      hasMore
    };
  }

  // Performance monitoring
  async measureQueryPerformance(
    collectionName: string,
    queryFn: () => Promise<any>
  ): Promise<{
    result: any;
    duration: number;
    timestamp: number;
  }> {
    const startTime = performance.now();
    
    try {
      const result = await queryFn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`Query performance: ${collectionName} took ${duration.toFixed(2)}ms`);
      
      return {
        result,
        duration,
        timestamp: Date.now()
      };
    } catch (error) {
      const endTime = performance.now();
      console.error(`Query failed after ${(endTime - startTime).toFixed(2)}ms:`, error);
      throw error;
    }
  }

  // Cleanup and unsubscribe all listeners
  cleanup(): void {
    this.activeListeners.forEach((unsubscribe, key) => {
      unsubscribe();
      console.log(`Unsubscribed from: ${key}`);
    });
    this.activeListeners.clear();
    this.cacheManager.clear();
  }

  // Get connection status
  getConnectionStatus(): {
    isConfigured: boolean;
    activeListeners: number;
    cacheSize: number;
  } {
    return {
      isConfigured,
      activeListeners: this.activeListeners.size,
      cacheSize: this.cacheManager['cache'].size
    };
  }
}

// Export singleton instance
export const dynamicFirebaseService = DynamicFirebaseService.getInstance();