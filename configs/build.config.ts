import path from 'node:path'
import * as esbuild from 'esbuild'
import { fileURLToPath } from 'url'
import { promises as fs } from 'fs'
import { getAllFiles } from 'get-all-files'
import aliasPlugin from 'esbuild-plugin-path-alias'
import { dTSPathAliasPlugin } from 'esbuild-plugin-d-ts-path-alias'
import { externalNodeModules } from '../src/plugins/externalNodeModules'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(dirname, `..`)
const outdir = path.join(rootDir, `dist`)
const esmOut = path.join(outdir, `esm`)
const cjsOut = path.join(outdir, `cjs`)
const srcDir = path.join(rootDir, `src`)
const tsconfigPath = path.join(rootDir, 'tsconfig.json')

const minify = false

const cjsBuild = async (entryPoints:string[]) => {
  // Build the files with esbuild
  await esbuild.build({
    entryPoints,
    bundle: true,
    minify: minify,
    outdir: cjsOut,
    sourcemap: true,
    platform: "node",
    target: ["node16"],
    tsconfig: tsconfigPath,
    plugins: [
      externalNodeModules(),
      aliasPlugin({
        
      }),
    ]
  })
  .catch(() => process.exit(1))
}

const esmBuild = async (entryPoints:string[]) => {
  return await esbuild.build({
    entryPoints,
    outdir: esmOut,
    format: `esm`,
    bundle: true,
    minify: minify,
    sourcemap: true,
    // splitting: true,
    platform: 'node',
    target: ["esnext"],
    packages: 'external',
    tsconfig: tsconfigPath,
    plugins: [
      dTSPathAliasPlugin({
        outputPath: esmOut,
        tsconfigPath: path.join(rootDir, 'tsconfig.json'),
      }),
      externalNodeModules()
    ]
  })
  .catch(() => process.exit(1))
}


const entryFiles = async () => {
  await fs.writeFile(path.join(rootDir, "index.js"), "export * from './dist/esm/index.js'")
  await fs.writeFile(path.join(rootDir, "index.cjs"), "module.exports = require('./dist/cjs/index.js')")
}

const copyNM = async () => {
  const nmLoc = path.join(rootDir, "configs/nm.config.json")
  await fs.cp(nmLoc, path.join(cjsOut, `nm.config.json`))
  await fs.cp(nmLoc, path.join(esmOut, `nm.config.json`))
}

;(async () => {

  // Remove the existing output dir
  await fs.rm(outdir, { recursive: true, force: true })

  // Get all paths to be generated
  const entryPoints = await getAllFiles(srcDir).toArray()
  await cjsBuild(entryPoints)
  await esmBuild(entryPoints)
  await copyNM()
  await entryFiles()

})()