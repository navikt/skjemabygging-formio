import Accordion from '../../../components/accordion/Accordion';
import { InputComponentProps, resolveReadMore } from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputAccordion = ({ component }: InputComponentProps) => (
  <FormGroup>
    <Accordion values={component.accordionValues} readMore={resolveReadMore(component)} />
  </FormGroup>
);

export default InputAccordion;
