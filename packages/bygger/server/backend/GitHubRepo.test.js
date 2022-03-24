import {
  mockCreateCommit,
  mockCreateOrUpdateFileContents,
  mockCreatePullRequest,
  mockCreateRef,
  mockCreateTree,
  mockDeleteRef,
  mockGetContent,
  mockGetRef,
  mockMergePullRequest,
  mockUpdateRef,
  Octokit,
} from "@octokit/rest";
import { GitHubRepo } from "./GitHubRepo.js";

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
    mockCreateTree.mockClear();
    mockCreateCommit.mockClear();
    mockUpdateRef.mockClear();
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

  describe("hasBranchChanged", () => {
    it("returns false, if ref sha is the same as the branch sha", async () => {
      const ref = { data: { object: { sha: "branch-sha" } } };
      mockGetRef.mockReturnValueOnce({ data: { object: { sha: "branch-sha" } } });
      expect(await repo.hasBranchChanged(ref, "branch")).toBe(false);
    });

    it("returns true, if ref sha is different from the branch sha", async () => {
      const ref = { data: { object: { sha: "ref-sha" } } };
      mockGetRef.mockReturnValueOnce({ data: { object: { sha: "branch-sha" } } });
      expect(await repo.hasBranchChanged(ref, "branch")).toBe(true);
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

  describe("updateSubmodule", () => {
    beforeEach(() => {
      mockGetRef.mockReturnValueOnce({ data: { object: { sha: "new-branch-sha" } } });
      mockCreateTree.mockReturnValueOnce({ data: { sha: "new-tree-sha" } });
      mockCreateCommit.mockReturnValueOnce({ data: { sha: "new-commit-sha" } });
      repo.updateSubmodule("new-branch", "submoduleSha", "submodulePath", "message");
    });

    it("creates a new git tree with an updated reference to the subModule", () => {
      expect(mockCreateTree).toHaveBeenCalledTimes(1);
      expect(mockCreateTree).toHaveBeenCalledWith({
        owner,
        repo: repoName,
        base_tree: "new-branch-sha",
        tree: [{ path: "submodulePath", mode: "160000", type: "commit", sha: "submoduleSha" }],
      });
    });

    it("commits the new tree, with the initial branch sha as parent", () => {
      expect(mockCreateCommit).toHaveBeenCalledTimes(1);
      expect(mockCreateCommit).toHaveBeenLastCalledWith({
        owner,
        repo: repoName,
        message: "message",
        tree: "new-tree-sha",
        parents: ["new-branch-sha"],
      });
    });

    it("updates the branch ref to point at the new commit sha", () => {
      expect(mockUpdateRef).toHaveBeenCalledTimes(1);
      expect(mockUpdateRef).toHaveBeenCalledWith({
        owner,
        repo: repoName,
        ref: "heads/new-branch",
        sha: "new-commit-sha",
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
