import http from 'http'
import { headers } from '@test/headers'
import { isStr, isObj } from '@keg-hub/jsutils'

const { TEST_SERVER_HTML_BODY, SERVER_PORT=5000 } = process.env

const server = http.createServer((req:http.IncomingMessage, res:http.ServerResponse<http.IncomingMessage>) => {

  const head = isObj(headers) ? headers : {}

  const body:string = isStr(TEST_SERVER_HTML_BODY)
    ? TEST_SERVER_HTML_BODY
    : `Missing html ENV`

  res.writeHead(200, head)
  res.write(body)
  res.end()

})

server.listen(SERVER_PORT)

console.log(`Server running on port ${SERVER_PORT}`)