import { Summary } from '@navikt/skjemadigitalisering-shared-domain';

interface Props {
  component: Summary.Attachment;
}

const AttachmentSummary = ({ component }: Props) => {
  return (
    <>
      <dt>{component.label}</dt>
      <dd>{component.value.description}</dd>
      {component.value.additionalDocumentation && component.value.additionalDocumentationLabel && (
        <>
          <dt>{component.value.additionalDocumentationLabel}</dt>
          <dd>{component.value.additionalDocumentation}</dd>
        </>
      )}
    </>
  );
};

export default AttachmentSummary;
