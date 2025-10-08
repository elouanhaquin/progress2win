import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
  newPassword: z.string().min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string().min(1, 'Confirme ton nouveau mot de passe'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await authApi.changePassword(data.currentPassword, data.newPassword);
      setSuccess(true);

      // Logout after 2 seconds and redirect to login
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Échec du changement de mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#FFF5E1] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[#9D4EDD] border-3 border-black rounded-2xl shadow-[5px_5px_0_0_rgba(0,0,0,1)] mx-auto mb-4 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-display text-black">Mot de passe changé!</h1>
            <p className="text-black/70 mt-2">Tu vas être redirigé vers la page de connexion...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF5E1] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#9D4EDD] border-3 border-black rounded-2xl shadow-[5px_5px_0_0_rgba(0,0,0,1)] mx-auto mb-4 flex items-center justify-center">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-display text-black">Changement de mot de passe requis</h1>
          <p className="text-black/70 mt-2">
            Pour ta sécurité, tu dois changer ton mot de passe temporaire
          </p>
        </div>

        <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
          <div className="mb-6 bg-[#FFD93D] border-2 border-black rounded-xl p-4 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-black" />
              <div>
                <p className="font-semibold text-black">Mot de passe temporaire détecté</p>
                <p className="text-sm mt-1 text-black/80">
                  Tu as reçu un mot de passe temporaire par email. Choisis maintenant un nouveau mot de passe sécurisé.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="mb-6 bg-white border-2 border-black rounded-xl p-4 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                <p className="text-sm text-black">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-black mb-2">Mot de passe actuel (temporaire)</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    placeholder="Entre ton mot de passe temporaire"
                    className={`w-full pl-11 pr-4 py-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none transition-all bg-white ${
                      errors.currentPassword ? 'border-red-500' : ''
                    }`}
                    {...register('currentPassword')}
                  />
                </div>
                {errors.currentPassword && (
                  <p className="text-xs text-red-600 mt-1">{errors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-black mb-2">Nouveau mot de passe</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    placeholder="Choisis un nouveau mot de passe"
                    className={`w-full pl-11 pr-4 py-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none transition-all bg-white ${
                      errors.newPassword ? 'border-red-500' : ''
                    }`}
                    {...register('newPassword')}
                  />
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-red-600 mt-1">{errors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-black mb-2">Confirmer le nouveau mot de passe</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    placeholder="Confirme ton nouveau mot de passe"
                    className={`w-full pl-11 pr-4 py-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none transition-all bg-white ${
                      errors.confirmPassword ? 'border-red-500' : ''
                    }`}
                    {...register('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="bg-[#FFF5E1] border-2 border-black rounded-xl p-4 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                <h3 className="text-sm font-semibold text-black mb-2">Ton mot de passe doit :</h3>
                <ul className="text-sm text-black/70 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-[#9D4EDD] font-semibold">✓</span>
                    <span>Contenir au moins 6 caractères</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#9D4EDD] font-semibold">✓</span>
                    <span>Être différent du mot de passe temporaire</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#9D4EDD] font-semibold">✓</span>
                    <span>Être facile à retenir mais difficile à deviner</span>
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#9D4EDD] border-2 border-black rounded-xl font-semibold text-white py-3 px-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Changement en cours...
                  </>
                ) : (
                  'Changer mon mot de passe'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
