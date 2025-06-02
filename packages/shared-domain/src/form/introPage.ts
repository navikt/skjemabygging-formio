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
    dataDisclosure?: IntroPageSection;
    dataTreatment: IntroPageSection;
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

export type { IntroPage };
