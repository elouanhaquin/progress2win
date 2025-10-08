import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button, Input, Card, Alert } from './UI';
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
  const [showCelebration, setShowCelebration] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0], // Today's date
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

      // Show celebration
      setShowCelebration(true);

      // Wait for celebration to finish before closing
      setTimeout(() => {
        reset();
        setSelectedCategory('');
        setShowCelebration(false);
        onSuccess();
        onClose();
      }, 3000);
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
    <>
      {showCelebration && <SuccessCelebration />}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <Card className="w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-black transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-black text-black mb-6">Ajouter une entrée</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Catégorie *
            </label>
            <select
              {...register('category')}
              onChange={handleCategoryChange}
              className="w-full px-4 py-3 border-2 border-black shadow-neo-sm focus:shadow-neo-md transition-all bg-white font-medium"
            >
              <option value="">Sélectionne une catégorie</option>
              {PROGRESS_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* Metric */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Métrique *
            </label>
            {selectedCategory && COMMON_METRICS[selectedCategory as keyof typeof COMMON_METRICS] ? (
              <select
                {...register('metric')}
                className="w-full px-4 py-3 border-2 border-black shadow-neo-sm focus:shadow-neo-md transition-all bg-white font-medium"
              >
                <option value="">Sélectionne une métrique</option>
                {COMMON_METRICS[selectedCategory as keyof typeof COMMON_METRICS].map((metric) => (
                  <option key={metric} value={metric}>
                    {metric.replace(/_/g, ' ').charAt(0).toUpperCase() + metric.replace(/_/g, ' ').slice(1)}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                {...register('metric')}
                placeholder="e.g., weight, distance, time"
                error={errors.metric?.message}
              />
            )}
            {errors.metric && (
              <p className="text-red-600 text-sm mt-1">{errors.metric.message}</p>
            )}
          </div>

          {/* Value and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Valeur *
              </label>
              <Input
                type="number"
                step="0.01"
                {...register('value', { valueAsNumber: true })}
                placeholder="0"
                error={errors.value?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Unité
              </label>
              <Input
                {...register('unit')}
                placeholder="kg, km, min..."
                error={errors.unit?.message}
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Date *
            </label>
            <Input
              type="date"
              {...register('date')}
              error={errors.date?.message}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Notes additionnelles..."
              className="w-full px-4 py-3 border-2 border-black shadow-neo-sm focus:shadow-neo-md transition-all bg-white font-medium resize-none"
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="accent"
              loading={isLoading}
              className="flex-1"
            >
              Ajouter
            </Button>
          </div>
        </form>
      </Card>
    </div>
    </>
  );
};
