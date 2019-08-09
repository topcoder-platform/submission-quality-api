/**
 * Webhook Service
 */

const joi = require('joi')
const logger = require('../common/logger')
const uuid = require('uuid/v4')

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

      await uploadArtifacts(body.project.key, 'SonarQubeSummary', 'c56a4180-65aa-42ec-a945-5fd21dec0501', body) // temporary type id
    })(),

    (async () => {
      const scanResults = await getScanResults(body.project.key, body.analysedAt)
      await uploadArtifacts(body.project.key, 'SonarQubeDetails', '50b917df-5b81-4081-8e20-7fc8a6aabe54', scanResults) // temporary type id
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
