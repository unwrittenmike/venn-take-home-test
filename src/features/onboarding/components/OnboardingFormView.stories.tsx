import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { OnboardingFormView, type OnboardingFieldProps } from './OnboardingFormView'

function field(name: string, error?: string): OnboardingFieldProps {
  return {
    name,
    onChange: async () => {},
    onBlur: async () => {},
    ref: () => {},
    error,
  }
}

const emptyFields = {
  firstName: field('firstName'),
  lastName: field('lastName'),
  phone: field('phone'),
  corporationNumber: field('corporationNumber'),
}

const meta = {
  component: OnboardingFormView,
  parameters: { layout: 'padded' },
  args: {
    fields: emptyFields,
    onSubmit: fn((event) => event.preventDefault()),
    isSubmitting: false,
    isSuccess: false,
  },
} satisfies Meta<typeof OnboardingFormView>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const WithFieldErrors: Story = {
  args: {
    fields: {
      firstName: field('firstName', 'First name is required'),
      lastName: field('lastName', 'Last name is required'),
      phone: field('phone', 'Enter a valid Canadian phone number'),
      corporationNumber: field('corporationNumber', 'Invalid corporation number'),
    },
  },
}

export const Submitting: Story = {
  args: { isSubmitting: true },
}

export const ServerError: Story = {
  args: { submitError: 'Invalid phone number' },
}

export const Success: Story = {
  args: { isSuccess: true },
}
