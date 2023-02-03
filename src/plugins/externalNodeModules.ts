import type { PluginBuild } from 'esbuild'

/**
* Custom plugin to filter out node_modules
* See more info [here](https://github.com/evanw/esbuild/issues/619#issuecomment-751995294)
*/
export const externalNodeModules = () => {
  return {
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
  }
}