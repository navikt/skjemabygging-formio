import { FormPropertiesType, NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import nock from "nock";
import { Backend } from "../Backend";
import config from "../config";
import { formioService } from "./index";
import PublisherService from "./PublisherService";

const opts = { userName: "todd", formioToken: "valid-formio-token" };

describe("PublisherService", () => {
  let publisherService: PublisherService;

  let backendMock: Backend;

  afterEach(() => {
    nock.abortPendingRequests();
    nock.cleanAll();
  });

  describe("publishForm", () => {
    describe("when publishing succeeds", () => {
      const testForm = { _id: "1", properties: {} } as NavFormType;
      let nockScope: nock.Scope;

      beforeEach(() => {
        backendMock = { publishForm: () => "git-commit-hash" } as unknown as Backend;
        publisherService = new PublisherService(formioService, backendMock);
        nockScope = nock(config.formio.projectUrl)
          .put(/\/form\/(\d*)$/)
          .times(1)
          .reply((uri, requestBody) => [200, requestBody]);
      });

      afterEach(() => {
        expect(nockScope.isDone()).toBe(true);
      });

      it("adds properties modified and published", async () => {
        const translations = {};
        const { changed, form } = await publisherService.publishForm(testForm, translations, opts);
        expect(changed).toBe(true);
        expect(form.properties.modified).toBeDefined();
        expect(form.properties.modifiedBy).toEqual("todd");
        expect(form.properties.published).toBeDefined();
        expect(form.properties.publishedBy).toEqual("todd");
      });

      describe("property: publishedLanguages", () => {
        it("adds publishedLanguages to properties", async () => {
          const translations = { en: {}, "nn-NO": {} };
          const testFormWithNoPublishedLanguages: NavFormType = {
            ...testForm,
            properties: {
              publishedLanguages: [] as string[],
            },
          } as NavFormType;
          const { form } = await publisherService.publishForm(testFormWithNoPublishedLanguages, translations, opts);
          expect(form.properties.publishedLanguages).toEqual(["en", "nn-NO"]);
        });

        it("resets publishedLanguages when empty translations object is published", async () => {
          const testFormWithPublishedLanguages: NavFormType = {
            ...testForm,
            properties: {
              publishedLanguages: ["en"],
            },
          } as NavFormType;
          const translations = {};
          const { form } = await publisherService.publishForm(testFormWithPublishedLanguages, translations, opts);
          expect(form.properties.publishedLanguages).toEqual([]);
        });

        it("does not reset publishedLanguages when translations object is undefined", async () => {
          const testFormWithPublishedLanguages: NavFormType = {
            ...testForm,
            properties: {
              publishedLanguages: ["en"],
            },
          } as NavFormType;
          const translations = undefined;
          const { form } = await publisherService.publishForm(testFormWithPublishedLanguages, translations, opts);
          expect(form.properties.publishedLanguages).toEqual(["en"]);
        });
      });
    });

    describe("when publishing fails", () => {
      let formioServiceSpy: jest.SpyInstance<
        Promise<NavFormType>,
        [form: NavFormType, formioToken: string, userName: string, formProps?: Partial<FormPropertiesType> | undefined]
      >;

      let nockScope: nock.Scope;
      let formioApiRequestBodies: NavFormType[];

      beforeEach(() => {
        formioApiRequestBodies = [];
        backendMock = {
          publishForm: () => {
            throw new Error("Commit failed");
          },
        } as unknown as Backend;
        publisherService = new PublisherService(formioService, backendMock);
        formioServiceSpy = jest.spyOn(formioService, "saveForm");
        nockScope = nock(config.formio.projectUrl)
          .put(/\/form\/(\d*)$/)
          .times(2)
          .reply((uri, requestBody) => {
            formioApiRequestBodies.push(requestBody as NavFormType);
            return [200, requestBody];
          });
      });

      afterEach(() => {
        formioServiceSpy.mockClear();
        expect(nockScope.isDone()).toBe(true);
      });

      it("form properties are reverted when publish fails", async () => {
        const translations = { en: {} };
        const form: NavFormType = { _id: "2", properties: {} } as NavFormType;
        let errorThrown = false;
        try {
          await publisherService.publishForm(form, translations, opts);
        } catch (error: any) {
          errorThrown = true;
          expect(error.message).toEqual("Publisering feilet");
        }
        expect(errorThrown).toBe(true);
        expect(formioServiceSpy).toHaveBeenCalledTimes(2);

        expect(formioApiRequestBodies).toHaveLength(2);

        const formPropsBeforePublish = formioApiRequestBodies[0].properties;
        const modifiedAtPublish = formPropsBeforePublish.modified;
        const modifiedByAtPublish = formPropsBeforePublish.modifiedBy;

        expect(formPropsBeforePublish.published).toBeDefined();
        expect(formPropsBeforePublish.publishedBy).toEqual(opts.userName);
        expect(modifiedAtPublish).toBeDefined();
        expect(modifiedByAtPublish).toEqual(opts.userName);
        expect(formPropsBeforePublish.publishedLanguages).toEqual(["en"]);

        const formPropsRollback = formioApiRequestBodies[1].properties;
        const modifiedAtRollback = formPropsRollback.modified;
        const modifiedByAtRollback = formPropsRollback.modifiedBy;

        expect(formPropsRollback.published).toBeUndefined();
        expect(formPropsRollback.publishedBy).toBeUndefined();
        expect(modifiedAtRollback).toBeDefined();
        expect(modifiedAtRollback).not.toEqual(modifiedAtPublish);
        expect(modifiedByAtRollback).toBeDefined();
        expect(formPropsRollback.publishedLanguages).toBeUndefined();
      });
    });
  });
});
