import { IntroPage } from '@navikt/skjemadigitalisering-shared-domain';

export type BulletPointErrors = Record<number, string>;

export type IntroPageSectionError = Partial<{
  title: string;
  description: string;
  bulletPoints: BulletPointErrors;
  message: string;
}>;

export type IntroPageError = Partial<{
  enabled: string;
  introduction: string;
  selfDeclaration: string;
  importantInformation: {
    title?: string;
    description?: string;
  };
  sections: Partial<Record<keyof IntroPage['sections'], IntroPageSectionError>>;
}>;

export function validateIntroPage(introPage?: Partial<IntroPage>): IntroPageError {
  if (!introPage) return {};

  const errors: IntroPageError = {};

  if (!introPage.introduction?.trim()) {
    errors.introduction = 'Velkomstmelding må fylles ut';
  }

  if (!introPage.selfDeclaration?.trim()) {
    errors.selfDeclaration = 'Egenerklæring må fylles ut';
  }

  const validateSection = (section: any): IntroPageSectionError | undefined => {
    const sectionErrors: IntroPageSectionError = {};
    const bulletPointErrors: BulletPointErrors = {};

    if (!section?.title?.trim()) {
      sectionErrors.title = 'Overskrift må fylles ut';
    }

    if (!section?.description?.trim()) {
      sectionErrors.description = 'Ingress må fylles ut';
    }

    if (Array.isArray(section?.bulletPoints)) {
      section.bulletPoints.forEach((bp: string, index: number) => {
        if (!bp?.trim()) {
          bulletPointErrors[index] = 'Kulepunktet må fylles ut';
        }
      });

      if (Object.keys(bulletPointErrors).length > 0) {
        sectionErrors.bulletPoints = bulletPointErrors;
      }
    }

    if (section?.bulletPoints?.length > 1 && section?.bulletPoints?.length < 2) {
      sectionErrors.message = 'Vennligst legg til minst to kulepunkter';
    }

    if (!section?.description?.trim() && !section?.bulletPoints?.length) {
      sectionErrors.message = 'Seksjonen må ha en ingress eller kulepunkter';
    }

    console.log('formError', errors);

    return Object.keys(sectionErrors).length > 0 ? sectionErrors : undefined;
  };

  const requiredSections: (keyof IntroPage['sections'])[] = ['prerequisites', 'dataTreatment'];
  const optionalSections: (keyof IntroPage['sections'])[] = [
    'scope',
    'outOfScope',
    'dataDisclosure',
    'optional',
    'automaticProcessing',
  ];

  const validateSections = (sectionKeys: (keyof IntroPage['sections'])[], optional = false) => {
    for (const sectionKey of sectionKeys) {
      const section = introPage.sections?.[sectionKey];
      if (!optional || (optional && section)) {
        const sectionErrors = validateSection(section);
        if (sectionErrors) {
          if (!errors.sections) errors.sections = {};
          errors.sections[sectionKey] = sectionErrors;
        }
      }
    }
  };

  validateSections(requiredSections);
  validateSections(optionalSections, true);

  if (introPage.importantInformation) {
    const importantErrors: NonNullable<IntroPageError['importantInformation']> = {};
    if (!introPage.importantInformation.title?.trim()) {
      importantErrors.title = 'Tittel må fylles ut';
    }
    if (!introPage.importantInformation.description?.trim()) {
      importantErrors.description = 'Beskrivelse må fylles ut';
    }
    if (Object.keys(importantErrors).length > 0) {
      errors.importantInformation = importantErrors;
    }
  }

  return errors;
}
