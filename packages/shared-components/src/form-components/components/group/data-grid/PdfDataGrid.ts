import renderPdfComponent from '../../../render/RenderPdfComponent';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const PdfDataGrid = (props: PdfComponentProps) => {
  const { component, submissionPath, formContextValue, languagesContextValue } = props;
  const { label, components } = component;
  const { submission } = formContextValue;
  const { translate } = languagesContextValue;
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
      verdiliste: components?.map((component) => {
        const componentSubmissionPath = formComponentUtils.getComponentSubmissionPath(
          component,
          `${submissionPath}[${index}]`,
        );

        return renderPdfComponent({
          ...props,
          submissionPath: componentSubmissionPath,
          component,
        });
      }),
    };
  });
};

export default PdfDataGrid;
