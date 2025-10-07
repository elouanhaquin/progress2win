import React from 'react';
import { Users, Trophy, TrendingUp } from 'lucide-react';
import { Card, Button } from '../components/UI';

const ComparePage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-black">Compare Progress</h1>
          <p className="text-lg text-neutral-600 font-medium mt-2">
            See how you stack up against friends
          </p>
        </div>
        <Button variant="secondary" size="lg" icon={<Users className="w-5 h-5" />}>
          Invite Friends
        </Button>
      </div>

      {/* Comparison Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-600">Friends</p>
              <p className="text-3xl font-black text-black">8</p>
            </div>
            <div className="w-12 h-12 bg-primary-500 border-2 border-black shadow-neo-sm flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-600">Your Rank</p>
              <p className="text-3xl font-black text-black">#3</p>
            </div>
            <div className="w-12 h-12 bg-accent-500 border-2 border-black shadow-neo-sm flex items-center justify-center">
              <Trophy className="w-6 h-6 text-black" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-600">Improvement</p>
              <p className="text-3xl font-black text-black">+15%</p>
            </div>
            <div className="w-12 h-12 bg-success-500 border-2 border-black shadow-neo-sm flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Comparison Content */}
      <Card>
        <h2 className="text-2xl font-black text-black mb-6">Friend Comparisons</h2>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-200 border-2 border-black shadow-neo-sm mx-auto mb-4 flex items-center justify-center">
            <Users className="w-8 h-8 text-neutral-500" />
          </div>
          <h3 className="text-lg font-bold text-black mb-2">Coming Soon!</h3>
          <p className="text-neutral-600 mb-4">Comparison features are being developed</p>
          <Button variant="primary">
            Invite Your First Friend
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ComparePage;
