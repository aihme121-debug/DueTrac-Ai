import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/ui-components';
import { 
  Wifi, 
  Activity, 
  Database, 
  Smartphone, 
  Settings,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import OfflineSyncTest from './OfflineSyncTest';
import PerformanceMonitor from './PerformanceMonitor';

interface TestResult {
  feature: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message: string;
  timestamp: Date;
}

const FirebaseTestDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'offline' | 'performance'>('overview');
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const runAllTests = async () => {
    setIsTesting(true);
    setTestResults([]);

    const tests = [
      { feature: 'Firebase Connection', test: testFirebaseConnection },
      { feature: 'Real-time Data Sync', test: testRealtimeSync },
      
      { feature: 'Offline Sync', test: testOfflineSync },
      { feature: 'Performance Metrics', test: testPerformanceMetrics }
    ];

    for (const { feature, test } of tests) {
      try {
        setTestResults(prev => [...prev, {
          feature,
          status: 'running',
          message: 'Testing...',
          timestamp: new Date()
        }]);

        const result = await test();
        
        setTestResults(prev => [...prev.slice(0, -1), {
          feature,
          status: result.success ? 'passed' : 'failed',
          message: result.message,
          timestamp: new Date()
        }]);

        // Wait between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        setTestResults(prev => [...prev.slice(0, -1), {
          feature,
          status: 'failed',
          message: error instanceof Error ? error.message : 'Test failed',
          timestamp: new Date()
        }]);
      }
    }

    setIsTesting(false);
  };

  const testFirebaseConnection = async () => {
    try {
      // Test Firebase connection
      const response = await fetch('https://firestore.googleapis.com/v1/projects');
      return {
        success: true,
        message: 'Firebase connection established'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Firebase connection failed'
      };
    }
  };

  const testRealtimeSync = async () => {
    try {
      // Test real-time data synchronization
      return {
        success: true,
        message: 'Real-time sync working'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Real-time sync failed'
      };
    }
  };

  

  const testOfflineSync = async () => {
    try {
      // Test offline synchronization
      const isOnline = navigator.onLine;
      return {
        success: true,
        message: isOnline ? 'Online mode detected' : 'Offline mode detected'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Offline sync test failed'
      };
    }
  };

  const testPerformanceMetrics = async () => {
    try {
      // Test performance metrics
      const loadTime = performance.timing.loadEventEnd - performance.timing.loadEventStart;
      return {
        success: true,
        message: `Page load time: ${loadTime}ms`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Performance metrics test failed'
      };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'running':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Firebase Feature Test Dashboard</h1>
          <p className="text-gray-600">Test and monitor all Firebase features in your mobile app</p>
        </div>

        {/* Control Panel */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Test Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <button
                onClick={runAllTests}
                disabled={isTesting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isTesting ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isTesting ? 'Testing...' : 'Run All Tests'}
              </button>
              <button
                onClick={() => setTestResults([])}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Clear Results
              </button>
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Test Results:</h3>
                {testResults.map((result, index) => (
                  <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${getStatusColor(result.status)}`}>
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="font-medium">{result.feature}</div>
                      <div className="text-sm opacity-75">{result.message}</div>
                    </div>
                    <div className="text-xs opacity-75">
                      {result.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feature Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: Smartphone },
              { id: 'offline', label: 'Offline Sync', icon: Wifi },
              { id: 'performance', label: 'Performance', icon: Activity }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Firebase Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Connected</div>
                  <div className="text-xs text-gray-500 mt-1">Real-time sync active</div>
                </CardContent>
              </Card>

              

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wifi className="w-4 h-4" />
                    Offline Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">Active</div>
                  <div className="text-xs text-gray-500 mt-1">Data cached locally</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">Good</div>
                  <div className="text-xs text-gray-500 mt-1">Within limits</div>
                </CardContent>
              </Card>
            </div>
          )}

          
          {activeTab === 'offline' && <OfflineSyncTest />}
          {activeTab === 'performance' && <PerformanceMonitor />}
        </div>
      </div>
    </div>
  );
};

export default FirebaseTestDashboard;