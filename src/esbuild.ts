import type { TESBuildConf } from './types'

import { build } from 'esbuild'
import { buildDevServer } from './buildDevServer'
import aliasPlugin from 'esbuild-plugin-path-alias'
import { nodemonWatch, externalNodeModules } from './plugins'
import {
  toBool,
  exists,
  noOpArr,
  eitherArr,
} from '@keg-hub/jsutils'

const isDev = [`1`, 1, `true`, `T`, `yes`].includes(process.env.DEV_BUILD)

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
    plugins,
    aliases,
    outDir,
    outFile,
    entryFile,
    mergeEnvs,
    onRebuild,
    externalNM,
    nodemonOpts,
    entryPoints,
    ...rest
  } = config

  const configDev = exists(dev) ? toBool(dev) : false
  const noDevServer = !isDev && !configDev
  const devServer = buildDevServer(config, noDevServer)

  const inputFiles = eitherArr(entryPoints, [])
  !inputFiles.includes(entryFile) && inputFiles.push(entryFile)

  const outObj = outDir ? { outdir: outDir } : outFile ? { outfile: outFile } : {}

  /**
  * Build the code, then run the devServer
  * ESBuild config object
  * [See here for more info](https://esbuild.github.io/api/#build-api)
  */
  return await build({
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
    plugins: [
      ...(eitherArr(noDevServer && [nodemonWatch(devServer, onRebuild)], noOpArr)),
      ...(eitherArr(aliases && [aliasPlugin(aliases)], noOpArr)),
      ...(eitherArr(externalNM !== false && [externalNodeModules()], noOpArr)),
      ...(eitherArr(plugins, noOpArr))
    ],
    
  }).then(devServer)

}
