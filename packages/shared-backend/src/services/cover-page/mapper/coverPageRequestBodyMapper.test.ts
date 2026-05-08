import { CoverPageDownloadType } from '@navikt/skjemadigitalisering-shared-domain';
import { coverPageRequestBodyMapper } from './coverPageRequestBodyMapper';

describe('coverPageRequestBodyMapper', () => {
  const defaultData: CoverPageDownloadType = {
    submissionType: 'STATIC_PDF',
    languageCode: 'nb',
    form: {
      skjemanummer: 'NAV 12.34-56',
      title: 'Testskjema',
      properties: {
        skjemanummer: 'NAV 12.34-56',
        tema: 'AAP',
        submissionTypes: ['STATIC_PDF'],
        subsequentSubmissionTypes: [],
      },
    },
    user: {
      nationalIdentityNumber: '12345678910',
    },
    attachments: ['Vedlegg 1'],
  };

  it('creates request body from download data', () => {
    const actual = coverPageRequestBodyMapper.createRequestBodyFromDownloadData(defaultData, 'nb');

    expect(actual).toEqual({
      foerstesidetype: 'SKJEMA',
      navSkjemaId: 'NAV 12.34-56',
      spraakkode: 'NB',
      overskriftstittel: 'NAV 12.34-56 Testskjema',
      arkivtittel: 'NAV 12.34-56 Testskjema',
      tema: 'AAP',
      vedleggsliste: ['Vedlegg 1'],
      dokumentlisteFoersteside: ['NAV 12.34-56 Testskjema', 'Vedlegg 1'],
      bruker: {
        brukerId: '12345678910',
        brukerType: 'PERSON',
      },
      netsPostboks: '1400',
    });
  });

  it('uses translated title, custom form number and recipient address', () => {
    const actual = coverPageRequestBodyMapper.createRequestBodyFromDownloadData(
      {
        ...defaultData,
        recipient: {
          name: 'NAV Test',
          postOfficeBox: '1234',
          postalCode: '0101',
          postalName: 'Oslo',
        },
        user: {
          firstName: 'Test',
          surname: 'Testesen',
          address: {
            streetAddress: 'Testveien 1',
            postalCode: '0101',
            postalName: 'Oslo',
          },
        },
      },
      'nn',
      (text) => `Oversatt ${text}`,
      'NAV 12.34-56p',
    );

    expect(actual).toEqual({
      foerstesidetype: 'SKJEMA',
      navSkjemaId: 'NAV 12.34-56p',
      spraakkode: 'NN',
      overskriftstittel: 'NAV 12.34-56 Oversatt Testskjema',
      arkivtittel: 'NAV 12.34-56 Oversatt Testskjema',
      tema: 'AAP',
      vedleggsliste: ['Vedlegg 1'],
      dokumentlisteFoersteside: ['NAV 12.34-56 Oversatt Testskjema', 'Vedlegg 1'],
      ukjentBrukerPersoninfo: 'Test Testesen, Testveien 1, 0101 Oslo, Norge',
      adresse: {
        adresselinje1: 'NAV Test',
        adresselinje2: '1234',
        postnummer: '0101',
        poststed: 'Oslo',
      },
    });
  });

  it('throws on invalid user values', () => {
    expect(() =>
      coverPageRequestBodyMapper.createRequestBodyFromDownloadData({
        ...defaultData,
        user: {
          nationalIdentityNumber: '12345678910=123',
        },
      }),
    ).toThrowError('Invalid value for cover page');
  });
});
