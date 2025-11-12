export interface IntroPageType {
  enabled?: boolean;
}

const introPage = (params?: IntroPageType) => {
  const { enabled } = params ?? {};

  return {
    ...staticValues,
    enabled: enabled ?? 'true',
  };
};

const staticValues = {
  introduction: '82757584-4f7c-48e2-8c84-8ad6b6ebacbd',
  selfDeclaration: 'introPage.selfDeclaration.description.alt1',
  sections: {
    dataTreatment: {
      description: '01dc83d4-cc78-4b5f-8815-adbff6437378',
    },
  },
};

export default introPage;
