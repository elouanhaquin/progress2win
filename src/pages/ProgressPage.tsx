import React, { useState, useEffect } from 'react';
import { BarChart3, Plus, Calendar, Target, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Card, Button, LoadingSpinner } from '../components/UI';
import { AddProgressModal } from '../components/AddProgressModal';
import { progressApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { Progress } from '../types';

const ProgressPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progressEntries, setProgressEntries] = useState<Progress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  const fetchProgress = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const data = await progressApi.getAll(user.id);
      setProgressEntries(data);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [user]);

  const handleDelete = async (progressId: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      await progressApi.delete(progressId);
      fetchProgress();
    } catch (error) {
      console.error('Failed to delete progress:', error);
    }
  };

  const thisMonthCount = progressEntries.filter((p) => {
    const entryDate = new Date(p.date);
    const now = new Date();
    return (
      entryDate.getMonth() === now.getMonth() &&
      entryDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const categories = new Set(progressEntries.map((p) => p.category));

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
        <Button
          variant="accent"
          size="lg"
          icon={<Plus className="w-5 h-5" />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Progress
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-600">Total Entries</p>
              <p className="text-3xl font-black text-black">{progressEntries.length}</p>
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
              <p className="text-3xl font-black text-black">{thisMonthCount}</p>
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
              <p className="text-3xl font-black text-black">{categories.size}</p>
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

        {isLoading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : progressEntries.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-200 border-2 border-black shadow-neo-sm mx-auto mb-4 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-neutral-500" />
            </div>
            <h3 className="text-lg font-bold text-black mb-2">No entries yet</h3>
            <p className="text-neutral-600 mb-4">Start tracking your progress today!</p>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Add Your First Entry
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {progressEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 border-2 border-black bg-white shadow-neo-sm hover:shadow-neo-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 text-xs font-bold bg-primary-500 border border-black text-white">
                      {entry.category.toUpperCase()}
                    </span>
                    <h3 className="text-lg font-bold text-black">
                      {entry.metric.replace(/_/g, ' ')}
                    </h3>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-neutral-600">
                    <span className="font-semibold">
                      Value: <span className="text-black">{entry.value} {entry.unit || ''}</span>
                    </span>
                    <span>
                      Date: {format(new Date(entry.date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  {entry.notes && (
                    <p className="mt-2 text-sm text-neutral-600">{entry.notes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => handleDelete(entry.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Progress Modal */}
      <AddProgressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProgress}
      />
    </div>
  );
};

export default ProgressPage;
