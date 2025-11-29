import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { DueItem, PaymentStatus, PaymentTransaction } from '../types';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Users, 
  Calendar,
  Activity,
  Target,
  BarChart3,
  RefreshCw,
  Download
} from 'lucide-react';
import { ModernCard, ModernBadge, ModernProgress } from '../utils/uiComponents';
import { DashboardSkeleton } from './Skeletons';
import { useLoading } from '../hooks/useLoading';
import { useErrorHandling } from './hooks/useErrorHandling';
import { ErrorState } from './ErrorState';
import { ExportModal } from './ExportModal';

interface DashboardProps {
  dues: DueItem[];
  payments: PaymentTransaction[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onQuickAction?: (action: string) => void;
  onRecordPayment?: () => void;
  onAddCustomer?: () => void;
  onScheduleDue?: () => void;
  onViewReports?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  dues, 
  payments, 
  isLoading = false,
  onRefresh,
  onQuickAction,
  onRecordPayment,
  onAddCustomer,
  onScheduleDue,
  onViewReports
}) => {
  const [animatedValues, setAnimatedValues] = useState({
    totalOutstanding: 0,
    overdue: 0,
    collected: 0,
    pending: 0,
    collectionRate: 0
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const hasAnimatedRef = useRef(false);
  const [hasEntered, setHasEntered] = useState(false);
  const { isLoading: localLoading, withLoading } = useLoading();
  const { errorState, showError, showSuccess } = useErrorHandling();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Dynamic quick action handlers
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'payment':
        if (onRecordPayment) {
          onRecordPayment();
        } else if (onQuickAction) {
          onQuickAction(action);
        }
        break;
      case 'customer':
        if (onAddCustomer) {
          onAddCustomer();
        } else if (onQuickAction) {
          onQuickAction(action);
        }
        break;
      case 'schedule':
        if (onScheduleDue) {
          onScheduleDue();
        } else if (onQuickAction) {
          onQuickAction(action);
        }
        break;
      case 'reports':
        if (onViewReports) {
          onViewReports();
        } else if (onQuickAction) {
          onQuickAction(action);
        }
        break;
      default:
        if (onQuickAction) {
          onQuickAction(action);
        }
    }
  };

  // Dynamic quick actions data based on current state
  const quickActions = useMemo(() => {
    const overdueCount = dues.filter(d => d.status === PaymentStatus.OVERDUE).length;
    const pendingCount = dues.filter(d => d.status === PaymentStatus.PENDING).length;
    
    return [
      { 
        icon: DollarSign, 
        title: 'Record Payment', 
        color: 'bg-success-500', 
        action: 'payment',
        badge: pendingCount > 0 ? pendingCount : null,
        description: `${pendingCount} pending payments`
      },
      { 
        icon: Users, 
        title: 'Add Customer', 
        color: 'bg-primary-500', 
        action: 'customer',
        description: 'Add new customer'
      },
      { 
        icon: Calendar, 
        title: 'Schedule Due', 
        color: 'bg-warning-500', 
        action: 'schedule',
        badge: overdueCount > 0 ? overdueCount : null,
        description: `${overdueCount} overdue dues`
      },
      { 
        icon: Activity, 
        title: 'View Reports', 
        color: 'bg-secondary-500', 
        action: 'reports',
        description: 'View detailed analytics'
      }
    ];
  }, [dues]);

  // Calculate dynamic metrics from actual data
  const totalDue = dues.reduce((acc, curr) => acc + curr.amount, 0);
  const paid = dues.filter(d => d.status === PaymentStatus.PAID).reduce((acc, curr) => acc + curr.amount, 0);
  const overdue = dues.filter(d => d.status === PaymentStatus.OVERDUE).reduce((acc, curr) => acc + (curr.amount - curr.paidAmount), 0);
  const pending = dues.filter(d => d.status === PaymentStatus.PENDING).reduce((acc, curr) => acc + (curr.amount - curr.paidAmount), 0);
  const partial = dues.filter(d => d.status === PaymentStatus.PARTIAL).reduce((acc, curr) => acc + (curr.amount - curr.paidAmount), 0);
  
  const collectionRate = totalDue > 0 ? Math.round((paid / totalDue) * 100) : 0;

  // Calculate dynamic trends based on last 30 days
  const last30Days = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPayments = payments.filter(p => new Date(p.paymentDate) >= thirtyDaysAgo);
    const recentPaidAmount = recentPayments.reduce((sum, p) => sum + p.amount, 0);
    
    const previous30Days = new Date();
    previous30Days.setDate(previous30Days.getDate() - 60);
    const previousPayments = payments.filter(p => 
      new Date(p.paymentDate) >= previous30Days && new Date(p.paymentDate) < thirtyDaysAgo
    );
    const previousPaidAmount = previousPayments.reduce((sum, p) => sum + p.amount, 0);
    
    const changePercent = previousPaidAmount > 0 
      ? Math.round(((recentPaidAmount - previousPaidAmount) / previousPaidAmount) * 100)
      : 0;
    
    return {
      recentPaidAmount,
      previousPaidAmount,
      changePercent,
      paymentCount: recentPayments.length
    };
  }, [payments]);

  // Generate real monthly data from payments and dues
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const monthlyStats = months.map((month, index) => {
      // Calculate the target month (last 6 months for display)
      const targetMonth = (currentMonth - 5 + index + 12) % 12;
      const targetYear = new Date().getFullYear() - (currentMonth - 5 + index < 0 ? 1 : 0);
      
      // Get first and last day of target month
      const firstDay = new Date(targetYear, targetMonth, 1);
      const lastDay = new Date(targetYear, targetMonth + 1, 0);
      
      // Calculate due amounts for this month
      const monthlyDues = dues.filter(due => {
        const dueDate = new Date(due.dueDate);
        return dueDate >= firstDay && dueDate <= lastDay;
      });
      const totalDue = monthlyDues.reduce((sum, due) => sum + due.amount, 0);
      
      // Calculate collected amounts for this month
      const monthlyPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate >= firstDay && paymentDate <= lastDay;
      });
      const totalCollected = monthlyPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      return {
        month: months[targetMonth],
        due: totalDue,
        collected: totalCollected
      };
    });
    
    // Return only last 6 months
    return monthlyStats.slice(-6);
  }, [dues, payments]);

  // Animate values on load
  useEffect(() => {
    const hasData = (overdue + pending + paid) > 0;

    if (hasAnimatedRef.current) {
      setAnimatedValues({
        totalOutstanding: overdue + pending,
        overdue,
        collected: paid,
        pending,
        collectionRate,
      });
      return;
    }

    if (!hasData) {
      setAnimatedValues({
        totalOutstanding: 0,
        overdue: 0,
        collected: 0,
        pending: 0,
        collectionRate: 0,
      });
      return;
    }

    const duration = 1200;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setAnimatedValues({
        totalOutstanding: Math.round((overdue + pending) * easeOutQuart),
        overdue: Math.round(overdue * easeOutQuart),
        collected: Math.round(paid * easeOutQuart),
        pending: Math.round(pending * easeOutQuart),
        collectionRate: Math.round(collectionRate * easeOutQuart),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        hasAnimatedRef.current = true;
      }
    }, interval);

    return () => clearInterval(timer);
  }, [overdue, pending, paid, collectionRate]);

  useEffect(() => {
    setHasEntered(true);
  }, []);

  // Real-time data refresh
  useEffect(() => {
    setLastUpdated(new Date());
  }, [dues, payments]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      window.dispatchEvent(new CustomEvent('dashboard:refresh'));
    }, 30000);
    return () => clearInterval(refreshInterval);
  }, []);

  const handleRefresh = async () => {
    if (onRefresh) {
      try {
        await withLoading(onRefresh());
        showSuccess('Dashboard data refreshed successfully');
      } catch (error) {
        showError('Failed to refresh dashboard data');
        console.error('Dashboard refresh error:', error);
      }
    }
  };

  const pieData = [
    { name: 'Paid', value: paid, color: '#22c55e', icon: CheckCircle },
    { name: 'Overdue', value: overdue, color: '#ef4444', icon: AlertTriangle },
    { name: 'Pending', value: pending, color: '#f59e0b', icon: Clock },
    { name: 'Partial', value: partial, color: '#8b5cf6', icon: Activity }
  ].filter(d => d.value > 0);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    subtitle, 
    trend, 
    loading = false
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string; 
    subtitle: string; 
    trend?: { value: number; isPositive: boolean };
    loading?: boolean;
  }) => (
    <ModernCard 
      variant="elevated" 
      className={`group transition-all duration-300 ${!hasEntered ? 'animate-slide-in-up' : ''} ${hasEntered ? 'hover:scale-105' : ''}`}
      hover
      glow
      animated={false}
    >
      <div className="p-4 space-y-3">
        {loading ? (
          <>
            <div className="flex items-center justify-between">
              <Skeleton width={120} height={20} rounded />
              <Skeleton width={60} height={24} rounded />
            </div>
            <div className="space-y-2">
              <Skeleton height={32} rounded />
              <Skeleton height={16} width={140} rounded />
              <Skeleton height={12} width={80} rounded />
            </div>
            <Skeleton height={8} rounded />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                <Icon size={20} className="text-white" />
              </div>
              {trend && (
                <ModernBadge 
                  variant={trend.isPositive ? 'success' : 'danger'} 
                  size="sm"
                  className="animate-fade-in"
                >
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </ModernBadge>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                ${typeof value === 'number' ? value.toLocaleString() : value}
              </div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {subtitle}
              </div>
            </div>
            
            <ModernProgress 
              value={typeof value === 'number' ? Math.min(value / 1000, 100) : 50} 
              max={100} 
              variant={color.includes('red') ? 'danger' : color.includes('green') ? 'success' : color.includes('yellow') ? 'warning' : 'primary'}
              gradient
              animated
              className="mt-4"
            />
          </>
        )}
      </div>
    </ModernCard>
  );

  if (isLoading || localLoading) {
    return <DashboardSkeleton />;
  }

  if (errorState.isError) {
    return (
      <ErrorState
        title="Dashboard Error"
        message={errorState.errorMessage}
        onRetry={onRefresh}
        showDetails={true}
        error={errorState.error || undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Data Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>Live data</span>
          <span className="text-gray-400">•</span>
          <span>Updated {lastUpdated.toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {dues.length} dues • {payments.length} payments
          </span>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            title="Export data"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleRefresh}
            disabled={localLoading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${localLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Animated Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Outstanding"
          value={animatedValues.totalOutstanding}
          icon={DollarSign}
          color="bg-gradient-primary"
          subtitle="Track actively"
          trend={{ value: Math.abs(last30Days.changePercent), isPositive: last30Days.changePercent >= 0 }}
        />
        
        <StatCard
          title="Overdue"
          value={animatedValues.overdue}
          icon={AlertTriangle}
          color="bg-gradient-danger"
          subtitle="Needs attention"
          trend={{ value: dues.filter(d => d.status === PaymentStatus.OVERDUE).length, isPositive: false }}
        />
        
        <StatCard
          title="Collected"
          value={animatedValues.collected}
          icon={CheckCircle}
          color="bg-gradient-success"
          subtitle={`${animatedValues.collectionRate}% collection rate`}
          trend={{ value: last30Days.recentPaidAmount / 1000, isPositive: true }}
        />
        
        <StatCard
          title="Pending"
          value={animatedValues.pending}
          icon={Clock}
          color="bg-gradient-warning"
          subtitle="Upcoming payments"
          trend={{ value: dues.filter(d => d.status === PaymentStatus.PENDING).length, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModernCard variant="elevated" className={hasEntered ? '' : 'animate-slide-in-left'} hover animated={false}>
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
                <Target size={20} className="text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-800">Payment Status Overview</div>
                <div className="text-sm text-gray-500">Current payment distribution</div>
              </div>
            </div>
            <div className="h-80">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)'
                      }}
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <Target size={24} className="text-gray-400" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium">No data available</div>
                    <div className="text-sm">Add some dues to see payment distribution</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ModernCard>

        <ModernCard variant="elevated" className={hasEntered ? '' : 'animate-slide-in-right'} hover animated={false}>
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center">
                <BarChart3 size={20} className="text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-800">Monthly Collection Trend</div>
                <div className="text-sm text-gray-500">Collection vs Due amounts</div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={monthlyData} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  onClick={(data) => {
                    if (data && data.activePayload && data.activePayload.length > 0) {
                      const monthData = data.activePayload[0].payload;
                      const collectionRate = monthData.due > 0 ? Math.round((monthData.collected / monthData.due) * 100) : 0;
                      showSuccess(`${monthData.month}: ₹${monthData.collected.toLocaleString()} collected out of ₹${monthData.due.toLocaleString()} due (${collectionRate}% collection rate)`);
                    }
                  }}
                >
                  <defs>
                    <linearGradient id="collectedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#16a34a" stopOpacity={0.6} />
                    </linearGradient>
                    <linearGradient id="dueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#d97706" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)'
                    }}
                    formatter={(value: number, name: string) => [
                      `₹${Number(value).toLocaleString()}`, 
                      name === 'collected' ? 'Collected' : 'Due Amount'
                    ]}
                  />
                  <Bar dataKey="collected" fill="url(#collectedGradient)" radius={4} name="collected" />
                  <Bar dataKey="due" fill="url(#dueGradient)" radius={4} name="due" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-b from-green-500 to-green-600 rounded"></div>
                <span>Collected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-b from-amber-500 to-amber-600 rounded"></div>
                <span>Due</span>
              </div>
              <div className="text-xs font-medium">
                Total Collection Rate: {monthlyData.reduce((acc, month) => acc + month.collected, 0) > 0 && monthlyData.reduce((acc, month) => acc + month.due, 0) > 0 
                  ? Math.round((monthlyData.reduce((acc, month) => acc + month.collected, 0) / monthlyData.reduce((acc, month) => acc + month.due, 0)) * 100) 
                  : 0}%
              </div>
            </div>
          </div>
        </ModernCard>
      </div>

      <ModernCard variant="elevated" className={hasEntered ? '' : 'animate-fade-in'} hover animated={false}>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-purple rounded-xl flex items-center justify-center">
              <Activity size={20} className="text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-800">Quick Actions</div>
              <div className="text-sm text-gray-500">Manage your finances efficiently</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((item, index) => (
              <button
                key={item.action}
                onClick={() => handleQuickAction(item.action)}
                className="group relative p-4 rounded-xl bg-gray-50 hover:bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:scale-105 hover:shadow-md"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {item.badge && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {item.badge}
                  </div>
                )}
                <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <item.icon size={18} className="text-white" />
                </div>
                <div className="text-sm font-medium text-gray-800 group-hover:text-gray-900">
                  {item.title}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {item.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </ModernCard>
      
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        dues={dues}
        payments={payments}
        customers={[]}
        onExportComplete={(result) => {
          showSuccess(`Exported ${result.recordCount} records successfully`);
        }}
      />
    </div>
  );
}

export default Dashboard;