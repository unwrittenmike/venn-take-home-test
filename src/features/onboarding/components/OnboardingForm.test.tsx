import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import {
  CORPORATION_NUMBER_URL,
  PROFILE_DETAILS_URL,
  VALID_CORPORATION_NUMBER,
} from '../../../test/handlers'
import { renderWithProviders } from '../../../test/render'
import { server } from '../../../test/server'
import { OnboardingForm } from './OnboardingForm'

const validValues = {
  firstName: 'Hello',
  lastName: 'World',
  phone: '+13062776103',
  corporationNumber: VALID_CORPORATION_NUMBER,
}

function setup() {
  const user = userEvent.setup()
  renderWithProviders(<OnboardingForm />)

  const fields = {
    firstName: screen.getByLabelText('First Name'),
    lastName: screen.getByLabelText('Last Name'),
    phone: screen.getByLabelText('Phone Number'),
    corporationNumber: screen.getByLabelText('Corporation Number'),
  }
  const submitButton = screen.getByRole('button', { name: /submit/i })

  async function fillValidForm() {
    await user.type(fields.firstName, validValues.firstName)
    await user.type(fields.lastName, validValues.lastName)
    await user.type(fields.phone, validValues.phone)
    await user.type(fields.corporationNumber, validValues.corporationNumber)
  }

  return { user, fields, submitButton, fillValidForm }
}

