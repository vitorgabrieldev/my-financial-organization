import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createOpenApiSpec } from '../src/core/openapi'

const outputPath = path.resolve(process.cwd(), 'sdk/openapi.json')

await mkdir(path.dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(createOpenApiSpec(), null, 2)}\n`, 'utf8')

console.log(`OpenAPI exported to ${outputPath}`)
