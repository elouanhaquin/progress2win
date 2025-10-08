import React, { useState, useEffect } from 'react';
import { Target, Plus, TrendingUp, Calendar, Award, X, Edit2, Trash2, BarChart3 } from 'lucide-react';
import { Card, Button, Input, Alert, LoadingSpinner, Badge } from '../components/UI';
import { progressApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { PROGRESS_CATEGORIES, COMMON_METRICS } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { Progress } from '../types';

interface Goal {
  id: string;
  category: string;
  metric: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  deadline: string;
  createdAt: string;
}

const GoalsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Load goals from localStorage
      const savedGoals = localStorage.getItem('fitness-goals');
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      }

      // Load all progress
      if (user) {
        const allProgress = await progressApi.getAll(user.id, { limit: 1000 });
        setProgress(allProgress);
      }
    } catch (err: any) {
      setError(err.message || 'Échec du chargement des objectifs');
    } finally {
      setIsLoading(false);
    }
  };

  const saveGoals = (newGoals: Goal[]) => {
    localStorage.setItem('fitness-goals', JSON.stringify(newGoals));
    setGoals(newGoals);
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    saveGoals([...goals, newGoal]);
  };

  const deleteGoal = (goalId: string) => {
    saveGoals(goals.filter(g => g.id !== goalId));
  };

  const getGoalProgress = (goal: Goal) => {
    // Filter progress entries that match this goal's category and metric
    const relevantProgress = progress.filter(
      p => p.category === goal.category && p.metric === goal.metric
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (relevantProgress.length === 0) {
      return {
        currentValue: goal.currentValue,
        progressPercent: 0,
        chartData: [],
        trend: 'neutral' as const,
      };
    }

    // Get latest value
    const latestValue = relevantProgress[relevantProgress.length - 1].value;

    // Calculate progress percentage
    const progressPercent = Math.min(
      100,
      Math.max(0, ((latestValue - goal.currentValue) / (goal.targetValue - goal.currentValue)) * 100)
    );

    // Prepare chart data
    const chartData = relevantProgress.map(p => ({
      date: new Date(p.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
      value: p.value,
      fullDate: p.date,
    }));

    // Calculate trend (comparing first half vs second half)
    const midPoint = Math.floor(relevantProgress.length / 2);
    const firstHalfAvg = relevantProgress.slice(0, midPoint).reduce((sum, p) => sum + p.value, 0) / midPoint;
    const secondHalfAvg = relevantProgress.slice(midPoint).reduce((sum, p) => sum + p.value, 0) / (relevantProgress.length - midPoint);

    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    if (secondHalfAvg > firstHalfAvg * 1.05) trend = 'up';
    else if (secondHalfAvg < firstHalfAvg * 0.95) trend = 'down';

    return {
      currentValue: latestValue,
      progressPercent,
      chartData,
      trend,
    };
  };

  const getDaysRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FFF5E1]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display text-black">Objectifs</h1>
            <p className="text-base sm:text-lg text-black/70 mt-1">
              Définis tes objectifs et suis tes progrès
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto bg-[#FFD93D] border-2 border-black rounded-xl font-semibold text-base py-3 px-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Ajouter
          </button>
        </div>

        {error && (
          <Alert variant="danger" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {goals.length === 0 ? (
          <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFD93D] border-3 border-black rounded-xl mb-4">
                <Target className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Aucun objectif</h3>
              <p className="text-black/60 mb-4">Définis ton premier objectif fitness et commence à suivre!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#9D4EDD] border-2 border-black rounded-xl font-semibold text-white py-2 px-4 shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150"
              >
                Créer un objectif
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goals.map((goal) => {
            const { currentValue, progressPercent, chartData, trend } = getGoalProgress(goal);
            const daysRemaining = getDaysRemaining(goal.deadline);

            // Calculate y-axis range
            const allValues = chartData.map(d => d.value);
            if (allValues.length > 0) {
              allValues.push(goal.targetValue);
              const minValue = Math.min(...allValues);
              const maxValue = Math.max(...allValues);
              const range = maxValue - minValue;
              const padding = range * 0.1 || 5;
              var yMin = Math.max(0, Math.floor(minValue - padding));
              var yMax = Math.ceil(maxValue + padding);
            }

              return (
                <div key={goal.id} className="bg-white border-3 border-black rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)] relative">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-display text-black capitalize">
                      {goal.metric.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-sm text-black/60 capitalize">
                      {goal.category.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-2 hover:bg-[#FFF5E1] border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[1px_1px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-black">
                      {currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                    <span className="px-3 py-1 text-xs font-semibold border-2 border-black rounded-lg text-white bg-[#9D4EDD]">
                      {progressPercent.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-6 bg-[#FFF5E1] border-2 border-black rounded-lg overflow-hidden shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                    <div
                      className="h-full bg-[#9D4EDD] transition-all duration-500"
                      style={{ width: `${Math.min(100, progressPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Deadline & Trend */}
                <div className="flex items-center justify-between mb-4 text-sm">
                  <div className="flex items-center gap-2 text-black/60">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">
                      {daysRemaining > 0 ? `${daysRemaining} jours restants` : 'Échéance dépassée'}
                    </span>
                  </div>
                  {trend !== 'neutral' && (
                    <div className={`flex items-center gap-1 font-semibold ${
                      trend === 'up' ? 'text-[#9D4EDD]' : 'text-black/60'
                    }`}>
                      <TrendingUp className={`w-4 h-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
                      <span>{trend === 'up' ? 'En progression' : 'En baisse'}</span>
                    </div>
                  )}
                </div>

                  {/* Chart */}
                  {chartData.length > 0 ? (
                    <div className="border-2 border-black bg-[#FFF5E1] rounded-xl p-4 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="0" stroke="#000000" strokeWidth={1} vertical={false} />
                          <XAxis
                            dataKey="date"
                            stroke="#000000"
                            strokeWidth={2}
                            tick={{ fill: '#000000', fontWeight: 600, fontSize: 11 }}
                          />
                          <YAxis
                            stroke="#000000"
                            strokeWidth={2}
                            tick={{ fill: '#000000', fontWeight: 600, fontSize: 11 }}
                            domain={[yMin, yMax]}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#FFD93D',
                              border: '3px solid black',
                              borderRadius: '0',
                              boxShadow: '3px 3px 0 0 rgba(0,0,0,1)',
                              fontWeight: 600,
                              padding: '8px 12px'
                            }}
                          />
                          {/* Target line */}
                          <ReferenceLine
                            y={goal.targetValue}
                            stroke="#9D4EDD"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            label={{
                              value: 'Cible',
                              position: 'right',
                              fill: '#9D4EDD',
                              fontWeight: 700,
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#000000"
                            strokeWidth={3}
                            dot={{ fill: '#9D4EDD', stroke: '#000000', strokeWidth: 2, r: 5 }}
                            activeDot={{ r: 7, stroke: '#000000', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="border-2 border-black bg-[#FFF5E1] rounded-xl p-8 text-center shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                      <BarChart3 className="w-12 h-12 text-black/40 mx-auto mb-2" />
                      <p className="text-sm text-black/60">
                        Aucune donnée de progrès. Commence à enregistrer!
                      </p>
                    </div>
                  )}

                  {/* Achievement badge */}
                  {progressPercent >= 100 && (
                    <div className="mt-4 p-3 bg-[#FFD93D] border-2 border-black rounded-xl shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex items-center gap-2">
                      <Award className="w-5 h-5 text-black" />
                      <span className="font-semibold text-black">Objectif atteint! 🎉</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Create Goal Modal */}
        {showCreateModal && (
          <CreateGoalModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={(goal) => {
              addGoal(goal);
              setShowCreateModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Create Goal Modal Component
const CreateGoalModal: React.FC<{
  onClose: () => void;
  onSuccess: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
}> = ({ onClose, onSuccess }) => {
  const [category, setCategory] = useState('');
  const [metric, setMetric] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    setMetric(''); // Reset metric when category changes
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !metric || !currentValue || !targetValue || !unit || !deadline) {
      setError('Tous les champs sont requis');
      return;
    }

    const current = parseFloat(currentValue);
    const target = parseFloat(targetValue);

    if (isNaN(current) || isNaN(target)) {
      setError('Les valeurs doivent être des nombres');
      return;
    }

    onSuccess({
      category,
      metric,
      currentValue: current,
      targetValue: target,
      unit,
      deadline,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#FFF5E1] border-3 border-black rounded-2xl shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-display text-black mb-6">Créer un objectif</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border-2 border-black rounded-xl p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block text-sm text-black mb-2">
                Catégorie *
              </label>
              <select
                value={category}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none transition-all bg-white"
                required
              >
                <option value="">Sélectionne une catégorie</option>
                {PROGRESS_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Metric */}
            <div>
              <label className="block text-sm text-black mb-2">
                Métrique *
              </label>
              {category && COMMON_METRICS[category as keyof typeof COMMON_METRICS] ? (
                <select
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none transition-all bg-white"
                  required
                >
                  <option value="">Sélectionne une métrique</option>
                  {COMMON_METRICS[category as keyof typeof COMMON_METRICS].map((m) => (
                    <option key={m} value={m}>
                      {m.replace(/_/g, ' ').charAt(0).toUpperCase() + m.replace(/_/g, ' ').slice(1)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  placeholder="e.g., weight, bench_press, distance"
                  className="w-full px-4 py-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none transition-all bg-white"
                  required
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-black mb-2">
                  Valeur actuelle *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none transition-all bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-black mb-2">
                  Valeur cible *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none transition-all bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-black mb-2">
                Unité *
              </label>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="kg, km, reps..."
                className="w-full px-4 py-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none transition-all bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-black mb-2">
                Échéance *
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none transition-all bg-white"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-white border-2 border-black rounded-lg font-semibold text-black py-2.5 px-6 shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-150"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#9D4EDD] border-2 border-black rounded-lg font-semibold text-white py-2.5 px-6 shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-150"
              >
                Créer l'objectif
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;
