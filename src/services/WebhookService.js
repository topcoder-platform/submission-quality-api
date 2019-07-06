/**
 * Webhook Service
 */

const joi = require('joi')
const helper = require('../common/helper')
const logger = require('../common/logger')
const uuid = require('uuid/v4')
const config = require('config')
const JSZip = require('jszip')

const resultFileName = 'SonarQubeResults'
const typeId = 'c56a4180-65aa-42ec-a945-5fd21dec0501'

/**
 * Process the scan results received via Webhook from Sonarqube Server
 * @param {Object} body Webhook request body
 * @returns {Promise}
 */
const processScanResults = async (body) => {
  const randomId = uuid()
  // Prepare review payload from Webhook
  const payload = {
    score: body.qualityGate.status === 'OK' ? 100 : 0,
    reviewerId: randomId,
    submissionId: body.project.key,
    scoreCardId: randomId,
    typeId // Request will fail if we don't use existing review type id
  }
  await helper.reqToSubmissionAPI('POST', `${config.SUBMISSION_API_URL}/reviews`, payload)

  const zip = new JSZip()
  zip.file(`${resultFileName}.json`, JSON.stringify(body, null, 2))
  const content = await zip.generateAsync({ type: 'nodebuffer' })
  const artifactPayload = {
    artifact: {
      name: `${resultFileName}.zip`,
      data: content
    },
    typeId
  }
  await helper.reqToV5APIWithFile(`${config.SUBMISSION_API_URL}/submissions/${body.project.key}/artifacts`, artifactPayload, 'artifact')
}

processScanResults.schema = {
  body: joi.object().keys({
    serverUrl: joi.string().uri().trim().required(),
    status: joi.string().required(),
    project: joi.object().required(),
    qualityGate: joi.object().required()
  }).unknown(true).required()
}

module.exports = {
  processScanResults
}

logger.buildService(module.exports)
