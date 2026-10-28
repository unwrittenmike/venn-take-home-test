import { useOnboardingForm } from '../hooks/useOnboardingForm'
import { OnboardingFormView } from './OnboardingFormView'

export function OnboardingForm() {
  const formProps = useOnboardingForm()
  return <OnboardingFormView {...formProps} />
}
