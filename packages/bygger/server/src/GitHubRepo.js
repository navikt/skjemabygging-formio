import { Octokit } from "@octokit/rest";

// Not exhaustive
export const gitTreeMode = {
  BLOB: "100644",
  EXECUTABLE: "100755",
  DIRECTORY: "040000",
};

export class GitHubRepo {
  constructor(owner, repo, personalAccessToken) {
    this.owner = owner;
    this.repo = repo;
    this.octokit = new Octokit({ auth: personalAccessToken });
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
    } catch (e) {}
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
      commit_message: "",
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
