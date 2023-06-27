import { NavFormType, Submission } from "@navikt/skjemadigitalisering-shared-domain";
import {
  Attachment,
  SendInnSoknadBody,
  assembleSendInnSoknadBody,
  isMellomLagringEnabled,
  sanitizeInnsendingsId,
  validateInnsendingsId,
} from "./sendInn";

const defaultFormProperties = { skjemanummer: "NAV123", tema: "TEMA", ettersendelsesfrist: "14" };
const defaultForm = { title: "Standard skjema", properties: defaultFormProperties };

const defaultRequestBody = {
  form: defaultForm as NavFormType,
  submission: { q: "a" } as unknown as Submission,
  language: "nb-NO",
};

const attachment1 = {
  vedleggsnr: "1",
  tittel: "Vedlegg 1",
  label: "Vedlegg 1",
  beskrivelse: "Beskrivelse",
} as Attachment;

const attachment2 = {
  vedleggsnr: "2",
  tittel: "Vedlegg 2",
  label: "Vedlegg 2",
  beskrivelse: "Beskrivelse",
} as Attachment;

const requestBodyWithAttachments = {
  ...defaultRequestBody,
  attachments: [attachment1, attachment2],
  otherDocumentation: true,
};

const idPortenPid = "123456789";
const submissionPdfAsByteArray = [123, 234, 56];

const expectedSubmissionAsByteArray = [
  123, 34, 108, 97, 110, 103, 117, 97, 103, 101, 34, 58, 34, 110, 98, 45, 78, 79, 34, 44, 34, 100, 97, 116, 97, 34, 58,
  123, 34, 113, 34, 58, 34, 97, 34, 125, 125,
];

