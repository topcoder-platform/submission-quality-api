/**
 * Service to communicate with topcoder submission api
 */
const joi = require('joi')
const JSZip = require('jszip')
const logger = require('../common/logger')
const { getSubmissionApiClient } = require('../common/helper')

const REVIEW_TYPE_NAME = 'SonarQube Review'

/**
 * Update submission status
 * @param {Object} payload Status
 *
 * @returns {Promise}
 */
async function updateSubmissionStatus (payload) {
  const client = getSubmissionApiClient()
  const res = await client.searchReviewTypes({ name: REVIEW_TYPE_NAME, isActive: true })
  if (res.body.length === 0) {
    throw new Error('No review type found for SonarQube Review')
  }
  const typeId = res.body[0].id
  return client.createReview({
    ...payload,
    typeId
  })
}

updateSubmissionStatus.schema = joi.object().keys({
  payload: joi.object().keys({
    score: joi.number().required(),
    reviewerId: joi.string().required(),
    submissionId: joi.string().required(),
    scoreCardId: joi.number().integer().min(1)
  }).required()
})
/**
 * Upload submission artifacts
 * @param {String} submissionId The submission id to upload the artifact to
 * @param {String} filename Artifact filename
 * @param {Object} body Artifacts content
 * @returns {Promise}
 */
async function uploadArtifacts (submissionId, filename, body) {
  const zip = new JSZip()
  zip.file(`${filename}.json`, JSON.stringify(body, null, 2))
  const content = await zip.generateAsync({ type: 'nodebuffer' })
  const artifactPayload = {
    artifact: {
      name: `${filename}.zip`,
      data: content
    }
  }

  const client = getSubmissionApiClient()
  return client.createArtifact(submissionId, artifactPayload)
}

uploadArtifacts.schema = joi.object().keys({
  submissionId: joi.string().required(),
  filename: joi.string().required(),
  body: joi.object().required()
})

module.exports = {
  updateSubmissionStatus,
  uploadArtifacts
}

logger.buildService(module.exports)
