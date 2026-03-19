import type { InputHTMLAttributes } from 'react'
import { LuCheck } from 'react-icons/lu'

interface CustomCheckboxProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'onChange' | 'checked'
  > {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
}

export const CustomCheckbox = ({
  checked,
  onChange,
  label,
  description,
  disabled,
  className = '',
  ...props
}: CustomCheckboxProps) => {
  return (
    <label
      className={`inline-flex cursor-pointer items-start gap-2 ${disabled ? 'cursor-not-allowed opacity-60' : ''} ${className}`}
    >
      <input
        {...props}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center border border-border bg-white text-white transition peer-focus-visible:border-primary peer-focus-visible:outline-none peer-checked:border-primary peer-checked:bg-primary">
        <LuCheck className="h-3.5 w-3.5 opacity-0 transition peer-checked:opacity-100" />
      </span>
      {label || description ? (
        <span className="grid gap-0.5 text-sm">
          {label ? <span className="text-ink">{label}</span> : null}
          {description ? <span className="text-xs text-muted">{description}</span> : null}
        </span>
      ) : null}
    </label>
  )
}
