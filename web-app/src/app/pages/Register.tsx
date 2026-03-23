import * as Icons from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { useRegister } from '@feature/auth/hooks';
import {
  registerSchema,
  type ProgramType,
  type RegisterFormData,
  type RegisterRequest,
} from '@feature/auth/types';
import { BackLink } from '@components/ui/back-link';
import { Button } from '@components/ui/button';
import * as CardUI from '@components/ui/card';
import { CheckboxField } from '@components/ui/checkbox-field';
import * as DropdownUI from '@components/ui/dropdown';
import * as FormUI from '@components/ui/form';
import { Input } from '@components/ui/input';
import { PageContainer } from '@components/ui/page-container';
import { PasswordField } from '@components/ui/password-field';
import { Text } from '@components/ui/text';
import { Textarea } from '@components/ui/textarea';

const TRACKS = [
  {
    id: 'programming',
    name: 'Programming',
    color: '#3B82F6',
    description: 'Web, Mobile, and Software Development',
  },
  {
    id: 'networking',
    name: 'Networking',
    color: '#8B5CF6',
    description: 'Network Infrastructure & Cloud',
  },
  {
    id: 'devsecops',
    name: 'DevSecOps',
    color: '#EF4444',
    description: 'Security, DevOps, and Automation',
  },
] satisfies DropdownUI.DropdownOptionType<ProgramType>[];

type RegisterFormInput = z.input<typeof registerSchema>;

export function Register() {
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormInput, undefined, RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      agreeToTerms: false,
    },
  });

  const selectedTrack = watch('program');
  const selectedTrackName = TRACKS.find((track) => track.id === selectedTrack)?.name;

  const onSubmit = (data: RegisterFormData) => {
    const payload: RegisterRequest = {
      full_name: data.full_name,
      email: data.email,
      program: data.program,
      student_id: data.student_id,
      intake_year: data.intake_year,
      motivation: data.motivation,
    };

    registerMutation.mutate(payload);
  };

  const handleTrackChange = (value: ProgramType) => {
    setValue('program', value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  return (
    <PageContainer maxWidth="2xl" className="max-md:items-start">
      <BackLink />

      <CardUI.Card tone="paper">
        <CardUI.CardContent padding="auth">
          <FormUI.FormHeader
            title="Join ITTS Community"
            subtitle="Start your journey to become a tech superhuman"
          />

          <FormUI.FormRoot onSubmit={handleSubmit(onSubmit)} gap="auth">
            <FormUI.FormField
              id="full_name"
              label="Full Name"
              error={errors.full_name?.message}
            >
              <Input
                {...register("full_name")}
                id="full_name"
                type="text"
                placeholder="Enter your full name"
                icon={<Icons.User />}
                hasError={!!errors.full_name}
              />
            </FormUI.FormField>

            <FormUI.FormField
              id="email"
              label="Email"
              error={errors.email?.message}
            >
              <Input
                {...register("email")}
                id="email"
                type="email"
                placeholder="your.email@itts.ac.id"
                icon={<Icons.Mail />}
                hasError={!!errors.email}
              />
            </FormUI.FormField>

            <FormUI.FormGroup columns={2}>
              <FormUI.FormField
                id="password"
                label="Password"
                error={errors.password?.message}
              >
                <PasswordField
                  {...register("password")}
                  id="password"
                  placeholder="Create password"
                  hasError={!!errors.password}
                />
              </FormUI.FormField>

              <FormUI.FormField
                id="confirmPassword"
                label="Confirm Password"
                error={errors.confirmPassword?.message}
              >
                <PasswordField
                  {...register("confirmPassword")}
                  id="confirmPassword"
                  placeholder="Confirm password"
                  hasError={!!errors.confirmPassword}
                />
              </FormUI.FormField>
            </FormUI.FormGroup>

            <input type="hidden" {...register("program")} />
            <DropdownUI.Dropdown.Root
              value={selectedTrack}
              onChange={handleTrackChange}
              placeholder="Choose your learning track"
            >
              <DropdownUI.Dropdown.Label htmlFor="program">
                Select Learning Track
              </DropdownUI.Dropdown.Label>
              <DropdownUI.Dropdown.Trigger displayValue={selectedTrackName} />
              <DropdownUI.Dropdown.Content>
                {TRACKS.map((track) => (
                  <DropdownUI.Dropdown.Option
                    key={track.id}
                    value={track.id}
                    name={track.name}
                    description={track.description}
                    color={track.color}
                  />
                ))}
              </DropdownUI.Dropdown.Content>
              <DropdownUI.Dropdown.Error
                message={errors.program?.message}
              />
            </DropdownUI.Dropdown.Root>

            <FormUI.FormGroup columns={2}>
              <FormUI.FormField
                id="student_id"
                label="Student ID"
                error={errors.student_id?.message}
              >
                <Input
                  {...register("student_id")}
                  id="student_id"
                  type="text"
                  placeholder="e.g. 220102001"
                  icon={<Icons.GraduationCap />}
                  hasError={!!errors.student_id}
                />
              </FormUI.FormField>

              <FormUI.FormField
                id="intake_year"
                label="Intake Year"
                error={errors.intake_year?.message}
              >
                <Input
                  {...register("intake_year")}
                  id="intake_year"
                  type="text"
                  placeholder="e.g. 2022"
                  icon={<Icons.Calendar />}
                  hasError={!!errors.intake_year}
                />
              </FormUI.FormField>
            </FormUI.FormGroup>

            <FormUI.FormField
              id="motivation"
              label="Why do you want to join ITTS Community?"
              error={errors.motivation?.message}
            >
              <Textarea
                {...register("motivation")}
                id="motivation"
                placeholder="Share your motivation and learning goals..."
                icon={<Icons.MessageSquare />}
                hasError={!!errors.motivation}
                rows={4}
              />
            </FormUI.FormField>

            <CheckboxField
              {...register("agreeToTerms")}
              id="agreeToTerms"
              error={errors.agreeToTerms?.message}
              className="items-start"
              label={
                <Text className="leading-relaxed">
                  I agree to the{" "}
                  <Link
                    to="/terms-of-service"
                    className="transition-opacity hover:opacity-70"
                    style={{ color: "rgba(4, 9, 12, 0.6)" }}
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy-policy"
                    className="transition-opacity hover:opacity-70"
                    style={{ color: "rgba(4, 9, 12, 0.6)" }}
                  >
                    Privacy Policy
                  </Link>
                </Text>
              }
            />

            <Button
              type="submit"
              disabled={registerMutation.isPending}
              variant="accent"
              size="form"
              fullWidth
              className="mt-4 sm:mt-6"
            >
              {registerMutation.isPending && (
                <Icons.Loader2 className="h-4 w-4 animate-spin" />
              )}
              {registerMutation.isPending
                ? "Creating Account..."
                : "Create Account"}
            </Button>
          </FormUI.FormRoot>

          <FormUI.FormFooter>
            <Text>
              Already have an account?{" "}
              <Link
                to="/sign-in"
                className="transition-opacity hover:opacity-70"
              >
                <Text variant="bold">Sign in</Text>
              </Link>
            </Text>
          </FormUI.FormFooter>
        </CardUI.CardContent>
      </CardUI.Card>
    </PageContainer>
  );
}
