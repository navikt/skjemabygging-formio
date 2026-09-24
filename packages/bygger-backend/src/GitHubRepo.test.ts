import { Octokit } from '@octokit/rest';
import { configForTest } from '../testTools/backend/testUtils';
import { GitHubRepo } from './GitHubRepo';

const authAppMocks = vi.hoisted(() => ({
  createAppAuth: vi.fn().mockReturnValue(async () => ({ token: undefined })),
}));

const octokitMocks = vi.hoisted(() => ({
  mockGetRef: vi.fn(),
  mockCreateRef: vi.fn(),
  mockDeleteRef: vi.fn(),
  mockGetTree: vi.fn(),
  mockGetCommit: vi.fn(),
  mockCreateTree: vi.fn(),
  mockCreateCommit: vi.fn(),
  mockUpdateRef: vi.fn(),
  mockGetContent: vi.fn(),
  mockCreateOrUpdateFileContents: vi.fn(),
  mockCreatePullRequest: vi.fn(),
  mockMergePullRequest: vi.fn(),
}));

const {
  mockCreateCommit,
  mockCreateOrUpdateFileContents,
  mockCreatePullRequest,
  mockCreateRef,
  mockCreateTree,
  mockDeleteRef,
  mockGetContent,
  mockGetRef,
  mockGetTree,
  mockGetCommit,
  mockMergePullRequest,
  mockUpdateRef,
} = octokitMocks;

vi.mock('@octokit/auth-app', () => authAppMocks);

vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn().mockImplementation(() => ({
    rest: {
      git: {
        getRef: mockGetRef,
        createRef: mockCreateRef,
        deleteRef: mockDeleteRef,
        getTree: mockGetTree,
        getCommit: mockGetCommit,
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
  })),
}));

