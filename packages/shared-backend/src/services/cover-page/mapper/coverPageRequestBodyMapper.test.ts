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

  it('creates an ettersending archive title and attachment-only document list', () => {
    const actual = coverPageRequestBodyMapper.createRequestBodyFromDownloadData({
      ...defaultData,
      type: 'ETTERSENDELSE',
      attachments: ['Attachment one', 'Attachment two'],
    });

    expect(actual).toMatchObject({
      foerstesidetype: 'ETTERSENDELSE',
      overskriftstittel: 'Ettersending til NAV 12.34-56 Testskjema',
      arkivtittel: 'Ettersending til NAV 12.34-56 Testskjema',
      dokumentlisteFoersteside: ['Attachment one', 'Attachment two'],
    });
  });

  it('uses a localized ettersending cover page title', () => {
    const translate = vi.fn((text) =>
      text === 'Testskjema'
        ? 'Translated form title'
        : 'Additional documentation for NAV 12.34-56 Translated form title',
    );

    const actual = coverPageRequestBodyMapper.createRequestBodyFromDownloadData(
      {
        ...defaultData,
        type: 'ETTERSENDELSE',
      },
      'en',
      translate,
    );

    expect(actual.overskriftstittel).toBe('Additional documentation for NAV 12.34-56 Translated form title');
    expect(actual.arkivtittel).toBe('Ettersending til NAV 12.34-56 Translated form title');
    expect(translate).toHaveBeenCalledWith('Ettersending til {{formNumber}} {{title}}', {
      formNumber: 'NAV 12.34-56',
      title: 'Testskjema',
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

  it.each([
    ['NFD-Ma\u030Al', 'SON 20-11.25 NFD-Mål'],
    ['NFD-MA\u030AL', 'SON 20-11.25 NFD-MÅL'],
  ])('normalizes decomposed characters in the form title', (title, expectedTitle) => {
    const actual = coverPageRequestBodyMapper.createRequestBodyFromDownloadData({
      ...defaultData,
      form: {
        ...defaultData.form,
        skjemanummer: 'SON 20-11.25',
        title,
      },
    });

    expect(actual.overskriftstittel).toBe(expectedTitle);
    expect(actual.arkivtittel).toBe(expectedTitle);
    expect(actual.dokumentlisteFoersteside).toEqual([expectedTitle, 'Vedlegg 1']);
  });

  it('normalizes a translated form title', () => {
    const actual = coverPageRequestBodyMapper.createRequestBodyFromDownloadData(defaultData, 'nn', () => 'Ma\u030Al');

    expect(actual.overskriftstittel).toBe('NAV 12.34-56 Mål');
    expect(actual.arkivtittel).toBe('NAV 12.34-56 Mål');
    expect(actual.dokumentlisteFoersteside).toEqual(['NAV 12.34-56 Mål', 'Vedlegg 1']);
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

  it('rejects invalid unknown-user information without exposing the input value', () => {
    expect(() =>
      coverPageRequestBodyMapper.createRequestBodyFromDownloadData({
        ...defaultData,
        user: {
          firstName: 'Test\\',
          surname: 'Testesen',
          address: {
            streetAddress: 'Testveien 1',
            postalCode: '0101',
            postalName: 'Oslo',
          },
        },
      }),
    ).toThrowError('Invalid value for cover page');
  });
});
