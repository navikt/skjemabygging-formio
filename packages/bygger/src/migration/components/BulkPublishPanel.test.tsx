import { Form, FormPropertiesType } from '@navikt/skjemadigitalisering-shared-domain';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import * as api from '../api';
import BulkPublishPanel from './BulkPublishPanel';

const published = {
  modified: '2022-11-17T13:12:38.825Z',
  modifiedBy: 'user@company.com',
  published: '2022-11-17T13:12:38.825Z',
};
const pending = {
  modified: '2022-12-08T15:05:28.353Z',
  modifiedBy: 'user@company.com',
  published: '2022-03-17T13:12:38.825Z',
};
const properties: FormPropertiesType = {
  skjemanummer: 'skjemanummer',
  tema: 'tema',
  innsending: 'PAPIR_OG_DIGITAL',
  signatures: {
    signature1: '',
    signature2: '',
    signature3: '',
    signature4: '',
    signature5: '',
  },
  mellomlagringDurationDays: '28',
};
const form: Form = {
  title: 'Form title',
  path: 'formPath',
  skjemanummer: 'skjemanummer',
  components: [],
  properties,
  status: 'draft',
};

const testForm1: Form = {
  ...form,
  path: 'form1',
  title: 'Form 1',
  skjemanummer: '001',
  properties: { ...properties, ...published },
  status: 'published',
};
const testForm2: Form = {
  ...form,
  path: 'form2',
  title: 'Form 2',
  skjemanummer: '002',
  properties: { ...properties, ...pending },
  status: 'pending',
};
const testForm3: Form = { ...form, path: 'form3', title: 'Form 3', skjemanummer: '003', properties: { ...properties } };
const bulkPublish = vi.fn();

describe('BulkPublishPanel', () => {
  beforeEach(() => {
    vi.spyOn(api, 'bulkPublish').mockImplementation(bulkPublish);
    render(<BulkPublishPanel forms={[testForm1, testForm2, testForm3]} />);
  });

  afterEach(() => {
    bulkPublish.mockClear();
  });

  it('no form is initially checked', () => {
    expect(screen.getByRole('checkbox', { name: 'Form 1', checked: false })).toBeDefined();
    expect(screen.getByRole('checkbox', { name: 'Form 2', checked: false })).toBeDefined();
    expect(screen.getByRole('checkbox', { name: 'Form 3', checked: false })).toBeDefined();
  });

  describe('When a form is checked', () => {
    beforeEach(() => {
      fireEvent.click(screen.getByRole('checkbox', { name: 'Form 1' }));
    });

    it('unselects one form', () => {
      expect(screen.getByRole('checkbox', { name: 'Form 1' })).toBeChecked();
    });

    describe('When modal button is clicked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('checkbox', { name: 'Form 3' }));
        const button = screen.getByRole('button');
        fireEvent.click(button);
      });

      it('opens modal with a summary of which forms will be published', () => {
        const table = screen.getAllByRole('table');

        expect(screen.getByRole('heading', { name: 'Skjemaer som vil bli publisert' })).toBeTruthy();
        const willBePublished = within(table[1]).getAllByRole('row');
        expect(willBePublished).toHaveLength(3);
        expect(willBePublished[1]).toHaveTextContent('Form 1');
        expect(willBePublished[2]).toHaveTextContent('Form 3');

        expect(screen.getByRole('heading', { name: 'Skjemaer som ikke vil bli publisert' })).toBeTruthy();
        const willNotBePublished = within(table[2]).getAllByRole('row');
        expect(willNotBePublished).toHaveLength(2);
        expect(willNotBePublished[1]).toHaveTextContent('Form 2');
      });

      it('bulk publishes selected forms when bulk publish is confirmed', async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Bekreft publisering' }));
        await waitFor(() => expect(bulkPublish).toHaveBeenCalledTimes(1));
        expect(bulkPublish).toHaveBeenCalledWith('', { formPaths: ['form1', 'form3'] });
      });
    });
  });
});
