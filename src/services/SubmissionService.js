/**
 * Service to communicate with topcoder submission api
 */
const joi = require('joi')
const JSZip = require('jszip')
const config = require('config')
const logger = require('../common/logger')
const helper = require('../common/helper')

const TYPE_ID = 'c56a4180-65aa-42ec-a945-5fd21dec0501'

/**
 * Update submission status
 * @param {Object} payload Status
 *
 * @returns {Promise}
 */
async function updateSubmissionStatus (payload) {
  return helper.reqToSubmissionAPI('POST', `${config.SUBMISSION_API_URL}/reviews`, {
    ...payload,
    typeId: TYPE_ID // Request will fail if we don't use existing review type id
  })
}

updateSubmissionStatus.schema = joi.object().keys({
  payload: joi.object().keys({
    score: joi.number().required(),
    reviewerId: joi.string().required(),
    submissionId: joi.string().required(),
    scoreCardId: joi.string().required()
  }).required()
})
/**
 * Upload submission artifacts
 * @param {String} submissionId The submission id to upload the artifact to
 * @param {String} filename Artifact filename
 * @param {String} typeId Associated artifact type id
 * @param {Object} body Artifacts content
 * @returns {Promise}
 */
async function uploadArtifacts (submissionId, filename, typeId, body) {
  const zip = new JSZip()
  zip.file(`${filename}.json`, JSON.stringify(body, null, 2))
  const content = await zip.generateAsync({ type: 'nodebuffer' })
  const artifactPayload = {
    artifact: {
      name: `${filename}.zip`,
      data: content
    },
    typeId: typeId
  }

  return helper.reqToV5APIWithFile(`${config.SUBMISSION_API_URL}/submissions/${submissionId}/artifacts`, artifactPayload, 'artifact')
}

uploadArtifacts.schema = joi.object().keys({
  submissionId: joi.string().required(),
  filename: joi.string().required(),
  typeId: joi.string().required(),
  body: joi.object().required()
})

module.exports = {
  updateSubmissionStatus,
  uploadArtifacts
}

logger.buildService(module.exports)
