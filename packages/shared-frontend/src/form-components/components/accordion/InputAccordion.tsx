import Accordion from '../../../components/accordion/Accordion';
import { AccordionDefinition } from '../../component-types';
import { InputComponentProps, resolveReadMore } from '../../inputComponentUtils';

const InputAccordion = ({ component }: InputComponentProps<AccordionDefinition>) => (
  <Accordion values={component.accordionValues} readMore={resolveReadMore(component)} />
);

export default InputAccordion;
