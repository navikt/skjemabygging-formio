export const mockGetRef = vi.fn();
export const mockCreateRef = vi.fn();
export const mockDeleteRef = vi.fn();
export const mockGetTree = vi.fn();
export const mockCreateTree = vi.fn();
export const mockCreateCommit = vi.fn();
export const mockUpdateRef = vi.fn();
export const mockGetContent = vi.fn();
export const mockCreateOrUpdateFileContents = vi.fn();
export const mockCreatePullRequest = vi.fn();
export const mockMergePullRequest = vi.fn();
export const Octokit = vi.fn().mockImplementation(() => {
  return {
    rest: {
      git: {
        getRef: mockGetRef,
        createRef: mockCreateRef,
        deleteRef: mockDeleteRef,
        getTree: mockGetTree,
        createTree: mockCreateTree,
        createCommit: mockCreateCommit,
        updateRef: mockUpdateRef,
      },
      repos: {
        getContent: mockGetContent,
        createOrUpdateFileContents: mockCreateOrUpdateFileContents,
      },
      pulls: {
        create: mockCreatePullRequest,
        merge: mockMergePullRequest,
      },
    },
  };
});
