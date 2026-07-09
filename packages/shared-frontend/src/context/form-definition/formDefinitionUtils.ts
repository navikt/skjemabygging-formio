import { Component, Form, navFormUtils, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';

const getResolvedSubmissionPath = (component: Component) =>
  submissionUtils.getComponentSubmissionPath(component, component.baseSubmissionPath ?? '');

const enrichComponentsWithBaseSubmissionPath = (components: Component[] = [], baseSubmissionPath = ''): Component[] =>
  components.map((component) => {
    const { components: childComponents, ...rest } = component;
    const nextBaseSubmissionPath = getResolvedSubmissionPath({
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
