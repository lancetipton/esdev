import type { TypecheckPluginOptions } from '@jgoz/esbuild-plugin-typecheck'
import type { BuildContext } from 'esbuild'
import type { ChildProcess } from 'child_process'
import type {
  Plugin,
  PluginBuild,
  BuildOptions,
} from 'esbuild'


export type TExternalNMConf = {
  dependencies?:boolean
  devDependencies?:boolean
  [key:string]: boolean
}

export type TDevServer = (() => void) & {
  server: ChildProcess
  ctx: BuildContext
}

export type TNMOpts = {
  args?:string[]
  merge?:boolean
  configPath?:string
}

export type TOnRebuild = (devServer:TDevServer, build:PluginBuild) => void

export type TESBuildConf = BuildOptions & {
  cwd:string
  dev?:boolean
  outDir?:string
  outFile?:string
  args?:string[]
  tsConfig?:string
  dispose?:boolean
  entryFile?:string
  mergeEnvs?:boolean
  plugins?: Plugin[]
  exportTypes?:boolean
  checkTypes?:boolean
  nodemonOpts?:TNMOpts
  entryPoints?:string[]
  onRebuild?:TOnRebuild
  addNodePolyfills?:boolean
  aliases?:Record<string, string>
  externalNM?:boolean | TExternalNMConf
  envs?:Record<string, string|number|boolean>
}


export type TPluginOpts = {
  nodemon:boolean
  outDir?: string
  tsConfig?: string
  plugins?: Plugin[]
  exportTypes?:boolean
  devServer:TDevServer
  onRebuild?:TOnRebuild
  addNodePolyfills?:boolean
  aliases?:Record<string, string>
  externalNM?:boolean | TExternalNMConf
  checkTypes?:boolean | TypecheckPluginOptions
}


export {}