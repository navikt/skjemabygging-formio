import { Form, formioFormsApiUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { removeInnsendingTypeFromForm } from './formsApiUtils';

describe('formsApiUtils', () => {
  describe('formioFormsApiUtils.mapInnsendingTypeToSubmissionTypes', () => {
    it('should return [PAPER, DIGITAL] when innsending is PAPIR_OG_DIGITAL', () => {
      expect(formioFormsApiUtils.mapInnsendingTypeToSubmissionTypes('PAPIR_OG_DIGITAL')).toStrictEqual([
        'PAPER',
        'DIGITAL',
      ]);
    });

    it('should return [PAPER] when innsending is KUN_PAPIR', () => {
      expect(formioFormsApiUtils.mapInnsendingTypeToSubmissionTypes('KUN_PAPIR')).toStrictEqual(['PAPER']);
    });

    it('should return [DIGITAL] when innsending is KUN_DIGITAL', () => {
      expect(formioFormsApiUtils.mapInnsendingTypeToSubmissionTypes('KUN_DIGITAL')).toStrictEqual(['DIGITAL']);
    });

    it('should return an empty array when innsending is undefined', () => {
      expect(formioFormsApiUtils.mapInnsendingTypeToSubmissionTypes(undefined)).toStrictEqual([]);
    });
  });

  describe('removeInnsendingFromForm', () => {
    it('should remove innsending and ettersending, and set both submissionTypes and subsequentSubmissionTypes to [PAPER, DIGITAL]', () => {
      const form = {
        tags: [],
        type: 'test',
        display: 'form',
        name: 'Test Form',
        title: 'Test Title',
        path: '/test-path',
        properties: {
          innsending: 'PAPIR_OG_DIGITAL',
          ettersending: 'PAPIR_OG_DIGITAL',
          ettersendelsesfrist: '12',
          skjemanummer: '',
          tema: '',
          mellomlagringDurationDays: '28',
        },
        components: [],
      } as unknown as Form;
      const data = removeInnsendingTypeFromForm(form);
      expect(data).not.toHaveProperty('properties.innsending');
      expect(data).not.toHaveProperty('properties.ettersending');
      expect(data).toHaveProperty('properties.submissionTypes');
      expect(data).toHaveProperty('properties.subsequentSubmissionTypes');
      expect(data.properties.submissionTypes).toEqual(['PAPER', 'DIGITAL']);
      expect(data.properties.subsequentSubmissionTypes).toEqual(['PAPER', 'DIGITAL']);
    });

    it('should keep existing submissionTypes and subsequentSubmissionTypes unchanged when already defined', () => {
      const form = {
        tags: [],
        type: 'test',
        display: 'form',
        name: 'Test Form',
        title: 'Test Title',
        path: '/test-path',
        properties: {
          submissionTypes: ['PAPER'],
          subsequentSubmissionTypes: ['PAPER', 'DIGITAL'],
          ettersendelsesfrist: '12',
          skjemanummer: '',
          tema: '',
          mellomlagringDurationDays: '28',
        },
        components: [],
      } as unknown as Form;
      const data = removeInnsendingTypeFromForm(form);
      expect(data).not.toHaveProperty('properties.innsending');
      expect(data).not.toHaveProperty('properties.ettersending');
      expect(data).toHaveProperty('properties.submissionTypes');
      expect(data).toHaveProperty('properties.subsequentSubmissionTypes');
      expect(data.properties.submissionTypes).toEqual(['PAPER']);
      expect(data.properties.subsequentSubmissionTypes).toEqual(['PAPER', 'DIGITAL']);
    });
  });
});
