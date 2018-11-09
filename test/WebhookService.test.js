
/**
 * Test cases for Webhook service
 */

const chai = require('chai')
const service = require('../src/services/WebhookService')
const { testWebHook } = require('./testData')

chai.should()
chai.use(require('chai-as-promised'))

describe('Webhook Service Tests', () => {
  it('Webhook Service - Passing null should throw error', async () => {
    return service.processScanResults(null).should.be.rejectedWith('"body" must be an object')
  })

  it('Webhook Service - Passing empty body should throw error', async () => {
    return service.processScanResults({}).should.be.rejectedWith('"serverUrl" is required')
  })

  it('Webhook Service - Passing valid webhook body should complete successfully', async () => {
    return service.processScanResults(testWebHook).should.be.fulfilled
  })
})
