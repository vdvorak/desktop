'use strict'

import * as express from 'express'
import * as webpack from 'webpack'
import * as devMiddleware from 'webpack-dev-middleware'
import * as hotMiddleware from 'webpack-hot-middleware'

import { forceUnwrap as u } from '../app/src/lib/fatal-error'

import configs = require('../app/webpack.development')

import { run } from './run'


function startApp() {
  const runningApp = run({ stdio: 'inherit' })
  if (!runningApp) {
    console.error(
      "Couldn't launch the app. You probably need to build it first. Run `yarn build:dev`."
    )
    process.exit(1)
    return
  }

  runningApp.on('close', () => {
    process.exit(0)
  })
}

if (process.env.NODE_ENV === 'production') {
  startApp()
} else {
  const rendererConfig = configs[1]

  const server = express()
  const compiler = webpack(rendererConfig)
  const port = process.env.PORT || 3000

  const message = 'Could not find public path from configuration'
  server.use(
    devMiddleware(compiler, {
      publicPath: u(message, u(message, u(message, rendererConfig).output).publicPath),
      noInfo: true,
    })
  )

  server.use(hotMiddleware(compiler))

  server.listen(port, 'localhost', (err: Error | null) => {
    if (err) {
      console.log(err)
      process.exit(1)
      return
    }

    console.log(`Server running at http://localhost:${port}`)
    startApp()
  })
}
