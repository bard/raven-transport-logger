# raven-transport-logger

Route error information collected by [Raven](https://github.com/getsentry/raven-node) to a logger.

## Motivation

Normally, Raven collects error information from a nodejs process and sends it to [Sentry](https://sentry.io/).

raven-transport-logger allows to route that information, through a logger, to elsewhere, e.g. to standard output, where it may be picked up by a log collector and delivered to a centralized log collection system.

## Usage

Using `console`:

```js
const ravenTransportLogger = require('raven-transport-logger')

// SENTRY_DSN won't be used and can be anything as long as it is
// in the format Raven expects
const DUMMY_SENTRY_DSN = 'https://12345@example.com/errors'

Raven.config(DUMMY_SENTRY_DSN, {
  transport: ravenTransportLogger({ logger: console })
}).install()
```

Using [pino](https://github.com/pinojs/pino):

```js
const pino = require('pino')
const ravenTransportLogger = require('raven-transport-logger')

const log = pino()
const DUMMY_SENTRY_DSN = 'https://12345@example.com/errors'

Raven.config(DUMMY_SENTRY_DSN, {
  transport: ravenTransportLogger({ logger: log })
}).install()
```

## Filtering out unnecessary fields

If output is too verbose or if you don't need certain fields because your logger is already adding them (e.g. pino already has equivalents for `timestamp`, `server_name`, `level`), you can limit the fields:

```js
const ravenTransportLogger = require('raven-transport-logger')
const pino = require('pino')

const log = pino()
const DUMMY_SENTRY_DSN = 'https://12345@example.com/errors'

Raven.config(DUMMY_SENTRY_DSN, {
  transport: ravenTransportLogger({
    logger: log,
    fields: ['message', 'exception', 'transaction', 'breadcrumbs']
  })
}).install()
```

## Caveats

The `logger` object is expected to have the methods `trace`, `debug`, `info`, `warn`, `error` and `fatal`. If any of those is missing (as in the case of the `console` which lacks `fatal()`), the error will be logged at the `error` level with an additional `originalLogLevel` field.
