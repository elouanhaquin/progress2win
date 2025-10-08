import React, { useState, useEffect } from 'react';
import { Users, Trophy, TrendingUp, BarChart3, Plus, Copy, Check, LogOut, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, Button, LoadingSpinner, Input, Alert } from '../components/UI';
import { groupsApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { GroupWithMembers, GroupProgressEntry } from '../types';
import { format, subDays } from 'date-fns';

const ComparePage: React.FC = () => {
  const { user } = useAuthStore();
  const [group, setGroup] = useState<GroupWithMembers | null>(null);
  const [groupProgress, setGroupProgress] = useState<GroupProgressEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGroup();
  }, []);

  useEffect(() => {
    if (group) {
      loadGroupProgress();
    }
  }, [group]);

  const loadGroup = async () => {
    try {
      setIsLoading(true);
      const myGroup = await groupsApi.getMyGroup();
      if (myGroup) {
        const fullGroup = await groupsApi.getGroup(myGroup.id);
        setGroup(fullGroup);
      }
    } catch (error: any) {
      setError(error.message || 'Échec du chargement du groupe');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGroupProgress = async () => {
    if (!group) return;

    try {
      setIsLoadingProgress(true);
      const data = await groupsApi.getGroupProgress(group.id, { limit: 100 });
      setGroupProgress(data);
    } catch (error) {
      console.error('Failed to load group progress:', error);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!group || !confirm(`Es-tu sûr de vouloir quitter "${group.name}"?`)) return;

    try {
      await groupsApi.leave(group.id);
      setGroup(null);
      setGroupProgress([]);
      loadGroup();
    } catch (error: any) {
      setError(error.message || 'Échec de la sortie du groupe');
    }
  };

  // Get comparison data for charts
  const getComparisonData = () => {
    if (!group || groupProgress.length === 0) return [];

    // Get unique categories and metrics
    const metricsMap = new Map<string, Map<number, { name: string; values: Map<string, number> }>>();

    groupProgress.forEach(entry => {
      const key = `${entry.category}-${entry.metric}`;
      if (!metricsMap.has(key)) {
        metricsMap.set(key, new Map());
      }

      const metricData = metricsMap.get(key)!;
      if (!metricData.has(entry.user_id)) {
        metricData.set(entry.user_id, {
          name: `${entry.first_name} ${entry.last_name}`,
          values: new Map(),
        });
      }

      metricData.get(entry.user_id)!.values.set(entry.date, entry.value);
    });

    return Array.from(metricsMap.entries()).map(([key, users]) => {
      const [category, metric] = key.split('-');

      // Get all dates
      const allDates = new Set<string>();
      const allValues: number[] = [];

      users.forEach(userData => {
        userData.values.forEach((value, date) => {
          allDates.add(date);
          allValues.push(value);
        });
      });

      // Sort dates
      const sortedDates = Array.from(allDates).sort();

      // Build chart data
      const chartData = sortedDates.map(date => {
        const dataPoint: any = { date: format(new Date(date), 'MMM dd') };
        users.forEach((userData, userId) => {
          dataPoint[userData.name] = userData.values.get(date) || null;
        });
        return dataPoint;
      });

      // Calculate min and max for better zoom
      const minValue = Math.min(...allValues);
      const maxValue = Math.max(...allValues);
      const range = maxValue - minValue;

      // Add 10% padding on each side for better visualization
      const padding = range * 0.1 || 5; // Use 5 as default if range is 0
      const yMin = Math.max(0, Math.floor(minValue - padding));
      const yMax = Math.ceil(maxValue + padding);

      return {
        category,
        metric,
        data: chartData,
        userNames: Array.from(users.values()).map(u => u.name),
        yMin,
        yMax,
      };
    });
  };

  const comparisonData = getComparisonData();

  const getTopPerformer = () => {
    if (groupProgress.length === 0) return null;

    const userTotals: Record<number, { name: string; count: number }> = {};

    groupProgress.forEach(p => {
      if (!userTotals[p.user_id]) {
        userTotals[p.user_id] = {
          name: `${p.first_name} ${p.last_name}`,
          count: 0,
        };
      }
      userTotals[p.user_id].count += 1;
    });

    const sorted = Object.values(userTotals).sort((a, b) => b.count - a.count);
    return sorted[0];
  };

  const topPerformer = getTopPerformer();
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

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
        <div>
          <h1 className="text-3xl sm:text-4xl font-display text-black">Comparer les progrès</h1>
          <p className="text-base sm:text-lg text-black/70 mt-1">
            {group ? 'Compare tes progrès fitness avec ton groupe' : 'Crée ou rejoins un groupe pour comparer avec tes amis'}
          </p>
        </div>

        {error && (
          <Alert variant="danger" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!group ? (
          <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFD93D] border-3 border-black rounded-xl mb-4">
                <Users className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Aucun groupe</h3>
              <p className="text-black/60 mb-4">Crée ou rejoins un groupe pour commencer à comparer!</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-[#FFD93D] border-2 border-black rounded-xl font-semibold text-black py-2 px-4 shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150"
                >
                  Créer un groupe
                </button>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="bg-white border-2 border-black rounded-xl font-semibold text-black py-2 px-4 shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150"
                >
                  Rejoindre un groupe
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Group Info Card */}
            <div className="bg-white border-3 border-black rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-display text-black mb-2">{group.name}</h2>
                  {group.description && (
                    <p className="text-black/60 mb-3">{group.description}</p>
                  )}
                  <CodeDisplay code={group.code} />
                </div>
                <button
                  onClick={handleLeaveGroup}
                  className="w-full sm:w-auto bg-white border-2 border-black rounded-xl font-semibold text-black py-2 px-4 shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Quitter
                </button>
              </div>

              <div className="border-t-2 border-black pt-4 mt-4">
                <h3 className="text-sm font-semibold text-black mb-3">Membres ({group.members.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {group.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center p-3 bg-[#FFF5E1] border-2 border-black rounded-xl"
                    >
                      <div className="w-8 h-8 bg-[#9D4EDD] border-2 border-black rounded-lg mr-2 flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">
                          {member.first_name[0]}{member.last_name[0]}
                        </span>
                      </div>
                      <span className="font-medium text-black text-sm truncate">
                        {member.first_name} {member.last_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-black/70">Total entrées</p>
                    <p className="text-3xl font-bold text-black mt-1">{groupProgress.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#9D4EDD] border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-black/70">Membres</p>
                    <p className="text-3xl font-bold text-black mt-1">{group.members.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#9D4EDD] border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-black/70">Plus actif</p>
                    <p className="text-lg font-bold text-black mt-1">
                      {topPerformer ? topPerformer.name : 'N/A'}
                    </p>
                    {topPerformer && (
                      <p className="text-xs text-black/60">{topPerformer.count} entrées</p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-[#FFD93D] border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                    <Trophy className="w-6 h-6 text-black" />
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Charts */}
            {isLoadingProgress ? (
              <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              </div>
            ) : comparisonData.length === 0 ? (
              <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFD93D] border-3 border-black rounded-xl mb-4">
                    <BarChart3 className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">Aucune donnée comparable</h3>
                  <p className="text-black/60">Commence à enregistrer tes progrès pour voir les comparaisons!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {comparisonData.map((comparison, idx) => (
                  <div key={idx} className="bg-white border-3 border-black rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
                    <h3 className="text-xl font-display text-black mb-4 capitalize">
                      {comparison.category.replace(/_/g, ' ')} - {comparison.metric.replace(/_/g, ' ')}
                    </h3>
                    <div className="border-2 border-black bg-[#FFF5E1] rounded-xl p-4 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={comparison.data}>
                          <CartesianGrid
                            strokeDasharray="0"
                            stroke="#000000"
                            strokeWidth={1}
                            vertical={false}
                          />
                          <XAxis
                            dataKey="date"
                            stroke="#000000"
                            strokeWidth={2}
                            tick={{ fill: '#000000', fontWeight: 600, fontSize: 12 }}
                            axisLine={{ stroke: '#000000', strokeWidth: 2 }}
                          />
                          <YAxis
                            stroke="#000000"
                            strokeWidth={2}
                            tick={{ fill: '#000000', fontWeight: 600, fontSize: 12 }}
                            axisLine={{ stroke: '#000000', strokeWidth: 2 }}
                            domain={[comparison.yMin, comparison.yMax]}
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
                            labelStyle={{
                              color: '#000000',
                              fontWeight: 600,
                              marginBottom: '4px'
                            }}
                            itemStyle={{
                              color: '#000000',
                              fontWeight: 600
                            }}
                          />
                          <Legend
                            wrapperStyle={{
                              fontWeight: 700,
                              paddingTop: '16px'
                            }}
                            iconType="rect"
                          />
                          {comparison.userNames.map((name, i) => (
                            <Line
                              key={name}
                              type="monotone"
                              dataKey={name}
                              stroke="#000000"
                              strokeWidth={3}
                              dot={{
                                fill: colors[i % colors.length],
                                stroke: '#000000',
                                strokeWidth: 2,
                                r: 5
                              }}
                              activeDot={{
                                r: 7,
                                stroke: '#000000',
                                strokeWidth: 2,
                                fill: colors[i % colors.length]
                              }}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Modals */}
        {showCreateModal && (
          <CreateGroupModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              loadGroup();
            }}
          />
        )}

        {showJoinModal && (
          <JoinGroupModal
            onClose={() => setShowJoinModal(false)}
            onSuccess={() => {
              setShowJoinModal(false);
              loadGroup();
            }}
          />
        )}
      </div>
    </div>
  );
};

// Code Display Component
const CodeDisplay: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-[#FFD93D] border-2 border-black rounded-xl shadow-[2px_2px_0_0_rgba(0,0,0,1)] inline-flex">
      <span className="text-xs font-semibold text-black/70 mr-1">CODE:</span>
      <code className="font-bold text-black text-lg">{code}</code>
      <button
        onClick={handleCopy}
        className="p-2 bg-white border-2 border-black rounded-lg hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all ml-2"
      >
        {copied ? (
          <Check className="w-4 h-4 text-[#9D4EDD]" />
        ) : (
          <Copy className="w-4 h-4 text-black" />
        )}
      </button>
    </div>
  );
};

// Create Group Modal
const CreateGroupModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      await groupsApi.create({ name: name.trim(), description: description.trim() || undefined });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Échec de la création du groupe');
    } finally {
      setIsLoading(false);
    }
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
          <h2 className="text-2xl sm:text-3xl font-display text-black mb-6">Créer un groupe</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border-2 border-black rounded-xl p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm text-black mb-2">Nom du groupe *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mon équipe fitness"
                className="w-full px-4 py-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none transition-all bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-black mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description optionnelle..."
                rows={3}
                className="w-full px-4 py-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none transition-all bg-white resize-none"
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
                disabled={isLoading}
                className="flex-1 bg-[#FFD93D] border-2 border-black rounded-lg font-semibold text-black py-2.5 px-6 shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Join Group Modal
const JoinGroupModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      await groupsApi.join(code.trim().toUpperCase());
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Échec de l\'entrée dans le groupe');
    } finally {
      setIsLoading(false);
    }
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
          <h2 className="text-2xl sm:text-3xl font-display text-black mb-6">Rejoindre un groupe</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border-2 border-black rounded-xl p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm text-black mb-2">Code du groupe *</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
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
                disabled={isLoading}
                className="flex-1 bg-[#9D4EDD] border-2 border-black rounded-lg font-semibold text-white py-2.5 px-6 shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'En cours...' : 'Rejoindre'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
