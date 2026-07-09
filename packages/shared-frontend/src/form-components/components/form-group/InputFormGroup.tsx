import { Box, Fieldset } from '@navikt/ds-react';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../../context/language/LanguageContext';
import RenderInputForm from '../../RenderInputForm';
import TranslatedDescription from '../../input/TranslatedDescription';
import { InputComponentRegistry } from '../../inputComponentRegistry';
import styles from './InputFormGroup.module.css';

interface InputFormGroupProps {
  component: Component;
  pageKey: string;
  pageComponents: Component[];
  componentRegistry?: InputComponentRegistry;
}

const InputFormGroup = ({ component, pageKey, pageComponents, componentRegistry }: InputFormGroupProps) => {
  const { translate } = useLanguage();
  const { components, legend, label, hideLabel, description, backgroundColor, type } = component;

  if (!components?.length) {
    return null;
  }

  const contentClassName = [
    styles.content,
    backgroundColor ? styles.background : undefined,
    backgroundColor && type === 'navSkjemagruppe' ? styles.backgroundNavGroup : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Box marginBlock="space-0 space-40">
      <Fieldset
        legend={translate(legend ?? label ?? component.key)}
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        hideLegend={hideLabel}
      >
        <div className={contentClassName}>
          <RenderInputForm
            pageKey={pageKey}
            pageComponents={pageComponents}
            components={components}
            componentRegistry={componentRegistry}
          />
        </div>
      </Fieldset>
    </Box>
  );
};

export default InputFormGroup;
