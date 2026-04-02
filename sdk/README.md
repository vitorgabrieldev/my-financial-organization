# Financial Core SDK

SDK gerado automaticamente a partir da OpenAPI da API core.

## Gerar novamente

```bash
npm run sdk:generate
```

## Uso rápido

```ts
import {
  configureFinancialCoreSdk,
  AccountsService,
} from './sdk'

configureFinancialCoreSdk({
  baseUrl: 'https://seu-projeto.vercel.app',
  apiKey: 'SUA_API_KEY',
  bearerToken: 'JWT_DO_SUPABASE',
})

const accounts = await AccountsService.getApiV1Accounts({
  limit: 20,
})
```
