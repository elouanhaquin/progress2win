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
      setError(err.message || 'Failed to load leaderboard');
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
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-black">Leaderboard</h1>
          <p className="text-lg text-neutral-600 font-medium mt-2">
            Compare with your group members
          </p>
        </div>

        <Card>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-black mb-2">No Group Yet</h3>
            <p className="text-neutral-600 mb-4">Join a group to see the leaderboard!</p>
            <Button variant="primary" onClick={() => window.location.href = '/compare'}>
              Go to Compare
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-black">Leaderboard</h1>
          <p className="text-lg text-neutral-600 font-medium mt-2">
            {group.name} - Who's crushing it?
          </p>
        </div>
        {myRank > 0 && (
          <Badge variant="accent" className="text-lg px-4 py-2">
            Your Rank: #{myRank}
          </Badge>
        )}
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {leaderboard.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-black mb-2">No Data Yet</h3>
            <p className="text-neutral-600">Start logging progress to see the leaderboard!</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Top 3 Podium */}
          {top3.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 2nd Place */}
              {top3[1] && (
                <Card className={`text-center ${top3[1].userId === user?.id ? 'bg-secondary-50 border-secondary-700' : ''}`}>
                  <div className="w-16 h-16 bg-secondary-500 border-2 border-black shadow-neo-sm mx-auto mb-4 flex items-center justify-center">
                    <Medal className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-black">
                    {top3[1].userId === user?.id ? 'You!' : top3[1].name}
                  </h3>
                  <p className="text-sm text-neutral-600">{top3[1].totalEntries} entries</p>
                  <Badge variant="secondary" className="mt-2">#2</Badge>
                </Card>
              )}

              {/* 1st Place */}
              {top3[0] && (
                <Card className={`text-center ${top3[0].userId === user?.id ? 'bg-accent-50 border-accent-700' : 'bg-accent-50'}`}>
                  <div className="w-20 h-20 bg-accent-500 border-2 border-black shadow-neo-sm mx-auto mb-4 flex items-center justify-center">
                    <Crown className="w-10 h-10 text-black" />
                  </div>
                  <h3 className="text-xl font-black text-black">
                    {top3[0].userId === user?.id ? 'You!' : top3[0].name}
                  </h3>
                  <p className="text-base text-neutral-600 font-semibold">{top3[0].totalEntries} entries</p>
                  <Badge variant="accent" className="mt-2">#1</Badge>
                </Card>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <Card className={`text-center ${top3[2].userId === user?.id ? 'bg-primary-50 border-primary-700' : ''}`}>
                  <div className="w-16 h-16 bg-primary-500 border-2 border-black shadow-neo-sm mx-auto mb-4 flex items-center justify-center">
                    <Medal className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-black">
                    {top3[2].userId === user?.id ? 'You!' : top3[2].name}
                  </h3>
                  <p className="text-sm text-neutral-600">{top3[2].totalEntries} entries</p>
                  <Badge variant="primary" className="mt-2">#3</Badge>
                </Card>
              )}
            </div>
          )}

          {/* Full Leaderboard */}
          <Card>
            <h2 className="text-2xl font-black text-black mb-6">Full Rankings</h2>
            <div className="space-y-4">
              {leaderboard.map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = entry.userId === user?.id;

                return (
                  <div
                    key={entry.userId}
                    className={`flex items-center justify-between p-4 border-2 border-black shadow-neo-sm ${
                      isCurrentUser ? 'bg-accent-50 border-accent-700' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 border-2 border-black shadow-neo-sm flex items-center justify-center ${
                        rank === 1 ? 'bg-accent-500' :
                        rank === 2 ? 'bg-secondary-500' :
                        rank === 3 ? 'bg-primary-500' : 'bg-neutral-300'
                      }`}>
                        {rank === 1 ? (
                          <Crown className="w-5 h-5 text-black" />
                        ) : rank <= 3 ? (
                          <Medal className="w-5 h-5 text-white" />
                        ) : (
                          <span className="text-sm font-bold text-black">{rank}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-black">
                          {isCurrentUser ? 'You!' : entry.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-black">{entry.totalEntries}</p>
                      <p className="text-xs text-neutral-500">entries</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Metric Leaders */}
          {metricLeaders.length > 0 && (
            <Card>
              <h2 className="text-2xl font-black text-black mb-6">Metric Leaders</h2>
              <p className="text-sm text-neutral-600 mb-4">
                Only showing metrics where at least 2 members have entries
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metricLeaders.map((leader) => (
                  <div
                    key={`${leader.category}-${leader.metric}`}
                    className={`p-4 border-2 border-black shadow-neo-sm ${
                      leader.userId === user?.id ? 'bg-accent-50' : 'bg-neutral-50'
                    }`}
                  >
                    <h3 className="font-bold text-black capitalize mb-1">
                      {leader.metric.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-xs text-neutral-500 mb-2 capitalize">
                      {leader.category.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-neutral-600 mb-2">
                      {leader.userId === user?.id ? 'You!' : leader.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-accent-600" />
                      <p className="text-lg font-black text-black">{leader.count} entries</p>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Avg: {leader.avgValue.toFixed(1)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default LeaderboardPage;
