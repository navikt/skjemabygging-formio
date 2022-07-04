import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import nock from "nock";
import config from "../config";
import formioService from "./formioService";

describe("FormioService", () => {
  describe("saveForm", () => {
    describe("props modified and modifiedBy", () => {
      const form: NavFormType = {
        _id: "1",
        properties: {
          modified: "2022-06-28T10:02:15.634Z",
          modifiedBy: "dennis",
        },
      } as NavFormType;

      beforeEach(() => {
        nock(config.formio.projectUrl)
          .put(/\/form\/(\d*)$/)
          .reply((uri, requestBody) => [200, requestBody]);
      });

      afterEach(() => {
        nock.cleanAll();
      });

      it("are updated with new values", async () => {
        const savedForm = await formioService.saveForm(form, "formio-token", "tore");
        expect(savedForm.properties.modified).not.toEqual(form.properties.modified);
        expect(savedForm.properties.modifiedBy).toEqual("tore");
      });

      it("are updated with values specified in formProps parameter", async () => {
        const props = {
          modified: "2022-06-28T10:03:15.634Z",
          modifiedBy: "pia",
        };
        const savedForm = await formioService.saveForm(form, "formio-token", "tore", props);
        expect(savedForm.properties.modified).not.toEqual(form.properties.modified);
        expect(savedForm.properties.modified).toEqual(props.modified);
        expect(savedForm.properties.modifiedBy).toEqual("pia");
      });
    });

    describe("http error from formio api", () => {
      beforeEach(() => {
        nock(config.formio.projectUrl)
          .put(/\/form\/(\d*)$/)
          .reply(500);
        jest.spyOn(console, "error").mockImplementation(() => {});
      });

      afterEach(() => {
        nock.cleanAll();
        jest.restoreAllMocks();
      });

      it("is thrown as an error", async () => {
        const form: NavFormType = {
          _id: "1",
          properties: {},
        } as NavFormType;
        let error: Error | undefined = undefined;
        try {
          await formioService.saveForm(form, "formio-token", "tore");
        } catch (e) {
          error = e as Error;
        }
        expect(error).toBeDefined();
        expect(error?.message).toEqual(
          "500 Internal Server Error fetching: http://formio-api-server.unittest.nav.no/form/1"
        );
      });
    });
  });

  describe("saveForms", () => {
    beforeEach(() => {
      nock(config.formio.projectUrl)
        .put(/\/form\/(\d*)$/)
        .times(2)
        .reply((uri, requestBody) => [200, requestBody]);
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it("uses same modified and modifiedBy on all forms", async () => {
      const forms = [
        { _id: "1", properties: { modified: "2022-06-28T10:03:15.634Z" } } as NavFormType,
        { _id: "2", properties: { modified: "2022-06-06T12:55:05.000Z" } } as NavFormType,
      ];
      const savedForms = await formioService.saveForms(forms, "formio-token", "jenny");
      expect(savedForms).toHaveLength(2);
      expect(savedForms[0].properties.modified).toEqual(savedForms[1].properties.modified);
    });
  });
});
