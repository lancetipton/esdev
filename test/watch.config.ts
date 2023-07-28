import path from 'path'
import { fileURLToPath } from 'url'
import { eswatch } from '../dist/esm'
const dirname = path.dirname(fileURLToPath(import.meta.url))

const buildDir = path.join(dirname, `build`)
const outFile = path.join(buildDir, `index.js`)
const entryFile = path.join(dirname, `src/index.ts`)
const tsconfigFile = path.join(dirname, `tsconfig.json`)

eswatch({
  outFile,
  entryFile,
  plugins: [],
  cwd: dirname,
  mergeEnvs: true,
  watchDir: buildDir,
  sourcemap: 'inline',
  tsconfig: tsconfigFile,
  aliases: { [`@test/headers`]: path.resolve(dirname, `src/headers.ts`) },
  envs: {
    ...process.env,
    SERVER_PORT: `5000`,
    NODE_ENV: process.env.NODE_ENV || `local`,
    TEST_SERVER_HTML_BODY: `<html><body><p>Test Server</p></body></html>`,
  },
})
