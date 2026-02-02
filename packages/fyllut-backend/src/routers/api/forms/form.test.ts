import {
  AttachmentSettingValues,
  Component,
  I18nTranslationReplacements,
  NavFormType,
  translationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import FormService from '../../../services/FormService';
import TranslationsService from '../../../services/TranslationsService';
import { mockRequest, mockResponse } from '../../../test/testHelpers';
import form, { mapAttachmentValues } from './form';

const testForm: NavFormType = {
  tags: [],
  type: 'test',
  display: 'form',
  name: 'Test Form',
  title: 'Test Title',
  path: '/test-path',
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
      vi.spyOn(FormService.prototype, 'loadForm').mockImplementationOnce(async (_formPath) => undefined);
      const request = mockRequest({ params: { formPath: 'nav123456' } });
      const response = mockResponse();
      await form.get(request, response);
      expect(response.json).not.toHaveBeenCalled();
      expect(response.sendStatus).toHaveBeenCalledWith(404);
    });

    describe("a form with 'nn' translations", () => {
      beforeEach(() => {
        vi.spyOn(TranslationsService.prototype, 'getTranslationsForLanguage').mockImplementationOnce(
          async (_, lang) => {
            switch (lang) {
              case 'nn':
                return {
                  'Norsk skjematittel': 'Nynorsk skjematittel',
                  'Norsk vedleggsnavn': 'Nynorsk vedleggsnavn',
                } as Record<string, string>;
              default:
                return {};
            }
          },
        );
        vi.spyOn(FormService.prototype, 'loadForm').mockImplementationOnce(
          async (formPath) =>
            ({
              path: formPath,
              title: 'Norsk skjematittel',

              properties: {
                ettersendelsesfrist: '10',
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
            }) as NavFormType,
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
