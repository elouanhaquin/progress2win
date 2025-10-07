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
  Activity,
  Dumbbell,
  Heart,
  Flame
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, Button, Badge, LoadingSpinner } from '../components/UI';
import { useAuthStore } from '../stores/authStore';
import { progressApi } from '../services/api';
import { Progress } from '../types';
import { format, subDays, startOfWeek, endOfWeek, parseISO } from 'date-fns';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [allProgress, setAllProgress] = useState<Progress[]>([]);
  const [recentProgress, setRecentProgress] = useState<Progress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyStats, setWeeklyStats] = useState({
    entries: 0,
    categories: new Set<string>(),
    avgValue: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load user progress
      const userProgress = await progressApi.getAll(user.id);
      setAllProgress(userProgress);
      setRecentProgress(userProgress.slice(0, 5));

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

      // Prepare chart data (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayEntries = userProgress.filter(p => p.date === dateStr);

        return {
          date: format(date, 'MMM dd'),
          entries: dayEntries.length,
          totalValue: dayEntries.reduce((sum, p) => sum + p.value, 0),
        };
      });

      setChartData(last7Days);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength': return <Dumbbell className="w-5 h-5 text-white" />;
      case 'cardio': return <Heart className="w-5 h-5 text-white" />;
      case 'bodyweight': return <Activity className="w-5 h-5 text-white" />;
      case 'weight_loss': return <TrendingUp className="w-5 h-5 text-white" />;
      case 'nutrition': return <Flame className="w-5 h-5 text-white" />;
      default: return <Target className="w-5 h-5 text-white" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strength': return 'primary';
      case 'cardio': return 'danger';
      case 'bodyweight': return 'secondary';
      case 'weight_loss': return 'success';
      case 'nutrition': return 'accent';
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
        {/* Recent Progress & Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart */}
          <Card>
            <h2 className="text-2xl font-black text-black mb-6">Activity Overview (Last 7 Days)</h2>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
              </div>
            ) : chartData.length > 0 && chartData.some(d => d.entries > 0) ? (
              <div className="border-4 border-black bg-white p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={1}/>
                        <stop offset="95%" stopColor="#93c5fd" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="0"
                      stroke="#000000"
                      strokeWidth={2}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="#000000"
                      strokeWidth={3}
                      tick={{ fill: '#000000', fontWeight: 800, fontSize: 12 }}
                      axisLine={{ stroke: '#000000', strokeWidth: 3 }}
                    />
                    <YAxis
                      stroke="#000000"
                      strokeWidth={3}
                      tick={{ fill: '#000000', fontWeight: 800, fontSize: 12 }}
                      axisLine={{ stroke: '#000000', strokeWidth: 3 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fbbf24',
                        border: '3px solid black',
                        borderRadius: '0',
                        boxShadow: '4px 4px 0 0 rgba(0,0,0,1)',
                        fontWeight: 800,
                        padding: '8px 12px'
                      }}
                      labelStyle={{
                        color: '#000000',
                        fontWeight: 800,
                        marginBottom: '4px'
                      }}
                      itemStyle={{
                        color: '#000000',
                        fontWeight: 700
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="entries"
                      stroke="#000000"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorEntries)"
                      name="Entries"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600">No data for the last 7 days</p>
              </div>
            )}
          </Card>

          {/* Recent Progress */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-black">Recent Progress</h2>
              <Link to="/progress">
                <Button variant="neutral" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            {isLoading ? (
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
                          {entry.category.replace(/_/g, ' ')} - {entry.metric.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {format(new Date(entry.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-black">
                        {entry.value} {entry.unit || ''}
                      </p>
                      <Badge variant={getCategoryColor(entry.category) as any}>
                        {entry.category.replace(/_/g, ' ')}
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
                <p className="text-neutral-600 mb-4">Start tracking your fitness progress today!</p>
                <Link to="/progress">
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
              <Link to="/progress" className="block">
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
              <h3 className="text-xl font-black text-black">Your Fitness Goals</h3>
              <Link to="/settings">
                <Button variant="neutral" size="sm">
                  Edit
                </Button>
              </Link>
            </div>

            {Array.isArray(user.goals) && user.goals.length > 0 ? (
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
                <p className="text-sm text-neutral-600 mb-3">No fitness goals set yet</p>
                <Link to="/settings">
                  <Button variant="primary" size="sm">
                    Set Goals
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
