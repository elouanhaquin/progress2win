import React from 'react';
import { Trophy, Medal, Crown, Star } from 'lucide-react';
import { Card, Button, Badge } from '../components/UI';

const LeaderboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-black">Leaderboard</h1>
          <p className="text-lg text-neutral-600 font-medium mt-2">
            See who's crushing their goals
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="neutral" size="sm">
            This Week
          </Button>
          <Button variant="primary" size="sm">
            All Time
          </Button>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 2nd Place */}
        <Card className="text-center">
          <div className="w-16 h-16 bg-neutral-300 border-2 border-black shadow-neo-sm mx-auto mb-4 flex items-center justify-center">
            <Medal className="w-8 h-8 text-neutral-600" />
          </div>
          <h3 className="text-lg font-bold text-black">Jane Smith</h3>
          <p className="text-sm text-neutral-600">2,847 points</p>
          <Badge variant="secondary" className="mt-2">#2</Badge>
        </Card>

        {/* 1st Place */}
        <Card className="text-center bg-accent-50 border-accent-700">
          <div className="w-20 h-20 bg-accent-500 border-2 border-black shadow-neo-sm mx-auto mb-4 flex items-center justify-center">
            <Crown className="w-10 h-10 text-black" />
          </div>
          <h3 className="text-xl font-black text-black">You!</h3>
          <p className="text-base text-neutral-600 font-semibold">3,156 points</p>
          <Badge variant="accent" className="mt-2">#1</Badge>
        </Card>

        {/* 3rd Place */}
        <Card className="text-center">
          <div className="w-16 h-16 bg-neutral-300 border-2 border-black shadow-neo-sm mx-auto mb-4 flex items-center justify-center">
            <Medal className="w-8 h-8 text-neutral-600" />
          </div>
          <h3 className="text-lg font-bold text-black">Mike Johnson</h3>
          <p className="text-sm text-neutral-600">2,634 points</p>
              <Badge variant="secondary" className="mt-2">#3</Badge>
        </Card>
      </div>

      {/* Full Leaderboard */}
      <Card>
        <h2 className="text-2xl font-black text-black mb-6">Full Rankings</h2>
        <div className="space-y-4">
          {/* Mock leaderboard entries */}
          {[
            { rank: 1, name: 'You!', points: 3156, category: 'Fitness' },
            { rank: 2, name: 'Jane Smith', points: 2847, category: 'Health' },
            { rank: 3, name: 'Mike Johnson', points: 2634, category: 'Learning' },
            { rank: 4, name: 'Sarah Wilson', points: 2456, category: 'Productivity' },
            { rank: 5, name: 'Alex Brown', points: 2234, category: 'Fitness' },
          ].map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center justify-between p-4 border-2 border-black shadow-neo-sm ${
                entry.rank === 1 ? 'bg-accent-50' : 'bg-white'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 border-2 border-black shadow-neo-sm flex items-center justify-center ${
                  entry.rank === 1 ? 'bg-accent-500' : 
                  entry.rank === 2 ? 'bg-secondary-500' : 
                  entry.rank === 3 ? 'bg-primary-500' : 'bg-neutral-300'
                }`}>
                  {entry.rank === 1 ? (
                    <Crown className="w-4 h-4 text-black" />
                  ) : entry.rank <= 3 ? (
                    <Medal className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-xs font-bold text-black">{entry.rank}</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-black">{entry.name}</p>
                  <p className="text-sm text-neutral-600">{entry.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-black">{entry.points.toLocaleString()}</p>
                <p className="text-xs text-neutral-500">points</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Categories */}
      <Card>
        <h2 className="text-2xl font-black text-black mb-6">Category Leaders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { category: 'Fitness', leader: 'You!', points: 1256 },
            { category: 'Health', leader: 'Jane Smith', points: 987 },
            { category: 'Learning', leader: 'Mike Johnson', points: 834 },
            { category: 'Productivity', leader: 'Sarah Wilson', points: 756 },
            { category: 'Finance', leader: 'Alex Brown', points: 623 },
            { category: 'Hobbies', leader: 'Emma Davis', points: 445 },
          ].map((cat) => (
            <div
              key={cat.category}
              className="p-4 bg-neutral-50 border-2 border-black shadow-neo-sm"
            >
              <h3 className="font-bold text-black capitalize">{cat.category}</h3>
              <p className="text-sm text-neutral-600 mt-1">{cat.leader}</p>
              <p className="text-lg font-black text-black">{cat.points} pts</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default LeaderboardPage;
