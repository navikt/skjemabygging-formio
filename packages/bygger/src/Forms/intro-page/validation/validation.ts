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
  const fieldsWithPrefilledBulletPoints = ['prerequisites', 'dataDisclosure'];
  const fieldsWithPrefilledIngressAndBulletPoints = ['dataDisclosure'];
  const fieldsWithoutTitle = ['automaticProcessing', 'dataTreatment'];
  const fieldWithoutDescription = ['dataDisclosure'];

  if (!introPage.introduction?.trim()) {
    errors.introduction = 'Velkomstmelding må fylles ut';
  }

  if (!introPage.selfDeclaration?.trim()) {
    errors.selfDeclaration = 'Egenerklæring må fylles ut';
  }

  const validateSection = (
    section: any,
    sectionKey: keyof IntroPage['sections'],
  ): IntroPageSectionError | undefined => {
    const sectionErrors: IntroPageSectionError = {};
    const bulletPointErrors: BulletPointErrors = {};

    if (!fieldsWithoutTitle.includes(sectionKey) && !section?.title?.trim()) {
      sectionErrors.title = 'Overskrift må fylles ut';
    }

    if (!fieldWithoutDescription.includes(sectionKey) && section?.description?.trim().length === 0) {
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

    if (
      !fieldsWithPrefilledBulletPoints.includes(sectionKey) &&
      !section?.description &&
      section?.bulletPoints?.length < 2
    ) {
      sectionErrors.message = 'Vennligst legg til minst to kulepunkter';
    }

    if (
      !fieldsWithPrefilledIngressAndBulletPoints.includes(sectionKey) &&
      !section?.description?.trim() &&
      !section?.bulletPoints?.length
    ) {
      sectionErrors.message = 'Seksjonen må ha en ingress eller kulepunkter';
    }

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
        const sectionErrors = validateSection(section, sectionKey);
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
    if (!introPage.importantInformation.description?.trim() && !introPage.importantInformation.title?.trim()) {
      importantErrors.title = 'Overskrift må fylles ut';
    }
    if (!introPage.importantInformation.description?.trim()) {
      importantErrors.description = 'Brødtekst må fylles ut';
    }
    if (Object.keys(importantErrors).length > 0) {
      errors.importantInformation = importantErrors;
    }
  }

  return errors;
}
