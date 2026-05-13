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

  it('creates organization request body matching main payload', () => {
    const actual = coverPageRequestBodyMapper.createRequestBodyFromDownloadData({
      ...defaultData,
      form: {
        skjemanummer: 'coverpageorganizationnumber',
        title: 'Cover page organization number test form',
        properties: {
          skjemanummer: 'coverpageorganizationnumber',
          tema: 'HJE',
          submissionTypes: ['STATIC_PDF'],
          subsequentSubmissionTypes: [],
        },
      },
      user: {
        organizationNumber: '889640782',
      },
      attachments: [],
    });

    expect(actual).toEqual({
      bruker: {
        brukerId: '889640782',
        brukerType: 'ORGANISASJON',
      },
      foerstesidetype: 'SKJEMA',
      navSkjemaId: 'coverpageorganizationnumber',
      spraakkode: 'NB',
      overskriftstittel: 'coverpageorganizationnumber Cover page organization number test form',
      arkivtittel: 'coverpageorganizationnumber Cover page organization number test form',
      tema: 'HJE',
      vedleggsliste: [],
      dokumentlisteFoersteside: ['coverpageorganizationnumber Cover page organization number test form'],
      netsPostboks: '1400',
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
