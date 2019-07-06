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
const artifactUrl = URL.parse(`${config.SUBMISSION_API_URL}/submissions/a34e1158-2c27-4d38-b079-5e5cca1bdcf7/artifacts`)

nock(/\//)
  .persist()
  .post(authUrl.path)
  .reply(200, { access_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJUb3Bjb2RlciBVc2VyIiwiQ29ubmVjdCBTdXBwb3J0IiwiYWRtaW5pc3RyYXRvciIsInRlc3RSb2xlIiwiYWFhIiwidG9ueV90ZXN0XzEiLCJDb25uZWN0IE1hbmFnZXIiLCJDb25uZWN0IEFkbWluIiwiY29waWxvdCIsIkNvbm5lY3QgQ29waWxvdCBNYW5hZ2VyIl0sImlzcyI6Imh0dHBzOi8vYXBpLnRvcGNvZGVyLWRldi5jb20iLCJoYW5kbGUiOiJUb255SiIsImV4cCI6MTU2NTY4MTkyMCwidXNlcklkIjoiODU0Nzg5OSIsImlhdCI6MTU1NTY4MTMyMCwiZW1haWwiOiJhamVmdHNAdG9wY29kZXIuY29tIiwianRpIjoiMTlhMDkzNzAtMjk4OC00N2I4LTkxODktMGRhODVjNjM0ZWQyIn0.V8nsQpbzQ_4iEd0dAbuYsfeydnhSAEQ95AKKwl8RONw' })
  .post(subApiUrl.path)
  .reply(200)
  .post(artifactUrl.path)
  .reply(200)
