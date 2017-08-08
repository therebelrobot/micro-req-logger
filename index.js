const ksuid = require('ksuid')
const Logger = require('@therebel/log')

function reqLog ({ serviceName, logLevel, nodeEnv }) {
  logger = Logger({ name: `${serviceName} [${nodeEnv}]`, level: logLevel, env: nodeEnv })
  return function (handler) {
    return function (req, res) {
      requestStart(req, res, logger)
      return handler(req, res).then(
        (...args) => {
          requestFinish(req, res, logger)
          return Promise.resolve(...args)
        },
        (err) => {
          requestFinish(req, res, err, logger)
          return Promise.reject(err) // eslint-disable-line prefer-promise-reject-errors
        }
      )
    }
  }
}

function requestStart (req, res, logger) {
  req.reqLogger = {}
  req.reqLogger.error = null
  req.reqLogger.start = Date.now()
  req.reqLogger.path = getNormalizedPathPattern(req)
  req.reqLogger.requestId = ksuid.randomSync().string
  logger.info('request', { method: req.method, path: req.url, id: req.reqLogger.requestId, query: req.query })
  res.setHeader('X-Request-ID', req.reqLogger.requestId)
}

function requestFinish (req, res, error, logger) {
  if (!logger) {
    logger = error
    error = null
  }
  if (error && error.statusCode) res.statusCode = error.statusCode
  else if (error) res.statusCode = 500 // thrown errors are caught further up the chain in micro
  else if (!res.statusCode) res.statusCode = 200 // normal responses are attached in micro too. only custom errors, like 400s, are present right now

  const code = res.statusCode / 100 | 0
  const duration = Date.now() - req.reqLogger.start

  if (duration > 1000) {
    logger.warning('slow response', {
      url: req.url,
      id: req.reqLogger.requestId,
      method: req.method,
      duration,
      route: req.reqLogger.path || undefined
    })
  }
  if (code === 4) {
    return logger.warning('response', { method: req.method, path: req.url, id: req.reqLogger.requestId, status: res.statusCode })
  }
  if (error) {
    return logger.error('response', { method: req.method, path: req.url, id: req.reqLogger.requestId, status: res.statusCode, query: req.query, error })
  }
  logger.info('response', { method: req.method, path: req.url, id: req.reqLogger.requestId, status: res.statusCode })
}

function getNormalizedPathPattern (req) {
  if (req.url) return escapeSpecialCharacters(removeQuery(req.url))
  return null
}
function removeQuery (str) {
  if (str.indexOf('?') > -1) return str.split('?')[0]
  return str
}
function escapeSpecialCharacters (str) {
  return str.split(/[/:]/).filter(Boolean).join('_')
}
