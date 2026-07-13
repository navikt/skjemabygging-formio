import Accordion from '../../../components/accordion/Accordion';
import { InputComponentProps, resolveReadMore } from '../../inputComponentRegistryUtils';

const InputAccordion = ({ component }: InputComponentProps) => (
  <Accordion values={component.accordionValues} readMore={resolveReadMore(component)} />
);

export default InputAccordion;
