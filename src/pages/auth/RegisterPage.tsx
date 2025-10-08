import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button, Input, Card, Alert } from '../../components/UI';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

const registerSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { confirmPassword, ...userData } = data;
      const user = await authApi.register(userData);
      
      // Auto-login after registration
      const authResponse = await authApi.login({
        email: data.email,
        password: data.password,
      });
      
      login(authResponse);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-accent-500 border-4 border-black shadow-neo-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-black text-3xl font-black">P2W</span>
          </div>
          <h1 className="text-3xl font-black text-black">Rejoins Progress2Win!</h1>
          <p className="text-neutral-600 font-medium">Commence à suivre tes progrès aujourd'hui</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="form-neo" noValidate>
            {error && (
              <Alert variant="danger" className="mb-6">
                {error}
              </Alert>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  placeholder="Jean"
                  icon={<User className="w-5 h-5" />}
                  error={errors.firstName?.message}
                  {...register('firstName')}
                />
                <Input
                  label="Nom"
                  placeholder="Dupont"
                  icon={<User className="w-5 h-5" />}
                  error={errors.lastName?.message}
                  {...register('lastName')}
                />
              </div>

              <Input
                label="Adresse email"
                type="email"
                placeholder="jean@exemple.com"
                icon={<Mail className="w-5 h-5" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <div className="relative">
                <Input
                  label="Mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Crée un mot de passe fort"
                  icon={<Lock className="w-5 h-5" />}
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-neutral-500 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirmer mot de passe"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirme ton mot de passe"
                  icon={<Lock className="w-5 h-5" />}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-neutral-500 hover:text-black transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <Button
                type="submit"
                variant="accent"
                size="lg"
                loading={isLoading}
                className="w-full"
              >
                Créer un compte
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Tu as déjà un compte?{' '}
              <Link
                to="/login"
                className="font-semibold text-primary-600 hover:text-primary-800 transition-colors"
              >
                Connecte-toi ici
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
