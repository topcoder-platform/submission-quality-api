const _ = require('lodash')
const chai = require('chai')
const nock = require('nock')

const service = require('../src/services/SonarService')

const { validIssuesResponse, validMeasuresResponse } = require('./testData')

chai.should()
chai.use(require('chai-as-promised'))

const ANALYSED_AT = '2019-08-03T19:07:05+0000'
const PROJECT_KEY = 'test-project'

describe('SonarService Service Tests', () => {
  describe('SonarQube API /api/measures/search_history response', async () => {
    beforeEach(() => {
      nock(/\//)
        .get('/api/issues/search')
        .query(true)
        .reply(200, validIssuesResponse)
    })

    afterEach(() => {
      nock.cleanAll()
    })

    it('Should set authorization header when token is configured', async () => {
      nock(/\//)
        .log(console.log)
        .matchHeader('authorization', 'Basic YWNjZXNzLXRva2VuOg==')
        .get('/api/measures/search_history')
        .query(true)
        .reply(200, validMeasuresResponse)

      return service.getScanResults(PROJECT_KEY, ANALYSED_AT).should.be.not.rejected
    })

    it('With missing "measures" should throw error', async () => {
      nock(/\//)
        .get('/api/measures/search_history')
        .query(true)
        .reply(200, _.omit(validMeasuresResponse, 'measures'))

      return service.getScanResults(PROJECT_KEY, ANALYSED_AT).should.be.rejectedWith('"measures" is required')
    })

    it('With missing "code_smells" metric should throw error', async () => {
      const response = _.cloneDeep(validMeasuresResponse)
      _.pullAt(response.measures, 0)

      nock(/\//)
        .get('/api/measures/search_history')
        .query(true)
        .reply(200, response)

      return service.getScanResults(PROJECT_KEY, ANALYSED_AT).should.be.rejectedWith('Metrics "code_smells" missing')
    })

    it('With missing "bugs" metric should throw error', async () => {
      const response = _.cloneDeep(validMeasuresResponse)
      _.pullAt(response.measures, 1)

      nock(/\//)
        .get('/api/measures/search_history')
        .query(true)
        .reply(200, response)

      return service.getScanResults(PROJECT_KEY, ANALYSED_AT).should.be.rejectedWith('Metrics "bugs" missing')
    })

    it('With missing "vulnerabilities" metric should throw error', async () => {
      const response = _.cloneDeep(validMeasuresResponse)
      _.pullAt(response.measures, 2)

      nock(/\//)
        .get('/api/measures/search_history')
        .query(true)
        .reply(200, response)

      return service.getScanResults(PROJECT_KEY, ANALYSED_AT).should.be.rejectedWith('Metrics "vulnerabilities" missing')
    })

    it('With missing "security_hotspots" metric should throw error', async () => {
      const response = _.cloneDeep(validMeasuresResponse)
      _.pullAt(response.measures, 3)

      nock(/\//)
        .get('/api/measures/search_history')
        .query(true)
        .reply(200, response)

      return service.getScanResults(PROJECT_KEY, ANALYSED_AT).should.be.rejectedWith('Metrics "security_hotspots" missing')
    })

    it('Ignores unknown metric', async () => {
      const response = _.cloneDeep(validMeasuresResponse)
      response.measures.push({
        metric: 'new-metric',
        history: [
          { value: 10 }
        ]
      })

      nock(/\//)
        .get('/api/measures/search_history')
        .query(true)
        .reply(200, response)

      return service.getScanResults(PROJECT_KEY, ANALYSED_AT).should.be.not.rejected
    })
  })

  describe('SonarQube API /api/issues/issues response', async () => {
    beforeEach(() => {
      nock(/\//)
        .get('/api/measures/search_history')
        .query(true)
        .reply(200, validMeasuresResponse)
    })

    afterEach(() => {
      nock.cleanAll()
    })

    it('With missing issues should throw error', async () => {
      const response = _.omit(validIssuesResponse, 'issues')

      nock(/\//)
        .get('/api/issues/search')
        .query(true)
        .reply(200, response)

      return service.getScanResults(PROJECT_KEY, ANALYSED_AT).should.be.rejectedWith('child "issues" fails')
    })

    it('With unknown issue type should ignore', async () => {
      const response = _.cloneDeep(validIssuesResponse)
      response.issues.push({
        type: 'unknown'
      })

      nock(/\//)
        .get('/api/issues/search')
        .query(true)
        .reply(200, response)

      return service.getScanResults(PROJECT_KEY, ANALYSED_AT).should.not.be.rejected
    })

    it('With multiple pages should fetch all data', async () => {
      nock(/\//)
        .log(console.log)
        .persist()
        .get('/api/issues/search')
        .query(params => params.p === '1')
        .reply(200, {
          paging: {
            pageIndex: 1,
            pageSize: 2,
            total: 5
          },
          issues: [
            { type: 'code_smell' }, { type: 'bug' }
          ]
        })
        .get('/api/issues/search')
        .query(params => params.p === '2')
        .reply(200, {
          paging: {
            pageIndex: 2,
            pageSize: 2,
            total: 5
          },
          issues: [
            { type: 'security_hotspot' }, { type: 'vulnerability' }
          ]
        })
        .get('/api/issues/search')
        .query(params => params.p === '3')
        .reply(200, {
          paging: {
            pageIndex: 3,
            pageSize: 2,
            total: 5
          },
          issues: [
            { type: 'vulnerability' }
          ]
        })

      const res = await service.getScanResults(PROJECT_KEY, ANALYSED_AT)

      res.issues.bugs.should.have.lengthOf(1)
      res.issues.code_smells.should.have.lengthOf(1)
      res.issues.security_hotspots.should.have.lengthOf(1)
      res.issues.vulnerabilities.should.have.lengthOf(2)
    })
  })

  it('Passing valid responses should complete successfully', async () => {
    nock(/\//)
      .get('/api/measures/search_history')
      .query(true)
      .reply(200, validMeasuresResponse)

    nock(/\//)
      .get('/api/issues/search')
      .query(true)
      .reply(200, validIssuesResponse)

    const res = await service.getScanResults(PROJECT_KEY, ANALYSED_AT)

    res.project_key.should.be.eql(PROJECT_KEY)
    res.scan_time.should.be.eql(ANALYSED_AT)
    res.issues.should.be.eql({
      bugs: [ { type: 'bug', someField: 1 }, { type: 'bug', someField: 2 } ],
      code_smells: [ { type: 'code_smell', someField: 1 } ],
      vulnerabilities: [ { type: 'vulnerability', someField: 1 } ],
      security_hotspots: [ { type: 'security_hotspot', someField: 1 } ]
    })
    res.measures.should.be.eql({
      bugs: 2,
      code_smells: 1,
      security_hotspots: 4,
      vulnerabilities: 3
    })
  })
})
