import { Radio, RadioGroup, VStack } from '@navikt/ds-react';
import { AttachmentOption } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';

type Props = {
  label: string;
  options: AttachmentOption[];
};

export function OtherAttachment({ label, options }: Props) {
  const [selectedOption, setSelectedOption] = useState<string>();
  return (
    <VStack gap="8" className="mb" style={{ borderTop: '1px solid #C0D6E4' }}>
      <RadioGroup
        defaultValue={selectedOption}
        legend={label}
        onChange={(value) => setSelectedOption(value)}
        style={{ marginTop: '1rem' }}
      >
        {options.map((option) => (
          <Radio key={option.value} value={option.value}>
            {option.label}
          </Radio>
        ))}
      </RadioGroup>
    </VStack>
  );
}
