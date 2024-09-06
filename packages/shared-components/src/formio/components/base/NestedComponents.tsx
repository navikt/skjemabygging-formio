import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import NavTextField from '../core/textfield/NavTextField';
import baseComponentUtils from './baseComponentUtils';
import Description from './components/Description';

interface Props {
  components: Component[];
  handleChange: (key: string, value: any) => void;
  translate: any;
}

const componentRenderer = (component: Component, handleChange, translate) => {
  const {
    getId,
    getKey,
    getLabel,
    getHideLabel,
    getClassName,
    getAutoComplete,
    isReadOnly,
    getSpellCheck,
    isProtected,
  } = baseComponentUtils;

  //TODO:
  // defaultValue
  // validation
  // betinget visning

  switch (component.type) {
    case 'textField':
    default:
      return (
        <NavTextField
          key={getId(component)}
          id={getId(component)}
          onChange={(event) => handleChange(getKey(component), event.currentTarget.value)}
          label={translate(getLabel(component))}
          hideLabel={getHideLabel(component)}
          description={<Description component={component} translate={translate} />}
          className={getClassName(component)}
          autoComplete={getAutoComplete(component)}
          readOnly={isReadOnly(component)}
          spellCheck={getSpellCheck(component)}
          inputMode={'text'}
          type={isProtected(component) ? 'password' : 'text'}
        />
      );
  }
};

const NestedComponents = ({ components, handleChange, translate }: Props) => {
  return components.map((component) => componentRenderer(component, handleChange, translate));
};
export default NestedComponents;
