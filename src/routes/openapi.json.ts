import { createPublicHandler, jsonResponse } from '../core/http.js'
import { createOpenApiSpec } from '../core/openapi.js'

export default createPublicHandler(
  { methods: ['GET'] },
  async ({ res, url }) => {
    const spec = createOpenApiSpec(url.origin)
    jsonResponse(res, 200, spec)
  },
)

