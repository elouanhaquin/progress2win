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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-black">Comparer les progrès</h1>
        <p className="text-lg text-neutral-600 font-medium mt-2">
          {group ? 'Compare tes progrès fitness avec ton groupe' : 'Crée ou rejoins un groupe pour comparer avec tes amis'}
        </p>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!group ? (
        <Card>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-black mb-2">Aucun groupe</h3>
            <p className="text-neutral-600 mb-4">Crée ou rejoins un groupe pour commencer à comparer!</p>
            <div className="flex gap-3 justify-center">
              <Button variant="accent" onClick={() => setShowCreateModal(true)}>
                Créer un groupe
              </Button>
              <Button variant="secondary" onClick={() => setShowJoinModal(true)}>
                Rejoindre un groupe
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Group Info Card */}
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-black text-black mb-2">{group.name}</h2>
                {group.description && (
                  <p className="text-neutral-600 mb-3">{group.description}</p>
                )}
                <CodeDisplay code={group.code} />
              </div>
              <Button
                variant="danger"
                size="sm"
                icon={<LogOut className="w-4 h-4" />}
                onClick={handleLeaveGroup}
              >
                Quitter
              </Button>
            </div>

            <div className="border-t-2 border-black pt-4 mt-4">
              <h3 className="text-sm font-bold text-black mb-3">Membres ({group.members.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {group.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center p-3 bg-neutral-50 border-2 border-black"
                  >
                    <div className="w-8 h-8 bg-primary-500 border-2 border-black mr-2 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">
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
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-600">Total entrées</p>
                  <p className="text-3xl font-black text-black">{groupProgress.length}</p>
                </div>
                <div className="w-12 h-12 bg-primary-500 border-2 border-black shadow-neo-sm flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-600">Membres</p>
                  <p className="text-3xl font-black text-black">{group.members.length}</p>
                </div>
                <div className="w-12 h-12 bg-secondary-500 border-2 border-black shadow-neo-sm flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-600">Plus actif</p>
                  <p className="text-lg font-black text-black">
                    {topPerformer ? topPerformer.name : 'N/A'}
                  </p>
                  {topPerformer && (
                    <p className="text-xs text-neutral-600">{topPerformer.count} entrées</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-accent-500 border-2 border-black shadow-neo-sm flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-black" />
                </div>
              </div>
            </Card>
          </div>

          {/* Comparison Charts */}
          {isLoadingProgress ? (
            <Card>
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            </Card>
          ) : comparisonData.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-black mb-2">Aucune donnée comparable</h3>
                <p className="text-neutral-600">Commence à enregistrer tes progrès pour voir les comparaisons!</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {comparisonData.map((comparison, idx) => (
                <Card key={idx}>
                  <h3 className="text-xl font-black text-black mb-4">
                    {comparison.category.replace(/_/g, ' ')} - {comparison.metric.replace(/_/g, ' ')}
                  </h3>
                  <div className="border-4 border-black bg-white p-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={comparison.data}>
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
                          domain={[comparison.yMin, comparison.yMax]}
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
                        <Legend
                          wrapperStyle={{
                            fontWeight: 800,
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
                            strokeWidth={4}
                            dot={{
                              fill: colors[i % colors.length],
                              stroke: '#000000',
                              strokeWidth: 3,
                              r: 6
                            }}
                            activeDot={{
                              r: 8,
                              stroke: '#000000',
                              strokeWidth: 3,
                              fill: colors[i % colors.length]
                            }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
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
    <div className="flex items-center gap-2 p-3 bg-accent-500 border-2 border-black shadow-neo-sm inline-flex">
      <span className="text-xs font-bold text-neutral-600 mr-1">CODE:</span>
      <code className="font-black text-black text-lg">{code}</code>
      <button
        onClick={handleCopy}
        className="p-2 bg-white border-2 border-black hover:shadow-neo-sm transition-shadow ml-2"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-600" />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <Card className="w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-black transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-black text-black mb-6">Créer un groupe</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="danger">{error}</Alert>}

          <Input
            label="Nom du groupe *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mon équipe fitness"
            required
          />

          <div>
            <label className="block text-sm font-bold text-black mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description optionnelle..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-black shadow-neo-sm focus:shadow-neo-md transition-all bg-white font-medium resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" variant="accent" loading={isLoading} className="flex-1">
              Créer
            </Button>
          </div>
        </form>
      </Card>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <Card className="w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-black transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-black text-black mb-6">Rejoindre un groupe</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="danger">{error}</Alert>}

          <Input
            label="Code du groupe *"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
            required
          />

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" variant="primary" loading={isLoading} className="flex-1">
              Rejoindre
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ComparePage;
