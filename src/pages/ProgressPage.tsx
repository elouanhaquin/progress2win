import React, { useState, useEffect } from 'react';
import { BarChart3, Plus, Calendar, Target, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { LoadingSpinner } from '../components/UI';
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
    if (!confirm('Es-tu sûr de vouloir supprimer cette entrée?')) return;

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

  const getCategoryColor = (category: string) => {
    return '#9D4EDD';
  };

  return (
    <div className="w-full bg-[#FFF5E1]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display text-black">Suivi des progrès</h1>
            <p className="text-base sm:text-lg text-black/70 mt-1 font-medium">
              Surveille ton parcours vers le succès
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-[#FFD93D] border-2 border-black rounded-xl font-semibold text-base py-3 px-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Ajouter
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black/70">Total Entrées</p>
                <p className="text-4xl font-bold text-black mt-1">{progressEntries.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#9D4EDD] border-2 border-black rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black/70">Ce mois-ci</p>
                <p className="text-4xl font-bold text-black mt-1">{thisMonthCount}</p>
              </div>
              <div className="w-12 h-12 bg-[#9D4EDD] border-2 border-black rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black/70">Catégories</p>
                <p className="text-4xl font-bold text-black mt-1">{categories.size}</p>
              </div>
              <div className="w-12 h-12 bg-[#9D4EDD] border-2 border-black rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress List */}
        <div className="bg-white border-3 border-black rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
          <h2 className="text-xl sm:text-2xl font-display text-black mb-5">Entrées récentes</h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : progressEntries.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFD93D] border-3 border-black rounded-xl mb-4">
                <BarChart3 className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Aucune entrée encore</h3>
              <p className="text-black/60 mb-4">Commence à suivre tes progrès aujourd'hui!</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#9D4EDD] border-2 border-black rounded-xl font-semibold text-white py-2 px-4 shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150"
              >
                Ajouter ta première entrée
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {progressEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-2 border-black rounded-xl bg-[#FFF5E1] shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className="px-3 py-1 text-xs font-semibold border-2 border-black rounded-lg text-white"
                        style={{ backgroundColor: getCategoryColor(entry.category) }}
                      >
                        {entry.category.toUpperCase()}
                      </span>
                      <h3 className="text-base sm:text-lg font-semibold text-black break-words">
                        {entry.metric.replace(/_/g, ' ')}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-black/70">
                      <span className="font-semibold">
                        <span className="text-black text-lg">{entry.value}</span> {entry.unit || ''}
                      </span>
                      <span>
                        {format(new Date(entry.date), 'dd MMM yyyy')}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="mt-2 text-sm text-black/70 break-words">{entry.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="w-full sm:w-auto bg-white border-2 border-black rounded-lg font-semibold text-black py-2 px-4 shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[1px_1px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Progress Modal */}
        <AddProgressModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchProgress}
        />
      </div>
    </div>
  );
};

export default ProgressPage;
