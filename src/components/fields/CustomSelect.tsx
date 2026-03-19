import type { ReactNode, SelectHTMLAttributes } from 'react'
import { LuChevronDown } from 'react-icons/lu'

interface CustomSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode
}

export const CustomSelect = ({
  children,
  className = '',
  disabled,
  ...props
}: CustomSelectProps) => {
  return (
    <span
      className={`relative flex h-11 items-center border border-border bg-white text-sm text-ink transition focus-within:border-primary ${
        disabled ? 'opacity-60' : ''
      } ${className}`}
    >
      <select
        {...props}
        disabled={disabled}
        className="h-full w-full cursor-pointer appearance-none bg-transparent px-3 pr-10 text-sm text-ink outline-none disabled:cursor-not-allowed"
      >
        {children}
      </select>
      <LuChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-muted" />
    </span>
  )
}
