import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/ui-components';
import { Wifi, WifiOff, RefreshCw, Database, Cloud, HardDrive } from 'lucide-react';

const OfflineSyncTest: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [offlineData, setOfflineData] = useState<any[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');
      // Simulate sync when coming back online
      setTimeout(() => {
        performSync();
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('idle');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const performSync = async () => {
    try {
      setSyncError(null);
      
      // Check if Firebase offline persistence is enabled
      const isOfflinePersistenceEnabled = await checkOfflinePersistence();
      
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setLastSyncTime(new Date());
      setSyncStatus('synced');
      
      // Show success message
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
      
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Sync failed');
      setSyncStatus('error');
      
      setTimeout(() => {
        setSyncStatus('idle');
      }, 5000);
    }
  };

  const checkOfflinePersistence = async (): Promise<boolean> => {
    try {
      // Check if we can access local storage/cache
      const testKey = 'offline_test_' + Date.now();
      localStorage.setItem(testKey, 'test');
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      return retrieved === 'test';
    } catch {
      return false;
    }
  };

  const testOfflineData = () => {
    const testData = {
      id: 'test_' + Date.now(),
      title: 'Test Offline Data',
      timestamp: new Date().toISOString(),
      online: isOnline
    };
    
    setOfflineData(prev => [...prev, testData]);
    
    // Store in localStorage to simulate offline persistence
    try {
      const existing = JSON.parse(localStorage.getItem('offline_test_data') || '[]');
      existing.push(testData);
      localStorage.setItem('offline_test_data', JSON.stringify(existing));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  };

  const loadOfflineData = () => {
    try {
      const stored = localStorage.getItem('offline_test_data');
      if (stored) {
        setOfflineData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  const clearOfflineData = () => {
    setOfflineData([]);
    localStorage.removeItem('offline_test_data');
  };

  useEffect(() => {
    loadOfflineData();
  }, []);

  const getStatusIcon = () => {
    if (isOnline) {
      return <Wifi className="w-5 h-5 text-green-500" />;
    }
    return <WifiOff className="w-5 h-5 text-red-500" />;
  };

  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'synced':
        return <Cloud className="w-5 h-5 text-green-500" />;
      case 'error':
        return <Cloud className="w-5 h-5 text-red-500" />;
      default:
        return <Database className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Offline Sync Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon()}
                <span className="font-medium">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {getSyncIcon()}
                <span className="text-sm text-gray-600">
                  {syncStatus === 'syncing' && 'Syncing...'}
                  {syncStatus === 'synced' && 'Synced'}
                  {syncStatus === 'error' && 'Sync Error'}
                  {syncStatus === 'idle' && 'Ready'}
                </span>
              </div>
            </div>

            {/* Last Sync Time */}
            {lastSyncTime && (
              <div className="text-sm text-gray-600">
                Last synced: {lastSyncTime.toLocaleString()}
              </div>
            )}

            {/* Error Message */}
            {syncError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {syncError}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={performSync}
                disabled={syncStatus === 'syncing' || !isOnline}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 inline mr-2 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                Sync Now
              </button>
              <button
                onClick={testOfflineData}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Test Offline Data
              </button>
              <button
                onClick={clearOfflineData}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Clear Data
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offline Data Display */}
      {offlineData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Offline Data ({offlineData.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {offlineData.map((item, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-gray-600">
                    {new Date(item.timestamp).toLocaleString()} - {item.online ? 'Online' : 'Offline'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">How to Test Offline Sync</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Click "Test Offline Data" to create some test data</li>
            <li>Turn off your internet connection (airplane mode)</li>
            <li>Add more offline data while offline</li>
            <li>Turn internet back on</li>
            <li>Watch the sync process automatically start</li>
            <li>Check if data persists across offline/online cycles</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflineSyncTest;