import { Octokit } from "@octokit/rest";

// Not exhaustive
export const gitTreeMode = {
  BLOB: "100644",
  EXECUTABLE: "100755",
  DIRECTORY: "040000",
  SUBMODULE: "160000",
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

  async updateSubmodule(branch, submoduleSha, submodulePath, commitMessage) {
    const {
      data: {
        object: { sha: currentSha },
      },
    } = await this.getRef(branch);

    const currentTree = await this.octokit.rest.git.getTree({
      owner: this.owner,
      repo: this.repo,
      tree_sha: currentSha,
    });

    const isCurrentSubmoduleUpToDate = currentTree.data.tree.some(
      (node) => node.mode === gitTreeMode.SUBMODULE && node.path === submodulePath && node.sha === submoduleSha
    );

    if (!isCurrentSubmoduleUpToDate) {
      const tree = await this.octokit.rest.git.createTree({
        owner: this.owner,
        repo: this.repo,
        base_tree: currentSha,
        tree: [
          {
            path: submodulePath,
            mode: gitTreeMode.SUBMODULE,
            type: "commit",
            sha: submoduleSha,
          },
        ],
      });

      const commit = await this.octokit.rest.git.createCommit({
        owner: this.owner,
        repo: this.repo,
        message: commitMessage,
        tree: tree.data.sha,
        parents: [currentSha],
      });

      return this.octokit.rest.git.updateRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${branch}`,
        sha: commit.data.sha,
      });
    }
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
    if (sha) {
      parameters = { ...parameters, sha };
    }
    return this.octokit.rest.repos.deleteFile(parameters);
  }
}
