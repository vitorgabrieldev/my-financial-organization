# My Financial Organization

Aplicação web de organização financeira pessoal com:

- React 19 + Vite + TypeScript
- Tailwind CSS
- Supabase (Auth, Postgres e Storage)
- Login por email/senha com sessão curta de 4 horas
- Módulos: Dashboard, Transações, Categorias, Contas, Metas, Relatórios e Usuários
- Controle de acesso por módulo e ação: visualizar, listar, criar, editar e excluir
- Conversão de moedas por API externa (Frankfurter)
- Campos customizados de formulário (checkbox, select, data e upload)
- Máscaras para telefone e valores monetários

## Stack

- Frontend: `react`, `react-router-dom`, `react-icons`
- Banco/Auth/Storage: `@supabase/supabase-js`
- Utilitários: `date-fns`, `zod`
- Testes unitários: `vitest`, `@testing-library/react`
- Testes E2E: `@playwright/test`
- Deploy recomendado: Vercel

## Rodando localmente

1. Instale dependências:

```bash
npm install
```

2. Configure o ambiente:

```bash
cp .env.example .env.local
```

3. Suba em desenvolvimento:

```bash
npm run dev
```

4. Validação:

```bash
npm run lint
npm run build
```

## Banco de dados (Supabase)

Migrations:

- `supabase/migrations/20260319011500_init_financial_system.sql`
- `supabase/migrations/20260319040000_access_control_users.sql`
- `supabase/migrations/20260319053000_user_phone_access_update.sql`

Seed:

- `supabase/seed.sql`

### Estrutura principal

- Tabelas: `user_preferences`, `accounts`, `categories`, `goals`, `transactions`, `user_profiles`, `user_module_permissions`
- Views: `monthly_report`, `category_report`
- Bucket privado: `receipts` com policies por usuário
- RLS nas tabelas de domínio e de acesso
- Funções RPC administrativas:
  - `admin_create_user`
  - `admin_update_user_access`
  - `admin_delete_user`

### Seed admin

Cria (ou atualiza) usuário admin confirmado:

- Email: `vitorgabrieldeoliveiradev@gmail.com`
- Senha: `Vitorgabrieldev100.`

## Testes

Unitários (com cobertura):

```bash
npm run test:unit
```

E2E:

```bash
npm run test:e2e
```

Rodar tudo:

```bash
npm run test
```

Variáveis opcionais para E2E:

- `E2E_ADMIN_EMAIL`
- `E2E_ADMIN_PASSWORD`

## Deploy na Vercel

O projeto está pronto para deploy estático:

1. Importe o repositório na Vercel.
2. Defina as variáveis:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Build command: `npm run build`
4. Output directory: `dist`
5. SPA fallback já configurado em `vercel.json`
