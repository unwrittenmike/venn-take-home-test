import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { z } from 'zod'

export const NAME_MAX_LENGTH = 50

const PHONE_FORMAT = /^\+1\d{10}$/
const CORPORATION_NUMBER_FORMAT = /^\d{9}$/

function isCanadianPhoneNumber(value: string) {
  const phoneNumber = parsePhoneNumberFromString(value)
  return phoneNumber?.country === 'CA' && phoneNumber.isValid()
}

function requiredName(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(NAME_MAX_LENGTH, `${label} must be ${NAME_MAX_LENGTH} characters or fewer`)
}

export function createOnboardingSchema(
  validateCorporationNumber: (number: string) => Promise<string | undefined>,
) {
  return z.object({
    firstName: requiredName('First name'),
    lastName: requiredName('Last name'),
    phone: z
      .string()
      .trim()
      .min(1, 'Phone number is required')
      .regex(PHONE_FORMAT, 'Phone number must be +1 followed by 10 digits')
      .refine(isCanadianPhoneNumber, 'Enter a valid Canadian phone number'),
    corporationNumber: z
      .string()
      .trim()
      .min(1, 'Corporation number is required')
      .regex(CORPORATION_NUMBER_FORMAT, 'Corporation number must be 9 digits')
      .superRefine(async (value, ctx) => {
        // Zod runs refinements even when earlier checks fail.
        if (!CORPORATION_NUMBER_FORMAT.test(value)) return

        const error = await validateCorporationNumber(value)
        if (error) ctx.addIssue({ code: 'custom', message: error })
      }),
  })
}

export type OnboardingFormValues = z.infer<ReturnType<typeof createOnboardingSchema>>
