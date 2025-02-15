import { Form, UsageContext } from '@navikt/skjemadigitalisering-shared-domain';
import { isFormMetadataValid, validateFormMetadata } from './utils';

describe('Form Metadata Validation', () => {
  let sampleForm: Form;

  beforeEach(() => {
    sampleForm = {
      skjemanummer: 'NAV 12-13.14',
      title: 'Sample Title',
      path: 'sample-path',
      properties: {
        skjemanummer: 'NAV 12-13.14',
        tema: 'AAP',
        mellomlagringDurationDays: '28',
      },
      components: [],
    };
  });

  it('should validate form metadata for a new form', () => {
    const usageContext: UsageContext = 'create';
    const errors = validateFormMetadata(sampleForm, usageContext);

    expect(errors).toEqual({});
    expect(isFormMetadataValid(errors)).toBe(true);
  });

  it('should validate form metadata for an edit form', () => {
    const usageContext: UsageContext = 'edit';
    // Set properties that are required for edit mode
    sampleForm.properties.innsending = 'KUN_DIGITAL';
    sampleForm.properties.ettersending = 'KUN_PAPIR';

    const errors = validateFormMetadata(sampleForm, usageContext);

    expect(errors).toEqual({});
    expect(isFormMetadataValid(errors)).toBe(true);
  });

  it('should handle errors for a new form', () => {
    const usageContext: UsageContext = 'create';
    sampleForm.title = ''; // Missing title

    const errors = validateFormMetadata(sampleForm, usageContext);

    expect(errors).toEqual({
      title: 'Du må oppgi skjematittel',
    });
    expect(isFormMetadataValid(errors)).toBe(false);
  });

  it('should handle errors for an edit form', () => {
    const usageContext: UsageContext = 'edit';

    sampleForm.properties.innsending = undefined; // Missing innsending
    sampleForm.properties.ettersending = undefined; // Missing ettersending

    const errors = validateFormMetadata(sampleForm, usageContext);

    expect(errors).toEqual({
      innsending: 'Du må velge innsendingstype',
      ettersending: 'Du må velge innsendingstype for ettersending',
    });
    expect(isFormMetadataValid(errors)).toBe(false);
  });

  it('should validate skjemanummer length for a new form', () => {
    const usageContext: UsageContext = 'create';
    // Skjemanummer with length greater than 20
    sampleForm.properties.skjemanummer = '123456789012345678901';

    const errors = validateFormMetadata(sampleForm, usageContext);

    expect(errors).toEqual({
      skjemanummer: 'Skjemanummeret kan ikke være lengre enn 20 tegn',
    });
    expect(isFormMetadataValid(errors)).toBe(false);
  });

  it('should show error for non-integer mellomlagringDurationDays', () => {
    const usageContext: UsageContext = 'edit';
    sampleForm.properties.mellomlagringDurationDays = '28.3';
    sampleForm.properties.innsending = 'KUN_DIGITAL';
    sampleForm.properties.ettersending = 'KUN_PAPIR';

    const errors = validateFormMetadata(sampleForm, usageContext);

    expect(errors).toEqual({
      mellomlagringDurationDays: 'Mellomlagringstiden må være et heltall',
    });
    expect(isFormMetadataValid(errors)).toBe(false);
  });

  it('should handle valid mellomlagringDurationDays', () => {
    const usageContext: UsageContext = 'edit';
    sampleForm.properties.mellomlagringDurationDays = '30';
    sampleForm.properties.innsending = 'KUN_DIGITAL';
    sampleForm.properties.ettersending = 'KUN_PAPIR';

    const errors = validateFormMetadata(sampleForm, usageContext);

    expect(errors).toEqual({});
    expect(isFormMetadataValid(errors)).toBe(true);
  });
});
