import { camelCase } from '../../src/utils/stringHelpers'
import config, { connector } from '../../config/app'

/**
 * Validated the required headers middleware
 * @params {object} req
 * @params {object} res
 * @params {function} next
 */
export default (req, res, next) => {
  // validate headers logic
  const validHeaders = {}
  const missingHeaders = []
  const routeKey = `${req.method} ${req.route.path}`

  const validateHeaders = (headers) => {
    headers.forEach(key => {
      const header = req.headers[key]
      if (header && typeof header === 'string') {
        validHeaders[camelCase(key)] = header
      } else {
        missingHeaders.push(key)
      }
    })
  }
  // get app config required headers
  const configRequiredHeaders = config.router.requiredHeaders || []
  // route  levelrequired headers
  const routeRequiredHeaders = connector.router.getRequiredHeaders(routeKey) || []
  // combine required header into one lookup
  const requiredHeaders = [...configRequiredHeaders, ...routeRequiredHeaders]
  if(requiredHeaders.length) {
    validateHeaders(requiredHeaders)
  }
  
  if (missingHeaders.length) {
    const missingMsg = missingHeaders.join(', ')
    return res.status(400).send({
      code: 'invalidHeaders',
      error: `Headers are invalid: missing ${missingMsg}`
    })
  }
  // make the valid headers available via request instead of implied
  req.getValidatedHeaders = () => {
    return validHeaders
  }

  return next()
}
