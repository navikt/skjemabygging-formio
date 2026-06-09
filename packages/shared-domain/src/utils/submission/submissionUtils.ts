import { Component } from '../../models/form/component';
import { Submission, SubmissionData } from '../../models/form/submission';

/**
 * Recursively searches for a value in a submission object based on the provided submissionPath.
 *
 * @param submission
 * @param submissionPath
 */
const getSubmissionValue = (submissionPath: string, submission?: Submission): any => {
  const findValue = (keys: string[], submissionData: SubmissionData) => {
    const key = keys.shift();

    if (key) {
      if (submissionData[key] !== undefined) {
        if (keys.length > 0) {
          return findValue(keys, submissionData[key] as SubmissionData);
        }

        if (
          submissionData[key] === '' ||
          (typeof submissionData[key] === 'object' && Object.keys(submissionData[key]).length === 0)
        ) {
          return undefined;
        }

        return submissionData[key] as SubmissionData;
      } else {
        const arrayKey = keyToArray(key);
        if (arrayKey && submissionData[arrayKey.key][arrayKey.index]) {
          return findValue(keys, submissionData[arrayKey.key][arrayKey.index] as SubmissionData);
        }
      }
    } else {
      return submissionData;
    }
  };

  if (!submissionPath || !submission?.data) {
    return;
  }

  return findValue(submissionPath.split('.'), submission.data);
};

const VERTICAL_TAB = '\v';
/**
 * Get submission value for PDF generation, replacing tabs with two spaces
 * @param submissionPath
 * @param submission
 */
const getPdfSubmissionValue = (submissionPath: string, submission?: Submission): any => {
  const value = getSubmissionValue(submissionPath, submission);
  if (typeof value === 'string') {
    return value.replaceAll('\t', '  ').replaceAll(VERTICAL_TAB, '\n');
  }
  return value;
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
 * @param parentSubmissionPath
 * @param components
 * @param submission
 */
const noChildValues = (parentSubmissionPath: string, components?: Component[], submission?: Submission) => {
  if (!submission || !components || !Array.isArray(components) || components.length === 0) {
    return true;
  }

  return components.every((component) => {
    const submissionPath = submissionUtils.getComponentSubmissionPath(component, parentSubmissionPath);
    return getSubmissionValue(submissionPath, submission) === undefined;
  });
};

const noChildValuesForDataGrid = (parentSubmissionPath: string, components: Component[], submission?: Submission) => {
  const dataGridValues = submissionUtils.getSubmissionValue(parentSubmissionPath, submission);
  if (!submission || !components || !dataGridValues || !Array.isArray(dataGridValues) || dataGridValues.length === 0) {
    return true;
  }

  return dataGridValues.every((_, index: number) =>
    noChildValues(`${parentSubmissionPath}[${index}]`, components, submission),
  );
};

const getComponentSubmissionPath = (component: Component, parentSubmissionPath: string) => {
  const { key, input, tree } = component;
  return tree || input ? (parentSubmissionPath ? `${parentSubmissionPath}.${key}` : key) : (parentSubmissionPath ?? '');
};

const submissionUtils = {
  getSubmissionValue,
  getPdfSubmissionValue,
  noChildValues,
  noChildValuesForDataGrid,
  getComponentSubmissionPath,
};

export { submissionUtils };
