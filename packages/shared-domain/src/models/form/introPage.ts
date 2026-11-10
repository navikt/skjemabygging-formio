interface IntroPage {
  enabled: boolean;
  introduction: string;
  importantInformation?: {
    title?: string;
    description?: string;
  };
  sections: {
    scope?: IntroPageSection;
    outOfScope?: IntroPageSection;
    prerequisites: IntroPageSection;
    beAwareOf?: IntroPageSection;
    dataDisclosure?: IntroPageSection;
    dataStorage?: IntroPageSection;
    automaticProcessing?: IntroPageSection;
    optional?: IntroPageSection;
  };
  selfDeclaration: string;
}

interface IntroPageSection {
  title?: string;
  description?: string;
  bulletPoints?: string[];
}

const introPageSectionContent = {
  scope: true,
  outOfScope: true,
  prerequisites: true,
  beAwareOf: false,
  dataDisclosure: true,
  dataStorage: false,
  automaticProcessing: true,
  optional: true,
} as const satisfies Record<keyof IntroPage['sections'], boolean>;

const supportedIntroPageSectionKeys = (Object.keys(introPageSectionContent) as (keyof IntroPage['sections'])[]).filter(
  (key) => introPageSectionContent[key],
);

export { introPageSectionContent, supportedIntroPageSectionKeys };
export type { IntroPage, IntroPageSection };
