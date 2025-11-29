import React, { useState, useEffect } from 'react';
import DynamicLayout from './DynamicLayout';
import { useDynamicContent, useRealTimeData, usePaginatedData } from '../hooks/useDynamicData';
import { useSecurity } from '../hooks/useSecurity';
import { securityService } from '../services/securityService';
import { dynamicFirebaseService } from '../services/dynamicFirebaseService';
import { Container } from './dynamic/Container';
import { Grid } from './dynamic/Grid';
import { Flex } from './dynamic/Flex';
import { Button } from './dynamic/Button';
import { DataCard } from './dynamic/DataCard';
import { DynamicTable } from './dynamic/DynamicTable';
import { DynamicForm } from './dynamic/DynamicForm';
import { AlertCircle, Shield, Database, Zap, Users, Activity } from 'lucide-react';

export const DynamicArchitectureDemo: React.FC = () => {
  const [demoData, setDemoData] = useState<any[]>([]);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLayout, setSelectedLayout] = useState<string>('dashboard-layout');
  
  const { currentUser, login, logout, hasPermission, securityAudit } = useSecurity();
  
  // Load dynamic layouts from Firestore
  const { 
    data: layouts, 
    loading: layoutsLoading, 
    error: layoutsError 
  } = useDynamicContent('dynamic_demo_layouts');
  
  // Load dynamic data from Firestore
  const { 
    data: dynamicData, 
    loading: dataLoading, 
    error: dataError 
  } = useDynamicContent('dynamic_demo_data', {
    filters: { layoutId: selectedLayout }
  });
  
  // Simulate real-time data updates
  const { data: realTimeData, loading: rtLoading } = useRealTimeData('demo_users', {
    filters: { status: 'active' },
    limit: 50
  });

  // Simulate paginated data loading
  const { 
    data: paginatedData, 
    loading: pgLoading, 
    currentPage, 
    totalPages, 
    goToPage 
  } = usePaginatedData('demo_users', {
    pageSize: 10,
    sortBy: 'createdAt',
    sortDirection: 'desc'
  });

  useEffect(() => {
    // Initialize demo user for security testing
    if (!currentUser) {
      login('demo-user', 'user');
    }
  }, [currentUser, login]);

  useEffect(() => {
    setDemoData([]);
  }, []);

  const handleFormSubmit = async (formData: any) => {
    try {
      // Simulate form submission with security
      const sanitizedData = securityService.sanitizeInput(formData);
      
      if (hasPermission('users', 'create')) {
        console.log('✅ Creating new user:', sanitizedData);
        // Add to database
        setDemoData(prev => [...prev, {
          id: Date.now(),
          ...sanitizedData,
          status: 'active',
          lastLogin: new Date().toISOString()
        }]);
      } else {
        console.warn('🚫 Permission denied: Cannot create users');
      }
    } catch (error) {
      console.error('❌ Form submission error:', error);
    }
  };

  const handleRoleSwitch = (role: string) => {
    login(currentUser?.id || 'demo-user', role);
  };

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Layout Selector */}
      <DataCard
        title="Dynamic Layout System"
        subtitle="Select a layout configuration from the database"
        variant="primary"
      >
        {layoutsLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading layouts...</p>
          </div>
        ) : layoutsError ? (
          <div className="text-red-600 bg-red-50 p-4 rounded">
            <AlertCircle className="inline mr-2" size={16} />
            Error loading layouts: {layoutsError}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {layouts.map((layout: any) => (
                <div
                  key={layout.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedLayout === layout.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedLayout(layout.id)}
                >
                  <h4 className="font-semibold text-gray-900">{layout.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{layout.description}</p>
                  <div className="mt-2">
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {layout.components?.length || 0} components
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedLayout && (
              <div className="mt-6 p-4 bg-gray-50 rounded">
                <h4 className="font-semibold mb-2">Selected Layout: {layouts.find((l: any) => l.id === selectedLayout)?.name}</h4>
                <p className="text-sm text-gray-600">
                  This layout will be rendered dynamically from the database configuration.
                </p>
              </div>
            )}
          </div>
        )}
      </DataCard>

      {/* Security Status Card */}
      <DataCard
        title="Security Configuration"
        subtitle={`Current Role: ${currentUser?.role || 'None'}`}
        variant="primary"
        className="mb-6"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Authentication Status:</span>
            <span className={`px-2 py-1 rounded text-sm font-medium ${
              currentUser ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {currentUser ? 'Authenticated' : 'Not Authenticated'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>User Management Permissions:</span>
            <div className="space-x-2">
              <span className={`px-2 py-1 rounded text-xs ${
                hasPermission('users', 'read') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                Read
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                hasPermission('users', 'create') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                Create
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                hasPermission('users', 'update') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                Update
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                hasPermission('users', 'delete') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                Delete
              </span>
            </div>
          </div>

          <div className="flex space-x-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRoleSwitch('user')}
              className={currentUser?.role === 'user' ? 'ring-2 ring-blue-500' : ''}
            >
              User Role
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRoleSwitch('manager')}
              className={currentUser?.role === 'manager' ? 'ring-2 ring-blue-500' : ''}
            >
              Manager Role
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRoleSwitch('admin')}
              className={currentUser?.role === 'admin' ? 'ring-2 ring-blue-500' : ''}
            >
              Admin Role
            </Button>
          </div>
        </div>
      </DataCard>

      {/* Performance Metrics */}
      <Grid cols={2} gap="lg">
        <DataCard
          title="Real-time Data Sync"
          subtitle={`${realTimeData.length} active users`}
          variant="success"
        >
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Connected Users:</span>
              <span className="font-semibold">{realTimeData.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Sync Status:</span>
              <span className="text-green-600 font-semibold">● Live</span>
            </div>
          </div>
        </DataCard>

        <DataCard
          title="Pagination Performance"
          subtitle={`Page ${currentPage} of ${totalPages}`}
          variant="info"
        >
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Current Page:</span>
              <span className="font-semibold">{currentPage}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Pages:</span>
              <span className="font-semibold">{totalPages}</span>
            </div>
            <div className="flex justify-between">
              <span>Loading:</span>
              <span className={pgLoading ? 'text-yellow-600' : 'text-green-600'}>
                {pgLoading ? '● Loading' : '● Ready'}
              </span>
            </div>
          </div>
        </DataCard>
      </Grid>
    </div>
  );

  const renderDataTab = () => (
    <div className="space-y-8">
      <DataCard
        title="Dynamic Data Table"
        subtitle="Real-time synchronized data with full CRUD operations"
        variant="default"
      >
        <DynamicTable
          data={demoData}
          columns={sampleTableColumns}
          searchable={true}
          sortable={true}
          filterable={true}
          pagination={true}
          pageSize={5}
          loading={tableLoading}
          actions={[
            {
              label: 'Edit',
              variant: 'primary',
              onClick: (row) => console.log('Edit user:', row)
            },
            {
              label: 'Delete',
              variant: 'danger',
              condition: (row) => hasPermission('users', 'delete'),
              onClick: (row) => {
                if (hasPermission('users', 'delete')) {
                  setDemoData(prev => prev.filter(item => item.id !== row.id));
                }
              }
            }
          ]}
        />
      </DataCard>

      {hasPermission('users', 'create') && (
        <DataCard
          title="Create New User"
          subtitle="Dynamic form with validation and security"
          variant="default"
        >
          <DynamicForm
            fields={sampleFormFields}
            onSubmit={handleFormSubmit}
            layout="vertical"
            validateOnChange={true}
            submitText="Create User"
            showCancel={true}
            onCancel={() => console.log('Form cancelled')}
          />
        </DataCard>
      )}
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-8">
      <DataCard
        title="Security Audit"
        subtitle="Comprehensive security monitoring and analysis"
        variant={securityAudit?.securityScore > 80 ? 'success' : 'warning'}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{securityAudit?.totalRoles || 0}</div>
            <div className="text-sm text-gray-600">Total Roles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{securityAudit?.enabledRules || 0}</div>
            <div className="text-sm text-gray-600">Active Rules</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{securityAudit?.failedAttempts || 0}</div>
            <div className="text-sm text-gray-600">Failed Attempts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{securityAudit?.securityScore || 0}%</div>
            <div className="text-sm text-gray-600">Security Score</div>
          </div>
        </div>
      </DataCard>

      <DataCard
        title="Recent Access Logs"
        subtitle="Security event monitoring"
        variant="default"
      >
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {securityAudit?.recentAccessLogs?.slice(0, 10).map((log: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${
                  log.success ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                <span className="text-sm font-medium">{log.userId}</span>
              </div>
              <div className="text-sm text-gray-600">
                {log.action} {log.resource}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(log.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </DataCard>
    </div>
  );

  return (
    <Container maxWidth="xl" padding="lg">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Dynamic Application Architecture Demo
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          This demo showcases a fully dynamic application architecture with real-time data synchronization,
          comprehensive security controls, and performance optimization features.
        </p>

        {/* Tab Navigation */}
        <Flex gap="sm" className="border-b border-gray-200 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'data', label: 'Data Management', icon: Database },
            { id: 'security', label: 'Security', icon: Shield }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'primary' : 'ghost'}
                onClick={() => setActiveTab(tab.id)}
                icon={<Icon size={16} />}
                iconPosition="left"
              >
                {tab.label}
              </Button>
            );
          })}
        </Flex>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'data' && renderDataTab()}
          {activeTab === 'security' && renderSecurityTab()}
        </div>

        {/* Dynamic Layout Demo */}
        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Dynamic Layout System
          </h2>
          <p className="text-gray-600 mb-6">
            Below is a demonstration of the dynamic layout system that can render UI components
            entirely from database configurations with real-time updates.
          </p>
          
          {selectedLayout && layouts.length > 0 ? (
            <div className="bg-white p-4 rounded-lg border">
              <DynamicLayout
                layoutId={selectedLayout}
                data={dynamicData.length > 0 ? dynamicData[0].data : {}}
                loading={dataLoading}
                error={dataError}
              />
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-gray-500 mb-0">
                Select a layout from the overview tab to see the dynamic rendering in action.
              </p>
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Zap className="text-blue-600 mr-2" size={20} />
              <h3 className="font-semibold text-blue-900">Real-time Sync</h3>
            </div>
            <p className="text-sm text-blue-700">
              Live data synchronization with Firebase listeners
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Shield className="text-green-600 mr-2" size={20} />
              <h3 className="font-semibold text-green-900">Security</h3>
            </div>
            <p className="text-sm text-green-700">
              Role-based access control with data validation
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Database className="text-purple-600 mr-2" size={20} />
              <h3 className="font-semibold text-purple-900">Performance</h3>
            </div>
            <p className="text-sm text-purple-700">
              Optimized with caching, pagination, and lazy loading
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default DynamicArchitectureDemo;