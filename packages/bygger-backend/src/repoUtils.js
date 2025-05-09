import { stringTobase64 } from './fetchUtils';
import { logger } from './logging/logger';

function areEqualWithoutWhiteSpaces(string1, string2) {
  return string1.replace(/\s/g, '') === string2.replace(/\s/g, '');
}

/**
 * Push a file to a repository. Returns a promise that resolves to an object with a boolean property "changed",
 * telling if the file was changed or not.
 * @param repo
 * @param branch
 * @param path File path in the repository (e.g. 'forms/nav123456.json')
 * @param message Commit message
 * @param fileContentAsBase64 Content of the file as base64 string
 * @returns {Promise<Awaited<{changed: boolean}>>}
 */
async function pushFileToRepo(repo, branch, path, message, fileContentAsBase64) {
  logger.info('Push file to repo', { branch, path, commitMessage: message });
  const remoteFile = await repo.getFileIfItExists(branch, path);
  const sha = remoteFile && remoteFile.data && remoteFile.data.sha;

  if (
    remoteFile &&
    remoteFile.data &&
    remoteFile.data.content &&
    areEqualWithoutWhiteSpaces(remoteFile.data.content, fileContentAsBase64)
  ) {
    // The file exists remotely, and is identical to the "local" file. Skip update.
    logger.info(`Skipping update of ${path} on ${branch}, content is identical`);
    return Promise.resolve({ changed: false });
  }

  await repo.createOrUpdateFileContents(branch, path, message, fileContentAsBase64, sha);
  logger.info(`${path} is created or replaced on ${branch}`);
  return Promise.resolve({ changed: true });
}

export function createFileForPushingToRepo(name, path, type, content) {
  return { name, path, type, contentAsBase64: stringTobase64(JSON.stringify(content)) };
}

export function pushFilesAndUpdateMonorepoRefCallback(files, newMonorepoGitSha) {
  return async (repo, branch) => {
    logger.debug(`Get ref for branch ${branch}`);
    const initialRef = await repo.getRef(branch);
    logger.info(`Perform ${files.length} change(s) on ${branch}, ref: ${initialRef}`);
    let hasBranchChanged = false;
    for (const file of files) {
      const result = await pushFileToRepo(
        repo,
        branch,
        file.path,
        `${file.type} "${file.name}", monorepo ref: ${newMonorepoGitSha}`,
        file.contentAsBase64,
      );
      if (result.changed) {
        hasBranchChanged = true;
      }
    }
    if (hasBranchChanged) {
      logger.info('Update monorepo ref', { newGitSha: newMonorepoGitSha, original: initialRef, branch });
      await pushFileToRepo(
        repo,
        branch,
        'MONOREPO',
        `oppdater monorepo ref: ${newMonorepoGitSha}`,
        stringTobase64(newMonorepoGitSha),
      );
    }
    return hasBranchChanged;
  };
}

async function deleteFile(repo, branch, path, message) {
  const remoteFile = await repo.getFileIfItExists(branch, path);
  const sha = remoteFile?.data?.sha;
  if (sha) {
    await repo.deleteFile(branch, path, message, sha);
    return { changed: true };
  }
  return { changed: false };
}

export function deleteFilesAndUpdateMonorepoRefCallback(paths) {
  return async (repo, branch) => {
    let changed = false;
    for (const path of paths) {
      const result = await deleteFile(repo, branch, path, `Delete "${path}"`);
      if (result.changed) {
        changed = true;
      }
    }
    return changed;
  };
}

export async function performChangesOnSeparateBranch(repo, base, branch, performChanges, mergeCommitMessage) {
  logger.debug(`Get ref for ${base}`);
  const baseRef = await repo.getRef(base);
  logger.info(`Create new branch ${branch} based on ${base}`, baseRef);
  await repo.createRef(branch, baseRef.data.object.sha);

  let updatedBaseSha;
  try {
    const hasBranchChanged = await performChanges(repo, branch);

    if (hasBranchChanged) {
      // Only create and merge pull request if the branch contains changes, compared to the base branch
      const pullRequest = await repo.createPullRequest('Automatic publishing job', branch, base);
      logger.info('Created pull-request', {
        pullRequest: pullRequest.data.number,
        baseRef,
        branch,
        commitMessage: mergeCommitMessage,
      });
      await repo.mergePullRequest(pullRequest.data.number, mergeCommitMessage);
      const updatedBase = await repo.getRef(base);
      updatedBaseSha = updatedBase.data.object.sha;
      logger.info('Merged pull-request', {
        updatedBaseSha,
        pullRequest: pullRequest.data.number,
        baseRef,
        branch,
      });
    } else {
      logger.info(`Skipping pull-request due to no changes on ${branch} compared to ${base}`);
    }
  } finally {
    try {
      await repo.deleteRef(branch);
      logger.info(`Deleted branch ${branch}`);
    } catch (error) {
      logger.error(`Failed to delete branch ${branch}`, error);
    }
  }
  return updatedBaseSha;
}

export function getFormFilePath(formPath) {
  return `forms/${formPath}.json`;
}

export function getTranslationFilePath(formPath) {
  return `translations/${formPath}.json`;
}
