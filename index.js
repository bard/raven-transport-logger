const zlib = require('zlib')
const pick = require('object.pick')

module.exports = function (opts) {
  if (opts === undefined) {
    throw new Error('Expected options argument.')
  }

  if (typeof opts === 'object' && !opts.logger) {
    throw new Error('Expected logger option.')
  }

  const logger = opts.logger
  const fields = opts.fields ||
        ['message', 'exception', 'transaction', 'breadcrumbs']

  return {
    send: (ravenInstance, sentryMessage, headers, eventId, cb) => {
      zlib.inflate(Buffer.from(sentryMessage, 'base64'), (err, buff) => {
        if (err) {
          return cb && cb(err)
        }

        try {
          const ravenEvent = JSON.parse(buff.toString())
          const level = ravenEvent.level

          // Limit fields if user so decided
          const event = opts.fields
                ? pick(ravenEvent, fields)
                : ravenEvent

          if (level in logger) {
            logger[level](event)
          } else if (level === 'warning') {
            logger.warn(event)
          } else {
            // Will happen e.g. if level is 'fatal' and logger is
            // 'console'
            logger.error({...event, originalLogLevel: level})
          }

          return cb && cb(null)
        } catch (err) {
          // If any error happens during sending, avoid propagating
          // the error and causing a loop
          console.error('Error processing log event', err)
        }
      })
    }
  }
}
