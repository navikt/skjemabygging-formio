export const mockRepoGetRef = vi.fn().mockReturnValue({ data: { object: { sha: 'sha' } } });
export const mockRepoCreateRef = vi.fn();
export const mockRepoDeleteRef = vi.fn();
export const mockRepoGetFileIfItExists = vi
  .fn()
  .mockReturnValue({ data: { sha: 'existing-file-sha', content: 'content' } });
export const mockRepoCreateOrUpdateFileContents = vi
  .fn()
  .mockReturnValue({ data: { commit: { sha: 'new-commit-sha' } } });
export const mockRepoCreatePullRequest = vi.fn().mockReturnValue({ data: { number: 14 } });
export const mockRepoMergePullRequest = vi.fn();

export const GitHubRepo = vi.fn().mockImplementation(() => {
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
