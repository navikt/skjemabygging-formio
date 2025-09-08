import { Component, Submission, SubmissionData } from '@navikt/skjemadigitalisering-shared-domain';

/**
 * Recursively searches for a value in a submission object based on the provided submissionPath.
 *
 * @param submission
 * @param submissionPath
 */
const getSubmissionValue = (submissionPath: string, submission?: Submission): any => {
  const findValue = (keys: string[], data: SubmissionData) => {
    const key = keys.shift();

    if (key) {
      if (data[key]) {
        if (keys.length > 0) {
          return findValue(keys, data[key] as SubmissionData);
        }

        if (data[key] === '' || (typeof data[key] === 'object' && Object.keys(data[key]).length === 0)) {
          return undefined;
        }

        return data[key] as SubmissionData;
      } else {
        const arrayKey = keyToArray(key);
        if (arrayKey && data[arrayKey.key][arrayKey.index]) {
          return findValue(keys, data[arrayKey.key][arrayKey.index] as SubmissionData);
        }
      }
    } else {
      return data;
    }
  };

  if (!submissionPath || !submission?.data) {
    return;
  }

  return findValue(submissionPath.split('.'), submission.data);
};

/**
 * Check for key with array syntax, e.g., "fieldName[0]"
 *
 * @param key
 */
const keyToArray = (key: string): { key: string; index: number } | undefined => {
  const matches = key?.match(/^(.+)\[(\d+)]/);
  if (matches && matches[1] && matches[2]) {
    return {
      key: matches[1],
      index: Number(matches[2]),
    };
  }
};

/**
 * Check if components have any values in submission
 *
 * @param parentsubmissionPath
 * @param components
 * @param submission
 */
const noChildValues = (parentsubmissionPath: string, components: Component[], submission?: Submission) => {
  return (
    !submission ||
    (Array.isArray(components) &&
      components.every((component) => {
        const submissionPath = formComponentUtils.getComponentSubmissionPath(component, parentsubmissionPath);
        return getSubmissionValue(submissionPath, submission) === undefined;
      }))
  );
};

const getComponentSubmissionPath = (component: Component, parentsubmissionPath: string) => {
  const { key, input } = component;
  return input ? (parentsubmissionPath ? `${parentsubmissionPath}.${key}` : key) : (parentsubmissionPath ?? '');
};

const formComponentUtils = {
  getSubmissionValue,
  noChildValues,
  getComponentSubmissionPath,
};

export default formComponentUtils;
