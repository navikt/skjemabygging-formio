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

export function validateIntroPage(
  introPage?: Partial<IntroPage>,
  getKeybasedText?: (value: string) => string,
): IntroPageError {
  const hasEmptyValue = (text?: string): boolean => !text?.trim() || (!!getKeybasedText && !getKeybasedText(text));

  if (!introPage) return {};

  const errors: IntroPageError = {};
  const fieldsWithPrefilledBulletPoints = ['dataDisclosure'];
  const fieldsWithPrefilledIngressAndBulletPoints = ['dataDisclosure'];
  const fieldsWithoutTitle = ['automaticProcessing', 'dataTreatment'];
  const fieldsWithTextFieldTitle = ['optional'];
  const fieldWithoutDescription = ['dataDisclosure'];

  if (hasEmptyValue(introPage.introduction)) {
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

    if (
      (!fieldsWithoutTitle.includes(sectionKey) && !section?.title?.trim()) ||
      (fieldsWithTextFieldTitle.includes(sectionKey) && hasEmptyValue(section.title))
    ) {
      sectionErrors.title = 'Overskrift må fylles ut';
    }

    if (!fieldWithoutDescription.includes(sectionKey) && hasEmptyValue(section?.description)) {
      sectionErrors.description = 'Ingress må fylles ut';
    }

    if (Array.isArray(section?.bulletPoints)) {
      section.bulletPoints.forEach((bp: string, index: number) => {
        if (hasEmptyValue(bp)) {
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

  const requiredSections: (keyof IntroPage['sections'])[] = ['dataTreatment'];
  const optionalSections: (keyof IntroPage['sections'])[] = [
    'prerequisites',
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
    if (
      hasEmptyValue(introPage.importantInformation.description) &&
      hasEmptyValue(introPage.importantInformation.title)
    ) {
      importantErrors.title = 'Overskrift må fylles ut';
    }
    if (hasEmptyValue(introPage.importantInformation.description)) {
      importantErrors.description = 'Brødtekst må fylles ut';
    }
    if (Object.keys(importantErrors).length > 0) {
      errors.importantInformation = importantErrors;
    }
  }

  return errors;
}
