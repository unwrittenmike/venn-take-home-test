import { queryOptions } from '@tanstack/react-query'
import { z } from 'zod'
import { API_BASE_URL } from './baseUrl'

const corporationNumberResponse = z.discriminatedUnion('valid', [
  z.object({ valid: z.literal(true), corporationNumber: z.string() }),
  z.object({ valid: z.literal(false), message: z.string() }),
])

export async function fetchCorporationNumber(number: string, signal?: AbortSignal) {
  const response = await fetch(`${API_BASE_URL}/corporation-number/${encodeURIComponent(number)}`, {
    signal,
  })
  const result = corporationNumberResponse.safeParse(await response.json().catch(() => null))

  // Invalid numbers come back as a 404 with a { valid: false, message } body.
  if ((response.ok || response.status === 404) && result.success) {
    return result.data
  }

  throw new Error('Could not verify corporation number')
}

export function corporationNumberQuery(number: string) {
  return queryOptions({
    queryKey: ['corporationNumber', number],
    queryFn: ({ signal }) => fetchCorporationNumber(number, signal),
    staleTime: Infinity,
  })
}
