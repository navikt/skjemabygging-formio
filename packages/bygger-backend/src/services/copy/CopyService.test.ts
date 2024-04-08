import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { FormioService } from '../formioService';
import { createCopyService } from './CopyService';
import devForm from './testdata/dev/form';
import languageForm from './testdata/dev/form-language';
import prodForm from './testdata/prod/form';
import prodTranslations from './testdata/prod/translations';
import { CopyService } from './types';

const FORMIO_TOKEN = 'formio-token';
describe('CopyService', () => {
  describe('form', () => {
    let devMock: FormioService;
    let prodMock: FormioService;
    let copyService: CopyService;

    beforeEach(() => {
      devMock = {
        getForm: vi.fn(),
        saveForm: vi.fn().mockImplementation((form) => Promise.resolve(form)),
        deleteTranslations: vi.fn().mockImplementation(() => Promise.resolve()),
        saveTranslations: vi.fn().mockImplementation(() => Promise.resolve([])),
        createNewForm: vi.fn().mockImplementation(() => Promise.reject(new Error('Should not create new form'))),
      } as unknown as FormioService;
      prodMock = {
        getForm: vi.fn(),
        getTranslations: vi.fn(),
      } as unknown as FormioService;
      vi.spyOn(devMock, 'getForm').mockImplementation((path) => {
        if (path === 'language') {
          return Promise.resolve(languageForm);
        }
        return Promise.resolve(devForm);
      });
      vi.spyOn(prodMock, 'getForm').mockImplementation((_path) => Promise.resolve(prodForm));
      vi.spyOn(prodMock, 'getTranslations').mockImplementation((_path) => Promise.resolve(prodTranslations));

      const formioServiceDevMock = vi.mocked(devMock);
      const formioServiceProdMock = vi.mocked(prodMock);
      copyService = createCopyService(formioServiceProdMock, formioServiceDevMock);
    });

    it('copies form content from prod to dev', async () => {
      const savedDevForm = await copyService.form('nav123456', FORMIO_TOKEN, 'mikke');
      expect(devMock.saveForm).toHaveBeenCalledOnce();
      expect(savedDevForm._id).toEqual('dev-id');
      expect(savedDevForm.properties.tema).toEqual(prodForm.properties.tema);
      expect(savedDevForm.components).toHaveLength(prodForm.components.length);
      expect(savedDevForm.title).toEqual(prodForm.title);
    });

    it('copies form translations', async () => {
      await copyService.form('nav123456', FORMIO_TOKEN, 'mikke');
      expect(devMock.deleteTranslations).toHaveBeenCalledWith(devForm.path, FORMIO_TOKEN);
      expect(devMock.saveTranslations).toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            data: prodTranslations[0].data,
            form: languageForm._id,
            project: devForm.project,
          },
        ]),
        FORMIO_TOKEN,
      );
    });

    it('creates new form if it does not already exist in target', async () => {
      vi.spyOn(devMock, 'getForm').mockImplementation((_path) => Promise.resolve(undefined));
      vi.spyOn(devMock, 'createNewForm').mockImplementation(() => Promise.resolve({ _id: 'new-id' } as NavFormType));

      const savedDevForm = await copyService.form('nav123456', FORMIO_TOKEN, 'mikke');
      expect(devMock.createNewForm).toHaveBeenCalledOnce();
      expect(devMock.saveForm).toHaveBeenCalledOnce();
      expect(savedDevForm._id).toEqual('new-id');
      expect(savedDevForm.properties.tema).toEqual(prodForm.properties.tema);
      expect(savedDevForm.components).toHaveLength(prodForm.components.length);
      expect(savedDevForm.title).toEqual(prodForm.title);
    });
  });
});
