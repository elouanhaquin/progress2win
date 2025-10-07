import React from 'react';
import { BarChart3, Plus, Calendar, Target } from 'lucide-react';
import { Card, Button } from '../components/UI';

const ProgressPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-black">Progress Tracking</h1>
          <p className="text-lg text-neutral-600 font-medium mt-2">
            Monitor your journey to success
          </p>
        </div>
        <Button variant="accent" size="lg" icon={<Plus className="w-5 h-5" />}>
          Add Progress
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-600">Total Entries</p>
              <p className="text-3xl font-black text-black">42</p>
            </div>
            <div className="w-12 h-12 bg-primary-500 border-2 border-black shadow-neo-sm flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-600">This Month</p>
              <p className="text-3xl font-black text-black">18</p>
            </div>
            <div className="w-12 h-12 bg-secondary-500 border-2 border-black shadow-neo-sm flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-600">Categories</p>
              <p className="text-3xl font-black text-black">5</p>
            </div>
            <div className="w-12 h-12 bg-accent-500 border-2 border-black shadow-neo-sm flex items-center justify-center">
              <Target className="w-6 h-6 text-black" />
            </div>
          </div>
        </Card>
      </div>

      {/* Progress List */}
      <Card>
        <h2 className="text-2xl font-black text-black mb-6">Recent Entries</h2>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-200 border-2 border-black shadow-neo-sm mx-auto mb-4 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-neutral-500" />
          </div>
          <h3 className="text-lg font-bold text-black mb-2">Coming Soon!</h3>
          <p className="text-neutral-600 mb-4">Progress tracking features are being developed</p>
          <Button variant="primary">
            Add Your First Entry
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ProgressPage;
