import path from 'node:path'
import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express'
import type { VercelRequest, VercelResponse } from '@vercel/node'

import rootHandler from '../../api/index'
import healthHandler from '../../api/health'
import changelogHandler from '../../api/changelog'
import openApiHandler from '../../api/openapi.json'
import authLoginHandler from '../../api/auth/login'
import authRefreshHandler from '../../api/auth/refresh'
import authLogoutHandler from '../../api/auth/logout'
import v1MetaHandler from '../../api/v1/index'
import v2MetaHandler from '../../api/v2/index'
import preferencesHandler from '../../api/v1/preferences'
import accountsCollectionHandler from '../../api/v1/accounts/index'
import accountByIdHandler from '../../api/v1/accounts/[id]'
import categoriesCollectionHandler from '../../api/v1/categories/index'
import categoryByIdHandler from '../../api/v1/categories/[id]'
import goalsCollectionHandler from '../../api/v1/goals/index'
import goalByIdHandler from '../../api/v1/goals/[id]'
import transactionsCollectionHandler from '../../api/v1/transactions/index'
import transactionByIdHandler from '../../api/v1/transactions/[id]'
import dashboardSummaryHandler from '../../api/v1/dashboard/summary'
import monthlyReportHandler from '../../api/v1/reports/monthly'
import categoryReportHandler from '../../api/v1/reports/categories'

type ApiHandler = (
  req: VercelRequest,
  res: VercelResponse,
) => Promise<void> | void

const app = express()
const docsDir = path.join(process.cwd(), 'docs')

app.disable('x-powered-by')
app.use(express.json({ limit: '4mb' }))
app.use(express.urlencoded({ extended: true }))
app.use('/docs', express.static(docsDir))

const withHandler = (
  handler: ApiHandler,
  options?: { copyPathIdToQuery?: boolean },
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (options?.copyPathIdToQuery && req.params.id) {
        const query = req.query as Record<string, unknown>
        query.id = req.params.id
      }

      await handler(
        req as unknown as VercelRequest,
        res as unknown as VercelResponse,
      )
    } catch (error) {
      next(error)
    }
  }
}

app.all('/api', withHandler(rootHandler))
app.all('/api/health', withHandler(healthHandler))
app.all('/api/changelog', withHandler(changelogHandler))
app.all('/api/openapi.json', withHandler(openApiHandler))
app.all('/api/auth/login', withHandler(authLoginHandler))
app.all('/api/auth/refresh', withHandler(authRefreshHandler))
app.all('/api/auth/logout', withHandler(authLogoutHandler))
app.all('/api/v1', withHandler(v1MetaHandler))
app.all('/api/v2', withHandler(v2MetaHandler))
app.all('/api/v1/preferences', withHandler(preferencesHandler))

app.all('/api/v1/accounts', withHandler(accountsCollectionHandler))
app.all('/api/v1/accounts/:id', withHandler(accountByIdHandler, { copyPathIdToQuery: true }))

app.all('/api/v1/categories', withHandler(categoriesCollectionHandler))
app.all('/api/v1/categories/:id', withHandler(categoryByIdHandler, { copyPathIdToQuery: true }))

app.all('/api/v1/goals', withHandler(goalsCollectionHandler))
app.all('/api/v1/goals/:id', withHandler(goalByIdHandler, { copyPathIdToQuery: true }))

app.all('/api/v1/transactions', withHandler(transactionsCollectionHandler))
app.all('/api/v1/transactions/:id', withHandler(transactionByIdHandler, { copyPathIdToQuery: true }))

app.all('/api/v1/dashboard/summary', withHandler(dashboardSummaryHandler))
app.all('/api/v1/reports/monthly', withHandler(monthlyReportHandler))
app.all('/api/v1/reports/categories', withHandler(categoryReportHandler))

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
  })
})

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  void _next
  console.error(error)
  res.status(500).json({
    error: 'Erro interno inesperado no servidor de desenvolvimento.',
  })
})

const port = Number(process.env.PORT || 3000)

app.listen(port, () => {
  console.log(`Financial Core API (local dev) running at http://localhost:${port}`)
})
