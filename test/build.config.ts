import path from 'path'
import { fileURLToPath } from 'url'
import { esbuild } from '../'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const buildDir = path.join(dirname, `build`)
const outFile = path.join(buildDir, `index.js`)
const entryFile = path.join(dirname, `src/index.ts`)
const tsconfigFile = path.join(dirname, `tsconfig.json`)

esbuild({
  outFile,
  entryFile,
  plugins: [],
  cwd: dirname,
  mergeEnvs: true,
  sourcemap: 'inline',
  tsconfig: tsconfigFile,
  dev: process.env.DEV_BUILD === `1`,
  aliases: { [`@test/headers`]: path.resolve(dirname, `src/headers.ts`) },
  envs: {
    SERVER_PORT: 5000,
    NODE_ENV: process.env.NODE_ENV || `local`,
    TEST_SERVER_HTML_BODY: `<html><body><p>Test Server</p></body></html>`,
  },
})
