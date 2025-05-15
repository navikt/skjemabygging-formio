import { Form, FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { mock, MockProxy } from 'vitest-mock-extended';
import { FormsService } from '../forms/types';
import { FormTranslationService, GlobalTranslationService } from '../translation/types';
import { createCopyService } from './CopyService';
import { CopyService } from './types';

describe('CopyService', () => {
  let formsServiceSourceMock: MockProxy<FormsService>;
  let formsServiceTargetMock: MockProxy<FormsService>;
  let formTranslationServiceSourceMock: MockProxy<FormTranslationService>;
  let formTranslationServiceTargetMock: MockProxy<FormTranslationService>;
  let globalTranslationServiceSourceMock: MockProxy<GlobalTranslationService>;
  let globalTranslationServiceTargetMock: MockProxy<GlobalTranslationService>;
  let copyService: CopyService;

  beforeEach(() => {
    formsServiceSourceMock = mock<FormsService>();
    formsServiceTargetMock = mock<FormsService>();
    formTranslationServiceSourceMock = mock<FormTranslationService>();
    formTranslationServiceTargetMock = mock<FormTranslationService>();
    globalTranslationServiceSourceMock = mock<GlobalTranslationService>();
    globalTranslationServiceTargetMock = mock<GlobalTranslationService>();
    copyService = createCopyService(
      formsServiceSourceMock,
      formsServiceTargetMock,
      formTranslationServiceSourceMock,
      formTranslationServiceTargetMock,
      globalTranslationServiceSourceMock,
      globalTranslationServiceTargetMock,
    );
  });

  describe('forms', () => {
    it('overwrites form that exists in target', async () => {
      const formPath = 'nav123456';
      const sourceForm: Form = { path: formPath, title: 'Tittel', properties: {} } as Form;
      const targetForm: Form = { path: formPath, title: 'Annen tittel', properties: {} } as Form;

      formsServiceSourceMock.get.calledWith(formPath).mockReturnValue(Promise.resolve(sourceForm));

      formsServiceTargetMock.get.calledWith(formPath).mockReturnValue(Promise.resolve(targetForm));

      formTranslationServiceSourceMock.get.calledWith(formPath).mockReturnValue(Promise.resolve([]));

      formTranslationServiceTargetMock.get.calledWith(formPath).mockReturnValue(Promise.resolve([]));

      await copyService.form(formPath, 'token', 'user');

      expect(formsServiceTargetMock.post).not.toHaveBeenCalled();
      expect(formsServiceTargetMock.put).toHaveBeenCalledOnce();
    });

    it('copies form that does not exists in target', async () => {
      const formPath = 'nav123456';
      const sourceForm: Form = { path: formPath, title: 'Tittel', properties: {} } as Form;

      formsServiceSourceMock.get.calledWith(formPath).mockReturnValue(Promise.resolve(sourceForm));

      formsServiceTargetMock.get.calledWith(formPath).mockImplementation((_formPath) => {
        throw Error('Not found');
      });

      formTranslationServiceSourceMock.get.calledWith(formPath).mockReturnValue(Promise.resolve([]));

      formTranslationServiceTargetMock.get.calledWith(formPath).mockReturnValue(Promise.resolve([]));

      await copyService.form(formPath, 'token', 'user');

      expect(formsServiceTargetMock.put).not.toHaveBeenCalled();
      expect(formsServiceTargetMock.post).toHaveBeenCalledOnce();
    });
  });

  describe('globalTranslations', () => {
    it('copies global translations for given language', async () => {
      globalTranslationServiceSourceMock.get.calledWith().mockReturnValue(Promise.resolve([] as FormsApiTranslation[]));
      globalTranslationServiceTargetMock.get.calledWith().mockReturnValue(Promise.resolve([] as FormsApiTranslation[]));

      await copyService.globalTranslations('token');
      expect(globalTranslationServiceSourceMock.get).toHaveBeenCalledTimes(1);
      expect(globalTranslationServiceTargetMock.get).toHaveBeenCalledTimes(1);
      // TODO mock global translations and verify that they are copied to target
    });
  });
});
