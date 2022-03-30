import { getRelevantAttachments } from "./attachmentsUtil";
import {
  borDuINorgeRadiopanel,
  panelForsteSide,
  panelVedleggsliste,
  vedleggBekreftelseBostedsadresse,
} from "./testdata/defaultFormElements";

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
        const submission = { [borDuINorgeRadiopanel.key]: "nei" };
        const attachments = getRelevantAttachments(form, submission);
        expect(attachments).toHaveLength(1);
      });

      it("attachment contains correct data", () => {
        const submission = { [borDuINorgeRadiopanel.key]: "nei" };
        const attachments = getRelevantAttachments(form, submission);
        expect(attachments).toHaveLength(1);
        expect(attachments[0].vedleggsnr).toEqual(vedleggBekreftelseBostedsadresse.properties.vedleggskode);
        expect(attachments[0].tittel).toEqual(vedleggBekreftelseBostedsadresse.properties.vedleggstittel);
        expect(attachments[0].label).toEqual(vedleggBekreftelseBostedsadresse.label);
        expect(attachments[0].mimetype).toBeUndefined();
      });

      it("does not return attachment which is not relevant", () => {
        const submission = { [borDuINorgeRadiopanel.key]: "ja" };
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
        const submission = { [borDuINorgeRadiopanel.key]: "nei" };
        const attachments = getRelevantAttachments(form, submission);
        expect(attachments).toHaveLength(1);
      });

      it("does not return attachment which is not relevant", () => {
        const submission = { [borDuINorgeRadiopanel.key]: "ja" };
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
        const submission = { [borDuINorgeRadiopanel.key]: "nei" };
        const attachments = getRelevantAttachments(form, submission);
        expect(attachments).toHaveLength(1);
      });

      it("does not return attachment which is not relevant", () => {
        const submission = { [borDuINorgeRadiopanel.key]: "ja" };
        const attachments = getRelevantAttachments(form, submission);
        expect(attachments).toHaveLength(0);
      });
    });
  });
});
