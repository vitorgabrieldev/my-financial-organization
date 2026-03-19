import { describe, expect, it } from 'vitest'
import { buildPermissionMap, can, makeDefaultPermissionDrafts } from './permissions'

describe('permissions', () => {
  it('constrói mapa padrão e respeita permissões', () => {
    const drafts = makeDefaultPermissionDrafts().map((item) => ({
      ...item,
      id: 'x',
      user_id: 'u1',
      created_at: '',
      updated_at: '',
    }))
    const map = buildPermissionMap(drafts)

    expect(can(null, map, 'dashboard', 'view')).toBe(true)
    expect(can(null, map, 'reports', 'create')).toBe(false)
    expect(can(null, map, 'users', 'view')).toBe(false)
  })

  it('admin possui acesso total', () => {
    const map = buildPermissionMap([])
    const isAllowed = can(
      {
        user_id: 'admin',
        email: 'admin@example.com',
        phone: null,
        full_name: 'Admin',
        is_admin: true,
        created_by: null,
        created_at: '',
        updated_at: '',
      },
      map,
      'users',
      'delete',
    )

    expect(isAllowed).toBe(true)
  })
})
