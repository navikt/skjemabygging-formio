import { useCallback } from 'react';
import { IntroPageRefs } from './useIntroPageRefs';
import { IntroPageError } from './validation';

export function useScrollToFirstError(refMap: IntroPageRefs) {
  return useCallback(
    (errors: IntroPageError) => {
      const flatPaths: string[] = [];

      if (errors.introduction) flatPaths.push('introduction');

      if (errors.importantInformation) {
        if (errors.importantInformation.title) flatPaths.push('importantInformation.title');
        if (errors.importantInformation.description) flatPaths.push('importantInformation.description');
      }

      if (errors.sections) {
        for (const [sectionKey, sectionErrors] of Object.entries(errors.sections)) {
          if (sectionErrors?.title) flatPaths.push(`sections.${sectionKey}.title`);
          if (sectionErrors?.description) flatPaths.push(`sections.${sectionKey}.description`);
          if (Array.isArray(sectionErrors?.bulletPoints)) {
            sectionErrors.bulletPoints.forEach((error, index) => {
              if (error) {
                flatPaths.push(`sections.${sectionKey}.bulletPoints.${index}`);
              }
            });
          }
        }
      }

      if (errors.selfDeclaration) flatPaths.push('selfDeclaration');

      for (const path of flatPaths) {
        const ref = refMap[path];

        if (Array.isArray(ref?.current)) {
          const firstValid = ref.current.find((el) => el !== null);
          if (firstValid) {
            firstValid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstValid.focus?.();
            break;
          }
        } else if (ref?.current) {
          ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          ref.current.focus?.();
          break;
        }
      }
    },
    [refMap],
  );
}
