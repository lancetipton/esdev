import type { ChildProcess } from 'child_process'
import type {
  Plugin,
  PluginBuild,
  BuildOptions,
} from 'esbuild'


export type TDevServer = (() => void) & {
  server?: ChildProcess
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

export {}