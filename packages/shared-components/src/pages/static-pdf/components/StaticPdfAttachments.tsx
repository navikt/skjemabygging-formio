import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { Component, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useForm } from '../../../context/form/FormContext';

interface Props {
  onChange: (changes: { [key: string]: any }) => void;
}

const StaticPdfAttachments = ({ onChange }: Props) => {
  const { form } = useForm();

  const attachments: Component[] = useMemo(() => {
    return navFormUtils.flattenComponents(form.components).filter((component) => component.type === 'attachment');
  }, [form.components]);

  if (attachments.length === 0) {
    return null;
  }

  const handleChange = (changes) => {
    onChange({ attachments: changes });
  };

  return (
    <div className="mb">
      <CheckboxGroup
        legend="Vedlegg"
        description="Velg hvilkem dokumentasjon du skal legge ved"
        onChange={handleChange}
      >
        {attachments.map((attachment) => (
          <Checkbox value={attachment.key} key={attachment.key} description={attachment.description}>
            {attachment.label}
          </Checkbox>
        ))}
      </CheckboxGroup>
    </div>
  );
};

export default StaticPdfAttachments;
