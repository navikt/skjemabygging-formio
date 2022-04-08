export const mockRepoGetRef = jest.fn().mockReturnValue({ data: { object: { sha: "sha" } } });
export const mockRepoCreateRef = jest.fn();
export const mockRepoDeleteRef = jest.fn();
export const mockRepoGetFileIfItExists = jest
  .fn()
  .mockReturnValue({ data: { sha: "existing-file-sha", content: "content" } });
export const mockRepoCreateOrUpdateFileContents = jest
  .fn()
  .mockReturnValue({ data: { commit: { sha: "new-commit-sha" } } });
export const mockRepoUpdateSubmodule = jest.fn();
export const mockRepoCreatePullRequest = jest.fn().mockReturnValue({ data: { number: 14 } });
export const mockRepoMergePullRequest = jest.fn();
export const mockRepoHasBranchChanged = jest
  .fn()
  .mockImplementation((ref, _branch) => mockRepoGetRef().data.object.sha !== ref.data.object.sha);

export const GitHubRepo = jest.fn().mockImplementation(() => {
  return {
    getRef: mockRepoGetRef,
    createRef: mockRepoCreateRef,
    deleteRef: mockRepoDeleteRef,
    getFileIfItExists: mockRepoGetFileIfItExists,
    createOrUpdateFileContents: mockRepoCreateOrUpdateFileContents,
    updateSubmodule: mockRepoUpdateSubmodule,
    createPullRequest: mockRepoCreatePullRequest,
    mergePullRequest: mockRepoMergePullRequest,
    hasBranchChanged: mockRepoHasBranchChanged,
  };
});
