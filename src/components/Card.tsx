import type { ComponentProps } from 'react'

export function Card({ className = '', ...divProps }: ComponentProps<'div'>) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-7 ${className}`} {...divProps} />
  )
}
