import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/ui-components';
import { Activity, Clock, MemoryStick, Cpu, Download, Upload, TrendingUp, AlertTriangle } from 'lucide-react';

interface PerformanceMetrics {
  pageLoadTime: number;
  memoryUsage: number;
  networkRequests: number;
  firebaseOperations: number;
  renderTime: number;
  timestamp: number;
}

interface NetworkMetrics {
  downloadSpeed: number;
  uploadSpeed: number;
  latency: number;
  connectionType: string;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
    firebaseOperations: 0,
    renderTime: 0,
    timestamp: Date.now()
  });

  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics>({
    downloadSpeed: 0,
    uploadSpeed: 0,
    latency: 0,
    connectionType: 'unknown'
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);

  // Measure page load performance
  const measurePageLoad = useCallback(() => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        setMetrics(prev => ({ ...prev, pageLoadTime: loadTime }));
      }
    }
  }, []);

  // Measure memory usage
  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      const usedMemory = memoryInfo.usedJSHeapSize / 1024 / 1024; // Convert to MB
      setMetrics(prev => ({ ...prev, memoryUsage: usedMemory }));
      
      // Alert if memory usage is high
      if (usedMemory > 100) { // 100MB threshold
        setAlerts(prev => [...prev, `High memory usage: ${usedMemory.toFixed(2)} MB`]);
      }
    }
  }, []);

  // Measure network performance
  const measureNetworkPerformance = useCallback(async () => {
    try {
      // Test download speed
      const downloadStart = Date.now();
      const testImage = new Image();
      testImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==?' + Date.now();
      
      await new Promise((resolve) => {
        testImage.onload = resolve;
        testImage.onerror = resolve;
        setTimeout(resolve, 1000); // Timeout after 1 second
      });
      
      const downloadTime = Date.now() - downloadStart;
      const downloadSpeed = (1 / downloadTime) * 1000; // KB/s estimate
      
      // Test latency
      const latencyStart = Date.now();
      await fetch(window.location.href, { method: 'HEAD' });
      const latency = Date.now() - latencyStart;
      
      // Get connection type
      const connection = (navigator as any).connection;
      const connectionType = connection?.effectiveType || 'unknown';
      
      setNetworkMetrics({
        downloadSpeed,
        uploadSpeed: downloadSpeed * 0.8, // Estimate upload as 80% of download
        latency,
        connectionType
      });
      
      // Alert if network is slow
      if (latency > 1000) {
        setAlerts(prev => [...prev, `High latency: ${latency}ms`]);
      }
      
    } catch (error) {
      console.error('Network performance test failed:', error);
    }
  }, []);

  // Monitor Firebase operations
  const monitorFirebaseOperations = useCallback(() => {
    // This would be integrated with your Firebase service
    // For now, we'll simulate Firebase operations
    const simulatedOperations = Math.floor(Math.random() * 10) + 1;
    setMetrics(prev => ({ ...prev, firebaseOperations: simulatedOperations }));
  }, []);

  // Monitor render performance
  const measureRenderTime = useCallback(() => {
    const startTime = Date.now();
    
    // Force a re-render and measure time
    requestAnimationFrame(() => {
      const renderTime = Date.now() - startTime;
      setMetrics(prev => ({ ...prev, renderTime }));
      
      // Alert if render time is high
      if (renderTime > 16) { // 16ms = 60fps threshold
        setAlerts(prev => [...prev, `Slow render: ${renderTime}ms`]);
      }
    });
  }, []);

  // Start monitoring
  const startMonitoring = () => {
    setIsMonitoring(true);
    setAlerts([]);
    
    // Initial measurements
    measurePageLoad();
    measureMemoryUsage();
    measureNetworkPerformance();
    monitorFirebaseOperations();
    measureRenderTime();
  };

  // Stop monitoring
  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  // Clear alerts
  const clearAlerts = () => {
    setAlerts([]);
  };

  // Auto-refresh when monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      measureMemoryUsage();
      measureNetworkPerformance();
      monitorFirebaseOperations();
      measureRenderTime();
      setMetrics(prev => ({ ...prev, timestamp: Date.now() }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isMonitoring, measureMemoryUsage, measureNetworkPerformance, monitorFirebaseOperations, measureRenderTime]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-4">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <button
              onClick={startMonitoring}
              disabled={isMonitoring}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Start Monitoring
            </button>
            <button
              onClick={stopMonitoring}
              disabled={!isMonitoring}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Stop Monitoring
            </button>
            <button
              onClick={clearAlerts}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Alerts
            </button>
          </div>

          {isMonitoring && (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm">Monitoring active</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Page Load Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(metrics.pageLoadTime)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.pageLoadTime < 1000 ? 'Fast' : metrics.pageLoadTime < 3000 ? 'Good' : 'Slow'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <MemoryStick className="w-4 h-4" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.memoryUsage.toFixed(1)} MB
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.memoryUsage < 50 ? 'Low' : metrics.memoryUsage < 100 ? 'Medium' : 'High'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Render Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(metrics.renderTime)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.renderTime < 16 ? '60 FPS' : metrics.renderTime < 33 ? '30 FPS' : 'Slow'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="w-4 h-4" />
              Firebase Ops
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.firebaseOperations}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              operations/min
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Speed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {networkMetrics.downloadSpeed.toFixed(1)} KB/s
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {networkMetrics.connectionType}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {networkMetrics.latency}ms
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {networkMetrics.latency < 100 ? 'Excellent' : networkMetrics.latency < 300 ? 'Good' : 'Poor'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Alerts */}
      {alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-4 h-4" />
              Performance Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {alerts.map((alert, index) => (
                <div key={index} className="text-sm text-red-700">
                  • {alert}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">How to Use Performance Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Click "Start Monitoring" to begin tracking performance</li>
            <li>Use your app normally to see real-time metrics</li>
            <li>Watch for alerts when performance degrades</li>
            <li>Test offline mode to see how it affects performance</li>
            <li>Stop monitoring when you're done testing</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;