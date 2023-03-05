import type { TPluginOpts } from '../types'

import { typeCheck } from './typeCheck'
import { aliasPaths } from './aliasPaths' 
import { nodePolyfill } from './nodePolyfill'
import { nodemonWatch } from './nodemonWatch'
import { generateTypes } from './generateTypes'
import { externalNodeModules } from './externalNodeModules'
import {
  isBool,
  emptyArr,
  eitherArr,
} from '@keg-hub/jsutils'

export const getPlugins = (opts:TPluginOpts) => {

  const {
    outDir,
    plugins,
    aliases,
    nodemon,
    tsConfig,
    devServer,
    onRebuild,
    externalNM,
    checkTypes,
    exportTypes,
    addNodePolyfills,
  } = opts

  return [
    checkTypes && typeCheck(isBool(checkTypes) ? undefined : checkTypes),
    nodemon && nodemonWatch(devServer, onRebuild),
    aliases && aliasPaths(aliases),
    externalNM !== false && externalNodeModules(isBool(externalNM) ? undefined : externalNM),
    addNodePolyfills && nodePolyfill(),
    exportTypes && generateTypes(outDir || tsConfig ? { outDir, tsconfig: tsConfig } : undefined),
    // Add consumers custom plugins
    ...(eitherArr(plugins, emptyArr)),
    ].filter(Boolean)
}