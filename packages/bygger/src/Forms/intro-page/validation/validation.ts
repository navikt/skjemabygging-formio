import { IntroPage, supportedIntroPageSectionKeys } from '@navikt/skjemadigitalisering-shared-domain';

const errorMessages = {
  introduction: 'Velkomstmelding må fylles ut',
  title: 'Overskrift må fylles ut',
  description: 'Ingress må fylles ut',
  bulletPoint: 'Kulepunktet må fylles ut',
  importantInformationDescription: 'Brødtekst må fylles ut',
} as const;

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
  const hasEmptyValue = (text?: string): boolean =>
    text !== undefined && (text.trim() === '' || (!!getKeybasedText && !getKeybasedText(text)));

  if (!introPage) return {};

  const errors: IntroPageError = {};
  const fieldsWithPrefilledBulletPoints = ['dataDisclosure'];
  const fieldsWithPrefilledIngressAndBulletPoints = ['dataDisclosure'];
  const fieldsWithoutTitle = ['automaticProcessing'];
  const fieldsWithTextFieldTitle = ['optional'];
  const fieldWithoutDescription = ['dataDisclosure'];

  if (introPage.introduction === undefined || hasEmptyValue(introPage.introduction)) {
    errors.introduction = errorMessages.introduction;
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
      sectionErrors.title = errorMessages.title;
    }

    if (!fieldWithoutDescription.includes(sectionKey) && hasEmptyValue(section?.description)) {
      sectionErrors.description = errorMessages.description;
    }

    if (Array.isArray(section?.bulletPoints)) {
      section.bulletPoints.forEach((bp: string, index: number) => {
        if (hasEmptyValue(bp)) {
          bulletPointErrors[index] = errorMessages.bulletPoint;
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

  const requiredSections: (keyof IntroPage['sections'])[] = [];
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
      importantErrors.title = errorMessages.title;
    }
    if (
      introPage.importantInformation.description === undefined ||
      hasEmptyValue(introPage.importantInformation.description)
    ) {
      importantErrors.description = errorMessages.importantInformationDescription;
    }
    if (Object.keys(importantErrors).length > 0) {
      errors.importantInformation = importantErrors;
    }
  }

  return errors;
}

export const getMissingTextErrors = (introPage: Partial<IntroPage> | undefined, missingKeys: string[]) => {
  const isMissing = (key?: string) => !!key && missingKeys.includes(key);
  const errors: IntroPageError = {};

  if (isMissing(introPage?.introduction)) {
    errors.introduction = errorMessages.introduction;
  }

  const { title, description } = introPage?.importantInformation ?? {};
  if (isMissing(title) || isMissing(description)) {
    errors.importantInformation = {
      ...(isMissing(title) && { title: errorMessages.title }),
      ...(isMissing(description) && { description: errorMessages.importantInformationDescription }),
    };
  }

  supportedIntroPageSectionKeys.forEach((sectionKey) => {
    const section = introPage?.sections?.[sectionKey];
    const sectionErrors: IntroPageSectionError = {};

    if (isMissing(section?.title)) {
      sectionErrors.title = errorMessages.title;
    }
    if (isMissing(section?.description)) {
      sectionErrors.description = errorMessages.description;
    }
    section?.bulletPoints?.forEach((bulletPoint, index) => {
      if (isMissing(bulletPoint)) {
        sectionErrors.bulletPoints = { ...sectionErrors.bulletPoints, [index]: errorMessages.bulletPoint };
      }
    });

    if (Object.keys(sectionErrors).length > 0) {
      errors.sections = { ...errors.sections, [sectionKey]: sectionErrors };
    }
  });

  return errors;
};
