import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import renderPdfComponent from '../../../render/RenderPdfComponent';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const PdfDataGrid = ({ component, submissionPath, componentRegistry }: PdfComponentProps) => {
  const { title, components } = component;
  const { submission } = useForm();
  const { translate } = useLanguages();
  const dataGridValues = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (
    !components ||
    dataGridValues === undefined ||
    formComponentUtils.noChildValuesForDataGrid(submissionPath, components, submission)
  ) {
    return null;
  }

  return {
    label: translate(title) ?? '',
    verdiliste: dataGridValues?.map((_, index: number) => {
      return components?.map((component) => {
        const componentSubmissionPath = formComponentUtils.getComponentSubmissionPath(
          component,
          `${submissionPath}[${index}]`,
        );

        return renderPdfComponent({
          component: component,
          submissionPath: componentSubmissionPath,
          componentRegistry,
        });
      });
    }),
  };
};

export default PdfDataGrid;
