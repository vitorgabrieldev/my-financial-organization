import { useId, type ChangeEvent, type InputHTMLAttributes } from 'react'
import { LuFileUp } from 'react-icons/lu'

interface CustomFileUploadProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
  value: File | null
  onChange: (file: File | null) => void
  placeholder?: string
}

export const CustomFileUpload = ({
  value,
  onChange,
  disabled,
  placeholder = 'Selecione um arquivo',
  className = '',
  ...props
}: CustomFileUploadProps) => {
  const inputId = useId()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null
    onChange(selected)
  }

  return (
    <label
      htmlFor={inputId}
      className={`group flex h-11 cursor-pointer items-center gap-2 border border-border bg-white px-3 text-sm text-ink transition hover:border-primary focus-within:border-primary ${
        disabled ? 'cursor-not-allowed opacity-60' : ''
      } ${className}`}
    >
      <input
        {...props}
        id={inputId}
        type="file"
        disabled={disabled}
        onChange={handleChange}
        className="sr-only"
      />
      <LuFileUp className="h-4 w-4 text-muted transition group-hover:text-primary" />
      <span className="truncate">{value?.name || placeholder}</span>
    </label>
  )
}
