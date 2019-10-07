/**
 * The application entry point
 */

require('./bootstrap')

const config = require('config')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const httpStatus = require('http-status-codes')
const _ = require('lodash')
const helper = require('./common/helper')
const logger = require('./common/logger')
const routes = require('./routes')
const healthcheck = require('topcoder-healthcheck-dropin')

function check () {
  // No checks to run. The output of this itself is an indication that the app is actively running
  return {
    checksRun: 1
  }
}

// setup express app
const app = express()

app.set('port', config.PORT)

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const apiRouter = express.Router()

app.use(healthcheck.middleware([check]))

// load all routes
_.each(routes, (verbs, url) => {
  _.each(verbs, (def, verb) => {
    const actions = []
    const method = require('./controllers/' + def.controller)[def.method]
    if (!method) {
      throw new Error(def.method + ' is undefined')
    }
    actions.push((req, res, next) => {
      req.signature = `${def.controller}#${def.method}`
      next()
    })
    actions.push(method)
    apiRouter[verb](`${config.API_VERSION}${url}`, helper.autoWrapExpress(actions))
  })
})

app.use('/', apiRouter)

app.use((err, req, res, next) => {
  logger.logFullError(err, req.signature)
  let status = err.httpStatus || httpStatus.INTERNAL_SERVER_ERROR
  if (err.isJoi) {
    status = httpStatus.BAD_REQUEST
  }
  res.status(status)
  if (err.isJoi) {
    res.json({
      error: err.details[0].message
    })
  } else {
    res.json({
      error: err.message
    })
  }
})

// Check if the route is not found or HTTP method is not supported
app.use('*', (req, res) => {
  const route = routes[req.baseUrl]
  if (route) {
    res.status(httpStatus.METHOD_NOT_ALLOWED).json({ error: 'The requested HTTP method is not supported.' })
  } else {
    res.status(httpStatus.NOT_FOUND).json({ error: 'The requested resource cannot be found.' })
  }
})

app.listen(app.get('port'), () => {
  logger.info(`Express server listening on port ${app.get('port')}`)
})
