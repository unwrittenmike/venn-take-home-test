import type { OnboardingFormValues } from '../schema/onboardingSchema'
import { API_BASE_URL } from './baseUrl'

const SUBMIT_ERROR_MESSAGE = 'Something went wrong. Please try again.'

export async function submitProfileDetails(values: OnboardingFormValues): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/profile-details`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  }).catch(() => {
    throw new Error(SUBMIT_ERROR_MESSAGE)
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(typeof body?.message === 'string' ? body.message : SUBMIT_ERROR_MESSAGE)
  }
}
