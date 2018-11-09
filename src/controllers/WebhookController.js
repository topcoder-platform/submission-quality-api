/**
 * Webhook Controller
 */

const WebhookService = require('../services/WebhookService')

/**
 * Process scan result received via Webhook
 * @param req the request
 * @param res the response
 */
async function processScanResults (req, res) {
  res.json(await WebhookService.processScanResults(req.body))
}

module.exports = {
  processScanResults
}
