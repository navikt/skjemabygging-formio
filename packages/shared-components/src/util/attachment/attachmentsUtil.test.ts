import { NavFormType, SubmissionData } from '@navikt/skjemadigitalisering-shared-domain';
import {
  borDuINorgeRadiopanel,
  panelForsteSide,
  panelVedleggsliste,
  vedleggAnnenDokumentasjon,
  vedleggBekreftelseBostedsadresse,
} from '../../../test/test-data/form/defaultFormElements';
import vedleggConditional from '../../../test/test-data/form/vedlegg-conditional';
import { getAllAttachments, getRelevantAttachments, hasOtherDocumentation } from './attachmentsUtil';

const borDuINorgeRadiopanelKey = borDuINorgeRadiopanel.key;

const testFormProperties = {
  skjemanummer: 'NAV 00-00.00',
  tema: 'TES',
  submissionTypes: ['DIGITAL'],
  subsequentSubmissionTypes: [],
};

describe('attachmentUtil', () => {
  describe('getRelevantAttachments', () => {
    describe('form containing attachment triggered by radiopanel submission value', () => {
      const form = {
        components: [
          {
            ...panelForsteSide,
            components: [{ ...borDuINorgeRadiopanel }],
          },
          {
            ...panelVedleggsliste,
            components: [
              {
                ...vedleggBekreftelseBostedsadresse,
                conditional: {
                  show: true,
                  when: borDuINorgeRadiopanelKey,
                  eq: 'nei',
                },
              },
            ],
          },
        ],
        properties: testFormProperties,
      } as unknown as NavFormType;

      it('return attachment which is relevant', () => {
        const submissionData = { [borDuINorgeRadiopanel.key]: 'nei' };
        const attachments = getRelevantAttachments(form, { data: submissionData });
        expect(attachments).toHaveLength(1);
      });

      it('attachment contains correct data', () => {
        const submissionData = { [borDuINorgeRadiopanel.key]: 'nei' };
        const attachments = getRelevantAttachments(form, { data: submissionData });
        expect(attachments).toHaveLength(1);
        expect(attachments[0].vedleggsnr).toEqual(vedleggBekreftelseBostedsadresse.properties.vedleggskode);
        expect(attachments[0].tittel).toEqual(vedleggBekreftelseBostedsadresse.properties.vedleggstittel);
        expect(attachments[0].label).toEqual(vedleggBekreftelseBostedsadresse.label);
      });

      it('does not return attachment which is not relevant', () => {
        const submissionData = { [borDuINorgeRadiopanel.key]: 'ja' };
        const attachments = getRelevantAttachments(form, { data: submissionData });
        expect(attachments).toHaveLength(0);
      });
    });

    describe('form containing attachment with custom conditional', () => {
      const form = {
        components: [
          {
            ...panelForsteSide,
            components: [{ ...borDuINorgeRadiopanel }],
          },
          {
            ...panelVedleggsliste,
            components: [
              {
                ...vedleggBekreftelseBostedsadresse,
                customConditional: `show = data.${borDuINorgeRadiopanelKey} === "nei"`,
              },
            ],
          },
        ],
        properties: testFormProperties,
      } as unknown as NavFormType;

      it('return attachment which is relevant', () => {
        const submissionData = { [borDuINorgeRadiopanel.key]: 'nei' };
        const attachments = getRelevantAttachments(form, { data: submissionData });
        expect(attachments).toHaveLength(1);
      });

      it('does not return attachment which is not relevant', () => {
        const submissionData = { [borDuINorgeRadiopanel.key]: 'ja' };
        const attachments = getRelevantAttachments(form, { data: submissionData });
        expect(attachments).toHaveLength(0);
      });
    });

    describe('form containing attachment with custom conditional which has expression possibly resulting in undefined error', () => {
      const form = {
        components: [
          {
            ...panelForsteSide,
            components: [{ ...borDuINorgeRadiopanel }],
          },
          {
            ...panelVedleggsliste,
            components: [
              {
                ...vedleggBekreftelseBostedsadresse,
                customConditional: `show = data.ukjentpanel.svar === "nei" || data.${borDuINorgeRadiopanelKey} === "nei"`,
              },
            ],
          },
        ],
        properties: testFormProperties,
      } as unknown as NavFormType;

      it('return attachment which is relevant', () => {
        const submissionData = { [borDuINorgeRadiopanel.key]: 'nei' };
        const attachments = getRelevantAttachments(form, { data: submissionData });
        expect(attachments).toHaveLength(1);
      });

      it('does not return attachment which is not relevant', () => {
        const submissionData = { [borDuINorgeRadiopanel.key]: 'ja' };
        const attachments = getRelevantAttachments(form, { data: submissionData });
        expect(attachments).toHaveLength(0);
      });
    });

    describe('Attachment panel has conditional', () => {
      it('All attachments are triggered', () => {
        const attachments = getRelevantAttachments(vedleggConditional.form, vedleggConditional.submission);
        expect(attachments).toHaveLength(3);
      });

      it('Some attachments are triggered', () => {
        const submissionDataCopy: SubmissionData = JSON.parse(JSON.stringify(vedleggConditional.submission.data));
        submissionDataCopy.harDuDokumentasjonDuOnskerALeggeVedSoknaden = 'ja';
        submissionDataCopy.hvaOnskerDuALeggeVed = {
          personinntektsskjema: false,
          resultatregnskap: true,
          naeringsoppgave: true,
          annet: false,
        };
        const attachments = getRelevantAttachments(vedleggConditional.form, { data: submissionDataCopy });
        expect(attachments).toHaveLength(2);
      });

      it('No attachments are triggered', () => {
        const submissionDataCopy = JSON.parse(JSON.stringify(vedleggConditional.submission.data));
        submissionDataCopy.harDuDokumentasjonDuOnskerALeggeVedSoknaden = 'nei';
        submissionDataCopy.hvaOnskerDuALeggeVed = undefined;
        const attachments = getRelevantAttachments(vedleggConditional.form, submissionDataCopy);
        expect(attachments).toHaveLength(0);
      });
    });
  });

  describe('Test if attachments have the property otherDocumentation set and take into account conditions', () => {
    const form = {
      components: [
        {
          ...panelVedleggsliste,
          components: [
            {
              ...vedleggBekreftelseBostedsadresse,
              otherDocumentation: true,
              customConditional: `show = data.ukjentpanel.svar === "nei" || data.${borDuINorgeRadiopanelKey} === "nei"`,
            },
          ],
        },
      ],
      properties: testFormProperties,
    };

    it('does not return attachment which is not relevant', () => {
      const submissionData = { [borDuINorgeRadiopanel.key]: 'ja' };
      const attachments = hasOtherDocumentation(form, { data: submissionData });
      expect(attachments).toBe(false);
    });

    it('does return attachment which is relevant', () => {
      const submissionData = { [borDuINorgeRadiopanel.key]: 'nei' };
      const attachments = hasOtherDocumentation(form, { data: submissionData });
      expect(attachments).toBe(true);
    });
  });

  describe('Test if attachments have the property attachmentType="other" set and take into account conditions', () => {
    const form = {
      components: [
        {
          ...panelVedleggsliste,
          components: [
            {
              ...vedleggAnnenDokumentasjon,
            },
            {
              ...vedleggBekreftelseBostedsadresse,
              customConditional: `show = data.ukjentpanel.svar === "nei" || data.${borDuINorgeRadiopanelKey} === "nei"`,
            },
          ],
        },
      ],
      properties: testFormProperties,
    } as unknown as NavFormType;

    it('does not return attachment which is not relevant', () => {
      const submissionData = { [borDuINorgeRadiopanel.key]: 'ja' };
      const otherDocumentation = hasOtherDocumentation(form, { data: submissionData });
      expect(otherDocumentation).toBe(true);
      const attachments = getRelevantAttachments(form, { data: submissionData });
      expect(attachments).toHaveLength(0);
    });

    it('does return attachment which is relevant', () => {
      const submissionData = { [borDuINorgeRadiopanel.key]: 'nei' };
      const otherDocumentation = hasOtherDocumentation(form, { data: submissionData });
      expect(otherDocumentation).toBe(true);
      const attachments = getRelevantAttachments(form, { data: submissionData });
      expect(attachments).toHaveLength(1);
      expect(attachments[0].label).toEqual(vedleggBekreftelseBostedsadresse.label);
    });
  });

  describe('attachments with custom conditional on submission method', () => {
    const digitalOnly = 'show = instance.isSubmissionDigital();';
    const form = {
      components: [
        {
          ...panelVedleggsliste,
          components: [
            { ...vedleggAnnenDokumentasjon, customConditional: digitalOnly },
            { ...vedleggBekreftelseBostedsadresse, customConditional: digitalOnly },
          ],
        },
      ],
      properties: { ...testFormProperties, submissionTypes: ['PAPER', 'DIGITAL'] },
    } as unknown as NavFormType;
    const submission = { data: {} };

    it('includes digital-only attachments when submission method is digital', () => {
      expect(getRelevantAttachments(form, submission, 'digital')).toHaveLength(1);
      expect(hasOtherDocumentation(form, submission, 'digital')).toBe(true);
      expect(getAllAttachments(form, submission, 'digital')).toHaveLength(2);
    });

    it('excludes digital-only attachments when submission method is paper', () => {
      expect(getRelevantAttachments(form, submission, 'paper')).toHaveLength(0);
      expect(hasOtherDocumentation(form, submission, 'paper')).toBe(false);
      expect(getAllAttachments(form, submission, 'paper')).toHaveLength(0);
    });
  });
});
