import { Mock } from 'vitest';
import { configForTest, createBackendForTest } from '../testTools/backend/testUtils.js';
import { GitHubRepo } from './GitHubRepo.js';
import { stringTobase64 } from './fetchUtils';
import { pushEventWithCommitMessage } from './testdata/default-github-push-event';

const mockRepoGetRef = vi.fn().mockReturnValue({ data: { object: { sha: 'sha' } } });
const mockRepoCreateRef = vi.fn();
const mockRepoDeleteRef = vi.fn();
const mockRepoGetFileIfItExists = vi.fn().mockReturnValue({ data: { sha: 'existing-file-sha', content: 'content' } });
const mockRepoCreateOrUpdateFileContents = vi.fn().mockReturnValue({ data: { commit: { sha: 'new-commit-sha' } } });
const mockRepoCreatePullRequest = vi.fn().mockReturnValue({ data: { number: 14 } });
const mockRepoMergePullRequest = vi.fn();
const mockRepoDeleteFile = vi.fn().mockImplementation(() => Promise.resolve());

vi.mock('uuid', () => {
  return { v4: vi.fn().mockReturnValue('1234') };
});
vi.mock('./GitHubRepo.js', () => {
  return {
    GitHubRepo: vi.fn().mockImplementation(() => {
      return {
        authenticate: vi.fn(),
        getRef: mockRepoGetRef,
        createRef: mockRepoCreateRef,
        deleteRef: mockRepoDeleteRef,
        getFileIfItExists: mockRepoGetFileIfItExists,
        createOrUpdateFileContents: mockRepoCreateOrUpdateFileContents,
        createPullRequest: mockRepoCreatePullRequest,
        mergePullRequest: mockRepoMergePullRequest,
        deleteFile: mockRepoDeleteFile,
      };
    }),
  };
});

