import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  Volume2, 
  VolumeX, 
  Clock, 
  Save, 
  RotateCcw,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock3,
  UserPlus,
  DollarSign,
  Settings,
  ChevronRight,
  Filter
} from 'lucide-react';
import { NotificationType, NotificationChannel, NotificationPriority } from '../../types';
import { notificationService } from '../../services/notificationService';
import { cn } from '../../utils/cn';

interface NotificationPreferencesProps {
  userId: string;
  className?: string;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ 
  userId, 
  className 
}) => {
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'channels' | 'types' | 'schedule'>('channels');

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await notificationService.getUserPreferences(userId);
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, [userId]);

  const handleChannelToggle = (channel: keyof typeof NotificationChannel) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      channels: {
        ...preferences.channels,
        [channel]: !preferences.channels[channel]
      }
    });
  };

  const handleTypeToggle = (type: NotificationType) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      types: {
        ...preferences.types,
        [type]: {
          ...preferences.types[type],
          enabled: !preferences.types[type].enabled
        }
      }
    });
  };

  const handleChannelPriorityChange = (type: NotificationType, channel: NotificationChannel) => {
    if (!preferences) return;
    
    const currentChannels = preferences.types[type].channels;
    const newChannels = currentChannels.includes(channel)
      ? currentChannels.filter((ch: NotificationChannel) => ch !== channel)
      : [...currentChannels, channel];
    
    setPreferences({
      ...preferences,
      types: {
        ...preferences.types,
        [type]: {
          ...preferences.types[type],
          channels: newChannels
        }
      }
    });
  };

  const handlePriorityChange = (type: NotificationType, priority: NotificationPriority) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      types: {
        ...preferences.types,
        [type]: {
          ...preferences.types[type],
          priority
        }
      }
    });
  };

  const handleQuietHoursToggle = () => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      quietHours: {
        ...preferences.quietHours,
        enabled: !preferences.quietHours.enabled
      }
    });
  };

  const handleQuietHoursChange = (field: 'start' | 'end', value: string) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      quietHours: {
        ...preferences.quietHours,
        [field]: value
      }
    });
  };

  const handleDailyDigestToggle = () => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      dailyDigest: {
        ...preferences.dailyDigest,
        enabled: !preferences.dailyDigest.enabled
      }
    });
  };

  const handleDailyDigestTimeChange = (time: string) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      dailyDigest: {
        ...preferences.dailyDigest,
        time
      }
    });
  };

  const handleSave = async () => {
    if (!preferences) return;
    
    try {
      setSaving(true);
      await notificationService.updateUserPreferences(userId, preferences);
      
      // Show success notification
      const event = new CustomEvent('inAppNotification', {
        detail: {
          id: 'preferences-saved',
          title: 'Preferences Saved',
          message: 'Your notification preferences have been updated successfully.',
          type: NotificationType.SUCCESS,
          priority: NotificationPriority.LOW,
          channels: ['in_app'],
          read: false,
          archived: false,
          createdAt: new Date().toISOString(),
          clickedCount: 0
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      
      // Show error notification
      const event = new CustomEvent('inAppNotification', {
        detail: {
          id: 'preferences-error',
          title: 'Save Failed',
          message: 'Failed to save notification preferences. Please try again.',
          type: NotificationType.ERROR,
          priority: NotificationPriority.MEDIUM,
          channels: ['in_app'],
          read: false,
          archived: false,
          createdAt: new Date().toISOString(),
          clickedCount: 0
        }
      });
      window.dispatchEvent(event);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all notification preferences to defaults?')) {
      try {
        setSaving(true);
        await notificationService.updateUserPreferences(userId, {});
        await loadPreferences();
      } catch (error) {
        console.error('Failed to reset preferences:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case NotificationChannel.IN_APP:
        return <Bell className="w-5 h-5" />;
      case NotificationChannel.PUSH:
        return <Smartphone className="w-5 h-5" />;
      case NotificationChannel.EMAIL:
        return <Mail className="w-5 h-5" />;
      case NotificationChannel.SMS:
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
      case NotificationType.PAYMENT_RECEIVED:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case NotificationType.WARNING:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case NotificationType.ERROR:
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case NotificationType.INFO:
      case NotificationType.SYSTEM:
        return <Info className="w-5 h-5 text-blue-500" />;
      case NotificationType.REMINDER:
      case NotificationType.PAYMENT_DUE:
        return <Clock3 className="w-5 h-5 text-orange-500" />;
      case NotificationType.CUSTOMER_CREATED:
        return <UserPlus className="w-5 h-5 text-purple-500" />;
      case NotificationType.DUE_OVERDUE:
        return <DollarSign className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return 'text-red-600 bg-red-50 border-red-200';
      case NotificationPriority.HIGH:
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case NotificationPriority.MEDIUM:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case NotificationPriority.LOW:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={cn('p-6 bg-white dark:bg-gray-800 rounded-lg shadow', className)}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className={cn('p-6 bg-white dark:bg-gray-800 rounded-lg shadow', className)}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Failed to load notification preferences.</p>
          <button
            onClick={loadPreferences}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notification Preferences
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              disabled={saving}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Reset to defaults"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
                saving
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              )}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'channels', label: 'Channels', icon: Bell },
            { id: 'types', label: 'Types', icon: Filter },
            { id: 'schedule', label: 'Schedule', icon: Clock }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'channels' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Notification Channels
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Choose how you want to receive notifications
              </p>
            </div>

            <div className="space-y-4">
              {Object.entries(preferences.channels).map(([channel, enabled]) => (
                <div
                  key={channel}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getChannelIcon(channel as NotificationChannel)}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                        {channel.replace('_', ' ')}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {channel === NotificationChannel.IN_APP && 'Show notifications within the app'}
                        {channel === NotificationChannel.PUSH && 'Send push notifications to your device'}
                        {channel === NotificationChannel.EMAIL && 'Send notifications to your email'}
                        {channel === NotificationChannel.SMS && 'Send text message notifications'}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleChannelToggle(channel as NotificationChannel)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        enabled ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'types' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Notification Types
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Customize which types of notifications you receive and how they're delivered
              </p>
            </div>

            <div className="space-y-6">
              {Object.entries(preferences.types).map(([type, config]: [string, any]) => (
                <div key={type} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(type as NotificationType)}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                          {type.replace('_', ' ')}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {type === NotificationType.INFO && 'General information notifications'}
                          {type === NotificationType.SUCCESS && 'Success and completion notifications'}
                          {type === NotificationType.WARNING && 'Warning and caution notifications'}
                          {type === NotificationType.ERROR && 'Error and failure notifications'}
                          {type === NotificationType.REMINDER && 'Reminder notifications'}
                          {type === NotificationType.PAYMENT_DUE && 'Payment due notifications'}
                          {type === NotificationType.PAYMENT_RECEIVED && 'Payment received notifications'}
                          {type === NotificationType.CUSTOMER_CREATED && 'New customer notifications'}
                          {type === NotificationType.DUE_OVERDUE && 'Overdue payment notifications'}
                          {type === NotificationType.SYSTEM && 'System and maintenance notifications'}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleTypeToggle(type as NotificationType)}
                      className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                        config.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          config.enabled ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </div>

                  {config.enabled && (
                    <div className="space-y-4 pl-8">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Priority Level
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {Object.values(NotificationPriority).map((priority) => (
                            <button
                              key={priority}
                              onClick={() => handlePriorityChange(type as NotificationType, priority)}
                              className={cn(
                                'px-3 py-1 text-sm rounded-full border transition-colors',
                                config.priority === priority
                                  ? getPriorityColor(priority)
                                  : 'text-gray-600 bg-white border-gray-300 hover:bg-gray-50 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'
                              )}
                            >
                              {priority.charAt(0).toUpperCase() + priority.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Delivery Channels
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.values(NotificationChannel).map((channel) => (
                            <label
                              key={channel}
                              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={config.channels.includes(channel)}
                                onChange={() => handleChannelPriorityChange(type as NotificationType, channel)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                                {getChannelIcon(channel)}
                                <span className="capitalize">{channel.replace('_', ' ')}</span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Notification Schedule
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Control when you receive notifications
              </p>
            </div>

            <div className="space-y-6">
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <VolumeX className="w-5 h-5 text-gray-500" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Quiet Hours
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Temporarily disable notifications during specific hours
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleQuietHoursToggle}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      preferences.quietHours.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        preferences.quietHours.enabled ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                {preferences.quietHours.enabled && (
                  <div className="space-y-4 pl-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={preferences.quietHours.start}
                          onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={preferences.quietHours.end}
                          onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Daily Digest
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive a daily summary of your notifications
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleDailyDigestToggle}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      preferences.dailyDigest.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        preferences.dailyDigest.enabled ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                {preferences.dailyDigest.enabled && (
                  <div className="pl-8">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Delivery Time
                    </label>
                    <input
                      type="time"
                      value={preferences.dailyDigest.time}
                      onChange={(e) => handleDailyDigestTimeChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPreferences;