import {
  API_CHANGELOG,
  API_CURRENT_VERSION,
} from '../src/core/changelog'
import { createPublicHandler, jsonResponse } from '../src/core/http'

export default createPublicHandler({ methods: ['GET'] }, async ({ res }) => {
  jsonResponse(res, 200, {
    current_version: API_CURRENT_VERSION,
    data: API_CHANGELOG,
  })
})
