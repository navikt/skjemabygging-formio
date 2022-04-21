export const mockGetRef = jest.fn();
export const mockCreateRef = jest.fn();
export const mockDeleteRef = jest.fn();
export const mockGetTree = jest.fn();
export const mockCreateTree = jest.fn();
export const mockCreateCommit = jest.fn();
export const mockUpdateRef = jest.fn();
export const mockGetContent = jest.fn();
export const mockCreateOrUpdateFileContents = jest.fn();
export const mockCreatePullRequest = jest.fn();
export const mockMergePullRequest = jest.fn();
export const Octokit = jest.fn().mockImplementation(() => {
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
