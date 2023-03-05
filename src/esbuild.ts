import type { TESBuildConf, TDevServer } from './types'

import { context } from 'esbuild'
import { getPlugins } from './plugins'
import { buildDevServer } from './buildDevServer'
import {
  toBool,
  exists,
  eitherArr,
} from '@keg-hub/jsutils'

const isDev = [`1`, 1, `true`, `T`, `yes`, `y`, `Y`].includes(process.env.DEV_BUILD)


const buildOnly = async (devServer:TDevServer, dispose:boolean=true) => {
  console.log(`Building application....\n`)
  await devServer.ctx.rebuild()
  console.log(`Application successfully built.\n`)
  dispose && await devServer.ctx.dispose()

  return devServer
}

const asServer = async (devServer:TDevServer) => {
  // Order is important
  // 1. ensure the app is build first
  // 2. Then start the nodemon server
  // 3. once nodemon is started, then start listening for changes
  console.log(`Starting application in watch mode...\n`)
  await devServer.ctx.rebuild()
  await devServer()
  await devServer.ctx.watch()

  return devServer
}

/**
* Calls esbuild.build API, then starts a dev server when configured
* Uses nodemon to reload the server
*/
export const esbuild = async (config:TESBuildConf) => {
  const {
    cwd,
    dev,
    args,
    envs,
    outDir,
    plugins,
    aliases,
    outFile,
    tsConfig,
    entryFile,
    mergeEnvs,
    onRebuild,
    externalNM,
    checkTypes,
    nodemonOpts,
    entryPoints,
    exportTypes,
    dispose=true,
    addNodePolyfills,
    ...rest
  } = config

  const configDev = exists(dev) ? toBool(dev) : false
  const noDevServer = !isDev && !configDev
  const devServer = buildDevServer(config, noDevServer)

  const inputFiles = eitherArr(entryPoints, [])
  !inputFiles.includes(entryFile) && inputFiles.push(entryFile)

  const outObj = outDir ? { outdir: outDir } : outFile ? { outfile: outFile } : {}

  devServer.ctx = await context({
    ...outObj,
    bundle: true,
    minify: false,
    sourcemap: true,
    target: 'esnext',
    platform: 'node',
    assetNames: '[name]',
    allowOverwrite: true,
    entryPoints: inputFiles,
    ...rest,
    plugins: getPlugins({
      outDir,
      aliases,
      plugins,
      tsConfig,
      onRebuild,
      devServer,
      checkTypes,
      externalNM,
      exportTypes,
      addNodePolyfills,
      nodemon: !noDevServer,
    }),
  })

  return noDevServer
    ? await buildOnly(devServer, dispose)
    : await asServer(devServer)

}
