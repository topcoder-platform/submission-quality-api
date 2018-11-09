/*
 * Setting up Mock for all tests
 */

// During the test the env variable is set to test
process.env.NODE_ENV = 'test'

require('../src/bootstrap')
const config = require('config')
const nock = require('nock')
const URL = require('url')

const authUrl = URL.parse(config.AUTH0_URL)
const subApiUrl = URL.parse(`${config.SUBMISSION_API_URL}/reviews`)

nock(/\//)
  .persist()
  .post(authUrl.path)
  .reply(200, { access_token: 'test' })
  .post(subApiUrl.path)
  .reply(200)
