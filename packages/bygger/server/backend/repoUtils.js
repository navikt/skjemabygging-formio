import { stringTobase64 } from "./fetchUtils.js";

function areEqualWithoutWhiteSpaces(string1, string2) {
  return string1.replace(/\s/g, "") === string2.replace(/\s/g, "");
}

async function pushJsonFileToRepo(repo, branch, path, message, fileContentAsBase64) {
  const remoteFile = await repo.getFileIfItExists(branch, path);
  const sha = remoteFile && remoteFile.data && remoteFile.data.sha;

  if (
    remoteFile &&
    remoteFile.data &&
    remoteFile.data.content &&
    areEqualWithoutWhiteSpaces(remoteFile.data.content, fileContentAsBase64)
  ) {
    // The file exists remotely, and is identical to the "local" file. Skip update.
    return Promise.resolve(undefined);
  }

  const createResult = await repo.createOrUpdateFileContents(branch, path, message, fileContentAsBase64, sha);
  return createResult.data.commit.sha;
}

export function createFileForPushingToRepo(name, path, type, content) {
  return { name, path, type, contentAsBase64: stringTobase64(JSON.stringify(content), "utf-8") };
}

export function pushFilesAndUpdateSubmoduleCallback(files, newSubmoduleGitSha, submoduleRepo) {
  return async (repo, branch) => {
    const initialRef = await repo.getRef(branch);

    for (const file of files) {
      await pushJsonFileToRepo(
        repo,
        branch,
        file.path,
        `[publisering] ${file.type} "${file.name}", monorepo ref: ${newSubmoduleGitSha}`,
        file.contentAsBase64
      );
    }

    if (await repo.hasBranchChanged(initialRef, branch)) {
      await repo.updateSubmodule(
        branch,
        newSubmoduleGitSha,
        submoduleRepo,
        `[publisering] oppdater monorepo ref: ${newSubmoduleGitSha}`
      );
    }
  };
}

export async function performChangesOnSeparateBranch(repo, base, branch, performChanges) {
  const baseRef = await repo.getRef(base);
  await repo.createRef(branch, baseRef.data.object.sha);

  await performChanges(repo, branch);

  let updatedBaseSha;
  if (await repo.hasBranchChanged(baseRef, branch)) {
    // Only create and merge pull request if the branch contains changes, compared to the base branch
    const pullRequest = await repo.createPullRequest("Automatic publishing job", branch, base);
    await repo.mergePullRequest(pullRequest.data.number);
    const updatedBase = await repo.getRef(base);
    updatedBaseSha = updatedBase.data.object.sha;
  }

  await repo.deleteRef(branch);
  return updatedBaseSha;
}
