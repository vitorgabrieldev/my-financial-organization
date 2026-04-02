export interface ApiChangelogEntry {
  version: string
  released_at: string
  summary: string
  changes: string[]
}

export const API_CURRENT_VERSION = '1.2.0'

export const API_CHANGELOG: ApiChangelogEntry[] = [
  {
    version: '1.2.0',
    released_at: '2026-04-02',
    summary:
      'Core robusto com paginação cursor/sort, idempotência e endpoints de sessão e dashboard.',
    changes: [
      'Novo POST /api/auth/refresh para renovação de sessão.',
      'Novo POST /api/auth/logout para revogação de sessão.',
      'Novo GET /api/v1/dashboard/summary para resumo consolidado.',
      'Paginação com cursor/sort/order nas listagens principais.',
      'Suporte a Idempotency-Key em rotas mutáveis autenticadas.',
      'Payload de erro padronizado com campo code em toda API.',
      'Versionamento explícito em /api/v1 e /api/v2.',
      'Geração de SDK a partir do OpenAPI para consumo no frontend.',
    ],
  },
  {
    version: '1.1.0',
    released_at: '2026-04-01',
    summary: 'Documentação interativa avançada e login por email/senha na própria docs.',
    changes: [
      'UI da documentação melhorada com animações, skeleton e preview de response.',
      'Persistência de credenciais no navegador.',
      'Fluxo de login integrado na docs para gerar JWT automaticamente.',
    ],
  },
  {
    version: '1.0.0',
    released_at: '2026-03-30',
    summary: 'Primeira versão pública do core financeiro API-first.',
    changes: [
      'CRUD de contas, categorias, metas e transações.',
      'Relatórios mensal e por categoria.',
      'Autenticação com API key + Bearer Supabase.',
      'Permissões por módulo e ação.',
    ],
  },
]
