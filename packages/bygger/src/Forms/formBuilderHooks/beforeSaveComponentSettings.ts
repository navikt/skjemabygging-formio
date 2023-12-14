import { SubmissionData } from '@navikt/skjemadigitalisering-shared-domain';

const beforeSaveComponentSettings = (submissionData: SubmissionData) => {
  const { properties, content } = submissionData;
  if (properties) {
    Object.keys(properties).forEach((key) => {
      const value = properties[key];
      if (value && typeof value === 'string') {
        properties[key] = value.trim();
      }
    });
  }
  if (content && typeof content === 'string') {
    const hrefTrimSpaceRegex = /\shref\s*=\s*/g;
    submissionData.content = content.replace(hrefTrimSpaceRegex, ' href=');
  }
};

export default beforeSaveComponentSettings;
