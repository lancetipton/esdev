import type { PluginBuild } from 'esbuild'
import type {
  TOnRebuild,
  TDevServer,
} from '../types'

/**
* Custom plugin to use nodemon
* Will watch for rebuilds and send a restart command to the nodemon process
*/
export const nodemonWatch = (devServer:TDevServer, onRebuild?:TOnRebuild) => {
  return {
    name: `nodemon-watch`,
    setup(build:PluginBuild){
      let count = 0
      build.onEnd(result => {
        if (count++ === 0) return console.log('App Built Successfully', result)

        onRebuild?.(devServer, build)
        devServer.server && devServer.server.send('restart')
      })
    }
  }
}