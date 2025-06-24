import { Form, IntroPage } from '@navikt/skjemadigitalisering-shared-domain';

type UpdateFormFunction = (updatedForm: Form) => void;

export function initializeImportantInformation(
  form: Form,
  key: string,
  value: string,
  handleChange: UpdateFormFunction,
): void {
  const { introPage } = form;
  if (!introPage) {
    return;
  }
  handleChange({
    ...form,
    introPage: {
      ...introPage,
      importantInformation: {
        ...introPage.importantInformation,
        [key]: value,
      },
    },
  });
}

export function updateSection(
  form: Form,
  sectionKey: keyof IntroPage['sections'],
  property: 'title' | 'description',
  value: string | undefined,
  handleChange: UpdateFormFunction,
): void {
  const { introPage } = form;

  handleChange({
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
  });
}

export function deleteImportantInformationKey(
  form: Form,
  key: keyof NonNullable<IntroPage['importantInformation']>,
  handleChange: UpdateFormFunction,
): void {
  const { introPage } = form;
  if (!introPage) {
    return;
  }

  const { [key]: _, ...remainingImportantInformation } = introPage.importantInformation || {};

  handleChange({
    ...form,
    introPage: {
      ...introPage,
      importantInformation: remainingImportantInformation,
    },
  });
}

export function updateImportantInformation(
  form: Form,
  key: keyof NonNullable<IntroPage['importantInformation']>,
  value: string,
  handleChange: UpdateFormFunction,
): void {
  const { introPage } = form;

  handleChange({
    ...form,
    introPage: {
      ...introPage,
      importantInformation: {
        ...introPage?.importantInformation,
        [key]: value,
      },
    } as IntroPage,
  });
}

export function addBulletPoint(
  form: Form,
  sectionKey: keyof IntroPage['sections'],
  bullet: string,
  handleChange: UpdateFormFunction,
): void {
  const { introPage } = form;
  const section = introPage?.sections?.[sectionKey] ?? {};
  const bulletPoints = section?.bulletPoints ?? [];

  handleChange({
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
  });
}

export function removeBulletPoint(
  form: Form,
  sectionKey: keyof IntroPage['sections'],
  index: number,
  handleChange: UpdateFormFunction,
): void {
  const { introPage } = form;
  const section = introPage?.sections?.[sectionKey];
  if (!section?.bulletPoints) return;

  const updatedBulletPoints = section.bulletPoints.filter((_, i) => i !== index);

  handleChange({
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
  });
}

export function handleBulletPointChange(
  form: Form,
  sectionKey: keyof IntroPage['sections'],
  index: number,
  value: string,
  handleChange: UpdateFormFunction,
): void {
  const { introPage } = form;
  const section = introPage?.sections?.[sectionKey] ?? {};
  const bulletPoints = [...(section?.bulletPoints || [])];
  bulletPoints[index] = value;

  handleChange({
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
  });
}
