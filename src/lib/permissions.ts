import type {
  AppModule,
  ModulePermission,
  PermissionAction,
  UserProfile,
} from '../types/finance'

export interface ModuleDefinition {
  module: AppModule
  label: string
  description: string
}

export const moduleDefinitions: ModuleDefinition[] = [
  { module: 'dashboard', label: 'Dashboard', description: 'Visão geral financeira' },
  {
    module: 'transactions',
    label: 'Transações',
    description: 'Lançamentos, recorrências e parcelamentos',
  },
  {
    module: 'categories',
    label: 'Categorias',
    description: 'Cadastro de categorias de receita e despesa',
  },
  { module: 'accounts', label: 'Contas', description: 'Gestão de contas e saldos' },
  { module: 'goals', label: 'Metas', description: 'Planejamento de objetivos' },
  {
    module: 'reports',
    label: 'Relatórios',
    description: 'Análises consolidadas e exportação',
  },
  {
    module: 'users',
    label: 'Usuários',
    description: 'Gestão de usuários e acessos',
  },
]

export const actionLabels: Record<PermissionAction, string> = {
  view: 'Visualizar',
  list: 'Listar',
  create: 'Criar',
  edit: 'Editar',
  delete: 'Excluir',
}

export interface PermissionDraft {
  module: AppModule
  can_view: boolean
  can_list: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
}

export type PermissionMap = Record<AppModule, PermissionDraft>

const emptyDraftByModule = (module: AppModule): PermissionDraft => ({
  module,
  can_view: false,
  can_list: false,
  can_create: false,
  can_edit: false,
  can_delete: false,
})

export const buildPermissionMap = (
  permissions: ModulePermission[],
): PermissionMap => {
  const map = Object.fromEntries(
    moduleDefinitions.map(({ module }) => [module, emptyDraftByModule(module)]),
  ) as PermissionMap

  for (const permission of permissions) {
    map[permission.module] = {
      module: permission.module,
      can_view: permission.can_view,
      can_list: permission.can_list,
      can_create: permission.can_create,
      can_edit: permission.can_edit,
      can_delete: permission.can_delete,
    }
  }

  return map
}

export const makeDefaultPermissionDrafts = (): PermissionDraft[] => {
  return [
    {
      module: 'dashboard',
      can_view: true,
      can_list: true,
      can_create: false,
      can_edit: false,
      can_delete: false,
    },
    {
      module: 'transactions',
      can_view: true,
      can_list: true,
      can_create: true,
      can_edit: true,
      can_delete: true,
    },
    {
      module: 'categories',
      can_view: true,
      can_list: true,
      can_create: true,
      can_edit: true,
      can_delete: true,
    },
    {
      module: 'accounts',
      can_view: true,
      can_list: true,
      can_create: true,
      can_edit: true,
      can_delete: true,
    },
    {
      module: 'goals',
      can_view: true,
      can_list: true,
      can_create: true,
      can_edit: true,
      can_delete: true,
    },
    {
      module: 'reports',
      can_view: true,
      can_list: true,
      can_create: false,
      can_edit: false,
      can_delete: false,
    },
    {
      module: 'users',
      can_view: false,
      can_list: false,
      can_create: false,
      can_edit: false,
      can_delete: false,
    },
  ]
}

export const can = (
  profile: UserProfile | null,
  map: PermissionMap,
  module: AppModule,
  action: PermissionAction,
): boolean => {
  if (profile?.is_admin) return true

  const permission = map[module]
  if (!permission) return false

  switch (action) {
    case 'view':
      return permission.can_view
    case 'list':
      return permission.can_list
    case 'create':
      return permission.can_create
    case 'edit':
      return permission.can_edit
    case 'delete':
      return permission.can_delete
    default:
      return false
  }
}

export const serializePermissionDrafts = (
  drafts: PermissionDraft[],
): PermissionDraft[] => {
  return drafts.map((item) => ({
    module: item.module,
    can_view: item.can_view,
    can_list: item.can_list,
    can_create: item.can_create,
    can_edit: item.can_edit,
    can_delete: item.can_delete,
  }))
}
