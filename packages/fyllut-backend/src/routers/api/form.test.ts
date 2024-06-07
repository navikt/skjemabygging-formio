import { Component, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import FormService from '../../services/FormService';
import TranslationsService from '../../services/TranslationsService';
import { mockRequest, mockResponse } from '../../test/testHelpers';
import form from './form';

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
      vi.spyOn(TranslationsService.prototype, 'getTranslationsForLanguage').mockImplementationOnce(async (_, lang) => {
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
      vi.spyOn(FormService.prototype, 'loadForm').mockImplementationOnce(
        async (formPath) =>
          ({
            path: formPath,
            title: 'Norsk skjematittel',
            properties: {},
            components: [
              {
                label: 'Norsk vedleggsnavn',
                properties: {
                  vedleggskode: 'B1',
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
