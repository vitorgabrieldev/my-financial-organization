import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CustomCheckbox } from './CustomCheckbox'

describe('CustomCheckbox', () => {
  it('dispara onChange ao clicar', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <CustomCheckbox
        checked={false}
        onChange={handleChange}
        label="Permitir edição"
      />,
    )

    await user.click(screen.getByLabelText('Permitir edição'))
    expect(handleChange).toHaveBeenCalledWith(true)
  })
})
