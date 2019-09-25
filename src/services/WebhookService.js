/**
 * Webhook Service
 */

const joi = require('joi')
const logger = require('../common/logger')
const uuid = require('uuid/v4')

const { updateSubmissionStatus, uploadArtifacts } = require('./SubmissionService')
const { getScanResults } = require('./SonarService')

const MAXIMUM_SCORE_CARD_ID = 200000000 // the maximum value of dummy score card id

/**
 * Process the scan results received via Webhook from Sonarqube Server
 * @param {Object} body Webhook request body
 * @returns {Promise}
 */
async function processScanResults (body) {
  const randomNumber = Math.floor(Math.random() * MAXIMUM_SCORE_CARD_ID) + 1

  await updateSubmissionStatus({
    score: body.qualityGate.status === 'OK' ? 100 : 0,
    reviewerId: uuid(),
    submissionId: body.project.key,
    scoreCardId: randomNumber
  })

  await uploadArtifacts(body.project.key, 'SonarQubeSummary', body)

  const scanResults = await getScanResults(body.project.key, body.analysedAt)

  await uploadArtifacts(body.project.key, 'SonarQubeDetails', scanResults)
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
