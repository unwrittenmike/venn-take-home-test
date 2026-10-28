import { ArrowRight } from 'lucide-react'
import type { SubmitEventHandler } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { Button } from '../../../components/Button'
import { Card } from '../../../components/Card'
import { TextField } from '../../../components/TextField'
import { NAME_MAX_LENGTH, type OnboardingFormValues } from '../schema/onboardingSchema'

export type OnboardingFieldProps = UseFormRegisterReturn & {
  error?: string
}

export interface OnboardingFormViewProps {
  fields: Record<keyof OnboardingFormValues, OnboardingFieldProps>
  onSubmit: SubmitEventHandler<HTMLFormElement>
  isSubmitting: boolean
  submitError?: string
  isSuccess: boolean
}

export function OnboardingFormView({
  fields,
  onSubmit,
  isSubmitting,
  submitError,
  isSuccess,
}: OnboardingFormViewProps) {
  return (
    <Card className="w-full max-w-lg">
      <h1 className="mb-6 text-center text-2xl text-black">Onboarding Form</h1>

      {isSuccess ? (
        <p role="status" className="text-center text-base text-black">
          Thanks! Your details have been submitted.
        </p>
      ) : (
        <form noValidate className="flex flex-col gap-5" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <TextField
              label="First Name"
              autoComplete="given-name"
              maxLength={NAME_MAX_LENGTH}
              {...fields.firstName}
            />
            <TextField
              label="Last Name"
              autoComplete="family-name"
              maxLength={NAME_MAX_LENGTH}
              {...fields.lastName}
            />
          </div>

          <TextField
            label="Phone Number"
            type="tel"
            autoComplete="tel"
            placeholder="+1"
            {...fields.phone}
          />

          <TextField label="Corporation Number" inputMode="numeric" {...fields.corporationNumber} />

          {submitError && (
            <p role="alert" className="text-sm text-red-600">
              {submitError}
            </p>
          )}

          <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
            Submit
            <ArrowRight className="size-4" />
          </Button>
        </form>
      )}
    </Card>
  )
}
