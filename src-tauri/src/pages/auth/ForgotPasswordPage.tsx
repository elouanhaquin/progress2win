import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button, Input, Card, Alert } from '../../components/UI';
import { authApi } from '../../services/api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
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
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-success-500 border-4 border-black shadow-neo-xl mx-auto mb-4 flex items-center justify-center">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-black">Check Your Email!</h1>
            <p className="text-neutral-600 font-medium">We've sent you a password reset link</p>
          </div>

          <Card>
            <div className="text-center space-y-6">
              <Alert variant="success">
                If an account with that email exists, we've sent you a password reset link.
              </Alert>
              
              <div className="space-y-4">
                <Link to="/login">
                  <Button variant="primary" className="w-full">
                    Back to Login
                  </Button>
                </Link>
                
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors"
                >
                  Try a different email
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-secondary-500 border-4 border-black shadow-neo-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-3xl font-black">P2W</span>
          </div>
          <h1 className="text-3xl font-black text-black">Forgot Password?</h1>
          <p className="text-neutral-600 font-medium">No worries, we'll send you reset instructions</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="form-neo">
            {error && (
              <Alert variant="danger" className="mb-6">
                {error}
              </Alert>
            )}

            <div className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                icon={<Mail className="w-5 h-5" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Button
                type="submit"
                variant="secondary"
                size="lg"
                loading={isLoading}
                className="w-full"
              >
                Send Reset Link
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
