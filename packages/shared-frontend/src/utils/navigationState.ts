const withoutSubmissionNavigationState = (state: unknown): Record<string, unknown> => {
  if (typeof state !== 'object' || state === null || Array.isArray(state)) {
    return {};
  }

  const {
    initialSubmission: _initialSubmission,
    preserveInitialSubmission: _preserveInitialSubmission,
    ...navigationState
  } = state as Record<string, unknown>;

  return navigationState;
};

export { withoutSubmissionNavigationState };