describe("sendInn API helper", () => {
  describe("sanitizeInnsendingsId", () => {
    it("removes all instances of '/' from innsendingsId", () => {
      expect(sanitizeInnsendingsId("abc/def/123")).toBe("abcdef123");
    });
    it("removes all instances of '.' from innsendingsId", () => {
      expect(sanitizeInnsendingsId("abc.def.123")).toBe("abcdef123");
    });
    it("removes both '/' and '.' from innsendingsId", () => {
      expect(sanitizeInnsendingsId("/abc/def.123/456.789.ABC.DEF.")).toBe("abcdef123456789ABCDEF");
    });
  });

  describe("validateInnsendingsId", () => {
    it("returns undefined when the innsendingsId is valid", () => {
      expect(validateInnsendingsId("12345678-ABCD-cdef-9876-12345678abcd")).toBeUndefined();
    });
    it("returns an error message when innsendingsId is missing", () => {
      expect(validateInnsendingsId(undefined)).toBe(
        "InnsendingsId mangler. Kan ikke oppdatere mellomlagret søknad med ferdig utfylt versjon"
      );
    });
    it("returns an error message when innsendingsId contains illegal character /", () => {
      expect(validateInnsendingsId("abcd/123-ABCD-cdef-9876-12345678abcd")).toBe(
        "abcd/123-ABCD-cdef-9876-12345678abcd er ikke en gyldig innsendingsId. Kan ikke oppdatere mellomlagret søknad med ferdig utfylt versjon"
      );
    });
    it("returns an error message when innsendingsId contains illegal character .", () => {
      expect(validateInnsendingsId("abcd.123-ABCD-cdef-9876-12345678abcd")).toBe(
        "abcd.123-ABCD-cdef-9876-12345678abcd er ikke en gyldig innsendingsId. Kan ikke oppdatere mellomlagret søknad med ferdig utfylt versjon"
      );
    });
  });

  describe("isMellomlagringEnabled", () => {
    it("returns false when featureToggles is empty", () => {
      expect(isMellomLagringEnabled({})).toBe(false);
    });

    it("returns true when both mellomlagring and sendInnIntegration is enabled", () => {
      expect(isMellomLagringEnabled({ enableMellomlagring: true, enableSendInnIntegration: true })).toBe(true);
    });

    it("returns false when mellomlagring is enabled but sendInnIntegration is disabled", () => {
      expect(isMellomLagringEnabled({ enableMellomlagring: true, enableSendInnIntegration: false })).toBe(false);
    });

    it("returns false when mellomlagring is disabled and sendInnIntegration is enabled", () => {
      expect(isMellomLagringEnabled({ enableMellomlagring: false, enableSendInnIntegration: true })).toBe(false);
    });
  });

  describe("assembleSendInnSoknadBody", () => {
    describe("Without attachments", () => {
      let body: SendInnSoknadBody;
      beforeEach(() => {
        body = assembleSendInnSoknadBody(defaultRequestBody, idPortenPid, submissionPdfAsByteArray);
      });

      it("adds the pid and form meta data", () => {
        expect(body).toEqual(
          expect.objectContaining({
            brukerId: idPortenPid,
            skjemanr: defaultFormProperties.skjemanummer,
            tema: defaultFormProperties.tema,
            tittel: defaultForm.title,
            spraak: defaultRequestBody.language,
          })
        );
      });

      it("creates hovedDokument with vedleggsnr, tittel and document", () => {
        expect(body.hoveddokument).toEqual(
          expect.objectContaining({
            vedleggsnr: defaultFormProperties.skjemanummer,
            tittel: defaultForm.title,
            mimetype: "application/pdf",
            document: submissionPdfAsByteArray,
          })
        );
      });

      it("creates hovedDokumentVariant with vedleggsnr, tittel and document", () => {
        expect(body.hoveddokumentVariant).toEqual(
          expect.objectContaining({
            vedleggsnr: defaultFormProperties.skjemanummer,
            tittel: defaultForm.title,
            mimetype: "application/json",
            document: expectedSubmissionAsByteArray,
          })
        );
      });

      it("adds ettersendelsesfrist as number", () => {
        expect(body.fristForEttersendelse).toEqual(14);
      });

      it("does not add vedleggsListe or kanLasteOppAnnet", () => {
        expect(body.vedleggsListe).not.toBeDefined();
        expect(body.kanLasteOppAnnet).not.toBeDefined();
      });
    });

    describe("With attachments", () => {
      let body: SendInnSoknadBody;
      beforeEach(() => {
        body = assembleSendInnSoknadBody(requestBodyWithAttachments, idPortenPid, submissionPdfAsByteArray);
      });

      it("adds vedleggsliste and kanLasteOppAnnet", () => {
        expect(body.kanLasteOppAnnet).toBe(true);
        expect(body.vedleggsListe).toEqual([attachment1, attachment2]);
      });
    });

    describe("With translations", () => {
      const requestBodyWithTranslation = {
        ...requestBodyWithAttachments,
        language: "en",
        translation: {
          "Standard skjema": "Form",
          "Vedlegg 1": "Attachment 1",
          "Vedlegg 2": "Attachment 2",
          Beskrivelse: "Description",
        },
      };

      it("translates form metadata", () => {
        const body = assembleSendInnSoknadBody(requestBodyWithTranslation, idPortenPid, submissionPdfAsByteArray);
        expect(body).toEqual(
          expect.objectContaining({
            spraak: "en",
            tittel: "Form",
          })
        );
        expect(body.hoveddokument).toEqual(expect.objectContaining({ label: "Form", tittel: "Form" }));
        expect(body.hoveddokumentVariant).toEqual(expect.objectContaining({ label: "Form", tittel: "Form" }));
      });

      it("translates vedlegg metadata", () => {
        const body = assembleSendInnSoknadBody(requestBodyWithTranslation, idPortenPid, submissionPdfAsByteArray);
        expect(body.vedleggsListe).toHaveLength(2);
        expect(body.vedleggsListe).toEqual([
          expect.objectContaining({
            label: "Attachment 1",
            tittel: "Attachment 1",
            beskrivelse: "Description",
          }),
          expect.objectContaining({
            label: "Attachment 2",
            tittel: "Attachment 2",
            beskrivelse: "Description",
          }),
        ]);
      });
    });
  });
});
