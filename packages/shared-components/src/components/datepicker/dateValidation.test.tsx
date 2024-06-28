import { validateDate } from './dateValidation';

const translate = () => 'error message';

describe('Date Validation', () => {
  describe('Required', () => {
    it('Check with value', async () => {
      const errorMessage = validateDate(
        {
          value: '2000-01-01',
          label: 'Label',
          required: true,
        },
        translate,
      );
      expect(errorMessage).toBeUndefined();
    });

    it('Check with empty value', async () => {
      const errorMessage = validateDate(
        {
          value: '',
          label: 'Label',
          required: true,
        },
        translate,
      );
      expect(errorMessage).toBeDefined();
    });

    it('Check with undefined value', async () => {
      const errorMessage = validateDate(
        {
          value: undefined as unknown as string,
          label: 'Label',
          required: true,
        },
        translate,
      );
      expect(errorMessage).toBeDefined();
    });

    it('Check with null value', async () => {
      const errorMessage = validateDate(
        {
          value: null as unknown as string,
          label: 'Label',
          required: true,
        },
        translate,
      );
      expect(errorMessage).toBeDefined();
    });
  });

  describe('From date', () => {
    it('From date, before value', async () => {
      const errorMessage = validateDate(
        {
          value: '2000-01-02',
          label: 'Label',
          fromDate: '2000-01-01',
        },
        translate,
      );
      expect(errorMessage).toBeUndefined();
    });

    it('From date, same as value', async () => {
      const errorMessage = validateDate(
        {
          value: '2000-01-02',
          label: 'Label',
          fromDate: '2000-01-02',
        },
        translate,
      );
      expect(errorMessage).toBeUndefined();
    });

    it('From date, after value', async () => {
      const errorMessage = validateDate(
        {
          value: '2000-01-02',
          label: 'Label',
          fromDate: '2000-01-03',
        },
        translate,
      );
      expect(errorMessage).toBeDefined();
    });
  });

  describe('To date', () => {
    it('To date, before value', async () => {
      const errorMessage = validateDate(
        {
          value: '2000-01-02',
          label: 'Label',
          toDate: '2000-01-01',
        },
        translate,
      );
      expect(errorMessage).toBeDefined();
    });

    it('To date, same as value', async () => {
      const errorMessage = validateDate(
        {
          value: '2000-01-02',
          label: 'Label',
          toDate: '2000-01-02',
        },
        translate,
      );
      expect(errorMessage).toBeUndefined();
    });

    it('To date, after value', async () => {
      const errorMessage = validateDate(
        {
          value: '2000-01-02',
          label: 'Label',
          toDate: '2000-01-03',
        },
        translate,
      );
      expect(errorMessage).toBeUndefined();
    });
  });

  describe('Date format', () => {
    it('Ok', async () => {
      const errorMessage = validateDate(
        {
          value: '2000-01-01',
          label: 'Label',
        },
        translate,
      );
      expect(errorMessage).toBeUndefined();
    });

    it('Invalid', async () => {
      const errorMessage = validateDate(
        {
          value: '2000-01',
          label: 'Label',
        },
        translate,
      );
      expect(errorMessage).toBeDefined();
    });

    it('Short format', async () => {
      const errorMessage = validateDate(
        {
          value: '01-01-01',
          label: 'Label',
        },
        translate,
      );
      expect(errorMessage).toBeDefined();
    });

    it('Norwegian format', async () => {
      const errorMessage = validateDate(
        {
          value: '01.01.2000',
          label: 'Label',
        },
        translate,
      );
      expect(errorMessage).toBeDefined();
    });
  });
});
