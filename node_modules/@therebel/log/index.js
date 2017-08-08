const winston = require('winston')
const ecs = require('ecs-logs-js')

module.exports = function log({ name = 'log', level = 'info', env = 'production' }) {
  if (env !== 'development') return new winston.Logger({
    level,
    levels: winston.config.syslog.levels,
    transports: [ new ecs.Transport({ level, name }) ]
  })
  const logger = new winston.Logger({
    level,
    levels: winston.config.syslog.levels
  })
  const toYAML = require('winston-console-formatter')
  logger.add(winston.transports.Console, toYAML.config())
  return logger
}
