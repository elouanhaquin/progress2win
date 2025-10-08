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
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-br from-primary-100 to-accent-100 border-2 border-black p-8 shadow-neo">
          <div>
            <h1 className="text-4xl font-black text-black">Objectifs</h1>
            <p className="text-lg text-neutral-700 mt-2">
              Définis tes objectifs et suis tes progrès
            </p>
          </div>
          <Button
            variant="accent"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            Ajouter un objectif
          </Button>
        </div>

        {error && (
          <Alert variant="danger" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {goals.length === 0 ? (
          <div className="bg-white border-2 border-black shadow-neo p-6">
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-black mb-2">Aucun objectif</h3>
              <p className="text-neutral-600 mb-4">Définis ton premier objectif fitness et commence à suivre!</p>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Créer un objectif
              </Button>
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
                <div key={goal.id} className="bg-white border-2 border-black shadow-neo p-6 relative">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-black capitalize">
                      {goal.metric.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-sm text-neutral-600 capitalize">
                      {goal.category.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-2 hover:bg-neutral-100 border-2 border-black shadow-neo-sm transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-black">
                      {currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                    <Badge variant={progressPercent >= 100 ? 'success' : progressPercent >= 50 ? 'primary' : 'secondary'}>
                      {progressPercent.toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="w-full h-6 bg-neutral-200 border-2 border-black shadow-neo-sm">
                    <div
                      className={`h-full border-r-2 border-black transition-all duration-500 ${
                        progressPercent >= 100 ? 'bg-success-500' :
                        progressPercent >= 50 ? 'bg-primary-500' : 'bg-secondary-500'
                      }`}
                      style={{ width: `${Math.min(100, progressPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Deadline & Trend */}
                <div className="flex items-center justify-between mb-4 text-sm">
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Calendar className="w-4 h-4" />
                    <span className="font-semibold">
                      {daysRemaining > 0 ? `${daysRemaining} jours restants` : 'Échéance dépassée'}
                    </span>
                  </div>
                  {trend !== 'neutral' && (
                    <div className={`flex items-center gap-1 font-bold ${
                      trend === 'up' ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      <TrendingUp className={`w-4 h-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
                      <span>{trend === 'up' ? 'En progression' : 'En baisse'}</span>
                    </div>
                  )}
                </div>

                  {/* Chart */}
                  {chartData.length > 0 ? (
                    <div className="border-2 border-black bg-neutral-50 p-4">
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="0" stroke="#000000" strokeWidth={1} vertical={false} />
                          <XAxis
                            dataKey="date"
                            stroke="#000000"
                            strokeWidth={2}
                            tick={{ fill: '#000000', fontWeight: 600, fontSize: 12 }}
                          />
                          <YAxis
                            stroke="#000000"
                            strokeWidth={2}
                            tick={{ fill: '#000000', fontWeight: 600 }}
                            domain={[yMin, yMax]}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fbbf24',
                              border: '2px solid black',
                              boxShadow: '4px 4px 0 0 rgba(0,0,0,1)',
                              fontWeight: 600,
                            }}
                          />
                          {/* Target line */}
                          <ReferenceLine
                            y={goal.targetValue}
                            stroke="#10b981"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            label={{
                              value: 'Cible',
                              position: 'right',
                              fill: '#10b981',
                              fontWeight: 700,
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#000000"
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', stroke: '#000000', strokeWidth: 2, r: 5 }}
                            activeDot={{ r: 7, stroke: '#000000', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="border-2 border-black bg-neutral-50 p-8 text-center">
                      <BarChart3 className="w-12 h-12 text-neutral-400 mx-auto mb-2" />
                      <p className="text-sm text-neutral-600 font-medium">
                        Aucune donnée de progrès. Commence à enregistrer!
                      </p>
                    </div>
                  )}

                  {/* Achievement badge */}
                  {progressPercent >= 100 && (
                    <div className="mt-4 p-3 bg-success-500 border-2 border-black shadow-neo-sm flex items-center gap-2">
                      <Award className="w-5 h-5 text-black" />
                      <span className="font-black text-black">Objectif atteint! 🎉</span>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <Card className="w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-black transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-black text-black mb-6">Créer un objectif</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="danger">{error}</Alert>}

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Catégorie *
            </label>
            <select
              value={category}
              onChange={handleCategoryChange}
              className="w-full px-4 py-3 border-2 border-black shadow-neo-sm focus:shadow-neo-md transition-all bg-white font-medium"
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
            <label className="block text-sm font-bold text-black mb-2">
              Métrique *
            </label>
            {category && COMMON_METRICS[category as keyof typeof COMMON_METRICS] ? (
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                className="w-full px-4 py-3 border-2 border-black shadow-neo-sm focus:shadow-neo-md transition-all bg-white font-medium"
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
              <Input
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                placeholder="e.g., weight, bench_press, distance"
                required
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valeur actuelle *"
              type="number"
              step="0.01"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              placeholder="0"
              required
            />

            <Input
              label="Valeur cible *"
              type="number"
              step="0.01"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="0"
              required
            />
          </div>

          <Input
            label="Unité *"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="kg, km, reps..."
            required
          />

          <Input
            label="Échéance *"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" variant="accent" className="flex-1">
              Créer l'objectif
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default GoalsPage;
