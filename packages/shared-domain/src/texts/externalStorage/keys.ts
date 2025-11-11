const introPage = [
  'introPage.guidePanel.hi',
  'introPage.guidePanel.hiPersonalized',
  'introPage.scope.title.alt1',
  'introPage.scope.title.alt2',
  'introPage.scope.title.alt3',
  'introPage.outOfScope.title.alt1',
  'introPage.outOfScope.title.alt2',
  'introPage.outOfScope.title.alt3',
  'introPage.prerequisites.title.alt1',
  'introPage.prerequisites.title.alt2',
  'introPage.prerequisites.title.alt3',
  'introPage.beAwareOf.title',
  'introPage.beAwareOf.mandatoryFields',
  'introPage.beAwareOf.useOfPublicComputers',
  'introPage.beAwareOf.sendByMail',
  'introPage.beAwareOf.timeLimit',
  'introPage.dataDisclosure.title.alt1',
  'introPage.dataDisclosure.title.alt2',
  'introPage.dataDisclosure.ingress',
  'introPage.dataDisclosure.nationalPopulationRegister',
  'introPage.dataTreatment.title',
  'introPage.dataTreatment.readMore',
  'introPage.dataStorage.title.digital',
  'introPage.dataStorage.ingress.digital',
  'introPage.automaticProcessing.title',
  'introPage.selfDeclaration.description.alt1',
  'introPage.selfDeclaration.description.alt2',
  'introPage.selfDeclaration.description.alt3',
  'introPage.selfDeclaration.description.alt4',
  'introPage.selfDeclaration.inputLabel',
  'introPage.selfDeclaration.validationError',
] as const;

const keys = { introPage } as const;
type IntroPageKey = (typeof introPage)[number];
type Tkey = IntroPageKey;

export { keys };
export type { Tkey };
