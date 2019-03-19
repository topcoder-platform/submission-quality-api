/**
 * Contains generic helper methods
 */

const config = require('config')
const _ = require('lodash')
const request = require('superagent')

const m2mAuth = require('tc-core-library-js').auth.m2m
const m2m = m2mAuth(_.pick(config, ['AUTH0_URL', 'AUTH0_AUDIENCE', 'AUTH0_PROXY_SERVER_URL']))

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

/*
 * Function to get M2M token
 * @returns {Promise}
 */
const getM2Mtoken = async () => {
  return m2m.getMachineToken(config.AUTH0_CLIENT_ID, config.AUTH0_CLIENT_SECRET)
}

/**
 * Function to send request to Submission API
 * @param {String} reqType Type of the request POST / PATCH
 * @param (String) path Complete path of the Submission API URL
 * @param {Object} reqBody Body of the request
 * @returns {Promise}
 */
const reqToSubmissionAPI = async (reqType, path, reqBody) => {
  // Token necessary to send request to Submission API
  const token = await getM2Mtoken()

  if (reqType === 'POST') {
    // Post the request body to Submission API
    await request
      .post(path)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send(reqBody)
  } else if (reqType === 'PUT') {
    // Put the request body to Submission API
    await request
      .put(path)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send(reqBody)
  } else if (reqType === 'PATCH') {
    // Patch the request body to Submission API
    await request
      .post(path)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send(reqBody)
  } else if (reqType === 'GET') {
    // GET the requested URL from Submission API
    const response = await request
      .get(path)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
    if (response.body) {
      return response.body
    } else {
      return null
    }
  }
}

module.exports = {
  wrapExpress,
  autoWrapExpress,
  reqToSubmissionAPI
}
