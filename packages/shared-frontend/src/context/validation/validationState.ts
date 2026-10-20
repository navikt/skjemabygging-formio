import { FieldViolation } from './validationTypes';

type PageViolationsByKey = Record<string, FieldViolation[]>;

const togglePageInSet = (pages: Set<string>, pageKey: string, shouldContain: boolean): Set<string> => {
  if (pages.has(pageKey) === shouldContain) {
    return pages;
  }
  const next = new Set(pages);
  if (shouldContain) {
    next.add(pageKey);
  } else {
    next.delete(pageKey);
  }
  return next;
};

const replacePageSet = (pages: Set<string>, nextPages: Set<string>): Set<string> => {
  if (pages.size === nextPages.size && [...nextPages].every((pageKey) => pages.has(pageKey))) {
    return pages;
  }
  return nextPages;
};

const areViolationsEqual = (violations: FieldViolation[] | undefined, nextViolations: FieldViolation[]): boolean =>
  (violations ?? []).length === nextViolations.length &&
  nextViolations.every((nextViolation, index) => {
    const violation = violations?.[index];
    return (
      violation?.pageKey === nextViolation.pageKey &&
      violation.submissionPath === nextViolation.submissionPath &&
      violation.field === nextViolation.field &&
      violation.message === nextViolation.message &&
      violation.violation?.textKey === nextViolation.violation?.textKey &&
      JSON.stringify(violation.violation?.params) === JSON.stringify(nextViolation.violation?.params)
    );
  });

const setPageViolations = (
  violationsByPage: PageViolationsByKey,
  pageKey: string,
  violations: FieldViolation[],
): PageViolationsByKey => {
  if (violations.length === 0) {
    if (!(pageKey in violationsByPage)) {
      return violationsByPage;
    }
    const { [pageKey]: _removedPageViolations, ...remainingViolations } = violationsByPage;
    return remainingViolations;
  }
  if (areViolationsEqual(violationsByPage[pageKey], violations)) {
    return violationsByPage;
  }
  return { ...violationsByPage, [pageKey]: violations };
};

export { replacePageSet, setPageViolations, togglePageInSet };
export type { PageViolationsByKey };
