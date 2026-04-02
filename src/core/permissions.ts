import type { SupabaseClient } from '@supabase/supabase-js'
import { AppError, ForbiddenError } from './errors'
import type { AppModule, PermissionAction } from './types'

const actionColumnMap: Record<PermissionAction, string> = {
  view: 'can_view',
  list: 'can_list',
  create: 'can_create',
  edit: 'can_edit',
  delete: 'can_delete',
}

export const requireModulePermission = async (
  supabase: SupabaseClient,
  userId: string,
  module: AppModule,
  action: PermissionAction,
): Promise<void> => {
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('user_id', userId)
    .maybeSingle()

  if (profileError) {
    throw new AppError(
      500,
      `Falha ao verificar perfil do usuário: ${profileError.message}`,
      undefined,
      'PERMISSIONS_PROFILE_LOOKUP_FAILED',
    )
  }

  if (profile?.is_admin) {
    return
  }

  const permissionColumn = actionColumnMap[action]

  const { data: permission, error: permissionError } = await supabase
    .from('user_module_permissions')
    .select(permissionColumn)
    .eq('user_id', userId)
    .eq('module', module)
    .maybeSingle()

  if (permissionError) {
    throw new AppError(
      500,
      `Falha ao verificar permissão de acesso: ${permissionError.message}`,
      undefined,
      'PERMISSIONS_LOOKUP_FAILED',
    )
  }

  const row = (permission ?? {}) as Record<string, unknown>
  const isAllowed = Boolean(row[permissionColumn])

  if (!isAllowed) {
    throw new ForbiddenError(
      `Sem permissão para ${action} no módulo ${module}.`,
    )
  }
}
