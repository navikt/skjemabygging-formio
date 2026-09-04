import Fieldset from '../../../components/fieldset/Fieldset';
import { FormGroupDefinition } from '../../component-types';
import { InputComponentRegistry } from '../../inputComponentRegistry';
import RenderInputForm from '../../RenderInputForm';
import FormGroup from '../../shared/FormGroup';
import styles from './InputFormGroup.module.css';

interface InputFormGroupProps {
  component: FormGroupDefinition;
  componentRegistry?: InputComponentRegistry;
}

const InputFormGroup = ({ component, componentRegistry }: InputFormGroupProps) => {
  const { components, legend, label, hideLabel, description, backgroundColor, type, key } = component;

  if (!components?.length) {
    return null;
  }

  const contentClassName = [
    styles.content,
    backgroundColor ? 'aksel-fieldset__content--background-color' : undefined,
    backgroundColor ? styles.background : undefined,
    backgroundColor && type === 'navSkjemagruppe' ? styles.backgroundNavGroup : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <FormGroup>
      <Fieldset
        legend={legend ?? label ?? key}
        description={description}
        hideLegend={hideLabel}
        contentClassName={contentClassName}
      >
        <RenderInputForm components={components} componentRegistry={componentRegistry} />
      </Fieldset>
    </FormGroup>
  );
};

export default InputFormGroup;
