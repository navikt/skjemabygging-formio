import { FormPropertiesType, NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import nock from "nock";
import { Backend } from "../Backend";
import config from "../config";
import PublisherService from "./PublisherService";
import { formioService } from "./index";

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
        expect(form.properties.modifiedBy).toBe("todd");
        expect(form.properties.published).toBeDefined();
        expect(form.properties.publishedBy).toBe("todd");
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
      // @ts-ignore
      let formioServiceSpy: vi.SpyInstance<
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
        formioServiceSpy = vi.spyOn(formioService, "saveForm");
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
          expect(error.message).toBe("Publisering feilet");
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

  describe("unpublishForm", () => {
    describe("when unpublish succeeds", () => {
      const testGitSha = "123456789A987654321";
      let nockScope: nock.Scope;

      beforeEach(() => {
        backendMock = { unpublishForm: () => testGitSha } as unknown as Backend;
        publisherService = new PublisherService(formioService, backendMock);
        nockScope = nock(config.formio.projectUrl)
          .put(/\/form\/(\d*)$/)
          .times(1)
          .reply((uri, requestBody) => [200, requestBody]);
      });

      afterEach(() => {
        expect(nockScope.isDone()).toBe(true);
      });

      it("sets unpublish props and unsets published props", async () => {
        const testForm = {
          _id: "1",
          properties: { published: "2022-07-28T10:00:10.325Z", publishedBy: "ernie" },
        } as NavFormType;
        const { changed, form } = await publisherService.unpublishForm(testForm, opts);
        expect(changed).toBe(true);
        const { properties } = form;
        expect(properties.published).toBeUndefined();
        expect(properties.publishedBy).toBeUndefined();
        expect(properties.unpublished).toBeDefined();
        expect(properties.unpublishedBy).toEqual(opts.userName);
      });
    });

    describe("when unpublish fails", () => {
      let nockScope: nock.Scope;
      let formioApiRequestBodies: NavFormType[];

      beforeEach(() => {
        formioApiRequestBodies = [];
        backendMock = {
          unpublishForm: () => {
            throw new Error("Commit failed");
          },
        } as unknown as Backend;
        publisherService = new PublisherService(formioService, backendMock);
        nockScope = nock(config.formio.projectUrl)
          .put(/\/form\/(\d*)$/)
          .times(2)
          .reply((uri, requestBody) => {
            formioApiRequestBodies.push(requestBody as NavFormType);
            return [200, requestBody];
          });
      });

      afterEach(() => {
        expect(nockScope.isDone()).toBe(true);
      });

      it("properties are rolled back", async () => {
        const testForm = {
          _id: "1",
          properties: { published: "2022-07-28T10:00:10.325Z", publishedBy: "ernie" },
        } as NavFormType;
        let errorThrown;

        try {
          await publisherService.unpublishForm(testForm, opts);
        } catch (error: any) {
          errorThrown = true;
          expect(error.message).toBe("Avpublisering feilet");
        }

        expect(errorThrown).toBe(true);
        expect(formioApiRequestBodies).toHaveLength(2);

        const { properties } = formioApiRequestBodies[1];
        expect(properties.published).toEqual(testForm.properties.published);
        expect(properties.publishedBy).toEqual(testForm.properties.publishedBy);
        expect(properties.unpublished).toBeUndefined();
        expect(properties.unpublishedBy).toBeUndefined();
      });
    });
  });

  describe("publishForms (bulk)", () => {
    const testForms: NavFormType[] = [
      { _id: "1", properties: { publishedLanguages: ["en"] } } as unknown as NavFormType,
      {
        _id: "2",
        properties: { publishedLanguages: [], published: "2022-07-28T10:00:10.325Z", publishedBy: "ernie" },
      } as unknown as NavFormType,
      {
        _id: "3",
        properties: {
          publishedLanguages: undefined,
          modified: "2022-06-28T10:02:15.634Z",
          modifiedBy: "bert",
          unpublished: "2022-06-28T10:02:15.634Z",
          unpublishedBy: "bert",
        },
      } as unknown as NavFormType,
    ];

    describe("when bulk publishing succeeds", () => {
      const testGitSha = "123456789A987654321";
      let nockScope: nock.Scope;
      let formioApiRequestBodies: NavFormType[];

      beforeEach(() => {
        formioApiRequestBodies = [];
        backendMock = { publishForms: () => testGitSha } as unknown as Backend;
        publisherService = new PublisherService(formioService, backendMock);
        nockScope = nock(config.formio.projectUrl)
          .put(/\/form\/(\d*)$/)
          .times(3)
          .reply((uri, requestBody) => {
            formioApiRequestBodies.push(requestBody as NavFormType);
            return [200, requestBody];
          });
      });

      afterEach(() => {
        expect(nockScope.isDone()).toBe(true);
      });

      it("returns git sha for bulk publish commit", async () => {
        const gitSha = await publisherService.publishForms(testForms, opts);
        expect(gitSha).toEqual(testGitSha);
      });

      it("adds properties modified and published with same value", async () => {
        await publisherService.publishForms(testForms, opts);

        expect(formioApiRequestBodies).toHaveLength(3);

        const form1Props = formioApiRequestBodies[0].properties;
        const form1Published = form1Props.published;
        expect(form1Published).toBeDefined();
        expect(form1Props.publishedBy).toEqual(opts.userName);
        expect(form1Props.modified).toBeDefined();
        expect(form1Props.modifiedBy).toEqual(opts.userName);

        const form2Props = formioApiRequestBodies[1].properties;
        const form2Published = form2Props.published;
        expect(form2Published).toBeDefined();
        expect(form2Props.publishedBy).toEqual(opts.userName);
        expect(form2Props.modified).toBeDefined();
        expect(form2Props.modifiedBy).toEqual(opts.userName);

        const form3Props = formioApiRequestBodies[2].properties;
        const form3Published = form3Props.published;
        expect(form3Published).toBeDefined();

        expect(form1Published).toEqual(form2Published);
        expect(form1Published).toEqual(form3Published);
      });

      it("does not modify publishedLanguages property", async () => {
        await publisherService.publishForms(testForms, opts);
        expect(formioApiRequestBodies).toHaveLength(3);

        const form1Props = formioApiRequestBodies[0].properties;
        expect(form1Props.publishedLanguages).toEqual(["en"]);

        const form2Props = formioApiRequestBodies[1].properties;
        expect(form2Props.publishedLanguages).toEqual([]);

        const form3Props = formioApiRequestBodies[2].properties;
        expect(form3Props.publishedLanguages).toBeUndefined();
      });
    });

    describe("when publishing fails", () => {
      let nockScope: nock.Scope;
      let formioApiRequestBodies: NavFormType[];

      beforeEach(() => {
        formioApiRequestBodies = [];
        backendMock = {
          publishForms: () => {
            throw new Error("Commit failed");
          },
        } as unknown as Backend;
        publisherService = new PublisherService(formioService, backendMock);
        nockScope = nock(config.formio.projectUrl)
          .put(/\/form\/(\d*)$/)
          .times(6) // 3 before publish, and 3 after publish fails
          .reply((uri, requestBody) => {
            formioApiRequestBodies.push(requestBody as NavFormType);
            return [200, requestBody];
          });
      });

      afterEach(() => {
        expect(nockScope.isDone()).toBe(true);
      });

      it("properties are rolled back", async () => {
        let errorThrown = false;
        try {
          await publisherService.publishForms(testForms, opts);
        } catch (error: any) {
          errorThrown = true;
          expect(error.message).toBe("Bulk-publisering feilet");
        }
        expect(errorThrown).toBe(true);
        expect(formioApiRequestBodies).toHaveLength(6);

        const form1Props = formioApiRequestBodies[0].properties;
        const form2Props = formioApiRequestBodies[1].properties;
        const form3Props = formioApiRequestBodies[2].properties;

        expect(form1Props.modified).toBeDefined();
        expect(form1Props.modifiedBy).toEqual(opts.userName);
        expect(form1Props.published).toBeDefined();
        expect(form1Props.publishedBy).toEqual(opts.userName);

        expect(form2Props.published).toBeDefined();
        expect(form2Props.publishedBy).toEqual(opts.userName);

        expect(form3Props.published).toBeDefined();
        expect(form3Props.unpublished).toBeUndefined();

        const form1PropsRollback = formioApiRequestBodies[3].properties;
        const form2PropsRollback = formioApiRequestBodies[4].properties;
        const form3PropsRollback = formioApiRequestBodies[5].properties;

        expect(form1PropsRollback.modified).not.toEqual(form1Props.modified);
        expect(form1PropsRollback.modifiedBy).toEqual(opts.userName);
        expect(form1PropsRollback.published).toBeUndefined();
        expect(form1PropsRollback.publishedBy).toBeUndefined();

        expect(form2PropsRollback.published).toEqual(testForms[1].properties.published);
        expect(form2PropsRollback.published).not.toEqual(form2Props.published);
        expect(form2PropsRollback.publishedBy).toEqual(testForms[1].properties.publishedBy);

        expect(form3PropsRollback.unpublished).toBeDefined();
        expect(form3PropsRollback.unpublished).toEqual(testForms[2].properties.unpublished);
        expect(form3PropsRollback.unpublishedBy).toBeDefined();
      });
    });
  });
});
