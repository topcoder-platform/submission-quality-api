/*
 * Test Data
 */

const testWebHook = {
  serverUrl: 'http://localhost:9000',
  taskId: 'AWaIkO3UJnZ4bDlnlrak',
  status: 'SUCCESS',
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

module.exports = {
  testWebHook
}
