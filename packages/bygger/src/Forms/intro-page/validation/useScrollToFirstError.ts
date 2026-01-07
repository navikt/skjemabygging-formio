import { useCallback } from 'react';
import { IntroPageRefs } from './useIntroPageRefs';
import { IntroPageError } from './validation';

export function useScrollToFirstError(refMap: IntroPageRefs) {
  return useCallback(
    (errors: IntroPageError) => {
      const scrollElementIntoView = (element?: HTMLElement | null) => {
        if (!element) return false;
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus?.();
        return true;
      };

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
        const bulletPointMatch = path.match(/^(sections\.[^.]+\.bulletPoints)\.(\d+)$/);
        if (bulletPointMatch) {
          const [, bulletPointsKey, index] = bulletPointMatch;
          const bulletPointsRef = refMap[bulletPointsKey as keyof IntroPageRefs];
          const bulletPointElement = bulletPointsRef?.current?.[Number(index)];
          if (scrollElementIntoView(bulletPointElement ?? null)) {
            break;
          }
        }

        const ref = refMap[path as keyof IntroPageRefs];
        const target = ref?.current;
        if (target && !Array.isArray(target) && scrollElementIntoView(target as HTMLElement)) {
          break;
        }
      }
    },
    [refMap],
  );
}
