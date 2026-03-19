import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CustomFileUpload } from './CustomFileUpload'

describe('CustomFileUpload', () => {
  it('dispara onChange ao selecionar arquivo', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <CustomFileUpload
        value={null}
        onChange={handleChange}
        aria-label="Upload de comprovante"
      />,
    )

    const input = screen.getByLabelText('Upload de comprovante') as HTMLInputElement
    const file = new File(['conteudo'], 'comprovante.txt', { type: 'text/plain' })
    await user.upload(input, file)

    expect(handleChange).toHaveBeenCalled()
    expect(input.files?.[0]?.name).toBe('comprovante.txt')
  })
})
