import { Form, IntroPage } from '@navikt/skjemadigitalisering-shared-domain';

export function initializeImportantInformation(form: Form, key: string, value: string): Form {
  const { introPage } = form;
  if (!introPage) {
    return form;
  }
  return {
    ...form,
    introPage: {
      ...introPage,
      importantInformation: {
        ...introPage.importantInformation,
        [key]: value,
      },
    },
  };
}

export function updateSection(
  form: Form,
  sectionKey: keyof IntroPage['sections'],
  property: 'title' | 'description',
  value: string | undefined,
): Form {
  const { introPage } = form;

  return {
    ...form,
    introPage: {
      ...introPage,
      sections: {
        ...introPage?.sections,
        [sectionKey]: {
          ...(introPage?.sections?.[sectionKey] ?? {}),
          [property]: value,
        },
      },
    } as IntroPage,
  };
}

export function deleteImportantInformationKey(
  form: Form,
  key: keyof NonNullable<IntroPage['importantInformation']>,
): Form {
  const { introPage } = form;
  if (!introPage) {
    return form;
  }

  const { [key]: _, ...remainingImportantInformation } = introPage.importantInformation || {};

  return {
    ...form,
    introPage: {
      ...introPage,
      importantInformation: remainingImportantInformation,
    },
  };
}

export function updateImportantInformation(
  form: Form,
  key: keyof NonNullable<IntroPage['importantInformation']>,
  value: string,
): Form {
  const { introPage } = form;

  return {
    ...form,
    introPage: {
      ...introPage,
      importantInformation: {
        ...introPage?.importantInformation,
        [key]: value,
      },
    } as IntroPage,
  };
}

export function addBulletPoint(form: Form, sectionKey: keyof IntroPage['sections'], bullet: string): Form {
  const { introPage } = form;
  const section = introPage?.sections?.[sectionKey] ?? {};
  const bulletPoints = section?.bulletPoints ?? [];

  return {
    ...form,
    introPage: {
      ...introPage,
      sections: {
        ...introPage?.sections,
        [sectionKey]: {
          ...section,
          bulletPoints: [...bulletPoints, bullet],
        },
      },
    } as IntroPage,
  };
}

export function removeBulletPoint(form: Form, sectionKey: keyof IntroPage['sections'], index: number): Form {
  const { introPage } = form;
  const section = introPage?.sections?.[sectionKey];
  if (!section?.bulletPoints) return form;

  const updatedBulletPoints = section.bulletPoints.filter((_, i) => i !== index);

  return {
    ...form,
    introPage: {
      ...introPage,
      sections: {
        ...introPage?.sections,
        [sectionKey]: {
          ...section,
          bulletPoints: updatedBulletPoints,
        },
      },
    } as IntroPage,
  };
}

export function handleBulletPointChange(
  form: Form,
  sectionKey: keyof IntroPage['sections'],
  index: number,
  value: string,
): Form {
  const { introPage } = form;
  const section = introPage?.sections?.[sectionKey] ?? {};
  const bulletPoints = [...(section?.bulletPoints || [])];
  bulletPoints[index] = value;

  return {
    ...form,
    introPage: {
      ...introPage,
      sections: {
        ...introPage?.sections,
        [sectionKey]: {
          ...section,
          bulletPoints,
        },
      },
    } as IntroPage,
  };
}
