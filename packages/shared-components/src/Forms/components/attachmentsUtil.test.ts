import { getRelevantAttachments, hasOtherDocumentation } from "./attachmentsUtil";
import {
  borDuINorgeRadiopanel,
  panelForsteSide,
  panelVedleggsliste,
  vedleggBekreftelseBostedsadresse,
} from "./testdata/defaultFormElements";
import vedleggConditional from "./testdata/vedlegg-conditional";

describe("attachmentUtil", () => {
  describe("getRelevantAttachments", () => {
    describe("form containing attachment triggered by radiopanel submission value", () => {
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
                  when: borDuINorgeRadiopanel.key,
                  eq: "nei",
                },
              },
            ],
          },
        ],
      };

      it("return attachment which is relevant", () => {
        const submission = { data: { [borDuINorgeRadiopanel.key]: "nei" } };
        const attachments = getRelevantAttachments(form, submission);
        expect(attachments).toHaveLength(1);
      });

      it("attachment contains correct data", () => {
        const submission = { data: { [borDuINorgeRadiopanel.key]: "nei" } };
        const attachments = getRelevantAttachments(form, submission);
        expect(attachments).toHaveLength(1);
        expect(attachments[0].vedleggsnr).toEqual(vedleggBekreftelseBostedsadresse.properties.vedleggskode);
        expect(attachments[0].tittel).toEqual(vedleggBekreftelseBostedsadresse.properties.vedleggstittel);
        expect(attachments[0].label).toEqual(vedleggBekreftelseBostedsadresse.label);
      });

      it("does not return attachment which is not relevant", () => {
        const submission = { data: { [borDuINorgeRadiopanel.key]: "ja" } };
        const attachments = getRelevantAttachments(form, submission);
        expect(attachments).toHaveLength(0);
      });
    });
    describe("form containing attachment with custom conditional", () => {
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
                customConditional: `show = data.${borDuINorgeRadiopanel.key} === "nei"`,
              },
            ],
          },
        ],
      };

      it("return attachment which is relevant", () => {
        const submission = { data: { [borDuINorgeRadiopanel.key]: "nei" } };
        const attachments = getRelevantAttachments(form, submission);
        expect(attachments).toHaveLength(1);
      });

      it("does not return attachment which is not relevant", () => {
        const submission = { data: { [borDuINorgeRadiopanel.key]: "ja" } };
        const attachments = getRelevantAttachments(form, submission);
        expect(attachments).toHaveLength(0);
      });
    });
    describe("form containing attachment with custom conditional which has expression possibly resulting in undefined error", () => {
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
                customConditional: `show = data.ukjentpanel.svar === "nei" || data.${borDuINorgeRadiopanel.key} === "nei"`,
              },
            ],
          },
        ],
      };

      it("return attachment which is relevant", () => {
        const submission = { data: { [borDuINorgeRadiopanel.key]: "nei" } };
        const attachments = getRelevantAttachments(form, submission);
        expect(attachments).toHaveLength(1);
      });

      it("does not return attachment which is not relevant", () => {
        const submission = { data: { [borDuINorgeRadiopanel.key]: "ja" } };
        const attachments = getRelevantAttachments(form, submission);
        expect(attachments).toHaveLength(0);
      });
    });

    describe("Attachment panel has conditional", () => {
      it("All attachments are triggered", () => {
        const attachments = getRelevantAttachments(vedleggConditional.form, vedleggConditional.submission);
        expect(attachments).toHaveLength(4);
      });
      it("Some attachments are triggered", () => {
        const submissionCopy = JSON.parse(JSON.stringify(vedleggConditional.submission));
        submissionCopy.data.harDuDokumentasjonDuOnskerALeggeVedSoknaden = "ja";
        submissionCopy.data.hvaOnskerDuALeggeVed = {
          personinntektsskjema: false,
          resultatregnskap: true,
          naeringsoppgave: true,
          annet: false,
        };
        const attachments = getRelevantAttachments(vedleggConditional.form, submissionCopy);
        expect(attachments).toHaveLength(2);
      });
      it("No attachments are triggered", () => {
        const submissionCopy = JSON.parse(JSON.stringify(vedleggConditional.submission));
        submissionCopy.data.harDuDokumentasjonDuOnskerALeggeVedSoknaden = "nei";
        submissionCopy.data.hvaOnskerDuALeggeVed = undefined;
        const attachments = getRelevantAttachments(vedleggConditional.form, submissionCopy);
        expect(attachments).toHaveLength(0);
      });
    });
  });

  describe("Test if attachments have the property otherDocumentation set and take into account conditions", () => {
    const form = {
      components: [
        {
          ...panelVedleggsliste,
          components: [
            {
              ...vedleggBekreftelseBostedsadresse,
              otherDocumentation: true,
              customConditional: `show = data.ukjentpanel.svar === "nei" || data.${borDuINorgeRadiopanel.key} === "nei"`,
            },
          ],
        },
      ],
    };

    it("does not return attachment which is not relevant", () => {
      const submission = { data: { [borDuINorgeRadiopanel.key]: "ja" } };
      const attachments = hasOtherDocumentation(form, submission);
      expect(attachments).toBe(false);
    });

    it("does not return attachment which is not relevant", () => {
      const submission = { data: { [borDuINorgeRadiopanel.key]: "nei" } };
      const attachments = hasOtherDocumentation(form, submission);
      expect(attachments).toBe(true);
    });
  });
});
