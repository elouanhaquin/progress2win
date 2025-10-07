import React from 'react';
import { Bell, CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { Card, Button, Badge } from '../components/UI';

const NotificationsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-black">Notifications</h1>
          <p className="text-lg text-neutral-600 font-medium mt-2">
            Stay updated on your progress
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="neutral" size="sm">
            Mark All Read
          </Button>
          <Button variant="danger" size="sm">
            Clear All
          </Button>
        </div>
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-600">Unread</p>
              <p className="text-3xl font-black text-black">3</p>
            </div>
            <div className="w-12 h-12 bg-danger-500 border-2 border-black shadow-neo-sm flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-600">This Week</p>
              <p className="text-3xl font-black text-black">12</p>
            </div>
            <div className="w-12 h-12 bg-primary-500 border-2 border-black shadow-neo-sm flex items-center justify-center">
              <Info className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-600">Total</p>
              <p className="text-3xl font-black text-black">47</p>
            </div>
            <div className="w-12 h-12 bg-secondary-500 border-2 border-black shadow-neo-sm flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <h2 className="text-2xl font-black text-black mb-6">Recent Notifications</h2>
        <div className="space-y-4">
          {/* Mock notifications */}
          {[
            {
              id: 1,
              title: 'Goal Achievement! 🎉',
              message: 'You\'ve reached your weekly fitness target! Keep up the great work!',
              type: 'success',
              isRead: false,
              time: '2 hours ago'
            },
            {
              id: 2,
              title: 'Friend Challenge',
              message: 'Jane Smith invited you to a 30-day fitness challenge!',
              type: 'info',
              isRead: false,
              time: '5 hours ago'
            },
            {
              id: 3,
              title: 'Weekly Reminder',
              message: 'Don\'t forget to log your progress for this week!',
              type: 'warning',
              isRead: false,
              time: '1 day ago'
            },
            {
              id: 4,
              title: 'Leaderboard Update',
              message: 'You\'ve moved up to #2 in the fitness category!',
              type: 'success',
              isRead: true,
              time: '2 days ago'
            },
            {
              id: 5,
              title: 'New Feature',
              message: 'Check out the new comparison tools we\'ve added!',
              type: 'info',
              isRead: true,
              time: '3 days ago'
            },
          ].map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start space-x-4 p-4 border-2 border-black shadow-neo-sm ${
                notification.isRead ? 'bg-neutral-50' : 'bg-white'
              }`}
            >
              <div className={`w-10 h-10 border-2 border-black shadow-neo-sm flex items-center justify-center ${
                notification.type === 'success' ? 'bg-success-500' :
                notification.type === 'warning' ? 'bg-accent-500' :
                notification.type === 'danger' ? 'bg-danger-500' :
                'bg-secondary-500'
              }`}>
                {notification.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : notification.type === 'warning' ? (
                  <AlertCircle className="w-5 h-5 text-black" />
                ) : (
                  <Info className="w-5 h-5 text-white" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${
                    notification.isRead ? 'text-neutral-600' : 'text-black'
                  }`}>
                    {notification.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-danger-500 border border-black rounded-full"></div>
                    )}
                    <button className="text-neutral-400 hover:text-black transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className={`text-sm mt-1 ${
                  notification.isRead ? 'text-neutral-500' : 'text-neutral-600'
                }`}>
                  {notification.message}
                </p>
                <p className="text-xs text-neutral-400 mt-2">{notification.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default NotificationsPage;
