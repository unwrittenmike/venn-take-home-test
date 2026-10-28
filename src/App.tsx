import { OnboardingForm } from './features/onboarding/components/OnboardingForm'

export function App() {
  return (
    <main className="flex min-h-svh flex-col items-center bg-neutral-100 px-4 py-10">
      <p className="mb-16 text-lg text-black sm:mb-24">Step 1 of 5</p>
      <OnboardingForm />
    </main>
  )
}
