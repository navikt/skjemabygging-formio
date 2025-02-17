import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import nock from 'nock';
import { getFormioApiServiceUrl } from '../util/formio';
import { formioService } from './index';

const FORMIO_API_SERVICE_URL = getFormioApiServiceUrl();

// TODO FORMS-API delete test when FormioService is not in use anymore
describe('FormioService', () => {
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

      beforeEach(() => {
        nock(FORMIO_API_SERVICE_URL)
          .put(/\/form\/(\d*)$/)
          .reply((uri, requestBody) => [200, requestBody]);
      });

      afterEach(() => {
        nock.cleanAll();
      });

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
      beforeEach(() => {
        nock(FORMIO_API_SERVICE_URL)
          .put(/\/form\/(\d*)$/)
          .reply(500);
        vi.spyOn(console, 'error').mockImplementation(() => {});
      });

      afterEach(() => {
        nock.cleanAll();
        vi.restoreAllMocks();
      });

      it('is thrown as an error', async () => {
        const form: NavFormType = {
          _id: '1',
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
    beforeEach(() => {
      nock(FORMIO_API_SERVICE_URL)
        .put(/\/form\/(\d*)$/)
        .times(2)
        .reply((uri, requestBody) => [200, requestBody]);
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it('uses same modified and modifiedBy on all forms', async () => {
      const forms = [
        { _id: '1', properties: { modified: '2022-06-28T10:03:15.634Z' } } as NavFormType,
        { _id: '2', properties: { modified: '2022-06-06T12:55:05.000Z' } } as NavFormType,
      ];
      const savedForms = await formioService.saveForms(forms, 'formio-token', 'jenny');
      expect(savedForms).toHaveLength(2);
      expect(savedForms[0].properties.modified).toEqual(savedForms[1].properties.modified);
    });
  });

  describe('createNewForm', () => {
    afterEach(() => {
      nock.cleanAll();
    });

    it('sets default properties', async () => {
      nock(FORMIO_API_SERVICE_URL)
        .post('/form')
        .reply((uri, requestBody) => [200, requestBody]);
      const skjemanummer = 'NAV 01-00.00';
      const savedForm = await formioService.createNewForm(skjemanummer, 'formio-token');
      expect(savedForm._id).toBeUndefined();
      expect(savedForm.type).toEqual('form');
      expect(savedForm.display).toEqual('wizard');
      expect(savedForm.path).toEqual('nav010000');
      expect(savedForm.name).toEqual('nav010000');
      expect(savedForm.title).toBeTruthy();
      expect(savedForm.properties.skjemanummer).toEqual(skjemanummer);
      expect(savedForm.access).toHaveLength(2);
      expect(savedForm.components).toHaveLength(0);
    });
  });
});
