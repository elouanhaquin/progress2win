import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Users, BarChart3 } from 'lucide-react';
import { Card, Button, Badge, LoadingSpinner, Alert } from '../components/UI';
import { groupsApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { GroupWithMembers, GroupProgressEntry } from '../types';

interface LeaderboardEntry {
  userId: number;
  name: string;
  totalEntries: number;
  totalValue: number;
  avgValue: number;
  firstName: string;
  lastName: string;
}

interface CategoryLeader {
  category: string;
  userId: number;
  name: string;
  count: number;
  totalValue: number;
}

interface MetricLeader {
  category: string;
  metric: string;
  userId: number;
  name: string;
  count: number;
  totalValue: number;
  avgValue: number;
}

const LeaderboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [group, setGroup] = useState<GroupWithMembers | null>(null);
  const [groupProgress, setGroupProgress] = useState<GroupProgressEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const myGroup = await groupsApi.getMyGroup();
      if (myGroup) {
        const fullGroup = await groupsApi.getGroup(myGroup.id);
        setGroup(fullGroup);

        const progress = await groupsApi.getGroupProgress(myGroup.id, { limit: 1000 });
        setGroupProgress(progress);
      }
    } catch (err: any) {
      setError(err.message || 'Échec du chargement du classement');
    } finally {
      setIsLoading(false);
    }
  };

  const getLeaderboard = (): LeaderboardEntry[] => {
    if (!groupProgress.length) return [];

    const userStats: Record<number, LeaderboardEntry> = {};

    groupProgress.forEach(entry => {
      if (!userStats[entry.user_id]) {
        userStats[entry.user_id] = {
          userId: entry.user_id,
          name: `${entry.first_name} ${entry.last_name}`,
          firstName: entry.first_name,
          lastName: entry.last_name,
          totalEntries: 0,
          totalValue: 0,
          avgValue: 0,
        };
      }

      userStats[entry.user_id].totalEntries += 1;
      userStats[entry.user_id].totalValue += entry.value;
    });

    // Calculate average and sort by total entries
    return Object.values(userStats)
      .map(stat => ({
        ...stat,
        avgValue: stat.totalValue / stat.totalEntries,
      }))
      .sort((a, b) => b.totalEntries - a.totalEntries);
  };

  const getMetricLeaders = (): MetricLeader[] => {
    if (!groupProgress.length) return [];

    // Group by category + metric
    const metricStats: Record<string, Record<number, MetricLeader>> = {};

    groupProgress.forEach(entry => {
      const key = `${entry.category}|${entry.metric}`;

      if (!metricStats[key]) {
        metricStats[key] = {};
      }

      if (!metricStats[key][entry.user_id]) {
        metricStats[key][entry.user_id] = {
          category: entry.category,
          metric: entry.metric,
          userId: entry.user_id,
          name: `${entry.first_name} ${entry.last_name}`,
          count: 0,
          totalValue: 0,
          avgValue: 0,
        };
      }

      metricStats[key][entry.user_id].count += 1;
      metricStats[key][entry.user_id].totalValue += entry.value;
    });

    // Get leader for each metric, but only if at least 2 users have that metric
    const leaders: MetricLeader[] = [];
    Object.values(metricStats).forEach(userStats => {
      const usersWithMetric = Object.values(userStats);

      // Only include metrics where at least 2 users have entries
      if (usersWithMetric.length >= 2) {
        const leader = usersWithMetric
          .map(stat => ({
            ...stat,
            avgValue: stat.totalValue / stat.count,
          }))
          .sort((a, b) => b.count - a.count)[0];

        leaders.push(leader);
      }
    });

    return leaders;
  };

  const leaderboard = getLeaderboard();
  const metricLeaders = getMetricLeaders();
  const top3 = leaderboard.slice(0, 3);
  const myRank = leaderboard.findIndex(entry => entry.userId === user?.id) + 1;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="w-full bg-[#FFF5E1]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display text-black">Classement</h1>
            <p className="text-base sm:text-lg text-black/70 mt-1">
              Compare-toi avec les membres de ton groupe
            </p>
          </div>

          <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFD93D] border-3 border-black rounded-xl mb-4">
                <Users className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Aucun groupe</h3>
              <p className="text-black/60 mb-4">Rejoins un groupe pour voir le classement!</p>
              <button
                onClick={() => window.location.href = '/compare'}
                className="bg-[#9D4EDD] border-2 border-black rounded-xl font-semibold text-white py-2 px-4 shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150"
              >
                Aller à Comparer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FFF5E1]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display text-black">Classement</h1>
            <p className="text-base sm:text-lg text-black/70 mt-1">
              {group.name} - Qui est au top?
            </p>
          </div>
          {myRank > 0 && (
            <span className="px-3 py-1 text-sm font-semibold border-2 border-black rounded-lg text-white bg-[#9D4EDD]">
              Ton rang: #{myRank}
            </span>
          )}
        </div>

        {error && (
          <Alert variant="danger" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {leaderboard.length === 0 ? (
          <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFD93D] border-3 border-black rounded-xl mb-4">
                <BarChart3 className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Aucune donnée</h3>
              <p className="text-black/60">Commence à enregistrer tes progrès pour voir le classement!</p>
            </div>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {top3.length >= 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 2nd Place */}
                {top3[1] && (
                  <div className={`bg-white border-3 border-black rounded-2xl p-5 text-center shadow-[5px_5px_0_0_rgba(0,0,0,1)] ${top3[1].userId === user?.id ? 'bg-[#FFD93D]' : ''}`}>
                    <div className="w-16 h-16 bg-[#9D4EDD] border-2 border-black rounded-xl mx-auto mb-4 flex items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                      <Medal className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-black">
                      {top3[1].userId === user?.id ? 'Toi!' : top3[1].name}
                    </h3>
                    <p className="text-sm text-black/60">{top3[1].totalEntries} entrées</p>
                    <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold border-2 border-black rounded-lg text-white bg-[#9D4EDD]">#2</span>
                  </div>
                )}

                {/* 1st Place */}
                {top3[0] && (
                  <div className={`bg-white border-3 border-black rounded-2xl p-5 text-center shadow-[5px_5px_0_0_rgba(0,0,0,1)] ${top3[0].userId === user?.id ? 'bg-[#FFD93D]' : 'bg-[#FFF5E1]'}`}>
                    <div className="w-20 h-20 bg-[#FFD93D] border-3 border-black rounded-xl mx-auto mb-4 flex items-center justify-center shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                      <Crown className="w-10 h-10 text-black" />
                    </div>
                    <h3 className="text-xl font-display text-black">
                      {top3[0].userId === user?.id ? 'Toi!' : top3[0].name}
                    </h3>
                    <p className="text-base text-black/60 font-semibold">{top3[0].totalEntries} entrées</p>
                    <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold border-2 border-black rounded-lg text-black bg-[#FFD93D]">#1</span>
                  </div>
                )}

                {/* 3rd Place */}
                {top3[2] && (
                  <div className={`bg-white border-3 border-black rounded-2xl p-5 text-center shadow-[5px_5px_0_0_rgba(0,0,0,1)] ${top3[2].userId === user?.id ? 'bg-[#FFD93D]' : ''}`}>
                    <div className="w-16 h-16 bg-[#9D4EDD] border-2 border-black rounded-xl mx-auto mb-4 flex items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                      <Medal className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-black">
                      {top3[2].userId === user?.id ? 'Toi!' : top3[2].name}
                    </h3>
                    <p className="text-sm text-black/60">{top3[2].totalEntries} entrées</p>
                    <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold border-2 border-black rounded-lg text-white bg-[#9D4EDD]">#3</span>
                  </div>
                )}
              </div>
            )}

            {/* Full Leaderboard */}
            <div className="bg-white border-3 border-black rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
              <h2 className="text-xl sm:text-2xl font-display text-black mb-5">Classement complet</h2>
              <div className="space-y-3">
                {leaderboard.map((entry, index) => {
                  const rank = index + 1;
                  const isCurrentUser = entry.userId === user?.id;

                  return (
                    <div
                      key={entry.userId}
                      className={`flex items-center justify-between p-4 border-2 border-black rounded-xl shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${
                        isCurrentUser ? 'bg-[#FFD93D]' : 'bg-[#FFF5E1]'
                      }`}
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className={`w-10 h-10 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex items-center justify-center ${
                          rank === 1 ? 'bg-[#FFD93D]' :
                          rank <= 3 ? 'bg-[#9D4EDD]' : 'bg-white'
                        }`}>
                          {rank === 1 ? (
                            <Crown className="w-5 h-5 text-black" />
                          ) : rank <= 3 ? (
                            <Medal className="w-5 h-5 text-white" />
                          ) : (
                            <span className="text-sm font-semibold text-black">{rank}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-black">
                            {isCurrentUser ? 'Toi!' : entry.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-black">{entry.totalEntries}</p>
                        <p className="text-xs text-black/60">entrées</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Metric Leaders */}
            {metricLeaders.length > 0 && (
              <div className="bg-white border-3 border-black rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
                <h2 className="text-xl sm:text-2xl font-display text-black mb-4">Leaders par métrique</h2>
                <p className="text-sm text-black/60 mb-4">
                  Seulement les métriques avec au moins 2 membres ayant des entrées
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {metricLeaders.map((leader) => (
                    <div
                      key={`${leader.category}-${leader.metric}`}
                      className={`p-4 border-2 border-black rounded-xl shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${
                        leader.userId === user?.id ? 'bg-[#FFD93D]' : 'bg-[#FFF5E1]'
                      }`}
                    >
                      <h3 className="font-semibold text-black capitalize mb-1">
                        {leader.metric.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-xs text-black/50 mb-2 capitalize">
                        {leader.category.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-black/70 mb-2">
                        {leader.userId === user?.id ? 'Toi!' : leader.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-[#9D4EDD]" />
                        <p className="text-lg font-bold text-black">{leader.count} entrées</p>
                      </div>
                      <p className="text-xs text-black/60 mt-1">
                        Moy: {leader.avgValue.toFixed(1)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
