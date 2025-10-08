import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { LoadingSpinner } from './UI';
import { SuccessCelebration } from './SuccessCelebration';
import { progressApi } from '../services/api';
import { PROGRESS_CATEGORIES, COMMON_METRICS } from '../types';
import type { ProgressFormData } from '../types';

const progressSchema = z.object({
  category: z.string().min(1, 'La catégorie est requise'),
  metric: z.string().min(1, 'La métrique est requise'),
  value: z.number().min(0, 'La valeur doit être positive'),
  unit: z.string().optional(),
  notes: z.string().optional(),
  date: z.string().min(1, 'La date est requise'),
});

interface AddProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddProgressModal: React.FC<AddProgressModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: ProgressFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await progressApi.add({
        category: data.category,
        metric: data.metric,
        value: Number(data.value),
        unit: data.unit,
        notes: data.notes,
        date: data.date,
      });

      reset();
      setSelectedCategory('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Échec de l\'ajout de l\'entrée');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setValue('category', category);
  };

  if (!isOpen) return null;

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
          <h2 className="text-2xl sm:text-3xl font-display text-black mb-6">Ajouter une entrée</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-100 border-2 border-black rounded-xl p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block text-sm text-black mb-2">
                Catégorie *
              </label>
              <select
                {...register('category')}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none transition-all bg-white"
              >
                <option value="">Sélectionne une catégorie</option>
                {PROGRESS_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-600 text-xs mt-1">{errors.category.message}</p>
              )}
            </div>

            {/* Metric */}
            <div>
              <label className="block text-sm text-black mb-2">
                Métrique *
              </label>
              {selectedCategory && COMMON_METRICS[selectedCategory as keyof typeof COMMON_METRICS] ? (
                <select
                  {...register('metric')}
                  className="w-full px-4 py-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none transition-all bg-white"
                >
                  <option value="">Sélectionne une métrique</option>
                  {COMMON_METRICS[selectedCategory as keyof typeof COMMON_METRICS].map((metric) => (
                    <option key={metric} value={metric}>
                      {metric.replace(/_/g, ' ').charAt(0).toUpperCase() + metric.replace(/_/g, ' ').slice(1)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  {...register('metric')}
                  placeholder="e.g., weight, distance, time"
                  className="w-full px-4 py-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none transition-all bg-white"
                />
              )}
              {errors.metric && (
                <p className="text-red-600 text-xs mt-1">{errors.metric.message}</p>
              )}
            </div>

            {/* Value and Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-black mb-2">
                  Valeur *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('value', { valueAsNumber: true })}
                  placeholder="0"
                  className="w-full px-4 py-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none transition-all bg-white"
                />
                {errors.value && (
                  <p className="text-red-600 text-xs mt-1">{errors.value.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-black mb-2">
                  Unité
                </label>
                <input
                  {...register('unit')}
                  placeholder="kg, km, min..."
                  className="w-full px-4 py-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none transition-all bg-white"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm text-black mb-2">
                Date *
              </label>
              <input
                type="date"
                {...register('date')}
                className="w-full px-4 py-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none transition-all bg-white"
              />
              {errors.date && (
                <p className="text-red-600 text-xs mt-1">{errors.date.message}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm text-black mb-2">
                Notes
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="Notes additionnelles..."
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
                className="flex-1 bg-[#9D4EDD] border-2 border-black rounded-lg font-semibold text-white py-2.5 px-6 shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Ajout...
                  </>
                ) : (
                  'Ajouter'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
