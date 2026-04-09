import { PdfData } from '@navikt/skjemadigitalisering-shared-domain';
import renderPdfComponent from '../../../render/RenderPdfComponent';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const PdfDataGrid = (props: PdfComponentProps): PdfData[] | null => {
  const { component, submissionPath, submission, translate } = props;
  const { label, components } = component;
  const dataGridValues = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (
    !components ||
    dataGridValues === undefined ||
    formComponentUtils.noChildValuesForDataGrid(submissionPath, components, submission)
  ) {
    return null;
  }

  return dataGridValues?.map((_, index: number) => {
    return {
      label: `${translate(label)} ${index + 1}`,
      verdiliste: components
        ?.flatMap((component) => {
          const componentSubmissionPath = formComponentUtils.getComponentSubmissionPath(
            component,
            `${submissionPath}[${index}]`,
          );

          return renderPdfComponent({
            ...props,
            submissionPath: componentSubmissionPath,
            component,
          });
        })
        .filter(Boolean) as PdfData[],
    };
  });
};

export default PdfDataGrid;
