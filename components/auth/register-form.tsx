'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/providers';
import { hasEmailPassword, hasSocialAuth, getSocialMethods } from '@/lib/auth-config';
import { emailSchema, passwordSchema } from '@/lib/form-utils';
import { AuthFormField } from './auth-form-field';
import { SocialAuthButton } from './social-auth-button';

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
}

export function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const showEmail = hasEmailPassword();
  const socialMethods = getSocialMethods();
  const showSocial = hasSocialAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError('');
    const newErrors: Record<string, string> = {};

    if (name.trim().length === 0) newErrors.name = 'Name is required';

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;

    const passResult = passwordSchema.safeParse(password);
    if (!passResult.success) newErrors.password = passResult.error.errors[0].message;

    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    const { error } = await signUp({ email, password, displayName: name });
    setLoading(false);

    if (error) {
      setGlobalError(error);
    } else {
      onSuccess?.();
    }
  }

  async function handleSocialLogin(method: string) {
    setGlobalError(`Social login (${method}) is configured but requires backend OAuth setup.`);
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Get started with your new account</p>
      </div>

      {globalError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {globalError}
        </div>
      )}

      {showEmail && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthFormField
            id="register-name"
            label="Full name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={setName}
            error={errors.name}
            autoComplete="name"
            disabled={loading}
          />
          <AuthFormField
            id="register-email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
            error={errors.email}
            autoComplete="email"
            disabled={loading}
          />
          <AuthFormField
            id="register-password"
            label="Password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            autoComplete="new-password"
            disabled={loading}
          />
          <AuthFormField
            id="register-confirm"
            label="Confirm password"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={errors.confirmPassword}
            autoComplete="new-password"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Create account
          </button>
        </form>
      )}

      {showSocial && showEmail && <Divider text="or continue with" />}

      {showSocial && (
        <div className="space-y-2.5">
          {socialMethods.map((method) => (
            <SocialAuthButton
              key={method.id}
              method={method.id}
              label={method.label}
              onClick={() => handleSocialLogin(method.id)}
              disabled={loading}
            />
          ))}
        </div>
      )}

      {onLoginClick && (
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <button onClick={onLoginClick} className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign in
          </button>
        </p>
      )}
    </div>
  );
}

function Divider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">{text}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
