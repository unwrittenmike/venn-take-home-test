import { http, HttpResponse } from 'msw'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const CORPORATION_NUMBER_URL = `${API_BASE_URL}/corporation-number/:number`
export const PROFILE_DETAILS_URL = `${API_BASE_URL}/profile-details`

export const VALID_CORPORATION_NUMBER = '123456789'

export const handlers = [
  http.get(CORPORATION_NUMBER_URL, ({ params }) =>
    params.number === VALID_CORPORATION_NUMBER
      ? HttpResponse.json({ corporationNumber: params.number, valid: true })
      : HttpResponse.json({ valid: false, message: 'Invalid corporation number' }, { status: 404 }),
  ),
  http.post(PROFILE_DETAILS_URL, () => new HttpResponse('OK')),
]
