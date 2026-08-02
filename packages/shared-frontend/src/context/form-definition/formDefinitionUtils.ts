import { Component, Form, navFormUtils, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';

const getResolvedSubmissionPath = (component: Component) => {
  if (component.type === 'attachment') {
    return component.baseSubmissionPath ? `${component.baseSubmissionPath}.${component.key}` : component.key;
  }

  return submissionUtils.getComponentSubmissionPath(component, component.baseSubmissionPath ?? '');
};

const enrichComponentsWithBaseSubmissionPath = (components: Component[] = [], baseSubmissionPath = ''): Component[] =>
  components.map((component) => {
    const { components: childComponents, ...rest } = component;
    const nextBaseSubmissionPath =
      rest.yourInformation && rest.type === 'container'
        ? [baseSubmissionPath, rest.key].filter(Boolean).join('.')
        : getResolvedSubmissionPath({
            ...rest,
            baseSubmissionPath,
          });

    return {
      ...rest,
      baseSubmissionPath,
      ...(childComponents && {
        components: enrichComponentsWithBaseSubmissionPath(childComponents, nextBaseSubmissionPath),
      }),
    };
  });

const enrichFormWithBaseSubmissionPath = (form: Form): Form => ({
  ...form,
  components: enrichComponentsWithBaseSubmissionPath(form.components),
});

const flattenComponentsWithBaseSubmissionPath = (components: Component[]) => navFormUtils.flattenComponents(components);

export {
  enrichComponentsWithBaseSubmissionPath,
  enrichFormWithBaseSubmissionPath,
  flattenComponentsWithBaseSubmissionPath,
  getResolvedSubmissionPath,
};