describe('Backend', () => {
  const formPath = 'skjema';

  beforeEach(() => {
    (GitHubRepo as Mock).mockClear();
    mockRepoGetRef.mockClear();
    mockRepoCreateRef.mockClear();
    mockRepoDeleteRef.mockClear();
    mockRepoGetFileIfItExists.mockClear();
    mockRepoCreateOrUpdateFileContents.mockClear();
    mockRepoCreatePullRequest.mockClear();
    mockRepoMergePullRequest.mockClear();
    mockRepoDeleteFile.mockClear();
    backend = createBackendForTest();
    (GitHubRepo as Mock).mockImplementation(() => {
      return {
        authenticate: vi.fn(),
        getRef: mockRepoGetRef,
        createRef: mockRepoCreateRef,
        deleteRef: mockRepoDeleteRef,
        getFileIfItExists: mockRepoGetFileIfItExists,
        createOrUpdateFileContents: mockRepoCreateOrUpdateFileContents,
        createPullRequest: mockRepoCreatePullRequest,
        mergePullRequest: mockRepoMergePullRequest,
        deleteFile: mockRepoDeleteFile,
      };
    });
  });

  let backend: any;

  describe('publishForm', () => {
    const expectedBranchName = 'publish-skjema--1234';

    describe('When file content is different from the corresponding file in the repo', () => {
      beforeEach(async () => {
        mockRepoGetFileIfItExists.mockReturnValueOnce({
          data: { content: stringTobase64(JSON.stringify({ title: 'Form2' })), sha: 'existing-file-sha' },
        });
        mockRepoGetFileIfItExists.mockReturnValueOnce({
          data: { content: stringTobase64(JSON.stringify({})), sha: 'existing-file-sha' },
        });
        mockRepoGetFileIfItExists.mockReturnValueOnce({
          data: { content: stringTobase64('publish-repo-git-sha'), sha: 'existing-file-sha' },
        });
        await backend.publishForm({ title: 'Form' }, { en: {} }, formPath);
      });

      it('creates instance of GitHubRepo.js', () => {
        expect(GitHubRepo).toHaveBeenCalledTimes(1);
        expect(GitHubRepo).toHaveBeenCalledWith(
          'publish-repo-owner',
          'publish-repo',
          expect.objectContaining(configForTest.githubApp),
        );
      });

      it('creates a new branch in the target repo', () => {
        expect(mockRepoCreateRef).toHaveBeenCalledTimes(1);
        expect(mockRepoCreateRef).toHaveBeenCalledWith(expectedBranchName, 'sha');
      });

      it('pushes form and translations on a separate branch', () => {
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledTimes(2);
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledWith(
          expectedBranchName,
          `forms/${formPath}.json`,
          'skjema "Form", monorepo ref: publish-repo-git-sha',
          'eyJ0aXRsZSI6IkZvcm0ifQ==',
          'existing-file-sha',
        );
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledWith(
          expectedBranchName,
          `translations/${formPath}.json`,
          'oversettelse "Form", monorepo ref: publish-repo-git-sha',
          'eyJlbiI6e319',
          'existing-file-sha',
        );
      });

      it('deletes the branch', () => {
        expect(mockRepoDeleteRef).toHaveBeenCalledTimes(1);
        expect(mockRepoDeleteRef).toHaveBeenCalledWith(expectedBranchName);
      });
    });

    describe('When file content is the same as the corresponding file in the repo', () => {
      beforeEach(async () => {
        const fileContent = { title: 'Form' };
        mockRepoGetFileIfItExists.mockReturnValueOnce({
          data: { content: stringTobase64(JSON.stringify(fileContent)), sha: 'sha' },
        });
        mockRepoGetFileIfItExists.mockReturnValueOnce({
          data: { content: stringTobase64(JSON.stringify({})), sha: 'sha' },
        });
        await backend.publishForm(fileContent, {}, formPath);
      });

      it('does not push the file', () => {
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledTimes(0);
      });

      it('deletes the branch', () => {
        expect(mockRepoDeleteRef).toHaveBeenCalledTimes(1);
        expect(mockRepoDeleteRef).toHaveBeenCalledWith(expectedBranchName);
      });
    });

    describe('when changes are pushed', () => {
      beforeEach(async () => {
        mockRepoGetRef.mockReturnValueOnce({ data: { object: { sha: 'original-sha-for-base-branch' } } });
        mockRepoGetRef.mockReturnValueOnce({ data: { object: { sha: 'different-sha-for-new-branch' } } });
        mockRepoGetRef.mockReturnValueOnce({ data: { object: { sha: 'resulting-sha-after-merge' } } });
        await backend.publishForm({ title: 'Form' }, { en: {} }, formPath);
      });

      it('updates monorepo ref', () => {
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledTimes(3);
        expect(mockRepoCreateOrUpdateFileContents.mock.calls[0][1]).toBe('forms/skjema.json');
        expect(mockRepoCreateOrUpdateFileContents.mock.calls[1][1]).toBe('translations/skjema.json');
        expect(mockRepoCreateOrUpdateFileContents.mock.calls[2][1]).toBe('MONOREPO');
      });

      it('creates a pull request', () => {
        expect(mockRepoCreatePullRequest).toHaveBeenCalledTimes(1);
        expect(mockRepoCreatePullRequest).toHaveBeenCalledWith(
          'Automatic publishing job',
          expectedBranchName,
          'publish-repo-main-branch',
        );
      });

      it('merges the the pull request', async () => {
        expect(mockRepoMergePullRequest).toHaveBeenCalledTimes(1);
        expect(mockRepoMergePullRequest).toHaveBeenCalledWith(
          14,
          '[publisering] skjema "Form", monorepo ref: publish-repo-git-sha',
        );
      });
    });

    describe('when no changes are pushed', () => {
      beforeEach(async () => {
        const form = { title: 'Form' };
        const translations = { en: {} };
        mockRepoGetFileIfItExists.mockReturnValueOnce({
          data: { content: stringTobase64(JSON.stringify(form)), sha: 'existing-file-sha' },
        });
        mockRepoGetFileIfItExists.mockReturnValueOnce({
          data: { content: stringTobase64(JSON.stringify(translations)), sha: 'existing-file-sha' },
        });
        await backend.publishForm(form, translations, formPath);
      });

      it('does not update monorepo ref', () => {
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledTimes(0);
      });

      it('does not merge the pull request', () => {
        expect(mockRepoMergePullRequest).toHaveBeenCalledTimes(0);
      });

      it('deletes the branch', () => {
        expect(mockRepoDeleteRef).toHaveBeenCalledTimes(1);
        expect(mockRepoDeleteRef).toHaveBeenCalledWith(expectedBranchName);
      });
    });

    describe('when getRef does not return the newly created branch', () => {
      const MAIN_BRANCH_SHA = 'main-branch-sha';
      const ERROR_MESSAGE = 'Not found';

      beforeEach(() => {
        mockRepoGetRef.mockImplementation((branch) => {
          if (branch === configForTest.publishRepo.base) {
            return { data: { object: { sha: MAIN_BRANCH_SHA } } };
          }
          throw new Error(ERROR_MESSAGE);
        });
      });

      it('deletes publish branch', async () => {
        await expect(backend.publishForm({ title: 'Form' }, { en: {} }, formPath)).rejects.toThrow(ERROR_MESSAGE);

        expect(mockRepoGetRef).toHaveBeenCalledTimes(2);
        expect(mockRepoCreateRef).toHaveBeenCalledOnce();
        expect(mockRepoCreateRef).toHaveBeenCalledWith(expectedBranchName, MAIN_BRANCH_SHA);
        expect(mockRepoDeleteRef).toHaveBeenCalledOnce();
        expect(mockRepoDeleteRef).toHaveBeenCalledWith(expectedBranchName);
        expect(mockRepoCreatePullRequest).not.toHaveBeenCalled();
        expect(mockRepoMergePullRequest).not.toHaveBeenCalled();
      });
    });
  });

  describe('unpublishForm', () => {
    it('merges pull request when form exists', async () => {
      mockRepoGetFileIfItExists.mockReturnValue({
        data: { content: stringTobase64(JSON.stringify({ title: 'Form2' })), sha: 'existing-file-sha' },
      });
      mockRepoGetFileIfItExists.mockReturnValue({
        data: { content: stringTobase64(JSON.stringify({ en: {}, nn: {} })), sha: 'existing-file-sha' },
      });
      await backend.unpublishForm(formPath);
      expect(mockRepoDeleteFile).toHaveBeenCalledTimes(2);
      expect(mockRepoMergePullRequest).toHaveBeenCalledTimes(1);
    });

    it('skips merge of pull request when form does not exists', async () => {
      mockRepoGetFileIfItExists.mockReturnValue({
        data: { content: undefined },
      });
      await backend.unpublishForm(formPath);
      expect(mockRepoDeleteFile).not.toHaveBeenCalled();
      expect(mockRepoMergePullRequest).not.toHaveBeenCalled();
    });
  });

  describe('publishResource', () => {
    const expectedBranchName = 'publish-settings--1234';

    beforeEach(() => {
      mockRepoGetRef.mockReturnValueOnce({ data: { object: { sha: 'original-sha-for-base-branch' } } });
      mockRepoGetRef.mockReturnValueOnce({ data: { object: { sha: 'different-sha-for-new-branch' } } });
      mockRepoGetRef.mockReturnValueOnce({ data: { object: { sha: 'resulting-sha-after-merge' } } });
    });

    describe('When file already exists, but has different contents', () => {
      beforeEach(async () => {
        mockRepoGetFileIfItExists.mockReturnValueOnce({
          data: { content: stringTobase64(JSON.stringify({ toggle: 'off' })), sha: 'existing-file-sha' },
        });
        await backend.publishResource('settings', { toggle: 'on' });
      });

      it('creates instance of GitHubRepo.js', () => {
        expect(GitHubRepo).toHaveBeenCalledTimes(1);
        expect(GitHubRepo).toHaveBeenCalledWith(
          'publish-repo-owner',
          'publish-repo',
          expect.objectContaining(configForTest.githubApp),
        );
      });

      it('creates a new branch in the target repo', () => {
        expect(mockRepoCreateRef).toHaveBeenCalledTimes(1);
        expect(mockRepoCreateRef).toHaveBeenCalledWith(expectedBranchName, 'original-sha-for-base-branch');
      });

      it('sends the sha of the original file to createOrUpdateFile', () => {
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledTimes(2);
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledWith(
          expectedBranchName,
          'resources/settings.json',
          'ressurs "settings", monorepo ref: publish-repo-git-sha',
          'eyJ0b2dnbGUiOiJvbiJ9',
          'existing-file-sha',
        );
      });

      it('updates monorepo ref', () => {
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledTimes(2);
        expect(mockRepoCreateOrUpdateFileContents.mock.calls[0][1]).toBe('resources/settings.json');
        expect(mockRepoCreateOrUpdateFileContents.mock.calls[1][1]).toBe('MONOREPO');
      });

      it('deletes the branch', () => {
        expect(mockRepoDeleteRef).toHaveBeenCalledTimes(1);
        expect(mockRepoDeleteRef).toHaveBeenCalledWith(expectedBranchName);
      });
    });

    describe("When the file doesn't exist in the repo", () => {
      beforeEach(async () => {
        mockRepoGetFileIfItExists.mockReturnValue(undefined);
        await backend.publishResource('settings', { toggle: 'on' });
      });

      it('calls createOrUpdateFile without a sha', () => {
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledTimes(2);
        expect(mockRepoCreateOrUpdateFileContents).toHaveBeenCalledWith(
          expectedBranchName,
          'resources/settings.json',
          'ressurs "settings", monorepo ref: publish-repo-git-sha',
          'eyJ0b2dnbGUiOiJvbiJ9',
          undefined,
        );
      });
    });
  });

  describe('interpretGithubPushEvent', () => {
    describe('bulk publication', () => {
      const commitMessage = '[bulk-publisering] 23 skjemaer publisert, monorepo ref: 1234567890';

      it('success message includes number of forms published', () => {
        const githubEvent = pushEventWithCommitMessage(commitMessage);
        const result = backend.interpretGithubPushEvent(githubEvent, 'success');
        expect(result).toEqual({
          type: 'success',
          title: 'Bulk-publisering fullført',
          message: '23 skjemaer ble bulk-publisert',
        });
      });

      it('failure message includes number of forms published', () => {
        const githubEvent = pushEventWithCommitMessage(commitMessage);
        const result = backend.interpretGithubPushEvent(githubEvent, 'failure');
        expect(result).toEqual({
          type: 'failure',
          title: 'Bulk-publisering feilet',
          message: '23 skjemaer feilet',
        });
      });
    });

    describe('publication', () => {
      const commitMessage = '[publisering] skjema "Testskjema", monorepo ref: 1234567890';

      it('success message includes form title', () => {
        const githubEvent = pushEventWithCommitMessage(commitMessage);
        const result = backend.interpretGithubPushEvent(githubEvent, 'success');
        expect(result).toEqual({
          type: 'success',
          title: 'Publisering fullført',
          message: 'Skjema Testskjema er nå publisert',
        });
      });

      it('failure message includes form title', () => {
        const githubEvent = pushEventWithCommitMessage(commitMessage);
        const result = backend.interpretGithubPushEvent(githubEvent, 'failure');
        expect(result).toEqual({
          type: 'failure',
          title: 'Publisering feilet',
          message: 'Feilet for skjema Testskjema',
        });
      });
    });

    describe('unpublishing', () => {
      const commitMessage = '[avpublisering] skjema nav123456, monorepo ref: 1234567890';

      it('success message includes form title', () => {
        const githubEvent = pushEventWithCommitMessage(commitMessage);
        const result = backend.interpretGithubPushEvent(githubEvent, 'success');
        expect(result).toEqual({
          type: 'success',
          title: 'Avpublisering fullført',
          message: 'Skjema nav123456 er nå avpublisert',
        });
      });

      it('failure message includes form title', () => {
        const githubEvent = pushEventWithCommitMessage(commitMessage);
        const result = backend.interpretGithubPushEvent(githubEvent, 'failure');
        expect(result).toEqual({
          type: 'failure',
          title: 'Avpublisering feilet',
          message: 'Feilet for skjema nav123456',
        });
      });
    });

    describe('random commit to repo skjemautfylling-formio', () => {
      const commitMessage = 'Endret tekstene';

      it('success message includes form title', () => {
        const githubEvent = pushEventWithCommitMessage(commitMessage);
        const result = backend.interpretGithubPushEvent(githubEvent, 'success');
        expect(result).toEqual({
          type: 'success',
          title: 'Ny versjon av FyllUt',
          message: 'Endret tekstene',
        });
      });

      it('failure message includes form title', () => {
        const githubEvent = pushEventWithCommitMessage(commitMessage);
        const result = backend.interpretGithubPushEvent(githubEvent, 'failure');
        expect(result).toEqual({
          type: 'failure',
          title: 'Deploy av FyllUt feilet',
          message: 'Endret tekstene',
        });
      });
    });
  });
});
