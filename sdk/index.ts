import { OpenAPI } from './generated/core/OpenAPI'

export * from './generated'

export interface FinancialCoreSdkConfig {
  baseUrl: string
  apiKey: string
  bearerToken?: string | null
}

export const configureFinancialCoreSdk = (
  config: FinancialCoreSdkConfig,
): void => {
  OpenAPI.BASE = config.baseUrl.replace(/\/+$/, '')
  OpenAPI.HEADERS = {
    'X-API-Key': config.apiKey,
    ...(config.bearerToken
      ? { Authorization: `Bearer ${config.bearerToken}` }
      : {}),
  }
}
