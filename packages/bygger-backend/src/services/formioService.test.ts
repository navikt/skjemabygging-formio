import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { MswUtils } from '../mocks/utils/mswUtils';
import { getFormioApiServiceUrl } from '../util/formio';
import { formioService } from './index';

const FORMIO_API_SERVICE_URL = getFormioApiServiceUrl();
const mswUtils = global.mswUtils as MswUtils;

describe('FormioService', () => {
  afterEach(() => {
    mswUtils.clear();
  });

  describe('saveForm', () => {
    describe('props modified and modifiedBy', () => {
      const form: NavFormType = {
        _id: '1',
        properties: {
          modified: '2022-06-28T10:02:15.634Z',
          modifiedBy: 'dennis',
        },
        components: [
          {
            type: 'textfield',
            navId: 'duplicateNavId',
            id: 'textField1',
          },
          {
            type: 'textfield',
            navId: 'duplicateNavId',
            id: 'textField2',
          },
          {
            type: 'container',
            id: 'container1',
            components: [{ type: 'textfield', navId: 'duplicateNavId', id: 'subComponent1' }],
          },
          {
            type: 'textfield',
            id: 'textField3',
          },
        ],
      } as NavFormType;

      it('are updated with new values', async () => {
        const savedForm = await formioService.saveForm(form, 'formio-token', 'tore');
        expect(savedForm.properties.modified).not.toEqual(form.properties.modified);
        expect(savedForm.properties.modifiedBy).toBe('tore');
      });

      it('is updated with new navIds when there are duplicates or missing navIds', async () => {
        const savedForm = await formioService.saveForm(form, 'formio-token', 'tore', {}, true);

        // First component keeps its navId
        expect(savedForm.components.find((comp) => comp.id === 'textField1')?.navId).toBe('duplicateNavId');

        // The rest are updated to a new navId
        expect(savedForm.components.find((comp) => comp.id === 'textField2')?.navId).not.toBe('duplicateNavId');
        expect(savedForm.components.find((comp) => comp.id === 'container1')?.navId).not.toBe('duplicateNavId');
        expect(savedForm.components.find((comp) => comp.components?.[0].id === 'subComponent1')?.navId).not.toBe(
          'duplicateNavId',
        );

        // Or added if missing
        expect(savedForm.components.find((comp) => comp.id === 'textField3')?.navId).toBeDefined();
      });

      it('are updated with values specified in formProps parameter', async () => {
        const props = {
          modified: '2022-06-28T10:03:15.634Z',
          modifiedBy: 'pia',
        };
        const savedForm = await formioService.saveForm(form, 'formio-token', 'tore', props);
        expect(savedForm.properties.modified).not.toEqual(form.properties.modified);
        expect(savedForm.properties.modified).toEqual(props.modified);
        expect(savedForm.properties.modifiedBy).toBe('pia');
      });
    });

    describe('http error from formio api', () => {
      const FORM_ID = '1';

      beforeEach(() => {
        mswUtils.mock(FORMIO_API_SERVICE_URL).put(`/form/${FORM_ID}`).reply(500);
        vi.spyOn(console, 'error').mockImplementation(() => {});
      });

      afterEach(() => {
        vi.restoreAllMocks();
      });

      it('is thrown as an error', async () => {
        const form: NavFormType = {
          _id: FORM_ID,
          properties: {},
        } as NavFormType;
        let error;
        try {
          await formioService.saveForm(form, 'formio-token', 'tore');
        } catch (e) {
          error = e;
        }
        expect(error).toBeDefined();
        expect(error?.response?.status).toBe(500);
      });
    });
  });

  describe('saveForms', () => {
    it('uses same modified and modifiedBy on all forms', async () => {
      const forms = [
        { _id: '1', properties: { modified: '2022-06-28T10:03:15.634Z' } } as NavFormType,
        { _id: '2', properties: { modified: '2022-06-06T12:55:05.000Z' } } as NavFormType,
      ];
      const savedForms = await formioService.saveForms(forms, 'formio-token', 'jenny');
      expect(savedForms).toHaveLength(2);
      const formModified1 = savedForms[0].properties.modified;
      const formModified2 = savedForms[1].properties.modified;
      expect(formModified1).toBeDefined();
      expect(formModified2).toBeDefined();
      expect(formModified1).toEqual(formModified2);
    });
  });

  describe('createNewForm', () => {
    it('sets default properties', async () => {
      const skjemanummer = 'NAV 01-00.00';
      const savedForm = await formioService.createNewForm(skjemanummer, 'formio-token');
      expect(savedForm._id).toBeUndefined();
      expect(savedForm.type).toEqual('form');
      expect(savedForm.display).toEqual('wizard');
      expect(savedForm.tags).toEqual(expect.arrayContaining(['nav-skjema']));
      expect(savedForm.path).toEqual('nav010000');
      expect(savedForm.name).toEqual('nav010000');
      expect(savedForm.title).toBeTruthy();
      expect(savedForm.properties.skjemanummer).toEqual(skjemanummer);
      expect(savedForm.access).toHaveLength(2);
      expect(savedForm.components).toHaveLength(0);
    });
  });
});
