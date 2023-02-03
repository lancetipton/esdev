import path from 'node:path'
import * as esbuild from 'esbuild'
import { fileURLToPath } from 'url'
import { promises as fs } from 'fs'
import { getAllFiles } from 'get-all-files'
import { dTSPathAliasPlugin } from 'esbuild-plugin-d-ts-path-alias'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const Root = path.join(dirname, `..`)
const outdir = path.join(Root, `dist`)
const srcDir = path.join(Root, `src`)
const typesDir = path.join(outdir, `src`)

;(async () => {

  // Remove the existing output dir
  await fs.rm(outdir, { recursive: true, force: true })

  // Get all paths to be generated
  const entryPoints = await getAllFiles(srcDir).toArray()

  // Build the files with esbuild
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
        outputPath: outdir,
        tsconfigPath: path.join(Root, 'tsconfig.json'),
      })
    ]
  })

  // Copy the types into the correct dir to match the dist output dir
  await fs.cp(typesDir, outdir, { recursive: true, force: true })
  await fs.rm(typesDir, { recursive: true, force: true })

})()