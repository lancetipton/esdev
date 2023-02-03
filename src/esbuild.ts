import type { TESBuildConf } from './types'
import type { PluginBuild, BuildResult,BuildFailure } from 'esbuild'

import { build } from 'esbuild'
import { buildDevServer } from './buildDevServer'
import aliasPlugin from 'esbuild-plugin-path-alias'
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
    outFile,
    entryFile,
    mergeEnvs,
    onRebuild,
    nodemonOpts,
    entryPoints,
    ...rest
  } = config

  const configDev = exists(dev) ? toBool(dev) : false
  const noDevServer = !isDev && !configDev
  const devServer = buildDevServer(config, noDevServer)

  const inputFiles = eitherArr(entryPoints, [])
  !inputFiles.includes(entryFile) && inputFiles.push(entryFile)

  /**
  * Build the code, then run the devServer
  * ESBuild config object
  * [See here for more info](https://esbuild.github.io/api/#build-api)
  */
  return await build({
    outfile: outFile,
    bundle: true,
    minify: false,
    sourcemap: true,
    target: 'es2020',
    platform: 'node',
    assetNames: '[name]',
    allowOverwrite: true,
    entryPoints: inputFiles,
    ...rest,
    watch: !noDevServer && {
      onRebuild(error:BuildFailure, result:BuildResult) {
        if (error) console.error(`Error rebuilding app`, error)
        else console.log(`Rebuilt app successfully`, result)

        onRebuild?.(error, result)
        devServer.server && devServer.server.send('restart')
      },
    },
    plugins: [
      ...(eitherArr(aliases && [aliasPlugin(aliases)], noOpArr)),
      /**
      * Custom plugin to filter out node_modules
      * See more info [here](https://github.com/evanw/esbuild/issues/619#issuecomment-751995294)
      */
      {
        name: `external-node-modules`,
        setup(build:PluginBuild) {
          // Must not start with "/" or "./" or "../" which means it's a node_modules
          // eslint-disable-next-line no-useless-escape
          const filter = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/
          build.onResolve({ filter }, (args) => ({
            external: true,
            path: args.path,
          }))
        },
      },
      ...(eitherArr(plugins, noOpArr))
    ],
    
  }).then(devServer)

}
