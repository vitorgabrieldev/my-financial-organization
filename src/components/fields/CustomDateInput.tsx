import type { InputHTMLAttributes } from 'react'
import { LuCalendarDays } from 'react-icons/lu'

type CustomDateInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export const CustomDateInput = ({
  className = '',
  disabled,
  ...props
}: CustomDateInputProps) => {
  return (
    <span
      className={`relative flex h-11 items-center border border-border bg-white text-sm text-ink transition focus-within:border-primary ${
        disabled ? 'opacity-60' : ''
      } ${className}`}
    >
      <input
        {...props}
        type="date"
        disabled={disabled}
        className="h-full w-full cursor-pointer bg-transparent px-3 pr-10 text-sm text-ink outline-none disabled:cursor-not-allowed"
      />
      <LuCalendarDays className="pointer-events-none absolute right-3 h-4 w-4 text-muted" />
    </span>
  )
}
