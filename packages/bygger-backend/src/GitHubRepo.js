import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';
import { logger } from './logging/logger';

// Not exhaustive
export const gitTreeMode = {
  BLOB: '100644',
  EXECUTABLE: '100755',
  DIRECTORY: '040000',
};

export class GitHubRepo {
  constructor(owner, repo, credentials) {
    this.owner = owner;
    this.repo = repo;
    this.credentials = credentials;
  }

  async authenticate() {
    if (
      this.credentials.appId &&
      this.credentials.privateKey &&
      this.credentials.clientId &&
      this.credentials.clientSecret &&
      this.credentials.installationId
    ) {
      const auth = createAppAuth({
        appId: this.credentials.appId,
        privateKey: this.credentials.privateKey,
        clientId: this.credentials.clientId,
        clientSecret: this.credentials.clientSecret,
      });
      this.authentication = await auth({
        type: 'installation',
        installationId: this.credentials.installationId,
      });
      logger.debug('Authenticate on Github as app installation');
    }

    const auth = this.authentication?.token ?? this.credentials.token;
    if (auth === undefined) {
      logger.error(
        'Github authentication token is missing. Make sure that either GITHUB_ACCESS_TOKEN or github app credentials are present as environment variables',
      );
    }
    this.octokit = new Octokit({
      auth,
      userAgent: 'navikt/skjemabygging',
      baseUrl: 'https://api.github.com',
      log: {
        debug: () => {},
        info: () => {},
        warn: logger.warn,
        error: logger.error,
      },
    });
  }

  getRef(branch) {
    return this.octokit.rest.git.getRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${branch}`,
    });
  }

  async hasBranchChanged(ref, branch) {
    const currentRef = await this.getRef(branch);
    return currentRef.data.object.sha !== ref.data.object.sha;
  }

  createRef(branch, sha) {
    return this.octokit.rest.git.createRef({
      owner: this.owner,
      repo: this.repo,
      ref: `refs/heads/${branch}`,
      sha,
    });
  }

  deleteRef(branch) {
    return this.octokit.rest.git.deleteRef({ owner: this.owner, repo: this.repo, ref: `heads/${branch}` });
  }

  async getFileIfItExists(ref, path) {
    let remoteFileContent;
    try {
      remoteFileContent = await this.octokit.rest.repos.getContent({ owner: this.owner, repo: this.repo, ref, path });
    } catch (error) {
      if (error?.status === 404) {
        logger.info(`Was not able to retrieve file ${path} from ${ref} in repo ${this.repo}`, error);
      } else {
        logger.error(`Failed to fetch file from Github repo ${this.repo}`, error);
      }
    }
    return remoteFileContent;
  }

  createOrUpdateFileContents(branch, path, message, content, sha) {
    let parameters = {
      owner: this.owner,
      repo: this.repo,
      branch,
      path,
      message,
      content,
    };
    if (sha) {
      parameters = { ...parameters, sha };
    }
    return this.octokit.rest.repos.createOrUpdateFileContents(parameters);
  }

  createPullRequest(title, head, base) {
    return this.octokit.rest.pulls.create({
      owner: this.owner,
      repo: this.repo,
      title,
      head,
      base,
    });
  }

  mergePullRequest(pull_number, commit_title) {
    return this.octokit.rest.pulls.merge({
      owner: this.owner,
      repo: this.repo,
      pull_number,
      commit_title,
      commit_message: '',
    });
  }

  deleteFile(branch, path, message, sha) {
    let parameters = {
      owner: this.owner,
      repo: this.repo,
      branch,
      path,
      message,
      sha,
    };
    return this.octokit.rest.repos.deleteFile(parameters);
  }
}