describe('GitHubRepo', () => {
  let repo;
  const owner = 'myOrganization';
  const repoName = 'myRepo';

  beforeEach(async () => {
    repo = new GitHubRepo(owner, repoName, configForTest.githubApp);
    await repo.authenticate();
  });

  afterEach(() => {
    vi.mocked(Octokit).mockClear();
    mockGetRef.mockClear();
    mockCreateRef.mockClear();
    mockDeleteRef.mockClear();
    mockGetTree.mockClear();
    mockGetCommit.mockClear();
    mockCreateTree.mockClear();
    mockCreateCommit.mockClear();
    mockUpdateRef.mockClear();
    mockGetContent.mockClear();
    mockCreateOrUpdateFileContents.mockClear();
    mockCreatePullRequest.mockClear();
    mockMergePullRequest.mockClear();
  });

  it('creates instance of octokit and authenticates with provided pat', () => {
    expect(Octokit).toHaveBeenCalledTimes(1);
    expect(Octokit).toHaveBeenLastCalledWith(expect.objectContaining({ auth: undefined }));
  });

  describe('getRef', () => {
    it('calls octokit.rest.git.getRef with ref: heads/main', () => {
      repo.getRef('main');
      expect(mockGetRef).toHaveBeenCalledTimes(1);
      expect(mockGetRef).toHaveBeenCalledWith({ owner, repo: repoName, ref: 'heads/main' });
    });

    describe('listFormPaths', () => {
      it('lists nested published forms on the configured branch', async () => {
        mockGetRef.mockResolvedValue({ data: { object: { sha: 'base-sha' } } });
        mockGetCommit.mockResolvedValue({ data: { tree: { sha: 'tree-sha' } } });
        mockGetTree.mockResolvedValue({
          data: {
            truncated: false,
            tree: [
              { type: 'blob', path: 'forms/nested/example.json' },
              { type: 'blob', path: 'translations/nested/example.json' },
              { type: 'blob', path: 'forms/another.json' },
              { type: 'tree', path: 'forms/folder.json' },
            ],
          },
        });
        await expect(repo.listFormPaths('test-publishing')).resolves.toEqual(['nested/example', 'another']);
        expect(mockGetRef).toHaveBeenCalledWith({
          owner,
          repo: repoName,
          ref: 'heads/test-publishing',
        });
        expect(mockGetCommit).toHaveBeenCalledWith({ owner, repo: repoName, commit_sha: 'base-sha' });
        expect(mockGetTree).toHaveBeenCalledWith({
          owner,
          repo: repoName,
          tree_sha: 'tree-sha',
          recursive: 'true',
        });
      });

      it('refuses cleanup if GitHub truncates the tree', async () => {
        mockGetRef.mockResolvedValue({ data: { object: { sha: 'base-sha' } } });
        mockGetCommit.mockResolvedValue({ data: { tree: { sha: 'tree-sha' } } });
        mockGetTree.mockResolvedValue({ data: { truncated: true, tree: [] } });
        await expect(repo.listFormPaths('test-publishing')).rejects.toThrow('truncated');
      });
    });
  });

  describe('createRef', () => {
    it('calls octokit.rest.git.createRef with ref: refs/heads/new-branch', () => {
      repo.createRef('new-branch');
      expect(mockCreateRef).toHaveBeenCalledTimes(1);
      expect(mockCreateRef).toHaveBeenCalledWith({ owner, repo: repoName, ref: 'refs/heads/new-branch' });
    });
  });

  describe('deleteRef', () => {
    it('calls octokit.rest.git.deleteRef with ref: heads/new-branch', () => {
      repo.deleteRef('new-branch');
      expect(mockDeleteRef).toHaveBeenCalledTimes(1);
      expect(mockDeleteRef).toHaveBeenCalledWith({ owner, repo: repoName, ref: 'heads/new-branch' });
    });
  });

  describe('getFileIfItExists', () => {
    it('calls octokit.rest.repos.getContent', () => {
      repo.getFileIfItExists('main', 'files/myFile.json');
      expect(mockGetContent).toHaveBeenCalledTimes(1);
      expect(mockGetContent).toHaveBeenCalledWith({ owner, repo: repoName, ref: 'main', path: 'files/myFile.json' });
    });
  });

  describe('createOrUpdateFileContents', () => {
    it('calls rest.repos.createOrUpdateFileContents with the provided sha', () => {
      repo.createOrUpdateFileContents(
        'new-branch',
        'files/existingFile.json',
        'Update existingFile.json',
        'base64-string',
        'sha for existingFile.json',
      );
      expect(mockCreateOrUpdateFileContents).toHaveBeenCalledTimes(1);
      expect(mockCreateOrUpdateFileContents).toHaveBeenCalledWith({
        owner,
        repo: repoName,
        branch: 'new-branch',
        path: 'files/existingFile.json',
        message: 'Update existingFile.json',
        content: 'base64-string',
        sha: 'sha for existingFile.json',
      });
    });

    it('omits sha from parameters when not provided', () => {
      repo.createOrUpdateFileContents('new-branch', 'files/newFile.json', 'Create newFile.json', 'base64-string');
      expect(mockCreateOrUpdateFileContents).toHaveBeenCalledTimes(1);
      expect(mockCreateOrUpdateFileContents).toHaveBeenCalledWith({
        owner,
        repo: repoName,
        branch: 'new-branch',
        path: 'files/newFile.json',
        message: 'Create newFile.json',
        content: 'base64-string',
      });
    });
  });

  describe('createPullRequest', () => {
    it('calls octokit.rest.pulls.create', () => {
      repo.createPullRequest('New PR', 'new-branch', 'main');
      expect(mockCreatePullRequest).toHaveBeenCalledTimes(1);
      expect(mockCreatePullRequest).toHaveBeenCalledWith({
        owner,
        repo: repoName,
        title: 'New PR',
        head: 'new-branch',
        base: 'main',
      });
    });
  });

  describe('mergePullRequest', () => {
    it('calls octokit.rest.pulls.merge', () => {
      repo.mergePullRequest(14, 'message');
      expect(mockMergePullRequest).toHaveBeenCalledTimes(1);
      expect(mockMergePullRequest).toHaveBeenCalledWith({
        owner,
        repo: repoName,
        pull_number: 14,
        commit_title: 'message',
        commit_message: '',
      });
    });
  });
});
