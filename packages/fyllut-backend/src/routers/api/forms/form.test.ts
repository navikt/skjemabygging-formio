import {
  AttachmentSettingValues,
  Component,
  Form,
  I18nTranslationReplacements,
  ResponseError,
  translationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { formService, translationsService } from '../../../services';
import { mockRequest, mockResponse } from '../../../test/testHelpers';
import form, { mapAttachmentValues } from './form';

vi.mock('../../../services', () => ({
  formService: { getForm: vi.fn() },
  translationsService: { getTranslationsForLanguage: vi.fn() },
}));

const testForm: Form = {
  title: 'Test Title',
  path: '/test-path',
  skjemanummer: '',
  properties: {
    submissionTypes: ['PAPER', 'DIGITAL'],
    subsequentSubmissionTypes: ['PAPER', 'DIGITAL'],
    ettersendelsesfrist: '12',
    skjemanummer: '',
    tema: '',
    mellomlagringDurationDays: '28',
  },
  components: [],
};

const translate = (text: string, textReplacements?: I18nTranslationReplacements) =>
  translationUtils.translateWithTextReplacements({
    translations: {},
    textOrKey: text,
    params: textReplacements,
    currentLanguage: 'nb-NO',
  });

describe('form', () => {
  describe('[endpoint] form', () => {
    it('returns 404 when form is not found', async () => {
      vi.mocked(formService.getForm).mockRejectedValueOnce(new ResponseError('NOT_FOUND', 'not found'));
      const request = mockRequest({ params: { formPath: 'nav123456' } });
      const response = mockResponse();

      await expect(form.get(request, response)).rejects.toMatchObject({ errorCode: 'NOT_FOUND' });

      expect(response.json).not.toHaveBeenCalled();
    });

    describe("a form with 'nn' translations", () => {
      beforeEach(() => {
        vi.mocked(translationsService.getTranslationsForLanguage).mockImplementationOnce(async (_, lang) => {
          switch (lang) {
            case 'nn':
              return {
                'Norsk skjematittel': 'Nynorsk skjematittel',
                'Norsk vedleggsnavn': 'Nynorsk vedleggsnavn',
              } as Record<string, string>;
            default:
              return {};
          }
        });
        vi.mocked(formService.getForm).mockImplementationOnce(
          async ({ formPath }) =>
            ({
              id: 1,
              path: formPath,
              title: 'Norsk skjematittel',
              publishedLanguages: ['nb', 'nn'],
              properties: {
                ettersendelsesfrist: '10',
                navUnitDescription: 'Velg riktig NAV-enhet',
              },
              components: [
                {
                  label: 'Norsk vedleggsnavn',
                  properties: {
                    vedleggskode: 'B1',
                  },
                  attachmentValues: {
                    nav: {
                      enabled: true,
                      additionalDocumentation: {
                        enabled: true,
                        label: 'Nav label',
                        description: 'Nav description',
                      },
                    },
                    leggerVedNaa: {
                      enabled: true,
                      additionalDocumentation: {
                        enabled: false,
                        label: 'Legger ved nå label',
                        description: 'Legger ved nå description',
                      },
                    },
                    andre: {
                      enabled: false,
                      additionalDocumentation: {
                        enabled: false,
                        label: 'Andre label',
                        description: 'Andre description',
                      },
                    },
                    ettersender: {
                      enabled: true,
                      showDeadline: true,
                    },
                  },
                } as Component,
              ],
              skjemanummer: '',
            }) as Form,
        );
      });

      describe('when type is limited', () => {
        it("is translated when requested lang='nn'", async () => {
          const request = mockRequest({ params: { formPath: 'nav123456' }, query: { lang: 'nn', type: 'limited' } });
          const response = mockResponse();
          await form.get(request, response);
          expect(response.json).toHaveBeenCalledWith(
            expect.objectContaining({
              title: 'Nynorsk skjematittel',
              properties: expect.objectContaining({
                navUnitDescription: 'Velg riktig NAV-enhet',
                publishedLanguages: ['nb', 'nn'],
              }),
            }),
          );
          const attachment = response.json.mock.calls[0][0].attachments[0];
          const attachmentValues = attachment.attachmentValues;

          expect(attachmentValues).toHaveLength(3);
          expect(attachmentValues).toStrictEqual([
            {
              key: 'nav',
              description: 'Jeg ønsker at Nav innhenter denne dokumentasjonen',
              additionalDocumentationLabel: 'Nav label',
              additionalDocumentationDescription: 'Nav description',
            },
            {
              key: 'leggerVedNaa',
              description: 'Jeg legger det ved dette skjemaet',
            },
            {
              key: 'ettersender',
              description: 'Jeg ettersender dokumentasjonen senere',
              deadlineWarning:
                'Hvis vi ikke har mottatt dette vedlegget innen 10 dager blir saken behandlet med de opplysningene som foreligger.',
            },
          ]);

          expect(attachment.label).toBe('Nynorsk vedleggsnavn');
        });

        it("is not translated when requested lang='en'", async () => {
          const request = mockRequest({ params: { formPath: 'nav123456' }, query: { lang: 'en', type: 'limited' } });
          const response = mockResponse();
          await form.get(request, response);
          expect(response.json).toHaveBeenCalledWith(
            expect.objectContaining({
              title: 'Norsk skjematittel',
            }),
          );
        });
      });

      describe('when type is not given', () => {
        it("is not translated even if requested lang='nn'", async () => {
          const request = mockRequest({ params: { formPath: 'nav123456' }, query: { lang: 'nn' } });
          const response = mockResponse();
          await form.get(request, response);
          expect(response.json).toHaveBeenCalledWith(
            expect.objectContaining({
              title: 'Norsk skjematittel',
            }),
          );
        });
      });
    });
  });

  describe('mapAttachmentValues', () => {
    it('should return an empty array if attachmentValues is undefined', () => {
      const result = mapAttachmentValues(translate, testForm);
      expect(result).toStrictEqual([]);
    });

    it('should return an empty array if attachmentValues is an empty object', () => {
      const result = mapAttachmentValues(translate, testForm, {});
      expect(result).toStrictEqual([]);
    });

    it('should map enabled attachment values correctly', () => {
      const attachmentValues: AttachmentSettingValues = {
        leggerVedNaa: { enabled: true },
        ettersender: { enabled: false },
        nav: {
          enabled: true,
          additionalDocumentation: { enabled: true, label: 'docLabel', description: 'docDescription' },
        },
      };

      const result = mapAttachmentValues(translate, testForm, attachmentValues);

      expect(result).toStrictEqual([
        {
          key: 'leggerVedNaa',
          description: 'Jeg legger det ved dette skjemaet',
        },
        {
          key: 'nav',
          description: 'Jeg ønsker at Nav innhenter denne dokumentasjonen',
          additionalDocumentationLabel: 'docLabel',
          additionalDocumentationDescription: 'docDescription',
        },
      ]);
    });

    it('should exclude attachment values correctly when "enabled" prop is not defined', () => {
      const attachmentValues: AttachmentSettingValues = {
        leggerVedNaa: { enabled: true },
        ettersender: {},
        nav: {
          enabled: true,
          additionalDocumentation: { enabled: true, label: 'docLabel', description: 'docDescription' },
        },
      };

      const result = mapAttachmentValues(translate, testForm, attachmentValues);

      expect(result).toStrictEqual([
        {
          key: 'leggerVedNaa',
          description: 'Jeg legger det ved dette skjemaet',
        },
        {
          key: 'nav',
          description: 'Jeg ønsker at Nav innhenter denne dokumentasjonen',
          additionalDocumentationLabel: 'docLabel',
          additionalDocumentationDescription: 'docDescription',
        },
      ]);
    });

    it('should include deadlineWarning if showDeadline is true and ettersendelsesfrist is defined', () => {
      const attachmentValues: AttachmentSettingValues = {
        leggerVedNaa: { enabled: true, showDeadline: true },
      };

      const result = mapAttachmentValues(translate, testForm, attachmentValues);

      expect(result).toStrictEqual([
        {
          key: 'leggerVedNaa',
          description: 'Jeg legger det ved dette skjemaet',
          deadlineWarning:
            'Hvis vi ikke har mottatt dette vedlegget innen 12 dager blir saken behandlet med de opplysningene som foreligger.',
        },
      ]);
    });

    it('should not include additionalDocumentation fields if additionalDocumentation is disabled', () => {
      const attachmentValues: AttachmentSettingValues = {
        leggerVedNaa: {
          enabled: true,
          additionalDocumentation: { enabled: false, label: 'docLabel', description: 'docDescription' },
        },
      };

      const result = mapAttachmentValues(translate, testForm, attachmentValues);

      expect(result).toStrictEqual([
        {
          key: 'leggerVedNaa',
          description: 'Jeg legger det ved dette skjemaet',
        },
      ]);
    });

    it('should not include deadlineWarning if showDeadline is false', () => {
      const attachmentValues: AttachmentSettingValues = {
        leggerVedNaa: { enabled: true, showDeadline: false },
      };

      const result = mapAttachmentValues(translate, testForm, attachmentValues);

      expect(result).toStrictEqual([
        {
          key: 'leggerVedNaa',
          description: 'Jeg legger det ved dette skjemaet',
        },
      ]);
    });

    it('should handle missing additionalDocumentation fields gracefully', () => {
      const attachmentValues: AttachmentSettingValues = {
        leggerVedNaa: { enabled: true },
      };

      const result = mapAttachmentValues(translate, testForm, attachmentValues);

      expect(result).toStrictEqual([
        {
          key: 'leggerVedNaa',
          description: 'Jeg legger det ved dette skjemaet',
        },
      ]);
    });
  });
});
