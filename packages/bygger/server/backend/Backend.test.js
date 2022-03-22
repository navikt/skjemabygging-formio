import nock from "nock";
import { createBackendForTest } from "../testTools/backend/testUtils.js";
import { stringTobase64 } from "./fetchUtils";
import { GitHubRepo } from "./GitHubRepo.js";
import {
  mockRepoCreateOrUpdateFileContents,
  mockRepoCreatePullRequest,
  mockRepoCreateRef,
  mockRepoDeleteRef,
  mockRepoGetFileIfItExists,
  mockRepoGetRef,
  mockRepoMergePullRequest,
} from "./__mocks__/GitHubRepo";

jest.mock("nav-frontend-js-utils", () => {
  return { guid: jest.fn().mockReturnValue("1234") };
});
jest.mock("./GitHubRepo.js");

describe("Backend", () => {
  const projectUrl = "https://projectApi.example.com";
  const token = "userToken";
  const formPath = "skjema";

  beforeEach(() => {
    GitHubRepo.mockImplementation(() => {
      return {
        getRef: mockRepoGetRef,
        createRef: mockRepoCreateRef,
        deleteRef: mockRepoDeleteRef,
        getFileIfItExists: mockRepoGetFileIfItExists,
        createOrUpdateFileContents: mockRepoCreateOrUpdateFileContents,
        createPullRequest: mockRepoCreatePullRequest,
        mergePullRequest: mockRepoMergePullRequest,
      };
    });
  });

  let backend;
  beforeEach(() => {
    backend = createBackendForTest();
  });

  afterEach(() => {
    nock.cleanAll();
    GitHubRepo.mockClear();
    mockRepoGetRef.mockClear();
    mockRepoCreateRef.mockClear();
    mockRepoDeleteRef.mockClear();
    mockRepoGetFileIfItExists.mockClear();
    mockRepoCreateOrUpdateFileContents.mockClear();
    mockRepoCreatePullRequest.mockClear();
    mockRepoMergePullRequest.mockClear();
  });

  it("creates instance of GitHubRepo.js", () => {
    expect(GitHubRepo).toHaveBeenCalledTimes(1);
    expect(GitHubRepo).toHaveBeenCalledWith("navikt", "publish-repo", "publishRepoToken");
  });

  describe("publishForm", () => {
    const expectedBranchName = "publish-skjema--1234";

    beforeEach(() => {
      nock(projectUrl).get("/current").reply(204);
    });

    describe("When file content is different from the corresponding file in the repo", () => {
      beforeEach(async () => {
        await backend.publishForm(token, { title: "Form" }, { en: {} }, formPath);
      });

      it("creates a new branch in the target repo", () => {
        expect(mockRepoCreateRef).toHaveBeenCalledTimes(1);
        expect(mockRepoCreateRef).toHaveBeenCalledWith("publish-skjema--1234", "sha");
      });

      it("pushes form and translations on a separate branch", () => {
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledTimes(2);
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledWith(
          expectedBranchName,
          `forms/${formPath}.json`,
          '[Publisering] skjema "Form", monorepo ref: publish-repo-git-sha',
          "eyJ0aXRsZSI6IkZvcm0ifQ==",
          "existing-file-sha"
        );
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledWith(
          expectedBranchName,
          `translations/${formPath}.json`,
          '[Publisering] oversettelse "Form", monorepo ref: publish-repo-git-sha',
          "eyJlbiI6e319",
          "existing-file-sha"
        );
      });

      it("deletes the branch", () => {
        expect(mockRepoDeleteRef).toHaveBeenCalledTimes(1);
        expect(mockRepoDeleteRef).toHaveBeenCalledWith("publish-skjema--1234");
      });
    });

    describe("When file content is the same as the corresponding file in the repo", () => {
      beforeEach(async () => {
        const fileContent = { title: "Form" };
        mockRepoGetFileIfItExists.mockReturnValueOnce({
          data: { content: stringTobase64(JSON.stringify({}), "utf-8"), sha: "sha" },
        });
        mockRepoGetFileIfItExists.mockReturnValueOnce({
          data: { content: stringTobase64(JSON.stringify(fileContent), "utf-8"), sha: "sha" },
        });
        await backend.publishForm(token, fileContent, {}, formPath);
      });

      it("does not push the file", () => {
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledTimes(0);
      });

      it("deletes the branch", () => {
        expect(mockRepoDeleteRef).toHaveBeenCalledTimes(1);
        expect(mockRepoDeleteRef).toHaveBeenCalledWith("publish-skjema--1234");
      });
    });

    describe("when changes are pushed", () => {
      beforeEach(async () => {
        mockRepoGetRef.mockReturnValueOnce({ data: { object: { sha: "original-sha-for-base-branch" } } });
        mockRepoGetRef.mockReturnValueOnce({ data: { object: { sha: "different-sha-for-new-branch" } } });
        mockRepoGetRef.mockReturnValueOnce({ data: { object: { sha: "resulting-sha-after-merge" } } });
        await backend.publishForm(token, { title: "Form" }, { en: {} }, formPath);
      });

      it("creates a pull request", () => {
        expect(mockRepoCreatePullRequest).toHaveBeenCalledTimes(1);
        expect(mockRepoCreatePullRequest).toHaveBeenCalledWith(
          "Automatic publishing job",
          expectedBranchName,
          "publish-repo-main-branch"
        );
      });

      it("merges the the pull request", async () => {
        expect(mockRepoMergePullRequest).toHaveBeenCalledTimes(1);
        expect(mockRepoMergePullRequest).toHaveBeenCalledWith(14);
      });
    });

    describe("when no changes are pushed", () => {
      beforeEach(async () => {
        mockRepoGetRef.mockReturnValueOnce({ data: { object: { sha: "original-sha-for-base-branch" } } });
        mockRepoGetRef.mockReturnValueOnce({ data: { object: { sha: "original-sha-for-base-branch" } } });
        await backend.publishForm(token, { title: "Form" }, { en: {} }, formPath);
      });

      it("does not merge the pull request", () => {
        expect(mockRepoMergePullRequest).toHaveBeenCalledTimes(0);
      });

      it("deletes the branch", () => {
        expect(mockRepoDeleteRef).toHaveBeenCalledTimes(1);
        expect(mockRepoDeleteRef).toHaveBeenCalledWith("publish-skjema--1234");
      });
    });
  });

  describe("publishResource", () => {
    beforeEach(() => {
      nock(projectUrl).get("/current").reply(204);
    });

    describe("When file already exists", () => {
      beforeEach(async () => {
        await backend.publishResource(token, "settings", { toggle: "on" });
      });

      it("sends the sha of the original file to createOrUpdateFile", () => {
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledTimes(1);
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledWith(
          "publish-repo-main-branch",
          "resources/settings.json",
          '[Publisering] ressurs "settings", monorepo ref: publish-repo-git-sha',
          "eyJ0b2dnbGUiOiJvbiJ9",
          "existing-file-sha"
        );
      });
    });

    describe("When the file doesn't exist in the repo", () => {
      beforeEach(async () => {
        mockRepoGetFileIfItExists.mockReturnValue(undefined);
        await backend.publishResource(token, "settings", { toggle: "on" });
      });

      it("calls createOrUpdateFile without a sha", () => {
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledTimes(1);
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledWith(
          "publish-repo-main-branch",
          "resources/settings.json",
          '[Publisering] ressurs "settings", monorepo ref: publish-repo-git-sha',
          "eyJ0b2dnbGUiOiJvbiJ9",
          undefined
        );
      });
    });
  });

  describe("Authorization and error handling", () => {
    describe("publishForm", () => {
      it("does not try to publish if authorization check to server fails", async () => {
        nock(projectUrl).get("/current").replyWithError("My error");
        await expect(backend.publishForm(token, {}, {}, formPath)).rejects.toThrowError("My error");
        nock.isDone();
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledTimes(0);
      });

      it("does not try to publish if authorization check to server returns unauthorized", async () => {
        nock(projectUrl).get("/current").reply(401);
        await expect(backend.publishForm(token, {}, {}, formPath)).rejects.toThrowError("Unauthorized");
        nock.isDone();
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledTimes(0);
      });
    });

    describe("publishResource", () => {
      it("does not try to publish if authorization check to server fails", async () => {
        nock(projectUrl).get("/current").replyWithError("My error");
        await expect(backend.publishResource(token, "resourceName", {})).rejects.toThrowError("My error");
        nock.isDone();
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledTimes(0);
      });

      it("does not try to publish if authorization check to server returns unauthorized", async () => {
        nock(projectUrl).get("/current").reply(401);
        await expect(backend.publishResource(token, "resourceName", {})).rejects.toThrowError("Unauthorized");
        nock.isDone();
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledTimes(0);
      });
    });
  });
});
