import type { Mock } from 'vitest';

declare module './GitHubRepo.js' {
  export const mockRepoGetRef: Mock;
  export const mockRepoCreateRef: Mock;
  export const mockRepoDeleteRef: Mock;
  export const mockRepoGetFileIfItExists: Mock;
  export const mockRepoCreateOrUpdateFileContents: Mock;
  export const mockRepoCreatePullRequest: Mock;
  export const mockRepoMergePullRequest: Mock;
  export const mockRepoDeleteFile: Mock;
}
