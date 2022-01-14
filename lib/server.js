import express from 'express'

import Hooks from './hooks'
import Router from './router'
import jobQueue from './jobs'
import cacheManager from './cache'
import logger from './logger'
import { port, disableXPoweredBy } from '../config/app'

import EVENTS from './events'

const environment = process.env.NODE_ENV

const app = express()

// load app hooks
const hooks = Hooks(app)
// env vars
app.set('env', environment)
// Set app configuration
app.enable('strict routing')
app.enable('case sensitive routing')

// load the body parser middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// Powered by
const poweredBy = (req, res, next) => {
  res.set('X-Powered-By', 'USS Enterprise NCC-1701')
  next()
}
if (disableXPoweredBy) {
  app.disable('x-powered-by')
} else {
  app.use(poweredBy)
}

const jobs = jobQueue(hooks)
app.set('hooks', hooks)
// set the routes
const router = Router(app)

hooks.waitFor(EVENTS.routerReady, () => {
  app.listen(port, logger.info('Listening on port %s', port))
})

// do not automatically configure the connector if in test
if (environment !== 'test') {
  hooks.trigger(EVENTS.appConfigure)
}

const cache = cacheManager()

// expose app services
export default {
  hooks,
  jobs,
  cache,
  router,
  logger
}