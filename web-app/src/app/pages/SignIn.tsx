import * as Icons from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { getGithubOAuthUrl, getMeApi } from '@feature/auth/api';
import { useLogin } from '@feature/auth/hooks';
import { loginSchema, type LoginFormData } from '@feature/auth/types';
import { useAuthStore } from '@store/auth.store';
import { openOAuthPopup } from '@utility/oauth';
import { Button } from '@components/ui/button';
import * as CardUI from '@components/ui/card';
import { CheckboxField } from '@components/ui/checkbox-field';
import { Input } from '@components/ui/input';
import { BackLink } from '@components/ui/back-link';
import * as FormUI from '@components/ui/form';
import { PasswordField } from '@components/ui/password-field';
import { TextDivider } from '@components/ui/text-divider';
import { SocialButton } from '@components/ui/social-button';
import { Text } from '@components/ui/text';
import { PageContainer } from '@components/ui/page-container';

export function SignIn() {
  const loginMutation = useLogin();
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@itts.ac.id',
      password: 'Daisyorscry123^',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const handleGithubLogin = async () => {
    setIsOAuthLoading(true);

    try {
      const oauthUrl = getGithubOAuthUrl();

      const result = await openOAuthPopup(oauthUrl);

      if (result.success && result.accessToken && result.refreshToken) {
        localStorage.setItem('access_token', result.accessToken);
        localStorage.setItem('refresh_token', result.refreshToken);
        if (result.expiresIn) {
          localStorage.setItem('expires_in', result.expiresIn.toString());
        }

        try {
          const userResponse = await getMeApi();

          if (userResponse.data) {
            setAuth(userResponse.data, result.accessToken, result.refreshToken);
            toast.success('Successfully signed in with GitHub!');
            navigate('/admin');
          } else {
            throw new Error('Failed to fetch user data');
          }
        } catch (userError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('expires_in');
          throw new Error('Failed to authenticate user');
        }
      } else {
        toast.error(result.errorDescription || 'GitHub authentication failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to authenticate with GitHub';
      toast.error(errorMessage);
    } finally {
      setIsOAuthLoading(false);
    }
  };

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      toast.error(errorParam);
    }
  }, [searchParams]);

  return (
    <PageContainer maxWidth="md">
      <BackLink />

      <CardUI.Card tone="paper">
        <CardUI.CardContent padding="auth">
          <FormUI.FormHeader title="Welcome Back" subtitle="Sign in to continue your learning journey" />

          <FormUI.FormRoot onSubmit={handleSubmit(onSubmit)} gap="auth">
            <FormUI.FormField id="email" label="Email" error={errors.email?.message}>
              <Input
                {...register('email')}
                id="email"
                type="email"
                placeholder="your.email@itts.ac.id"
                icon={<Icons.Mail />}
                hasError={!!errors.email}
              />
            </FormUI.FormField>

            <FormUI.FormField id="password" label="Password" error={errors.password?.message}>
              <PasswordField
                {...register('password')}
                id="password"
                placeholder="Enter your password"
                hasError={!!errors.password}
              />
            </FormUI.FormField>

            <FormUI.FormRow justify="between" className="pt-1">
              <CheckboxField id="remember" label="Remember me" />
              <Button asChild variant="link-muted" size="link" type="button">
                <Link to="/forgot-password">Forgot password?</Link>
              </Button>
            </FormUI.FormRow>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              variant="accent"
              size="form"
              fullWidth
              className="mt-6"
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </FormUI.FormRoot>

          <TextDivider text="OR CONTINUE WITH" />

          <SocialButton provider="github" onClick={handleGithubLogin} isLoading={isOAuthLoading} />

          <FormUI.FormFooter>
            <Text>
              Don't have an account?{' '}
              <Link to="/register" className="transition-opacity hover:opacity-70">
                <Text variant="bold">Register here</Text>
              </Link>
            </Text>
          </FormUI.FormFooter>
        </CardUI.CardContent>
      </CardUI.Card>
    </PageContainer>
  );
}
