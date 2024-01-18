import { SubmissionData } from '@navikt/skjemadigitalisering-shared-domain';

const beforeSaveComponentSettings = (submissionData: SubmissionData) => {
  const { properties, content, description, additionalDescriptionText } = submissionData;
  if (properties) {
    Object.keys(properties).forEach((key) => {
      const value = properties[key];
      if (value && typeof value === 'string') {
        properties[key] = value.trim();
      }
    });
  }

  const hrefTrimSpaceRegex = /href\s*=\s*/g;
  const hrefWithoutSpace = 'href=';
  if (content && typeof content === 'string') {
    submissionData.content = content.replace(hrefTrimSpaceRegex, hrefWithoutSpace);
  }
  if (description && typeof description === 'string') {
    submissionData.description = description.replace(hrefTrimSpaceRegex, hrefWithoutSpace);
  }
  if (additionalDescriptionText && typeof additionalDescriptionText === 'string') {
    submissionData.additionalDescriptionText = additionalDescriptionText.replace(hrefTrimSpaceRegex, hrefWithoutSpace);
  }
};

export default beforeSaveComponentSettings;
