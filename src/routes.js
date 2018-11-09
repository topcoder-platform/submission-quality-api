/**
 * The application API routes
 */

module.exports = {
  '/scan/webhook': {
    post: {
      controller: 'WebhookController',
      method: 'processScanResults'
    }
  }
}
