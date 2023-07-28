import type { SpawnOptions, ChildProcess } from 'child_process'
import type {
  Plugin,
  PluginBuild,
  BuildOptions,
  ServeResult,
  BuildContext,
  ServeOptions
} from 'esbuild'


export type TDevServer = (() => void) & {
  server: ChildProcess
  ctx?: BuildContext
}

export type TNMOpts = {
  args?:string[]
  merge?:boolean
  configPath?:string
}

export type TOnRebuild = (devServer:TDevServer, build:PluginBuild) => void

export type TESBuildConf = BuildOptions & {
  cwd:string
  exts?:string[]
  dev?:boolean
  outDir?:string
  outFile?:string
  args?:string[]
  dispose?:boolean
  entryFile?:string
  mergeEnvs?:boolean
  plugins?: Plugin[]
  externalNM?:boolean,
  nodemonOpts?:TNMOpts
  entryPoints?:string[]
  onRebuild?:TOnRebuild
  aliases?:Record<string, string>
  envs?:Record<string, string|number|boolean>
}

export type TESWatchConf = Omit<TESBuildConf, `dev`|`dispose`|`nodemonOpts`> & {
  file?:string
  node?:string[]
  watchDir?:string
  spawn?:SpawnOptions
}
