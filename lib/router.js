
   
import EventEmitter from 'events'
import logger from './logger'

import config from '../config/app'
import routes from '../src/routes'

import EVENTS from './events'
import ERRORS from './errors'

import validateHeaderMiddleware from './middleware/validateHeader'
import allParamsMiddleware from './middleware/allParams'
// APP DEFAULT MIDDLEWARE
const DEFAULT_MIDDLEWARE = [
  validateHeaderMiddleware,
  allParamsMiddleware
] 

class Router extends EventEmitter {

  constructor() {
    super()

    this._hasAllPolicy = false
    this._internal = { 
      requiredHeaders: {}, 
      middleware: DEFAULT_MIDDLEWARE
    }
    this.routeQueue = Object.keys(routes)
  }

  // return the assigned client
  get client() {
    return this._client || null
  }

  // sets the app client
  set client(client) {
    this._client = client
  }

  // gets the internal middleware
  get middleware() {
    return this._internal.middleware
  }

  /**
   * Init the Router with the Express client
   * @param {Express} client 
   */
  async init(client) {
    // logger.warn('init', client)
    this.client = client

    return await this.generateRoutes()
  }

  /**
   * Async load the Controller resource
   * @param {string} controller 
   */
  async loadController(controller) {
    try {
      const internal = await import(`../src/controllers/${controller}`)
      return internal.default || internal
    } catch (e) {
      logger.error('loadController', controller, e)
      return Promise.reject(new Error(e.message))
    }
  }

  /**
   * Generate the App routes based on the defined route config
   */
  async generateRoutes() {
    if (this.client) {
      while (this.routeQueue.length) {
        const key = this.routeQueue.shift()
        // looking for compound string
        // ex: POST /magento/index-products
        const [verb, uri] = key.split(' ')

        try {
          this.validateRouteOption(verb)
          // define app method
          const method = verb.toLowerCase()
          // controller path
          // ex: magento/index-products
          const controllerPath = routes[key]
          // build the middleware stack
          const middlewareStack = this.middleware
          let controller
          // load the controller
          if(typeof controllerPath === 'string') {
            controller = await this.loadController(controllerPath)
          } else if(typeof controllerPath === 'object') {
            if(!controllerPath.controller) {
              throw new Error(ERRORS.invalidRouteController)
            }
            controller = await this.loadController(controllerPath.controller)
            // check to see if the route has requiredHeaders in the configuration
            if(controllerPath.requiredHeaders) {
              // set the route path requiredHeaders
              this._internal.requiredHeaders[key] = controllerPath.requiredHeaders
            }
          } else {
            throw new Error(ERRORS.invalidRouteConfiguration)
          }
          // assign the route to app client
          this.client[method](uri, ...middlewareStack, controller)
          // logger.info('route generated', method, uri)
          // notify listeners of status of route loading
          this.emit(EVENTS.routeLoaded, key)
        } catch (e) {
          logger.error('generateRoutes.error', key, e)
          this.emit(EVENTS.routerError, e, key)
        }
      }
      this.emit(EVENTS.routerReady)
    } else {
      throw new Error(ERRORS.appClientNotDefined)
    }
    return Promise.resolve()
  }

  /**
   * Get the Required headers for the Route given
   * @param {string} route 
   */
  getRequiredHeaders(route) {
    return this._internal.requiredHeaders[route]
  }

  /**
   * Validates the Route Verb requested
   * @param {string} verb
   * @throws ERRORS.invalidRouteVerb 
   */
  validateRouteOption(verb) {
    if (config.security.allowedRequestOptions.indexOf(verb) === -1) {
      throw new Error(ERRORS.invalidRouteVerb)
    }
  }
}

export default (app) => {
  const hooks = app.get('hooks')
  // create a new router
  const router = new Router()
  hooks.relay(router,
    // relay router specific events to the main app event bus
    EVENTS.routeLoaded,
    // when router has finished loading the router
    EVENTS.routerReady
  )
  // listen for route policies to be loaded into app config and ready for consumption
  // pass app as {client} and config
  hooks.waitFor(EVENTS.appConfigure, async () => router.init(app))

  return {
    getRequiredHeaders: (route) => router.getRequiredHeaders(route)
  }

}