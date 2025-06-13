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
          if (sectionErrors?.message) flatPaths.push(`sections.${sectionKey}.message`);
          if (sectionErrors?.bulletPoints && typeof sectionErrors.bulletPoints === 'object') {
            Object.entries(sectionErrors.bulletPoints).forEach(([index, error]) => {
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
        if (ref?.current) {
          ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          ref.current.focus?.();
          break;
        }
      }
    },
    [refMap],
  );
}
