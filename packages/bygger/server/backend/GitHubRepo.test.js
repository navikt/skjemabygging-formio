import { Octokit } from "@octokit/rest";
import {
  mockCreateOrUpdateFileContents,
  mockCreatePullRequest,
  mockCreateRef,
  mockDeleteRef,
  mockGetContent,
  mockGetRef,
  mockMergePullRequest,
} from "../__mocks__/@octokit/rest";
import { GitHubRepo } from "./GitHubRepo";

jest.mock("@octokit/rest");

describe("GitHubRepo", () => {
  let repo;
  const owner = "myOrganization";
  const repoName = "myRepo";

  beforeEach(() => {
    repo = new GitHubRepo(owner, repoName, "personalAccessToken");
  });

  afterEach(() => {
    Octokit.mockClear();
    mockGetRef.mockClear();
    mockCreateRef.mockClear();
    mockDeleteRef.mockClear();
    mockGetContent.mockClear();
    mockCreateOrUpdateFileContents.mockClear();
    mockCreatePullRequest.mockClear();
    mockMergePullRequest.mockClear();
  });

  it("creates instance of octokit and authenticates with provided pat", () => {
    expect(Octokit).toHaveBeenCalledTimes(1);
    expect(Octokit).toHaveBeenLastCalledWith({ auth: "personalAccessToken" });
  });

  describe("getRef", () => {
    it("calls octokit.rest.git.getRef with ref: heads/main", () => {
      repo.getRef("main");
      expect(mockGetRef).toHaveBeenCalledTimes(1);
      expect(mockGetRef).toHaveBeenCalledWith({ owner, repo: repoName, ref: "heads/main" });
    });
  });

  describe("createRef", () => {
    it("calls octokit.rest.git.createRef with ref: refs/heads/new-branch", () => {
      repo.createRef("new-branch");
      expect(mockCreateRef).toHaveBeenCalledTimes(1);
      expect(mockCreateRef).toHaveBeenCalledWith({ owner, repo: repoName, ref: "refs/heads/new-branch" });
    });
  });

  describe("deleteRef", () => {
    it("calls octokit.rest.git.deleteRef with ref: heads/new-branch", () => {
      repo.deleteRef("new-branch");
      expect(mockDeleteRef).toHaveBeenCalledTimes(1);
      expect(mockDeleteRef).toHaveBeenCalledWith({ owner, repo: repoName, ref: "heads/new-branch" });
    });
  });

  describe("getFileIfItExists", () => {
    it("calls octokit.rest.repos.getContent", () => {
      repo.getFileIfItExists("main", "files/myFile.json");
      expect(mockGetContent).toHaveBeenCalledTimes(1);
      expect(mockGetContent).toHaveBeenCalledWith({ owner, repo: repoName, ref: "main", path: "files/myFile.json" });
    });
  });

  describe("createOrUpdateFileContents", () => {
    it("calls rest.repos.createOrUpdateFileContents with the provided sha", () => {
      repo.createOrUpdateFileContents(
        "new-branch",
        "files/existingFile.json",
        "Update existingFile.json",
        "base64-string",
        "sha for existingFile.json"
      );
      expect(mockCreateOrUpdateFileContents).toHaveBeenCalledTimes(1);
      expect(mockCreateOrUpdateFileContents).toHaveBeenCalledWith({
        owner,
        repo: repoName,
        branch: "new-branch",
        path: "files/existingFile.json",
        message: "Update existingFile.json",
        content: "base64-string",
        sha: "sha for existingFile.json",
      });
    });

    it("omits sha from parameters when not provided", () => {
      repo.createOrUpdateFileContents("new-branch", "files/newFile.json", "Create newFile.json", "base64-string");
      expect(mockCreateOrUpdateFileContents).toHaveBeenCalledTimes(1);
      expect(mockCreateOrUpdateFileContents).toHaveBeenCalledWith({
        owner,
        repo: repoName,
        branch: "new-branch",
        path: "files/newFile.json",
        message: "Create newFile.json",
        content: "base64-string",
      });
    });
  });

  describe("createPullRequest", () => {
    it("calls octokit.rest.pulls.create", () => {
      repo.createPullRequest("New PR", "new-branch", "main");
      expect(mockCreatePullRequest).toHaveBeenCalledTimes(1);
      expect(mockCreatePullRequest).toHaveBeenCalledWith({
        owner,
        repo: repoName,
        title: "New PR",
        head: "new-branch",
        base: "main",
      });
    });
  });

  describe("mergePullRequest", () => {
    it("calls octokit.rest.pulls.merge", () => {
      repo.mergePullRequest(14);
      expect(mockMergePullRequest).toHaveBeenCalledTimes(1);
      expect(mockMergePullRequest).toHaveBeenCalledWith({ owner, repo: repoName, pull_number: 14 });
    });
  });
});
