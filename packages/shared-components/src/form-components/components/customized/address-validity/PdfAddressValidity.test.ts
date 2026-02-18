import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import PdfAddressValidity from './PdfAddressValidity';

describe('PdfAddressValidity', () => {
  it('should return null if value is undefined', () => {
    const props = {
      submissionPath: 'addressValidity',
      submission: {
        data: {
          addressValidity: {
            gyldigFraOgMed: undefined,
          },
        },
      },
      translate: (key: string) => key,
    } as unknown as PdfComponentProps;
    const output = PdfAddressValidity(props);
    expect(output).toBeNull();
  });

  it('should return only valid to', () => {
    const props = {
      submissionPath: 'addressValidity',
      submission: {
        data: {
          addressValidity: {
            gyldigFraOgMed: '2024-03-01T15:12:22.000Z',
          },
        },
      },
      translate: (key: string) => key,
    } as unknown as PdfComponentProps;
    const output = PdfAddressValidity(props);
    expect(output).not.toBeNull();
    expect(output).toBeInstanceOf(Array);

    const fromElement = getByLabel(output, TEXTS.statiske.address.validFrom);
    expect(fromElement).toBeDefined();
    expect(fromElement.verdi).toBe('01.03.2024');
    const toElement = getByLabel(output, TEXTS.statiske.address.validTo);
    expect(toElement).toBeUndefined();
    expect(output?.length).toBe(1);
  });

  it('should return only valid from', () => {
    const props = {
      submissionPath: 'addressValidity',
      submission: {
        data: {
          addressValidity: {
            gyldigTilOgMed: '2024-03-01T15:12:22.000Z',
          },
        },
      },
      translate: (key: string) => key,
    } as unknown as PdfComponentProps;
    const output = PdfAddressValidity(props);
    expect(output).not.toBeNull();
    expect(output).toBeInstanceOf(Array);

    const fromElement = getByLabel(output, TEXTS.statiske.address.validFrom);
    expect(fromElement).toBeUndefined();
    const toElement = getByLabel(output, TEXTS.statiske.address.validTo);
    expect(toElement).toBeDefined();
    expect(toElement.verdi).toBe('01.03.2024');
    expect(output?.length).toBe(1);
  });

  it('should return both from and to', () => {
    const props = {
      submissionPath: 'addressValidity',
      submission: {
        data: {
          addressValidity: {
            gyldigFraOgMed: '2024-03-01T15:12:22.000Z',
            gyldigTilOgMed: '2027-05-31T15:12:22.000Z',
          },
        },
      },
      translate: (key: string) => key,
    } as unknown as PdfComponentProps;
    const output = PdfAddressValidity(props);
    expect(output).not.toBeNull();
    expect(output).toBeInstanceOf(Array);

    const fromElement = getByLabel(output, TEXTS.statiske.address.validFrom);
    expect(fromElement).toBeDefined();
    expect(fromElement.verdi).toBe('01.03.2024');
    const toElement = getByLabel(output, TEXTS.statiske.address.validTo);
    expect(toElement).toBeDefined();
    expect(toElement.verdi).toBe('31.05.2027');
    expect(output?.length).toBe(2);
  });

  const getByLabel = (output: any, label: string) => {
    return output?.find((item: any) => item.label === label);
  };
});
