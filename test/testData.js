/*
 * Test Data
 */

const testWebHook = {
  serverUrl: 'http://localhost:9000',
  taskId: 'AWaIkO3UJnZ4bDlnlrak',
  status: 'SUCCESS',
  analysedAt: '2019-08-03T19:07:05+0000',
  project: {
    key: 'a34e1158-2c27-4d38-b079-5e5cca1bdcf7',
    name: 'a34e1158-2c27-4d38-b079-5e5cca1bdcf7'
  },
  branch: {
    name: 'master',
    type: 'LONG',
    isMain: true
  },
  qualityGate: {
    name: 'SonarQube way',
    status: 'OK'
  },
  properties: {

  }
}

const validMeasuresResponse = {
  measures: [
    {
      metric: 'code_smells',
      history: [
        { value: 1 }
      ]
    },
    {
      metric: 'bugs',
      history: [
        { value: 2 }
      ]
    },
    {
      metric: 'vulnerabilities',
      history: [
        { value: 3 }
      ]
    },
    {
      metric: 'security_hotspots',
      history: [
        { value: 4 }
      ]
    }
  ]
}

const validIssuesResponse = {
  paging: {
    pageSize: 100,
    pageIndex: 1,
    total: 4
  },
  issues: [
    { type: 'bug', someField: 1 },
    { type: 'bug', someField: 2 },
    { type: 'code_smell', someField: 1 },
    { type: 'vulnerability', someField: 1 },
    { type: 'security_hotspot', someField: 1 }
  ]
}

module.exports = {
  testWebHook,
  validIssuesResponse,
  validMeasuresResponse
}
