import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { corporationNumberQuery } from '../api/corporationNumber'

export function useCorporationNumberValidation() {
  const queryClient = useQueryClient()

  return useCallback(
    async (number: string) => {
      try {
        const result = await queryClient.query(corporationNumberQuery(number))
        return result.valid ? undefined : result.message
      } catch {
        return 'Could not verify corporation number. Please try again.'
      }
    },
    [queryClient],
  )
}
