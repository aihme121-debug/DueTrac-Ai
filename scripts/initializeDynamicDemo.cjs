const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Configuration provided by user
const firebaseConfig = {
  apiKey: "AIzaSyA4LFmYUK34TEMlK7o-SCPBdgZpNyZ8KJ8",
  authDomain: "dueall-27bff.firebaseapp.com",
  projectId: "dueall-27bff",
  storageBucket: "dueall-27bff.firebasestorage.app",
  messagingSenderId: "132561668068",
  appId: "1:132561668068:web:fae6325cb5c9d8e71569f1",
  measurementId: "G-0NGHKE44YD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample layouts for the dynamic demo
const sampleLayouts = [
  {
    id: 'dashboard-layout',
    name: 'Dashboard Layout',
    description: 'Main dashboard with metrics and charts',
    components: [
      {
        id: 'header-1',
        type: 'Container',
        props: {
          className: 'bg-blue-600 text-white p-6 rounded-lg mb-6',
          children: [
            {
              id: 'title-1',
              type: 'h1',
              props: {
                className: 'text-3xl font-bold',
                children: 'Dynamic Dashboard'
              }
            },
            {
              id: 'subtitle-1',
              type: 'p',
              props: {
                className: 'text-blue-100 mt-2',
                children: 'Real-time data visualization'
              }
            }
          ]
        }
      },
      {
        id: 'metrics-grid',
        type: 'Grid',
        props: {
          className: 'grid-cols-1 md:grid-cols-3 gap-6 mb-8',
          children: [
            {
              id: 'metric-1',
              type: 'DataCard',
              props: {
                title: 'Total Users',
                value: '1,234',
                change: '+12%',
                icon: 'Users'
              }
            },
            {
              id: 'metric-2',
              type: 'DataCard',
              props: {
                title: 'Revenue',
                value: '$45,678',
                change: '+8%',
                icon: 'DollarSign'
              }
            },
            {
              id: 'metric-3',
              type: 'DataCard',
              props: {
                title: 'Orders',
                value: '892',
                change: '+15%',
                icon: 'ShoppingCart'
              }
            }
          ]
        }
      },
      {
        id: 'data-table-1',
        type: 'DynamicTable',
        props: {
          title: 'Recent Orders',
          collectionName: 'orders',
          columns: [
            { key: 'id', title: 'Order ID' },
            { key: 'customer', title: 'Customer' },
            { key: 'amount', title: 'Amount' },
            { key: 'status', title: 'Status' }
          ],
          pageSize: 10
        }
      }
    ],
    metadata: {
      author: 'system',
      version: '1.0',
      tags: ['dashboard', 'metrics', 'real-time'],
      permissions: {
        read: ['admin', 'manager', 'viewer'],
        write: ['admin', 'manager']
      }
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    id: 'form-layout',
    name: 'User Management Form',
    description: 'User creation and editing form',
    components: [
      {
        id: 'form-container',
        type: 'Container',
        props: {
          className: 'max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg',
          children: [
            {
              id: 'form-title',
              type: 'h2',
              props: {
                className: 'text-2xl font-bold mb-6',
                children: 'Create New User'
              }
            },
            {
              id: 'user-form',
              type: 'DynamicForm',
              props: {
                fields: [
                  {
                    name: 'name',
                    type: 'text',
                    label: 'Full Name',
                    required: true,
                    validation: { minLength: 2, maxLength: 50 }
                  },
                  {
                    name: 'email',
                    type: 'email',
                    label: 'Email Address',
                    required: true,
                    validation: { pattern: '^[\\w._%+-]+@[\\w.-]+\\.[a-zA-Z]{2,}$' }
                  },
                  {
                    name: 'role',
                    type: 'select',
                    label: 'Role',
                    required: true,
                    options: [
                      { value: 'admin', label: 'Administrator' },
                      { value: 'manager', label: 'Manager' },
                      { value: 'user', label: 'User' }
                    ]
                  },
                  {
                    name: 'department',
                    type: 'text',
                    label: 'Department',
                    required: false
                  }
                ],
                onSubmit: 'handleUserCreate',
                submitButtonText: 'Create User'
              }
            }
          ]
        }
      }
    ],
    metadata: {
      author: 'system',
      version: '1.0',
      tags: ['form', 'user-management'],
      permissions: {
        read: ['admin', 'manager'],
        write: ['admin']
      }
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

// Sample data for the dynamic demo
const sampleData = [
  {
    id: 'metric-data-1',
    layoutId: 'dashboard-layout',
    data: {
      'metric-1': {
        title: 'Active Users',
        value: '2,847',
        change: '+15%',
        icon: 'Users',
        trend: 'up'
      },
      'metric-2': {
        title: 'Monthly Revenue',
        value: '$124,567',
        change: '+22%',
        icon: 'DollarSign',
        trend: 'up'
      },
      'metric-3': {
        title: 'Pending Orders',
        value: '156',
        change: '-5%',
        icon: 'ShoppingCart',
        trend: 'down'
      }
    },
    metadata: {
      source: 'analytics',
      lastUpdated: serverTimestamp()
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    id: 'orders-data-1',
    layoutId: 'dashboard-layout',
    data: {
      orders: [
        {
          id: 'ORD-001',
          customer: 'John Smith',
          amount: '$234.50',
          status: 'completed',
          date: '2024-01-15'
        },
        {
          id: 'ORD-002',
          customer: 'Sarah Johnson',
          amount: '$567.80',
          status: 'processing',
          date: '2024-01-16'
        },
        {
          id: 'ORD-003',
          customer: 'Mike Davis',
          amount: '$123.45',
          status: 'pending',
          date: '2024-01-17'
        },
        {
          id: 'ORD-004',
          customer: 'Emily Brown',
          amount: '$890.12',
          status: 'completed',
          date: '2024-01-18'
        },
        {
          id: 'ORD-005',
          customer: 'David Wilson',
          amount: '$456.78',
          status: 'shipped',
          date: '2024-01-19'
        }
      ]
    },
    metadata: {
      source: 'orders-system',
      lastUpdated: serverTimestamp()
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

const initializeDynamicDemo = async () => {
  try {
    console.log('🚀 Initializing Dynamic Demo Collections...');
    
    // Initialize layouts collection
    const layoutsRef = collection(db, 'dynamic_demo_layouts');
    for (const layout of sampleLayouts) {
      const layoutDoc = doc(layoutsRef, layout.id);
      await setDoc(layoutDoc, layout);
      console.log(`✅ Layout created: ${layout.name}`);
    }
    
    // Initialize data collection
    const dataRef = collection(db, 'dynamic_demo_data');
    for (const data of sampleData) {
      const dataDoc = doc(dataRef, data.id);
      await setDoc(dataDoc, data);
      console.log(`✅ Data created: ${data.id}`);
    }
    
    console.log('✅ Dynamic Demo collections initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing Dynamic Demo collections:', error);
    process.exit(1);
  }
};

// Run initialization
initializeDynamicDemo();