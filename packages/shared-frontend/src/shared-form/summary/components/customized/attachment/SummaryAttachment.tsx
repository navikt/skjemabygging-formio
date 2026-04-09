import { buildAttachmentSummaryNode } from '@navikt/skjemadigitalisering-shared-form';
import { FormComponentProps } from '../../../types';
import { SummaryFieldNodeAnswers } from '../../shared/form-summary';

const SummaryAttachment = (props: FormComponentProps) => {
  const { component, submissionPath, submission, translate, formProperties, appConfig } = props;
  const summaryNode = buildAttachmentSummaryNode({
    component,
    submissionPath,
    submission,
    translate,
    formProperties,
    submissionMethod: appConfig.submissionMethod,
  });

  if (!summaryNode) {
    return null;
  }

  return <SummaryFieldNodeAnswers node={summaryNode} />;
};

export default SummaryAttachment;
