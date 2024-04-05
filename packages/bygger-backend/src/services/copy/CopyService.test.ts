import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { FormioService } from '../formioService';
import { createCopyService } from './CopyService';

describe('CopyService', () => {
  describe('form', () => {
    let devMock: FormioService;
    let prodMock: FormioService;
    let copyService;

    beforeEach(() => {
      devMock = {
        getForm: vi.fn(),
        saveForm: vi.fn().mockImplementation((form) => form),
      } as unknown as FormioService;
      prodMock = {
        getForm: vi.fn(),
      } as unknown as FormioService;
      const formioServiceDevMock = vi.mocked(devMock);
      const formioServiceProdMock = vi.mocked(prodMock);
      copyService = createCopyService(formioServiceProdMock, formioServiceDevMock);
    });

    it('copies form content from prod to dev', async () => {
      const prodForm = {
        path: 'nav123456',
        title: 'Prod form title',
        components: [
          {
            type: 'panel',
          },
        ],
        properties: {
          tema: 'BIL',
        },
      } as unknown as NavFormType;
      const devForm = {
        path: 'nav123456',
        title: 'Dev form title',
        components: [],
        properties: {
          tema: 'ARB',
        },
      } as unknown as NavFormType;

      vi.spyOn(prodMock, 'getForm').mockImplementation((_path) => Promise.resolve(prodForm));
      vi.spyOn(devMock, 'getForm').mockImplementation((_path) => Promise.resolve(devForm));
      const savedDevForm = await copyService.form('nav123456');
      expect(devMock.saveForm).toHaveBeenCalledOnce();
      expect(savedDevForm.properties.tema).toEqual(prodForm.properties.tema);
      expect(savedDevForm.components).toHaveLength(prodForm.components.length);
      expect(savedDevForm.title).toEqual(prodForm.title);
    });
  });
});
