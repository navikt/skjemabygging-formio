import { Box, Label } from '@navikt/ds-react';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { CSSProperties } from 'react';
import TranslatedDescription from '../../../components/shared/TranslatedDescription';
import { useLanguage } from '../../../context/language/LanguageContext';
import { InputComponentRegistry } from '../../inputComponentRegistry';
import RenderInputForm from '../../RenderInputForm';
import FormGroup from '../../shared/FormGroup';
import styles from './InputRow.module.css';

interface InputRowProps {
  component: Component;
  componentRegistry?: InputComponentRegistry;
}

type FieldStyle = CSSProperties & {
  '--field-width'?: string;
};

const getChildStyle = (component: Component): FieldStyle | undefined => {
  if (!component.widthPercent || component.widthPercent <= 0 || component.widthPercent >= 100) {
    return undefined;
  }

  return {
    '--field-width': `calc(${component.widthPercent}% - var(--ax-space-24))`,
  };
};

const InputRow = ({ component, componentRegistry }: InputRowProps) => {
  const { translate } = useLanguage();
  const { components, label, hideLabel, description } = component;

  if (!components?.length) {
    return null;
  }

  return (
    <FormGroup>
      <Box marginBlock="space-0 space-40">
        {!hideLabel && label && (
          <Label as="div" className={styles.label}>
            {translate(label)}
          </Label>
        )}
        {description && (
          <div className={styles.description}>
            <TranslatedDescription>{description}</TranslatedDescription>
          </div>
        )}
        <div className={styles.fields}>
          {components.map((childComponent) => (
            <div
              key={childComponent.navId ?? childComponent.key}
              className={styles.field}
              style={getChildStyle(childComponent)}
            >
              <RenderInputForm components={[childComponent]} componentRegistry={componentRegistry} />
            </div>
          ))}
        </div>
      </Box>
    </FormGroup>
  );
};

export default InputRow;
