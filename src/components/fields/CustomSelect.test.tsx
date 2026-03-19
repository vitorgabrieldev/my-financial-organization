import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CustomSelect } from './CustomSelect'

describe('CustomSelect', () => {
  it('altera opção selecionada', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <CustomSelect aria-label="Tipo" onChange={handleChange} value="a">
        <option value="a">Opção A</option>
        <option value="b">Opção B</option>
      </CustomSelect>,
    )

    await user.selectOptions(screen.getByLabelText('Tipo'), 'b')
    expect(handleChange).toHaveBeenCalled()
  })
})
