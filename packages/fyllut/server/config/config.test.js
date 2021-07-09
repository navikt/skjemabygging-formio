import {jest} from '@jest/globals'
import {checkConfigConsistency} from "./config.js"
import {NaisCluster} from "./nais-cluster.js"

describe('config', () => {

  let logError
  let exit

  beforeEach(() => {
    logError = jest.fn()
    exit = jest.fn()
  })

  test('FormioApi er ikke tillatt i prod', () => {
    const config = {
      useFormioApi: true,
      naisClusterName: NaisCluster.PROD,
    }
    checkConfigConsistency(config, logError, exit)
    expect(logError).toBeCalledWith('FormioApi is not allowed in prod-gcp')
    expect(exit).toBeCalledWith(1)
  })

  test('SkjemaUrl er påkrevd når FormioApi skal brukes i labs', () => {
    const config = {
      useFormioApi: true,
      naisClusterName: NaisCluster.LABS,
    }
    checkConfigConsistency(config, logError, exit)
    expect(logError).toBeCalledWith('SKJEMA_URL is required when using FormioApi')
    expect(exit).toBeCalledWith(1)
  })

  test('FormioApi er tillatt i labs', () => {
    const config = {
      useFormioApi: true,
      naisClusterName: NaisCluster.LABS,
      skjemaUrl: 'https://form.io/skjemaurl',
    }
    checkConfigConsistency(config, logError, exit)
    expect(logError).not.toBeCalled()
    expect(exit).not.toBeCalled()
  })

})
