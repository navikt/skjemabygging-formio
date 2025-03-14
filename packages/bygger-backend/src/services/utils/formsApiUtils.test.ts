import { Form, formioFormsApiUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { removeInnsendingFromForm } from './formsApiUtils';

describe('formsApiUtils', () => {
  describe('formioFormsApiUtils.mapInnsendingToSubmissionTypes', () => {
    it('should return [PAPER, DIGITAL] when innsending is PAPIR_OG_DIGITAL', () => {
      expect(formioFormsApiUtils.mapInnsendingToSubmissionTypes('PAPIR_OG_DIGITAL')).toStrictEqual([
        'PAPER',
        'DIGITAL',
      ]);
    });

    it('should return [PAPER] when innsending is KUN_PAPIR', () => {
      expect(formioFormsApiUtils.mapInnsendingToSubmissionTypes('KUN_PAPIR')).toStrictEqual(['PAPER']);
    });

    it('should return [DIGITAL] when innsending is KUN_DIGITAL', () => {
      expect(formioFormsApiUtils.mapInnsendingToSubmissionTypes('KUN_DIGITAL')).toStrictEqual(['DIGITAL']);
    });

    it('should return an empty array when innsending is undefined', () => {
      expect(formioFormsApiUtils.mapInnsendingToSubmissionTypes(undefined)).toStrictEqual([]);
    });
  });

  describe('removeInnsendingFromForm', () => {
    it('should not return innsending and submissionTypes should be [PAPER, DIGITAL]', () => {
      const form = {
        tags: [],
        type: 'test',
        display: 'form',
        name: 'Test Form',
        title: 'Test Title',
        path: '/test-path',
        properties: {
          innsending: 'PAPIR_OG_DIGITAL',
          ettersendelsesfrist: '12',
          skjemanummer: '',
          tema: '',
          mellomlagringDurationDays: '28',
        },
        components: [],
      } as unknown as Form;
      const data = removeInnsendingFromForm(form);
      expect(data).not.toHaveProperty('properties.innsending');
      expect(data).toHaveProperty('properties.submissionTypes');
      expect(data.properties.submissionTypes).toEqual(['PAPER', 'DIGITAL']);
    });

    it('should return submissionType when exists', () => {
      const form = {
        tags: [],
        type: 'test',
        display: 'form',
        name: 'Test Form',
        title: 'Test Title',
        path: '/test-path',
        properties: {
          submissionTypes: ['PAPER'],
          ettersendelsesfrist: '12',
          skjemanummer: '',
          tema: '',
          mellomlagringDurationDays: '28',
        },
        components: [],
      } as unknown as Form;
      const data = removeInnsendingFromForm(form);
      expect(data).not.toHaveProperty('properties.innsending');
      expect(data).toHaveProperty('properties.submissionTypes');
      expect(data.properties.submissionTypes).toEqual(['PAPER']);
    });
  });
});
