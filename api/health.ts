import { createPublicHandler, jsonResponse } from '../src/core/http'

export default createPublicHandler({ methods: ['GET'] }, async ({ res }) => {
  jsonResponse(res, 200, {
    status: 'ok',
    service: 'financial-core-api',
    timestamp: new Date().toISOString(),
  })
})
