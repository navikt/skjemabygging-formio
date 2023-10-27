import { SubmissionData } from '@navikt/skjemadigitalisering-shared-domain';

const beforeSaveComponentSettings = (submissionData: SubmissionData) => {
  const { properties } = submissionData;
  if (properties) {
    Object.keys(properties).forEach((key) => {
      const value = properties[key];
      if (value && typeof value === 'string') {
        properties[key] = value.trim();
      }
    });
  }
};

export default beforeSaveComponentSettings;
