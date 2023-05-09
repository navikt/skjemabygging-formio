import { stringTobase64 } from "./fetchUtils";
import { logger } from "./logging/logger";

function areEqualWithoutWhiteSpaces(string1, string2) {
  return string1.replace(/\s/g, "") === string2.replace(/\s/g, "");
}

async function pushFileToRepo(repo, branch, path, message, fileContentAsBase64) {
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
  return { name, path, type, contentAsBase64: stringTobase64(JSON.stringify(content)) };
}

export function pushFilesAndUpdateMonorepoRefCallback(files, newMonorepoGitSha) {
  return async (repo, branch) => {
    const initialRef = await repo.getRef(branch);
    logger.info(`Perform ${files.length} change(s) on ${branch}, ref: ${initialRef}`);
    for (const file of files) {
      logger.debug("Push file to repo", { repo, branch, path: file.path, type: file.type, name: file.name });
      await pushFileToRepo(
        repo,
        branch,
        file.path,
        `${file.type} "${file.name}", monorepo ref: ${newMonorepoGitSha}`,
        file.contentAsBase64
      );
    }

    if (await repo.hasBranchChanged(initialRef, branch)) {
      logger.info("Update monorepo ref", { newGitSha: newMonorepoGitSha, original: initialRef, branch, repo });
      await pushFileToRepo(
        repo,
        branch,
        "MONOREPO",
        `oppdater monorepo ref: ${newMonorepoGitSha}`,
        stringTobase64(newMonorepoGitSha)
      );
    }
  };
}

async function deleteFile(repo, branch, path, message) {
  const remoteFile = await repo.getFileIfItExists(branch, path);
  const sha = remoteFile?.data?.sha;
  if (sha) {
    await repo.deleteFile(branch, path, message, sha);
  }
}

export function deleteFilesAndUpdateMonorepoRefCallback(paths) {
  return async (repo, branch) => {
    for (const path of paths) {
      await deleteFile(repo, branch, path, `Delete "${path}"`);
    }
  };
}

export async function performChangesOnSeparateBranch(repo, base, branch, performChanges, mergeCommitMessage) {
  const baseRef = await repo.getRef(base);
  await repo.createRef(branch, baseRef.data.object.sha);

  await performChanges(repo, branch);

  let updatedBaseSha;
  if (await repo.hasBranchChanged(baseRef, branch)) {
    // Only create and merge pull request if the branch contains changes, compared to the base branch
    const pullRequest = await repo.createPullRequest("Automatic publishing job", branch, base);
    logger.info("Created pull-request", {
      pullRequest: pullRequest.data.number,
      baseRef,
      branch,
      committMessage: mergeCommitMessage,
    });
    await repo.mergePullRequest(pullRequest.data.number, mergeCommitMessage);
    const updatedBase = await repo.getRef(base);
    updatedBaseSha = updatedBase.data.object.sha;
    logger.info("Merged pull-request", {
      updatedBaseSha,
      pullRequest: pullRequest.data.number,
      baseRef,
      branch,
    });
  }

  try {
    await repo.deleteRef(branch);
  } catch (error) {
    logger.error(`Failed to delete branch ${branch}`, error);
  }
  logger.info(`Deleted branch ${branch}`);
  return updatedBaseSha;
}

export function getFormFilePath(formPath) {
  return `forms/${formPath}.json`;
}

export function getTranslationFilePath(formPath) {
  return `translations/${formPath}.json`;
}
