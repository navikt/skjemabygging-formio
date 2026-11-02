import { IntroPage, supportedIntroPageSectionKeys } from '@navikt/skjemadigitalisering-shared-domain';

const sanitizeIntroPage = (introPage: IntroPage): IntroPage => {
  const sections: IntroPage['sections'] = { prerequisites: introPage.sections?.prerequisites };
  supportedIntroPageSectionKeys.forEach((key) => {
    if (introPage.sections?.[key] !== undefined) {
      sections[key] = introPage.sections[key];
    }
  });
  return { ...introPage, sections };
};

export { sanitizeIntroPage };
