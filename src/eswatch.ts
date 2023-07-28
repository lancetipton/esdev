import type { TESWatchConf } from './types'

import { context } from 'esbuild'
import { nodeWatch } from './plugins/nodeWatch'
import { buildNodeDevServer } from './buildDevServer'
import aliasPlugin from 'esbuild-plugin-path-alias'
import {
  noOpArr,
  eitherArr,
} from '@keg-hub/jsutils'

export const eswatch = async (config:TESWatchConf) => {
  const {
    cwd,
    args,
    exts,
    file,
    envs,
    node,
    spawn,
    outDir,
    plugins,
    aliases,
    outFile,
    watchDir,
    entryFile,
    mergeEnvs,
    onRebuild,
    externalNM,
    entryPoints,
    ...rest
  } = config

  const inputFiles = eitherArr(entryPoints, [])
  !inputFiles.includes(entryFile) && inputFiles.push(entryFile)
  
  const devServer = buildNodeDevServer(config)

  const outObj = outDir ? { outdir: outDir } : outFile ? { outfile: outFile } : {}

  const opts = {} as any
  externalNM !== false &&
    (opts.packages = `external`)

  devServer.ctx = await context({
    ...outObj,
    bundle: true,
    minify: false,
    sourcemap: true,
    target: `esnext`,
    platform: `node`,
    assetNames: `[name]`,
    allowOverwrite: true,
    entryPoints: inputFiles,
    ...rest,
    plugins: [
      ...(eitherArr([nodeWatch(devServer, onRebuild)], noOpArr)),
      ...(eitherArr(aliases && [aliasPlugin(aliases)], noOpArr)),
      ...(eitherArr(plugins, noOpArr)),
    ],
    resolveExtensions: exts || [
      `.tsx`,
      `.ts`,
      `.jsx`,
      `.js`,
      `.css`,
      `.json`,
      `.cjs`,
      `.mjs`
    ],
  })

  // Order is important
  // 1. ensure the app is build first
  // 2. Then start the nodemon server
  // 3. once node is started, then start listening for changes
  console.log(`Starting application in watch mode...\n`)
  await devServer.ctx.rebuild()
  await devServer()
  await devServer.ctx.watch()

  return devServer

}

