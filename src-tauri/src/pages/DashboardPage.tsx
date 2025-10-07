import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Calendar,
  Plus,
  Trophy,
  Users,
  Activity
} from 'lucide-react';
import { Card, Button, Badge, LoadingSpinner } from '../components/UI';
import { useAuthStore } from '../stores/authStore';
import { useAppStore } from '../stores/appStore';
import { progressApi, settingsApi } from '../services/api';
import { Progress, Metrics } from '../types';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    progress, 
    setProgress, 
    isLoadingProgress, 
    setProgressLoading,
    metrics,
    setMetrics,
    isLoadingMetrics,
    setMetricsLoading
  } = useAppStore();

  const [recentProgress, setRecentProgress] = useState<Progress[]>([]);
  const [weeklyStats, setWeeklyStats] = useState({
    entries: 0,
    categories: new Set<string>(),
    avgValue: 0,
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setProgressLoading(true);
      setMetricsLoading(true);

      // Load user progress
      const userProgress = await progressApi.getUserProgress(user.id, 10, 0);
      setProgress(userProgress);
      setRecentProgress(userProgress.slice(0, 5));

      // Load metrics
      const appMetrics = await settingsApi.getMetrics();
      setMetrics(appMetrics);

      // Calculate weekly stats
      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());
      
      const weeklyEntries = userProgress.filter(p => {
        const entryDate = new Date(p.date);
        return entryDate >= weekStart && entryDate <= weekEnd;
      });

      const categories = new Set(weeklyEntries.map(p => p.category));
      const avgValue = weeklyEntries.length > 0 
        ? weeklyEntries.reduce((sum, p) => sum + p.value, 0) / weeklyEntries.length 
        : 0;

      setWeeklyStats({
        entries: weeklyEntries.length,
        categories,
        avgValue,
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setProgressLoading(false);
      setMetricsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fitness': return <Activity className="w-5 h-5" />;
      case 'health': return <TrendingUp className="w-5 h-5" />;
      case 'learning': return <BarChart3 className="w-5 h-5" />;
      case 'productivity': return <Target className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fitness': return 'primary';
      case 'health': return 'success';
      case 'learning': return 'secondary';
      case 'productivity': return 'accent';
      default: return 'neutral';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-black">
            Welcome back, {user.firstName}! 👋
          </h1>
          <p className="text-lg text-neutral-600 font-medium mt-2">
            Ready to crush your goals today?
          </p>
        </div>
        <Link to="/progress/add">
          <Button variant="accent" size="lg" icon={<Plus className="w-5 h-5" />}>
            Add Progress
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-600">This Week</p>
              <p className="text-3xl font-black text-black">{weeklyStats.entries}</p>
              <p className="text-xs text-neutral-500">entries logged</p>
            </div>
            <div className="w-12 h-12 bg-primary-500 border-2 border-black shadow-neo-sm flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-600">Categories</p>
              <p className="text-3xl font-black text-black">{weeklyStats.categories.size}</p>
              <p className="text-xs text-neutral-500">active areas</p>
            </div>
            <div className="w-12 h-12 bg-secondary-500 border-2 border-black shadow-neo-sm flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-600">Avg Value</p>
              <p className="text-3xl font-black text-black">
                {weeklyStats.avgValue.toFixed(1)}
              </p>
              <p className="text-xs text-neutral-500">this week</p>
            </div>
            <div className="w-12 h-12 bg-accent-500 border-2 border-black shadow-neo-sm flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-black" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-600">Goals</p>
              <p className="text-3xl font-black text-black">{user.goals.length}</p>
              <p className="text-xs text-neutral-500">set targets</p>
            </div>
            <div className="w-12 h-12 bg-success-500 border-2 border-black shadow-neo-sm flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Progress */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-black">Recent Progress</h2>
              <Link to="/progress">
                <Button variant="neutral" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            {isLoadingProgress ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner />
              </div>
            ) : recentProgress.length > 0 ? (
              <div className="space-y-4">
                {recentProgress.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 bg-neutral-50 border-2 border-black shadow-neo-sm"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 border-2 border-black shadow-neo-sm flex items-center justify-center bg-${getCategoryColor(entry.category)}-500`}>
                        {getCategoryIcon(entry.category)}
                      </div>
                      <div>
                        <p className="font-semibold text-black capitalize">
                          {entry.category} - {entry.metric}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {format(new Date(entry.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-black">
                        {entry.value} {entry.unit}
                      </p>
                      <Badge variant={getCategoryColor(entry.category) as any}>
                        {entry.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-neutral-200 border-2 border-black shadow-neo-sm mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-neutral-500" />
                </div>
                <h3 className="text-lg font-bold text-black mb-2">No Progress Yet</h3>
                <p className="text-neutral-600 mb-4">Start tracking your progress to see it here!</p>
                <Link to="/progress/add">
                  <Button variant="primary">
                    Add Your First Entry
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions & Goals */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <h3 className="text-xl font-black text-black mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/progress/add" className="block">
                <Button variant="primary" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Log Progress
                </Button>
              </Link>
              <Link to="/compare" className="block">
                <Button variant="secondary" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Compare Progress
                </Button>
              </Link>
              <Link to="/leaderboard" className="block">
                <Button variant="accent" className="w-full justify-start">
                  <Trophy className="w-4 h-4 mr-2" />
                  View Leaderboard
                </Button>
              </Link>
            </div>
          </Card>

          {/* Goals */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-black">Your Goals</h3>
              <Link to="/settings">
                <Button variant="neutral" size="sm">
                  Edit
                </Button>
              </Link>
            </div>
            
            {user.goals.length > 0 ? (
              <div className="space-y-2">
                {user.goals.map((goal, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-neutral-50 border border-black"
                  >
                    <div className="w-2 h-2 bg-primary-500 border border-black mr-3"></div>
                    <span className="text-sm font-medium text-black">{goal}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-neutral-600 mb-3">No goals set yet</p>
                <Link to="/settings">
                  <Button variant="primary" size="sm">
                    Set Goals
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Global Stats */}
          {metrics && (
            <Card>
              <h3 className="text-xl font-black text-black mb-4">Global Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Total Users</span>
                  <span className="font-semibold text-black">{metrics.totalUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Total Entries</span>
                  <span className="font-semibold text-black">{metrics.totalProgressEntries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Popular Category</span>
                  <span className="font-semibold text-black capitalize">
                    {metrics.mostPopularCategory || 'N/A'}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
