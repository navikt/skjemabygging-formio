import type { IntroPage } from '../../models/form/introPage';

type IntroPageTextGroup = keyof IntroPage['sections'] | 'guidePanel' | 'selfDeclaration';

const introPageTexts = {
  guidePanel: {
    hi: 'introPage.guidePanel.hi',
    hiPersonalized: 'introPage.guidePanel.hiPersonalized',
  },
  scope: {
    titles: ['introPage.scope.title.alt1', 'introPage.scope.title.alt2', 'introPage.scope.title.alt3'],
  },
  outOfScope: {
    titles: ['introPage.outOfScope.title.alt1', 'introPage.outOfScope.title.alt2', 'introPage.outOfScope.title.alt3'],
  },
  prerequisites: {
    titles: [
      'introPage.prerequisites.title.alt1',
      'introPage.prerequisites.title.alt2',
      'introPage.prerequisites.title.alt3',
    ],
  },
  beAwareOf: {
    title: 'introPage.beAwareOf.title',
    mandatoryFields: 'introPage.beAwareOf.mandatoryFields',
    useOfPublicComputers: 'introPage.beAwareOf.useOfPublicComputers',
    sendByMail: 'introPage.beAwareOf.sendByMail',
    notSave: 'introPage.beAwareOf.notSave',
    timeLimit: 'introPage.beAwareOf.timeLimit',
    timeLimitNologin: 'introPage.beAwareOf.timeLimitNologin',
  },
  dataDisclosure: {
    titles: ['introPage.dataDisclosure.title.alt1', 'introPage.dataDisclosure.title.alt2'],
    ingress: 'introPage.dataDisclosure.ingress',
    nationalPopulationRegister: 'introPage.dataDisclosure.nationalPopulationRegister',
    readMore: 'introPage.dataTreatment.readMore', // Keep the legacy key used by existing global translations.
  },
  dataStorage: {
    title: 'introPage.dataStorage.title.digital',
    ingress: 'introPage.dataStorage.ingress.digital',
  },
  automaticProcessing: {
    title: 'introPage.automaticProcessing.title',
  },
  optional: {},
  selfDeclaration: {
    descriptions: [
      'introPage.selfDeclaration.description.alt1',
      'introPage.selfDeclaration.description.alt2',
      'introPage.selfDeclaration.description.alt3',
      'introPage.selfDeclaration.description.alt4',
    ],
    inputLabel: 'introPage.selfDeclaration.inputLabel',
    validationError: 'introPage.selfDeclaration.validationError',
  },
} as const satisfies Record<IntroPageTextGroup, Record<string, string | readonly string[]>>;

const introPage = Object.values(introPageTexts).flatMap((group) => Object.values(group).flat());
type IntroPageKey = (typeof introPage)[number];
type ScopeTitle = (typeof introPageTexts.scope.titles)[number];
type OutOfScopeTitle = (typeof introPageTexts.outOfScope.titles)[number];
type PrerequisitesTitle = (typeof introPageTexts.prerequisites.titles)[number];
type DataDisclosureTitle = (typeof introPageTexts.dataDisclosure.titles)[number];
type SelfDeclarationDescription = (typeof introPageTexts.selfDeclaration.descriptions)[number];

const keys = { introPage } as const;
type Tkey = IntroPageKey;
type TElement = Tkey | { key: Tkey; params: Record<string, any> };

export { introPageTexts, keys };
export type {
  DataDisclosureTitle,
  IntroPageKey,
  OutOfScopeTitle,
  PrerequisitesTitle,
  ScopeTitle,
  SelfDeclarationDescription,
  TElement,
  Tkey,
};
