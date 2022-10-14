import { createBackendForTest } from "../testTools/backend/testUtils.js";
import {
  mockRepoCreateOrUpdateFileContents,
  mockRepoCreatePullRequest,
  mockRepoCreateRef,
  mockRepoDeleteRef,
  mockRepoGetFileIfItExists,
  mockRepoGetRef,
  mockRepoHasBranchChanged,
  mockRepoMergePullRequest,
  mockRepoUpdateSubmodule,
} from "../__mocks__/GitHubRepo";
import { stringTobase64 } from "./fetchUtils";
import { GitHubRepo } from "./GitHubRepo.js";

jest.mock("uuid", () => {
  return { v4: jest.fn().mockReturnValue("1234") };
});
jest.mock("./GitHubRepo.js");

describe("Backend", () => {
  const formPath = "skjema";

  beforeEach(() => {
    // @ts-ignore
    GitHubRepo.mockImplementation(() => {
      return {
        getRef: mockRepoGetRef,
        createRef: mockRepoCreateRef,
        deleteRef: mockRepoDeleteRef,
        hasBranchChanged: mockRepoHasBranchChanged,
        getFileIfItExists: mockRepoGetFileIfItExists,
        createOrUpdateFileContents: mockRepoCreateOrUpdateFileContents,
        updateSubmodule: mockRepoUpdateSubmodule,
        createPullRequest: mockRepoCreatePullRequest,
        mergePullRequest: mockRepoMergePullRequest,
      };
    });
  });

  let backend: any;
  beforeEach(() => {
    backend = createBackendForTest();
  });

  afterEach(() => {
    // @ts-ignore
    GitHubRepo.mockClear();
    mockRepoGetRef.mockClear();
    mockRepoCreateRef.mockClear();
    mockRepoDeleteRef.mockClear();
    mockRepoHasBranchChanged.mockClear();
    mockRepoGetFileIfItExists.mockClear();
    mockRepoUpdateSubmodule.mockClear();
    mockRepoCreateOrUpdateFileContents.mockClear();
    mockRepoCreatePullRequest.mockClear();
    mockRepoMergePullRequest.mockClear();
  });

  it("creates instance of GitHubRepo.js", () => {
    expect(GitHubRepo).toHaveBeenCalledTimes(1);
    expect(GitHubRepo).toHaveBeenCalledWith("publish-repo-owner", "publish-repo", "publishRepoToken");
  });

  describe("publishForm", () => {
    const expectedBranchName = "publish-skjema--1234";

    describe("When file content is different from the corresponding file in the repo", () => {
      beforeEach(async () => {
        await backend.publishForm({ title: "Form" }, { en: {} }, formPath);
      });

      it("creates a new branch in the target repo", () => {
        expect(mockRepoCreateRef).toHaveBeenCalledTimes(1);
        expect(mockRepoCreateRef).toHaveBeenCalledWith(expectedBranchName, "sha");
      });

      it("pushes form and translations on a separate branch", () => {
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledTimes(2);
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledWith(
          expectedBranchName,
          `forms/${formPath}.json`,
          'skjema "Form", monorepo ref: publish-repo-git-sha',
          "eyJ0aXRsZSI6IkZvcm0ifQ==",
          "existing-file-sha"
        );
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledWith(
          expectedBranchName,
          `translations/${formPath}.json`,
          'oversettelse "Form", monorepo ref: publish-repo-git-sha',
          "eyJlbiI6e319",
          "existing-file-sha"
        );
      });

      it("deletes the branch", () => {
        expect(mockRepoDeleteRef).toHaveBeenCalledTimes(1);
        expect(mockRepoDeleteRef).toHaveBeenCalledWith(expectedBranchName);
      });
    });

    describe("When file content is the same as the corresponding file in the repo", () => {
      beforeEach(async () => {
        const fileContent = { title: "Form" };
        mockRepoGetFileIfItExists.mockReturnValueOnce({
          data: { content: stringTobase64(JSON.stringify(fileContent)), sha: "sha" },
        });
        mockRepoGetFileIfItExists.mockReturnValueOnce({
          data: { content: stringTobase64(JSON.stringify({})), sha: "sha" },
        });
        await backend.publishForm(fileContent, {}, formPath);
      });

      it("does not push the file", () => {
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledTimes(0);
      });

      it("deletes the branch", () => {
        expect(mockRepoDeleteRef).toHaveBeenCalledTimes(1);
        expect(mockRepoDeleteRef).toHaveBeenCalledWith(expectedBranchName);
      });
    });

    describe("when changes are pushed", () => {
      beforeEach(async () => {
        mockRepoGetRef.mockReturnValueOnce({ data: { object: { sha: "original-sha-for-base-branch" } } });
        mockRepoGetRef.mockReturnValueOnce({ data: { object: { sha: "different-sha-for-new-branch" } } });
        mockRepoGetRef.mockReturnValueOnce({ data: { object: { sha: "different-sha-after-pushing-files" } } });
        mockRepoGetRef.mockReturnValueOnce({ data: { object: { sha: "resulting-sha-after-merge" } } });
        await backend.publishForm({ title: "Form" }, { en: {} }, formPath);
      });

      it("updates submodule", () => {
        expect(mockRepoUpdateSubmodule).toHaveBeenCalledTimes(1);
        expect(mockRepoUpdateSubmodule).toHaveBeenCalledWith(
          expectedBranchName,
          "publish-repo-git-sha",
          "submodule-repo",
          "oppdater monorepo ref: publish-repo-git-sha"
        );
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
        expect(mockRepoMergePullRequest).toHaveBeenCalledWith(
          14,
          '[publisering] skjema "Form", monorepo ref: publish-repo-git-sha'
        );
      });
    });

    describe("when no changes are pushed", () => {
      beforeEach(async () => {
        await backend.publishForm({ title: "Form" }, { en: {} }, formPath);
      });

      it("does not update submodule", () => {
        expect(mockRepoUpdateSubmodule).toHaveBeenCalledTimes(0);
      });

      it("does not merge the pull request", () => {
        expect(mockRepoMergePullRequest).toHaveBeenCalledTimes(0);
      });

      it("deletes the branch", () => {
        expect(mockRepoDeleteRef).toHaveBeenCalledTimes(1);
        expect(mockRepoDeleteRef).toHaveBeenCalledWith(expectedBranchName);
      });
    });
  });

  describe("publishResource", () => {
    const expectedBranchName = "publish-settings--1234";

    beforeEach(() => {
      mockRepoGetRef.mockReturnValueOnce({ data: { object: { sha: "original-sha-for-base-branch" } } });
      mockRepoGetRef.mockReturnValueOnce({ data: { object: { sha: "different-sha-for-new-branch" } } });
      mockRepoGetRef.mockReturnValueOnce({ data: { object: { sha: "different-sha-after-pushing-file" } } });
      mockRepoGetRef.mockReturnValueOnce({ data: { object: { sha: "resulting-sha-after-merge" } } });
    });

    describe("When file already exists", () => {
      beforeEach(async () => {
        await backend.publishResource("settings", { toggle: "on" });
      });

      it("creates a new branch in the target repo", () => {
        expect(mockRepoCreateRef).toHaveBeenCalledTimes(1);
        expect(mockRepoCreateRef).toHaveBeenCalledWith(expectedBranchName, "original-sha-for-base-branch");
      });

      it("sends the sha of the original file to createOrUpdateFile", () => {
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledTimes(2);
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledWith(
          expectedBranchName,
          "resources/settings.json",
          'ressurs "settings", monorepo ref: publish-repo-git-sha',
          "eyJ0b2dnbGUiOiJvbiJ9",
          "existing-file-sha"
        );
      });

      it("updates submodule", () => {
        expect(mockRepoUpdateSubmodule).toHaveBeenCalledTimes(1);
        expect(mockRepoUpdateSubmodule).toHaveBeenCalledWith(
          expectedBranchName,
          "publish-repo-git-sha",
          "submodule-repo",
          "oppdater monorepo ref: publish-repo-git-sha"
        );
      });

      it("deletes the branch", () => {
        expect(mockRepoDeleteRef).toHaveBeenCalledTimes(1);
        expect(mockRepoDeleteRef).toHaveBeenCalledWith(expectedBranchName);
      });
    });

    describe("When the file doesn't exist in the repo", () => {
      beforeEach(async () => {
        mockRepoGetFileIfItExists.mockReturnValue(undefined);
        await backend.publishResource("settings", { toggle: "on" });
      });

      it("calls createOrUpdateFile without a sha", () => {
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledTimes(2);
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledWith(
          expectedBranchName,
          "resources/settings.json",
          'ressurs "settings", monorepo ref: publish-repo-git-sha',
          "eyJ0b2dnbGUiOiJvbiJ9",
          undefined
        );
      });
    });
  });
});
