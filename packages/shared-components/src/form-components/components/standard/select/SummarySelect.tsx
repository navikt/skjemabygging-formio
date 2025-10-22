import { FormComponentProps } from '../../../types';
import { DefaultAnswer } from '../../shared/form-summary';
import DefaultSelectAnswer from '../../shared/form-summary/DefaultSelectAnswer';

const SummarySelect = ({ component, submissionPath }: FormComponentProps) => {
  if (component.type === 'select') {
    return <DefaultAnswer component={component} submissionPath={submissionPath} />;
  }
  return <DefaultSelectAnswer component={component} submissionPath={submissionPath} />;
};

export default SummarySelect;
