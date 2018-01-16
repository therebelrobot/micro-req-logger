const Logger = require('@therebel/log')
const micro = require('./micro')
const express = require('./express')

module.exports = function reqLog ({ serviceName, logLevel, nodeEnv, stats, logger, server = 'micro', ignore }) {
  logger = logger || Logger({ name: `${serviceName} [${nodeEnv}]`, level: logLevel, env: nodeEnv })
  switch(server) {
    case 'micro':
      return micro({ logger, stats })
      break
    case 'express':
      return express({ logger, stats, ignore })
      break
  }
  return
}
