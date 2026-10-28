import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { submitProfileDetails } from '../api/profileDetails'
import { createOnboardingSchema, type OnboardingFormValues } from '../schema/onboardingSchema'
import { useCorporationNumberValidation } from './useCorporationNumberValidation'

const defaultValues: OnboardingFormValues = {
  firstName: '',
  lastName: '',
  phone: '',
  corporationNumber: '',
}

export function useOnboardingForm() {
  const validateCorporationNumber = useCorporationNumberValidation()
  const schema = useMemo(
    () => createOnboardingSchema(validateCorporationNumber),
    [validateCorporationNumber],
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormValues>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: zodResolver(schema),
    defaultValues,
  })

  const submitProfile = useMutation({ mutationFn: submitProfileDetails })

  const field = (name: keyof OnboardingFormValues) => ({
    ...register(name),
    error: errors[name]?.message,
  })

  return {
    fields: {
      firstName: field('firstName'),
      lastName: field('lastName'),
      phone: field('phone'),
      corporationNumber: field('corporationNumber'),
    },
    onSubmit: handleSubmit((values) => submitProfile.mutate(values)),
    isSubmitting: isSubmitting || submitProfile.isPending,
    submitError: submitProfile.error?.message,
    isSuccess: submitProfile.isSuccess,
  }
}
