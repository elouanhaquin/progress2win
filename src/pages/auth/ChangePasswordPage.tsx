import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button, Input, Card, Alert } from '../../components/UI';
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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-success-500 border-4 border-black shadow-neo-xl mx-auto mb-4 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-black">Mot de passe changé!</h1>
            <p className="text-neutral-600 font-medium mt-2">Tu vas être redirigé vers la page de connexion...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-500 border-4 border-black shadow-neo-xl mx-auto mb-4 flex items-center justify-center">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-black">Changement de mot de passe requis</h1>
          <p className="text-neutral-600 font-medium mt-2">
            Pour ta sécurité, tu dois changer ton mot de passe temporaire
          </p>
        </div>

        <Card>
          <Alert variant="warning" className="mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Mot de passe temporaire détecté</p>
                <p className="text-sm mt-1">
                  Tu as reçu un mot de passe temporaire par email. Choisis maintenant un nouveau mot de passe sécurisé.
                </p>
              </div>
            </div>
          </Alert>

          <form onSubmit={handleSubmit(onSubmit)} className="form-neo">
            {error && (
              <Alert variant="danger" className="mb-6">
                {error}
              </Alert>
            )}

            <div className="space-y-6">
              <Input
                label="Mot de passe actuel (temporaire)"
                type="password"
                placeholder="Entre ton mot de passe temporaire"
                icon={<Lock className="w-5 h-5" />}
                error={errors.currentPassword?.message}
                {...register('currentPassword')}
              />

              <Input
                label="Nouveau mot de passe"
                type="password"
                placeholder="Choisis un nouveau mot de passe"
                icon={<Lock className="w-5 h-5" />}
                error={errors.newPassword?.message}
                {...register('newPassword')}
              />

              <Input
                label="Confirmer le nouveau mot de passe"
                type="password"
                placeholder="Confirme ton nouveau mot de passe"
                icon={<Lock className="w-5 h-5" />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <div className="bg-neutral-50 border-2 border-black p-4">
                <h3 className="text-sm font-bold text-black mb-2">Ton mot de passe doit :</h3>
                <ul className="text-sm text-neutral-700 space-y-1">
                  <li>✓ Contenir au moins 6 caractères</li>
                  <li>✓ Être différent du mot de passe temporaire</li>
                  <li>✓ Être facile à retenir mais difficile à deviner</li>
                </ul>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full"
              >
                Changer mon mot de passe
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
