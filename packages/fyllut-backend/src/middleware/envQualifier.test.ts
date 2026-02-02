import fs from 'fs';
import { beforeAll } from 'vitest';
import { mockRequest, mockResponse } from '../test/testHelpers';
import { EnvQualifier } from '../types/env';
import envQualifier, { PartialUrl } from './envQualifier';

const URL_REGEX = /(https?:\/\/[^ ]*)\n/g;

const envMap = {
  preprod: {
    naisIngress: '', // lastes fra nais config i beforeAll
    expectedEnvQualifier: EnvQualifier.preprodIntern,
  },
  preprodAnsatt: {
    naisIngress: '', // lastes fra nais config i beforeAll
    expectedEnvQualifier: EnvQualifier.preprodAnsatt,
  },
  preprodAlt: {
    naisIngress: '', // lastes fra nais config i beforeAll
    expectedEnvQualifier: EnvQualifier.preprodAltIntern,
  },
  preprodAltAnsatt: {
    naisIngress: '', // lastes fra nais config i beforeAll
    expectedEnvQualifier: EnvQualifier.preprodAltAnsatt,
  },
  delingslenke: {
    naisIngress: '', // lastes fra nais config i beforeAll
    expectedEnvQualifier: EnvQualifier.delingslenke,
  },
  localhost: {
    naisIngress: 'http://localhost:3001/fyllut',
    expectedEnvQualifier: EnvQualifier.local,
  },
};

const allEnvironments = Object.keys(envMap);

describe('envQualifier', () => {
  const urlMatch = (ingress: string, partialUrl: PartialUrl) => ingress.includes(partialUrl);

  const loadUrlsFromFile = (path: string) => {
    const file = fs.readFileSync(path, 'utf8');
    const matches = file.match(URL_REGEX);
    const urls = matches?.map((url) => url.replace(/["\r\n]/g, '').trim());
    return urls?.filter((url) => url.endsWith('/fyllut')) || [];
  };

  beforeAll(() => {
    const preprodYamlUrls = loadUrlsFromFile('../../.nais/fyllut/preprod.yaml');
    preprodYamlUrls.forEach((ingress: string) => {
      if (urlMatch(ingress, 'fyllut-preprod.intern.dev.nav.no')) {
        envMap.preprod.naisIngress = ingress;
      } else if (urlMatch(ingress, 'fyllut-preprod.ansatt.dev.nav.no')) {
        envMap.preprodAnsatt.naisIngress = ingress;
      }
    });

    const preprodAltYamlUrls = loadUrlsFromFile('../../.nais/fyllut/preprod-alt.yaml');
    preprodAltYamlUrls.forEach((ingress: string) => {
      if (urlMatch(ingress, 'fyllut-preprod-alt.intern.dev.nav.no')) {
        envMap.preprodAlt.naisIngress = ingress;
      } else if (urlMatch(ingress, 'fyllut-preprod-alt.ansatt.dev.nav.no')) {
        envMap.preprodAltAnsatt.naisIngress = ingress;
      }
    });

    const delingslenkeYamlUrls = loadUrlsFromFile('../../.nais/fyllut/dev-delingslenke.yaml');
    delingslenkeYamlUrls.forEach((ingress: string) => {
      if (urlMatch(ingress, 'skjemadelingslenke')) {
        envMap.delingslenke.naisIngress = ingress;
      }
    });
  });

  it.each(allEnvironments)('Returnerer korrekt envQualifier for %s', async (envName) => {
    const testdata = envMap[envName];
    const ingress = testdata.naisIngress;
    expect(ingress).toBeTruthy();
    const getMap = { host: ingress.replace(/https?:\/\//, '').replace(/\/.*/, '') };
    const req = mockRequest({ getMap });
    const res = mockResponse();
    const next = vi.fn();
    envQualifier(req, res, next);
    expect(req.getEnvQualifier()).toBe(testdata.expectedEnvQualifier);
    expect(next).toHaveBeenCalledOnce();
  });

  it('Returnerer undefined for annen host', () => {
    const getMap = { host: 'www.nav.no' };
    const req = mockRequest({ getMap });
    const res = mockResponse();
    const next = vi.fn();
    envQualifier(req, res, next);
    expect(req.getEnvQualifier()).toBeUndefined();
    expect(next).toHaveBeenCalledOnce();
  });
});
