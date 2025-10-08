import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
  });

  console.log('Form errors:', errors);

  const onSubmit = async (data: LoginFormData) => {
    console.log('Form submitted with data:', data);
    setIsLoading(true);
    setError(null);

    try {
      const authResponse = await authApi.login(data);
      console.log('Login successful:', authResponse);
      login(authResponse);

      // If password reset is required, redirect to change password page
      if (authResponse.passwordResetRequired) {
        navigate('/change-password');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5E1] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#9D4EDD] border-3 border-black rounded-2xl shadow-[5px_5px_0_0_rgba(0,0,0,1)] mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-3xl font-display">P2W</span>
          </div>
          <h1 className="text-3xl font-display text-black">Bienvenue!</h1>
          <p className="text-black/70">Connecte-toi pour continuer tes progrès</p>
        </div>

        <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
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

              <div>
                <label className="block text-sm text-black mb-2">Mot de passe</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Entre ton mot de passe"
                    className={`w-full pl-11 pr-12 py-2.5 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none transition-all bg-white ${
                      errors.password ? 'border-red-500' : ''
                    }`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-[#9D4EDD] hover:text-[#7B2CBF] transition-colors"
                >
                  Mot de passe oublié?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#9D4EDD] border-2 border-black rounded-xl font-semibold text-white py-3 px-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connexion...
                  </>
                ) : (
                  'Connexion'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-black/70">
              Pas de compte?{' '}
              <Link
                to="/register"
                className="font-semibold text-[#9D4EDD] hover:text-[#7B2CBF] transition-colors"
              >
                Inscris-toi ici
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
