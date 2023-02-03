import path from 'node:path'
import * as esbuild from 'esbuild'
import { fileURLToPath } from 'url'
import { getAllFiles } from 'get-all-files'
import { dTSPathAliasPlugin } from 'esbuild-plugin-d-ts-path-alias'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const Root = path.join(dirname, `..`)
const outdir = path.join(Root, `dist`)
const srcDir = path.join(Root, `src`)

;(async () => {
  const entryPoints = await getAllFiles(srcDir).toArray()

  await esbuild.build({
    outdir,
    entryPoints,
    bundle: false,
    minify: false,
    sourcemap: true,
    target: 'es2020',
    platform: 'node',
    plugins: [
      dTSPathAliasPlugin({
        outputPath: Root,
        tsconfigPath: path.join(Root, 'tsconfig.json'),
      })
    ]
  })
})()