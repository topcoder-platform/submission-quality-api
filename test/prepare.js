/*
 * Setting up Mock for all tests
 */

// During the test the env variable is set to test
process.env.NODE_ENV = 'test'
// AWS dummy credentials
process.env.AWS_ACCESS_KEY_ID = 'dummy-key'
process.env.AWS_SECRET_ACCESS_KEY = 'dummy-secret'

require('../src/bootstrap')
