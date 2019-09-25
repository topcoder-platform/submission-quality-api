/**
 * Contains generic helper methods
 */

const config = require('config')
const _ = require('lodash')
const submissionApi = require('@topcoder-platform/topcoder-submission-api-wrapper')
const submissionApiM2MClient = submissionApi(_.pick(config, ['AUTH0_URL', 'AUTH0_AUDIENCE', 'TOKEN_CACHE_TIME', 'AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET', 'SUBMISSION_API_URL', 'AUTH0_PROXY_SERVER_URL']))

/**
 * Wrap async function to standard express function
 * @param {Function} fn the async function
 * @returns {Function} the wrapped function
 */
const wrapExpress = fn => (req, res, next) => {
  fn(req, res, next).catch(next)
}

/**
 * Wrap all functions from object
 * @param obj the object (controller exports)
 * @returns {Object|Array} the wrapped object
 */
const autoWrapExpress = (obj) => {
  if (_.isArray(obj)) {
    return obj.map(autoWrapExpress)
  }
  if (_.isFunction(obj)) {
    if (obj.constructor.name === 'AsyncFunction') {
      return wrapExpress(obj)
    }
    return obj
  }
  _.each(obj, (value, key) => {
    obj[key] = autoWrapExpress(value)
  })
  return obj
}

/**
 * Get submission api wrapper client
 * @returns {Object} the submission api wrapper client
 */
const getSubmissionApiClient = () => submissionApiM2MClient

module.exports = {
  wrapExpress,
  autoWrapExpress,
  getSubmissionApiClient
}
