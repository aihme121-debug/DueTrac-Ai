// Dynamic Demo Firestore Collection Structure
// Collection: dynamic_demo_layouts
// Collection: dynamic_demo_data

export interface DynamicDemoLayout {
  id: string;
  name: string;
  layout: {
    id: string;
    name: string;
    components: Array<{
      id: string;
      type: 'layout' | 'form' | 'table' | 'chart' | 'custom';
      component: string;
      props: Record<string, any>;
      children?: any[];
      visibility?: {
        condition: string;
        dependencies: string[];
      };
    }>;
    metadata: {
      version: number;
      lastModified: string;
      author: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface DynamicDemoData {
  id: string;
  layoutId: string;
  data: Record<string, any>;
  type: 'metrics' | 'users' | 'performance' | 'security';
  createdAt: string;
  updatedAt: string;
}

// Sample data structure for dynamic demo
export const createSampleDemoLayout = (): DynamicDemoLayout => ({
  id: 'demo-dashboard-v1',
  name: 'Dynamic Architecture Demo',
  layout: {
    id: 'demo-dashboard',
    name: 'Dynamic Architecture Demo',
    components: [
      {
        id: 'header-section',
        type: 'layout',
        component: 'Container',
        props: {
          maxWidth: 'xl',
          padding: 'lg',
          background: 'white',
          rounded: true,
          shadow: 'md'
        },
        children: [
          {
            id: 'title',
            type: 'custom',
            component: 'Typography',
            props: {
              variant: 'h1',
              text: 'Dynamic Architecture Demo',
              className: 'text-3xl font-bold text-gray-900 mb-2'
            }
          }
        ]
      },
      {
        id: 'metrics-grid',
        type: 'layout',
        component: 'Grid',
        props: {
          columns: 4,
          gap: 4,
          className: 'mb-8'
        },
        children: [
          {
            id: 'realtime-metric',
            type: 'custom',
            component: 'DataCard',
            props: {
              title: 'Real-time Updates',
              value: 'Active',
              icon: 'Zap',
              color: 'green'
            }
          },
          {
            id: 'security-metric',
            type: 'custom',
            component: 'DataCard',
            props: {
              title: 'Security Status',
              value: 'Secure',
              icon: 'Shield',
              color: 'blue'
            }
          },
          {
            id: 'performance-metric',
            type: 'custom',
            component: 'DataCard',
            props: {
              title: 'Performance',
              value: 'Optimal',
              icon: 'Activity',
              color: 'purple'
            }
          },
          {
            id: 'database-metric',
            type: 'custom',
            component: 'DataCard',
            props: {
              title: 'Database Status',
              value: 'Connected',
              icon: 'Database',
              color: 'indigo'
            }
          }
        ]
      }
    ],
    metadata: {
      version: 1,
      lastModified: new Date().toISOString(),
      author: 'system'
    }
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

export const createSampleDemoData = (): DynamicDemoData[] => [
  {
    id: 'metrics-realtime',
    layoutId: 'demo-dashboard-v1',
    data: {
      connections: 42,
      updatesPerSecond: 15,
      latency: 45,
      uptime: 99.8
    },
    type: 'metrics',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'security-status',
    layoutId: 'demo-dashboard-v1',
    data: {
      activeUsers: 128,
      failedAttempts: 3,
      blockedIPs: 2,
      securityScore: 98
    },
    type: 'security',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'performance-stats',
    layoutId: 'demo-dashboard-v1',
    data: {
      avgResponseTime: 120,
      cacheHitRate: 87,
      memoryUsage: 65,
      cpuUsage: 45
    },
    type: 'performance',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'user-activity',
    layoutId: 'demo-dashboard-v1',
    data: {
      totalUsers: 256,
      activeUsers: 84,
      newUsers: 12,
      returningUsers: 72
    },
    type: 'users',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];