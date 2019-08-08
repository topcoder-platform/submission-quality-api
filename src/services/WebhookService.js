/**
 * Webhook Service
 */

const joi = require('joi')
const logger = require('../common/logger')
const uuid = require('uuid/v4')
const { s3upload } = require('../common/helper')

const { updateSubmissionStatus, uploadArtifacts } = require('./SubmissionService')
const { getScanResults } = require('./SonarService')

/**
 * Process the scan results received via Webhook from Sonarqube Server
 * @param {Object} body Webhook request body
 * @returns {Promise}
 */
async function processScanResults (body) {
  await Promise.all([
    (async () => {
      const randomId = uuid()

      await updateSubmissionStatus({
        score: body.qualityGate.status === 'OK' ? 100 : 0,
        reviewerId: randomId,
        submissionId: body.project.key,
        scoreCardId: randomId
      })

      await uploadArtifacts(body)
    })(),

    (async () => {
      const scanResults = await getScanResults(body.project.key, body.analysedAt)
      await s3upload(`${body.project.key}.json`, JSON.stringify(scanResults), 'application/json')
    })()
  ])
}

processScanResults.schema = {
  body: joi.object().keys({
    serverUrl: joi.string().uri().trim().required(),
    status: joi.string().required(),
    analysedAt: joi.string().required(),
    project: joi.object().keys({
      key: joi.string().required()
    }).unknown(true).required(),
    qualityGate: joi.object().required()
  }).unknown(true).required()
}

module.exports = {
  processScanResults
}

logger.buildService(module.exports)
