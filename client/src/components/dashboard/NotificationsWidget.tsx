import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRealtimeDb } from '@/hooks/useRealtimeDb';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loading, HealthcareLoading } from '@/components/ui/loading';

interface Notification {
  id: string;
  userId: string;
  type: 'appointment_reminder' | 'dose_reminder' | 'health_alert' | 'report_ready' | 'general';
  title: string;
  message: string;
  timestamp: any;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

const NotificationsWidget: React.FC = () => {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const { toast } = useToast();
  const [showAll, setShowAll] = useState(false);
  
  const { 
    data: notifications, 
    markAsRead, 
    remove: removeNotification, 
    loading: notificationsLoading 
  } = useRealtimeDb<Notification>('notifications');

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayNotifications = showAll ? notifications : notifications.slice(0, 5);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      toast({
        title: t('success'),
        description: t('notificationMarkedAsRead'),
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      toast({
        title: t('error'),
        description: t('failedToMarkAsRead'),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await removeNotification(notificationId);
      toast({
        title: t('success'),
        description: t('notificationDeleted'),
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      toast({
        title: t('error'),
        description: t('failedToDeleteNotification'),
        variant: 'destructive',
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_reminder':
        return 'event';
      case 'dose_reminder':
        return 'medication';
      case 'health_alert':
        return 'warning';
      case 'report_ready':
        return 'description';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'bg-red-100 text-red-600';
    if (priority === 'medium') return 'bg-yellow-100 text-yellow-600';
    
    switch (type) {
      case 'appointment_reminder':
        return 'bg-blue-100 text-blue-600';
      case 'dose_reminder':
        return 'bg-green-100 text-green-600';
      case 'health_alert':
        return 'bg-red-100 text-red-600';
      case 'report_ready':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getTimeAgo = (timestamp: any) => {
    if (!timestamp?.toDate) return 'Just now';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {t('notifications')}
            </CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowAll(!showAll)}
            style={{ color: 'hsl(207, 90%, 54%)' }}
          >
            {showAll ? t('showLess') : t('showAll')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {notificationsLoading ? (
            <HealthcareLoading text={t('loadingNotifications')} />
          ) : displayNotifications.length === 0 ? (
            <div className="text-center py-4">
              <span className="material-icons text-gray-400 text-3xl mb-2">notifications_none</span>
              <p className="text-gray-500">{t('noNotifications')}</p>
              <p className="text-sm text-gray-400">{t('allCaughtUp')}</p>
            </div>
          ) : (
            displayNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-3 rounded-lg border transition-colors ${
                  notification.read 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getNotificationColor(notification.type, notification.priority)}`}>
                    <span className="material-icons text-sm">
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`font-medium text-sm ${
                          notification.read ? 'text-gray-600' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </p>
                        <p className={`text-sm mt-1 ${
                          notification.read ? 'text-gray-500' : 'text-gray-700'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {getTimeAgo(notification.timestamp)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1"
                            title={t('markAsRead')}
                          >
                            <span className="material-icons text-xs">check</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                          title={t('deleteNotification')}
                        >
                          <span className="material-icons text-xs">delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {notifications.length > 5 && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <Button 
              variant="link" 
              className="p-0 h-auto hover:text-blue-700" 
              style={{ color: 'hsl(207, 90%, 54%)' }}
            >
              {t('viewAllNotifications', { count: notifications.length })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsWidget;
