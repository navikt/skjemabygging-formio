import { NavFormType, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { base64Decode, base64EncodeByteArray } from '../../../utils/base64';
import {
  Attachment,
  SendInnSoknadBody,
  assembleSendInnSoknadBody,
  byteArrayToObject,
  objectToByteArray,
  sanitizeInnsendingsId,
  validateInnsendingsId,
} from './sendInn';

const defaultFormProperties = { skjemanummer: 'NAV123', tema: 'TEMA', ettersendelsesfrist: '14' };
const defaultForm = { title: 'Standard skjema', properties: defaultFormProperties };
const fyllutUrl = 'https://www.nav.test.dev.no/fyllut';

const defaultRequestBody = {
  form: defaultForm as NavFormType,
  submission: { q: 'a' } as unknown as Submission,
  language: 'nb-NO',
};

const attachment1 = {
  vedleggsnr: '1',
  tittel: 'Vedlegg 1',
  label: 'Vedlegg 1',
  beskrivelse: 'Beskrivelse',
} as Attachment;

const attachment2 = {
  vedleggsnr: '2',
  tittel: 'Vedlegg 2',
  label: 'Vedlegg 2',
  beskrivelse: 'Beskrivelse',
  vedleggskjema: 'nav123456',
} as Attachment;

const requestBodyWithAttachments = {
  ...defaultRequestBody,
  attachments: [attachment1, attachment2],
  otherDocumentation: true,
};

const idPortenPid = '123456789';
const submissionPdfAsByteArray = [123, 234, 56];
const submissionPdfAsBase64 = base64EncodeByteArray(submissionPdfAsByteArray);

const expectedSubmissionAsBase64 = base64EncodeByteArray([
  123, 34, 108, 97, 110, 103, 117, 97, 103, 101, 34, 58, 34, 110, 98, 45, 78, 79, 34, 44, 34, 100, 97, 116, 97, 34, 58,
  123, 34, 113, 34, 58, 34, 97, 34, 125, 125,
]);

describe('sendInn API helper', () => {
  describe('sanitizeInnsendingsId', () => {
    it("removes all instances of '/' from innsendingsId", () => {
      expect(sanitizeInnsendingsId('abc/def/123')).toBe('abcdef123');
    });

    it("removes all instances of '.' from innsendingsId", () => {
      expect(sanitizeInnsendingsId('abc.def.123')).toBe('abcdef123');
    });

    it("removes both '/' and '.' from innsendingsId", () => {
      expect(sanitizeInnsendingsId('/abc/def.123/456.789.ABC.DEF.')).toBe('abcdef123456789ABCDEF');
    });
  });

  describe('validateInnsendingsId', () => {
    it('returns undefined when the innsendingsId is valid', () => {
      expect(validateInnsendingsId('12345678-ABCD-cdef-9876-12345678abcd')).toBeUndefined();
    });

    it('returns an error message when innsendingsId is missing', () => {
      expect(validateInnsendingsId(undefined)).toBe('InnsendingsId mangler.');
    });

    it('returns an error message when innsendingsId contains illegal character /', () => {
      expect(validateInnsendingsId('abcd/123-ABCD-cdef-9876-12345678abcd')).toBe(
        'abcd/123-ABCD-cdef-9876-12345678abcd er ikke en gyldig innsendingsId.',
      );
    });

    it('returns an error message when innsendingsId contains illegal character .', () => {
      expect(validateInnsendingsId('abcd.123-ABCD-cdef-9876-12345678abcd')).toBe(
        'abcd.123-ABCD-cdef-9876-12345678abcd er ikke en gyldig innsendingsId.',
      );
    });
  });

  describe('assembleSendInnSoknadBody', () => {
    describe('Without attachments', () => {
      let body: SendInnSoknadBody;

      beforeEach(() => {
        body = assembleSendInnSoknadBody(defaultRequestBody, idPortenPid, fyllutUrl, submissionPdfAsByteArray);
      });

      it('adds the pid and form meta data', () => {
        expect(body).toEqual(
          expect.objectContaining({
            brukerId: idPortenPid,
            skjemanr: defaultFormProperties.skjemanummer,
            tema: defaultFormProperties.tema,
            tittel: defaultForm.title,
            spraak: defaultRequestBody.language,
          }),
        );
      });

      it('creates hovedDokument with vedleggsnr, tittel and document', () => {
        expect(body.hoveddokument).toEqual(
          expect.objectContaining({
            vedleggsnr: defaultFormProperties.skjemanummer,
            tittel: defaultForm.title,
            mimetype: 'application/pdf',
            document: submissionPdfAsBase64,
          }),
        );
      });

      it('creates hovedDokumentVariant with vedleggsnr, tittel and document', () => {
        expect(body.hoveddokumentVariant).toEqual(
          expect.objectContaining({
            vedleggsnr: defaultFormProperties.skjemanummer,
            tittel: defaultForm.title,
            mimetype: 'application/json',
            document: expectedSubmissionAsBase64,
          }),
        );
      });

      it('adds ettersendelsesfrist as number', () => {
        expect(body.fristForEttersendelse).toBe(14);
      });

      it('does not add vedleggsListe or kanLasteOppAnnet', () => {
        expect(body.vedleggsListe).toBeUndefined();
        expect(body.kanLasteOppAnnet).toBeUndefined();
      });
    });

    describe('With attachments', () => {
      let body: SendInnSoknadBody;

      beforeEach(() => {
        body = assembleSendInnSoknadBody(requestBodyWithAttachments, idPortenPid, fyllutUrl, submissionPdfAsByteArray);
      });

      it('adds kanLasteOppAnnet and vedleggsliste including vedleggsurl if applicable', () => {
        expect(body.kanLasteOppAnnet).toBe(true);
        expect(body.vedleggsListe).toEqual([
          attachment1,
          { ...attachment2, vedleggsurl: `${fyllutUrl}/${attachment2.vedleggskjema}?sub=paper` },
        ]);
      });
    });

    describe('With translations', () => {
      const requestBodyWithTranslation = {
        ...requestBodyWithAttachments,
        language: 'en',
        translation: {
          'Standard skjema': 'Form',
          'Vedlegg 1': 'Attachment 1',
          'Vedlegg 2': 'Attachment 2',
          Beskrivelse: 'Description',
        },
      };

      it('translates form metadata', () => {
        const body = assembleSendInnSoknadBody(
          requestBodyWithTranslation,
          idPortenPid,
          fyllutUrl,
          submissionPdfAsByteArray,
        );
        expect(body).toEqual(
          expect.objectContaining({
            spraak: 'en',
            tittel: 'Form',
          }),
        );
        expect(body.hoveddokument).toEqual(expect.objectContaining({ label: 'Form', tittel: 'Form' }));
        expect(body.hoveddokumentVariant).toEqual(expect.objectContaining({ label: 'Form', tittel: 'Form' }));
      });

      it('translates vedlegg metadata', () => {
        const body = assembleSendInnSoknadBody(
          requestBodyWithTranslation,
          idPortenPid,
          fyllutUrl,
          submissionPdfAsByteArray,
        );
        expect(body.vedleggsListe).toHaveLength(2);
        expect(body.vedleggsListe).toEqual([
          expect.objectContaining({
            label: 'Attachment 1',
            tittel: 'Attachment 1',
            beskrivelse: 'Description',
          }),
          expect.objectContaining({
            label: 'Attachment 2',
            tittel: 'Attachment 2',
            beskrivelse: 'Description',
          }),
        ]);
      });
    });
  });

  describe('Byte array conversion', () => {
    const simpleObject = { key: 'key', value: '1235' };
    const specialCharacters = {
      nordicSpecialCharacters: 'æ ä ø ö å Æ Ä Ø Ö Å',
      europeanSpecialCharacters:
        'Á á Ă ă Â â Å å Ä ä Ǟ ǟ Ã ã Ą ą Ā ā Æ æ Ć ć Ĉ ĉ Ċ ċ Ç ç Ď ď Ḑ ḑ Đ đ Ð ð É é Ê ê Ě ě Ë ë Ė ė Ę ę Ē ē Ğ ğ Ĝ ĝ Ġ ġ Ģ ģ Ĥ ĥ Ħ ħ İ ı Í í Ì ì Î î Ï ï Ĩ ĩ Į į Ī ī Ĳ ĳ Ĵ ĵ Ķ ķ Ĺ ĺ Ļ ļ Ł ł Ŀ ŀ Ń ń Ň ň Ñ ñ Ņ ņ Ŋ ŋ Ó ó Ò ò Ô ô Ö ö Ȫ ȫ Ő ő Õ õ Ȯ ȯ Ø ø Ǫ ǫ Ō ō Ọ ọ Œ œ ĸ Ř ř Ŕ ŕ Ŗ ŗ ſ Ś ś Ŝ ŝ Š š Ş ş Ṣ ṣ Ș ș ẞ ß Ť ť Ţ ţ Ț ț Ŧ ŧ Ú ú Ù ù Ŭ ŭ Û û Ů ů Ü ü Ű ű Ũ ũ Ų ų Ū ū Ŵ ŵ Ý ý Ŷ ŷ Ÿ ÿ Ȳ ȳ Ź ź Ž ž Ż ż Þ þ ª º ',
    };

    it('converts an object to byte array, and back to the same object', () => {
      const byteArray = objectToByteArray(simpleObject);
      expect(byteArray.length).toBeGreaterThan(0);
      expect(byteArrayToObject(Buffer.from(byteArray))).toEqual(simpleObject);
    });

    it("handles special characters like 'æøå'", () => {
      const byteArray = objectToByteArray(specialCharacters);
      expect(byteArray.length).toBeGreaterThan(0);
      expect(byteArrayToObject(Buffer.from(byteArray))).toEqual(specialCharacters);
    });

    it('handles special characters when bytearray has been base64 encoded as well', () => {
      const byteArrayBase64 = base64EncodeByteArray(objectToByteArray(specialCharacters));
      expect(byteArrayToObject(base64Decode(byteArrayBase64))).toEqual(specialCharacters);
    });
  });
});
