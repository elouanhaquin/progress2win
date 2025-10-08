import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft } from 'lucide-react';
import { authApi } from '../../services/api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Adresse email invalide'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await authApi.forgotPassword(data.email);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Échec de l\'envoi de l\'email de réinitialisation');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#FFF5E1] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[#9D4EDD] border-3 border-black rounded-2xl shadow-[5px_5px_0_0_rgba(0,0,0,1)] mx-auto mb-4 flex items-center justify-center">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-display text-black">Vérifie ton email!</h1>
            <p className="text-black/70">Nous t'avons envoyé un mot de passe temporaire</p>
          </div>

          <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
            <div className="text-center space-y-6">
              <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                <p className="text-sm text-black">
                  Si un compte avec cet email existe, nous t'avons envoyé un mot de passe temporaire.
                </p>
              </div>

              <div className="space-y-4">
                <Link to="/login">
                  <button className="w-full bg-[#9D4EDD] border-2 border-black rounded-xl font-semibold text-white py-3 px-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150">
                    Retour à la connexion
                  </button>
                </Link>

                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-sm font-semibold text-[#9D4EDD] hover:text-[#7B2CBF] transition-colors"
                >
                  Essayer un autre email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF5E1] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#9D4EDD] border-3 border-black rounded-2xl shadow-[5px_5px_0_0_rgba(0,0,0,1)] mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-3xl font-display">P2W</span>
          </div>
          <h1 className="text-3xl font-display text-black">Mot de passe oublié?</h1>
          <p className="text-black/70">Pas de souci, on t'envoie les instructions</p>
        </div>

        <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
          <form onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="mb-6 bg-white border-2 border-black rounded-xl p-4 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                <p className="text-sm text-black">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-black mb-2">Adresse email</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    placeholder="Entre ton email"
                    className={`w-full pl-11 pr-4 py-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none transition-all bg-white ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#9D4EDD] border-2 border-black rounded-xl font-semibold text-white py-3 px-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  'Recevoir un mot de passe temporaire'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-semibold text-[#9D4EDD] hover:text-[#7B2CBF] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
