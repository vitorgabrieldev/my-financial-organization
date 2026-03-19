import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CustomDateInput } from './CustomDateInput'

describe('CustomDateInput', () => {
  it('aceita mudança de data', () => {
    const handleChange = vi.fn()

    render(
      <CustomDateInput
        aria-label="Data"
        value="2026-03-01"
        onChange={handleChange}
      />,
    )

    fireEvent.change(screen.getByLabelText('Data'), {
      target: { value: '2026-03-10' },
    })
    expect(handleChange).toHaveBeenCalled()
  })
})
