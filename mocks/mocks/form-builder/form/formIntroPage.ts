export interface FormIntroPageType {
  enabled?: boolean;
}

const formIntroPage = (props?: FormIntroPageType) => {
  const { enabled } = props ?? {};

  return {
    ...staticDefaultValues,
    enabled: enabled ?? 'true',
  };
};

const staticDefaultValues = {
  introduction: '82757584-4f7c-48e2-8c84-8ad6b6ebacbd',
  selfDeclaration: 'introPage.selfDeclaration.description.alt1',
  sections: {
    dataDisclosure: {
      title: 'introPage.dataDisclosure.title.alt1',
    },
    dataTreatment: {
      description: '01dc83d4-cc78-4b5f-8815-adbff6437378',
    },
  },
};

export default formIntroPage;
