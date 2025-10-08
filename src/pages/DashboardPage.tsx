import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Trophy,
  Dumbbell,
  Heart,
  Activity,
  Flame,
  TrendingUp,
  Target
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { LoadingSpinner } from '../components/UI';
import { useAuthStore } from '../stores/authStore';
import { progressApi } from '../services/api';
import { Progress } from '../types';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

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
    <div className="w-full bg-[#FFF5E1]">
      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl sm:text-5xl font-display text-black mb-2">
            Salut {user.firstName}! 👋
          </h1>
          <p className="text-lg sm:text-xl text-black/70">
            Continue ton super parcours fitness!
          </p>
        </div>

        {/* Quick Add Button */}
        <Link to="/progress/add">
          <button className="w-full bg-[#FFD93D] border-3 border-black rounded-xl font-semibold text-lg py-4 px-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 flex items-center justify-center gap-2">
            <Plus className="w-6 h-6" />
            Ajouter un progrès
          </button>
        </Link>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Entrées cette semaine */}
          <div className="bg-[#9D4EDD] border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
            <div className="mb-2">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <p className="text-4xl font-bold text-white mb-1">{weeklyStats.entries}</p>
            <p className="text-sm text-white/80">Entrées cette semaine</p>
          </div>

          {/* Catégories actives */}
          <div className="bg-[#FFD93D] border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
            <div className="mb-2">
              <Target className="w-6 h-6 text-black" />
            </div>
            <p className="text-4xl font-bold text-black mb-1">{weeklyStats.categories.size}</p>
            <p className="text-sm text-black/60">Catégories actives</p>
          </div>

          {/* Moyenne */}
          <div className="bg-[#9D4EDD] border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
            <div className="mb-2">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <p className="text-4xl font-bold text-white mb-1">{weeklyStats.avgValue.toFixed(0)}</p>
            <p className="text-sm text-white/80">Moyenne</p>
          </div>

          {/* Objectifs */}
          <div className="bg-[#FFD93D] border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
            <div className="mb-2">
              <Trophy className="w-6 h-6 text-black" />
            </div>
            <p className="text-4xl font-bold text-black mb-1">{user.goals.length}</p>
            <p className="text-sm text-black/60">Objectifs</p>
          </div>
        </div>

        {/* Chart Section */}
        {!isLoading && chartData.length > 0 && chartData.some(d => d.entries > 0) && (
          <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-display text-black mb-4">Ta semaine</h2>
            <div className="bg-[#FFF5E1] border-2 border-black rounded-xl p-3">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9D4EDD" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#FFD93D" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#000000"
                    strokeWidth={2}
                    tick={{ fill: '#000000', fontWeight: 700, fontSize: 11 }}
                    axisLine={{ stroke: '#000000', strokeWidth: 2 }}
                  />
                  <YAxis
                    stroke="#000000"
                    strokeWidth={2}
                    tick={{ fill: '#000000', fontWeight: 700, fontSize: 11 }}
                    axisLine={{ stroke: '#000000', strokeWidth: 2 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFD93D',
                      border: '3px solid black',
                      borderRadius: '0',
                      boxShadow: '3px 3px 0 0 rgba(0,0,0,1)',
                      fontWeight: 700,
                      padding: '8px 12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="entries"
                    stroke="#000000"
                    strokeWidth={3}
                    fill="url(#colorGradient)"
                    name="Entrées"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Progress */}
        <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-display text-black mb-4">Progrès récents</h2>

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : recentProgress.length > 0 ? (
            <div className="space-y-3">
              {recentProgress.map((entry) => {
                const colors = {
                  strength: '#9D4EDD',
                  cardio: '#9D4EDD',
                  bodyweight: '#9D4EDD',
                  weight_loss: '#FFD93D',
                  nutrition: '#FFD93D',
                };
                const bgColor = colors[entry.category as keyof typeof colors] || '#9D4EDD';

                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 bg-[#FFF5E1] border-2 border-black rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 border-2 border-black rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: bgColor }}
                      >
                        {getCategoryIcon(entry.category)}
                      </div>
                      <div>
                        <p className="font-semibold text-black text-sm capitalize">
                          {entry.metric.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-black/60">
                          {format(new Date(entry.date), 'dd MMM')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-black">
                        {entry.value}
                      </p>
                      {entry.unit && (
                        <p className="text-xs text-black/60">{entry.unit}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFD93D] border-3 border-black rounded-xl mb-3">
                <Dumbbell className="w-8 h-8 text-black" />
              </div>
              <p className="text-base font-semibold text-black mb-1">Aucun progrès encore</p>
              <p className="text-sm text-black/60">Commence ton parcours fitness!</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-display text-black mb-4">Actions rapides</h2>
          <div className="flex flex-col gap-3">
            <Link to="/progress">
              <button className="w-full bg-[#9D4EDD] border-2 border-black rounded-xl font-semibold text-white py-3 px-4 shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Voir tous mes progrès
              </button>
            </Link>
            <Link to="/leaderboard">
              <button className="w-full bg-[#9D4EDD] border-2 border-black rounded-xl font-semibold text-white py-3 px-4 shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Voir le classement
              </button>
            </Link>
          </div>
        </div>

        {/* Goals */}
        {Array.isArray(user.goals) && user.goals.length > 0 && (
          <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-display text-black mb-4">Tes objectifs</h2>
            <div className="space-y-2">
              {user.goals.map((goal, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-[#FFF5E1] border-2 border-black rounded-lg"
                >
                  <div className="w-2 h-2 bg-[#9D4EDD] rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-black">{goal}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
