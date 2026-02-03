import { http } from '@navikt/skjemadigitalisering-shared-components';
import { vi } from 'vitest';
import httpFyllut from './httpFyllut';

const originalWindowLocation = window.location;

describe('httpFyllut', () => {
  it('submission method header', () => {
    Object.defineProperty(window, 'location', {
      value: {
        search: '?sub=digital',
      },
      writable: true,
    });

    const headers = httpFyllut.getDefaultHeaders();
    expect(headers).toEqual({ 'Fyllut-Submission-Method': 'digital' });

    // @ts-expect-error Possible bug in typescript: https://github.com/microsoft/TypeScript/issues/61335
    window.location = originalWindowLocation;
  });

  it('401 redirect', async () => {
    const replace = vi.fn();
    Object.defineProperty(window, 'location', {
      value: {
        replace,
      },
      writable: true,
    });

    vi.spyOn(http, 'get').mockImplementation(() => {
      return new Promise((resolve, reject) => {
        reject(new httpFyllut.UnauthenticatedError());
      });
    });

    await expect(httpFyllut.get('https://www.nav.no')).rejects.toThrow(httpFyllut.UnauthenticatedError);
    expect(replace).toHaveBeenCalledTimes(1);

    // @ts-expect-error Possible bug in typescript: https://github.com/microsoft/TypeScript/issues/61335
    window.location = originalWindowLocation;
  });
});