describe('OnboardingForm', () => {
  it('renders all four labelled fields and a submit button', () => {
    const { fields, submitButton } = setup()

    Object.values(fields).forEach((field) => expect(field).toBeInTheDocument())
    expect(submitButton).toBeEnabled()
  })

  it('shows a required error when a field is blurred empty', async () => {
    const { user, fields } = setup()

    await user.click(fields.firstName)
    await user.tab()

    expect(await screen.findByText('First name is required')).toBeInTheDocument()
    expect(fields.firstName).toHaveAttribute('aria-invalid', 'true')
  })

  it('limits names to 50 characters', async () => {
    const { user, fields } = setup()

    await user.type(fields.lastName, 'a'.repeat(60))

    expect(fields.lastName).toHaveValue('a'.repeat(50))
  })

  it.each([
    ['without the +1 prefix', '3062776103', 'Phone number must be +1 followed by 10 digits'],
    ['with special characters', '+1306-277-6103', 'Phone number must be +1 followed by 10 digits'],
    ['from the US', '+12125551234', 'Enter a valid Canadian phone number'],
  ])('rejects a phone number %s', async (_, phone, message) => {
    const { user, fields } = setup()

    await user.type(fields.phone, phone)
    await user.tab()

    expect(await screen.findByText(message)).toBeInTheDocument()
  })

  it('shows the API error when the corporation number is invalid', async () => {
    const { user, fields } = setup()

    await user.type(fields.corporationNumber, '111111111')
    await user.tab()

    expect(await screen.findByText('Invalid corporation number')).toBeInTheDocument()
  })

  it('does not treat an unexpected 404 response as a valid corporation number', async () => {
    server.use(
      http.get(CORPORATION_NUMBER_URL, () =>
        HttpResponse.json({ error: 'Not Found' }, { status: 404 }),
      ),
    )
    const { user, fields } = setup()

    await user.type(fields.corporationNumber, VALID_CORPORATION_NUMBER)
    await user.tab()

    expect(
      await screen.findByText('Could not verify corporation number. Please try again.'),
    ).toBeInTheDocument()
  })

  it('does not call the corporation API until the number is 9 digits', async () => {
    let requests = 0
    server.use(
      http.get(CORPORATION_NUMBER_URL, () => {
        requests++
        return HttpResponse.json({ valid: true, corporationNumber: '' })
      }),
    )
    const { user, fields } = setup()

    await user.type(fields.corporationNumber, '1234')
    await user.tab()

    expect(await screen.findByText('Corporation number must be 9 digits')).toBeInTheDocument()
    expect(requests).toBe(0)
  })

  it('waits for blur before re-validating the corporation number after a failed submit', async () => {
    let requests = 0
    server.use(
      http.get(CORPORATION_NUMBER_URL, () => {
        requests++
        return HttpResponse.json({ valid: true, corporationNumber: VALID_CORPORATION_NUMBER })
      }),
    )
    const { user, fields, submitButton } = setup()

    await user.click(submitButton)
    await screen.findByText('Corporation number is required')
    await user.type(fields.corporationNumber, VALID_CORPORATION_NUMBER)

    expect(requests).toBe(0)

    await user.tab()

    await waitFor(() => expect(requests).toBe(1))
    await waitFor(() =>
      expect(screen.queryByText('Corporation number is required')).not.toBeInTheDocument(),
    )
  })

  it('shows every field error and does not POST when submitted empty', async () => {
    let posted = false
    server.use(
      http.post(PROFILE_DETAILS_URL, () => {
        posted = true
        return new HttpResponse('OK')
      }),
    )
    const { user, submitButton } = setup()

    await user.click(submitButton)

    expect(await screen.findByText('First name is required')).toBeInTheDocument()
    expect(screen.getByText('Last name is required')).toBeInTheDocument()
    expect(screen.getByText('Phone number is required')).toBeInTheDocument()
    expect(screen.getByText('Corporation number is required')).toBeInTheDocument()
    expect(posted).toBe(false)
  })

  it('POSTs the expected payload when all fields are valid', async () => {
    let body: unknown
    server.use(
      http.post(PROFILE_DETAILS_URL, async ({ request }) => {
        body = await request.json()
        return new HttpResponse('OK')
      }),
    )
    const { user, submitButton, fillValidForm } = setup()

    await fillValidForm()
    await user.click(submitButton)

    expect(await screen.findByRole('status')).toHaveTextContent('Your details have been submitted')
    expect(body).toEqual(validValues)
  })

  it('shows the server message when submission returns 400', async () => {
    server.use(
      http.post(PROFILE_DETAILS_URL, () =>
        HttpResponse.json({ message: 'Invalid phone number' }, { status: 400 }),
      ),
    )
    const { user, submitButton, fillValidForm } = setup()

    await fillValidForm()
    await user.click(submitButton)

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid phone number')
  })

  it('shows a friendly message when the submission request fails to send', async () => {
    server.use(http.post(PROFILE_DETAILS_URL, () => HttpResponse.error()))
    const { user, submitButton, fillValidForm } = setup()

    await fillValidForm()
    await user.click(submitButton)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Something went wrong. Please try again.',
    )
  })

  describe('keyboard', () => {
    it('tabs through the fields in visual order, ending on submit', async () => {
      const { user, fields, submitButton } = setup()

      for (const element of [...Object.values(fields), submitButton]) {
        await user.tab()
        expect(element).toHaveFocus()
      }
    })

    it('submits with Enter', async () => {
      let body: unknown
      server.use(
        http.post(PROFILE_DETAILS_URL, async ({ request }) => {
          body = await request.json()
          return new HttpResponse('OK')
        }),
      )
      const { user } = setup()

      await user.tab()
      await user.keyboard(validValues.firstName)
      await user.tab()
      await user.keyboard(validValues.lastName)
      await user.tab()
      await user.keyboard(validValues.phone)
      await user.tab()
      await user.keyboard(`${validValues.corporationNumber}{Enter}`)

      expect(await screen.findByRole('status')).toBeInTheDocument()
      expect(body).toEqual(validValues)
    })

    it('moves focus to the first invalid field when submit fails', async () => {
      const { user, fields } = setup()

      await user.type(fields.firstName, validValues.firstName)
      await user.type(fields.phone, `${validValues.phone}{Enter}`)

      await waitFor(() => expect(fields.lastName).toHaveFocus())
    })
  })
})
