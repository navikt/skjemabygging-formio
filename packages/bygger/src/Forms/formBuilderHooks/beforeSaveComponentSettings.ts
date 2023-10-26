const propsToTrim = ['vedleggskode', 'vedleggstittel'];

const beforeSaveComponentSettings = (submissionData) => {
  const { properties } = submissionData;
  propsToTrim.forEach((propToTrim) => {
    const value = properties[propToTrim];
    if (value && typeof value === 'string') {
      properties[propToTrim] = value.trim();
    }
  });
};

export default beforeSaveComponentSettings;
